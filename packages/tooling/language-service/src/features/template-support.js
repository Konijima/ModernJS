const ts = require('typescript/lib/tsserverlibrary');
const { log } = require('../utils/logger');
const { findNodeAtPosition } = require('../utils/ast');
const { getComponentInfo } = require('../utils/component-info');

function isInBindingContext(text, startPos) {
    // 1. Check Interpolation {{ ... }}
    const lastOpenBrace = text.lastIndexOf('{{', startPos);
    if (lastOpenBrace !== -1) {
        const closingBetween = text.indexOf('}}', lastOpenBrace);
        if (closingBetween === -1 || closingBetween > startPos) {
            const nextCloseBrace = text.indexOf('}}', startPos);
            if (nextCloseBrace !== -1) {
                return true;
            }
        }
    }

    // 2. Check Attribute Binding [prop]="..." or (event)="..."
    const sub = text.slice(0, startPos);
    // Match attribute name starting with [ or ( followed by =" or ='
    // We look for the last occurrence of =" or ='
    const match = sub.match(/([\[\(][\w-]+[\]\)]?)\s*=\s*(["'])(?:(?!\2).)*$/);
    
    if (match) {
        return true;
    }
    
    return false;
}

function getQuickInfo(info, fileName, position, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo) return prior;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const fullText = node.getText();
        const relativePos = position - node.getStart();
        
        // Find word at cursor
        let start = relativePos;
        while (start > 0 && /[\w$]/.test(fullText[start - 1])) start--;
        let end = relativePos;
        while (end < fullText.length && /[\w$]/.test(fullText[end])) end++;
        
        const word = fullText.slice(start, end);

        // Check context
        if (!isInBindingContext(fullText, start)) {
            return prior;
        }
        
        const textBefore = fullText.slice(0, start);
        const typeChecker = program.getTypeChecker();

        // Check Injected Services
        const injectedProps = componentInfo.inject;
        
        // Case 1: Hovering on service property: this.serviceName
        // We check if the text before ends with "this." (ignoring whitespace)
        if (/this\.\s*$/.test(textBefore)) {
            if (injectedProps.has(word)) {
                const details = injectedProps.get(word);
                log(`Hover on injected service: ${word}`);
                
                const symbol = typeChecker.getSymbolAtLocation(details.node);
                let docParts = [];
                if (symbol) {
                    const aliasedSymbol = (symbol.flags & ts.SymbolFlags.Alias) 
                        ? typeChecker.getAliasedSymbol(symbol) 
                        : symbol;
                    docParts = aliasedSymbol.getDocumentationComment(typeChecker);
                }
                
                return {
                    kind: ts.ScriptElementKind.memberVariableElement,
                    kindModifiers: '',
                    textSpan: { start: node.getStart() + start, length: word.length },
                    displayParts: [
                        { kind: 'text', text: '(service) ' },
                        { kind: 'propertyName', text: word },
                        { kind: 'punctuation', text: ': ' },
                        { kind: 'className', text: details.serviceName }
                    ],
                    documentation: docParts
                };
            }
        }

        // Case 2: Hovering on service member: this.serviceName.member
        const serviceMatch = textBefore.match(/this\.(\w+)\.\s*$/);
        if (serviceMatch) {
            const serviceName = serviceMatch[1];
            if (injectedProps.has(serviceName)) {
                const details = injectedProps.get(serviceName);
                const serviceSymbol = typeChecker.getSymbolAtLocation(details.node);
                
                if (serviceSymbol) {
                    const aliasedSymbol = (serviceSymbol.flags & ts.SymbolFlags.Alias) 
                        ? typeChecker.getAliasedSymbol(serviceSymbol) 
                        : serviceSymbol;
                        
                    // Get the instance type of the service
                    // The symbol refers to the class constructor, so we need the instance type
                    const constructorType = typeChecker.getDeclaredTypeOfSymbol(aliasedSymbol);
                    const constructSignatures = constructorType.getConstructSignatures();
                    
                    let instanceType;
                    if (constructSignatures.length > 0) {
                        instanceType = constructSignatures[0].getReturnType();
                    } else {
                        // Fallback: sometimes getDeclaredTypeOfSymbol returns the instance type for classes?
                        // Let's try to get prototype property or just assume it's the instance type if no construct signatures
                        instanceType = constructorType; 
                    }

                    const memberSymbol = instanceType.getProperty(word);
                    
                    if (memberSymbol) {
                        log(`Hover on service member: ${serviceName}.${word}`);
                        
                        const docParts = memberSymbol.getDocumentationComment(typeChecker);
                        const memberType = typeChecker.getTypeOfSymbolAtLocation(memberSymbol, details.node);
                        const typeString = typeChecker.typeToString(memberType);
                        
                        const isMethod = memberType.getCallSignatures().length > 0;
                        
                        return {
                            kind: isMethod ? ts.ScriptElementKind.memberFunctionElement : ts.ScriptElementKind.memberVariableElement,
                            kindModifiers: '',
                            textSpan: { start: node.getStart() + start, length: word.length },
                            displayParts: [
                                { kind: 'text', text: `(service ${isMethod ? 'method' : 'property'}) ` },
                                { kind: 'propertyName', text: word },
                                { kind: 'punctuation', text: ': ' },
                                { kind: 'text', text: typeString }
                            ],
                            documentation: docParts
                        };
                    }
                }
            }
        }

        // Check State
        const stateProps = componentInfo.state;
        if (stateProps.has(word)) {
            const details = stateProps.get(word);
            // const typeChecker = program.getTypeChecker(); // Already defined above
            const type = typeChecker.getTypeAtLocation(details.value);
            const typeString = typeChecker.typeToString(type);
            
            log(`Hover on state property: ${word}`);

            const symbol = typeChecker.getSymbolAtLocation(details.node.name);
            let docParts = [];
            if (symbol) {
                docParts = symbol.getDocumentationComment(typeChecker);
            }
            if (docParts.length === 0) {
                docParts = [{ kind: 'text', text: `State property` }];
            }
            
            return {
                kind: ts.ScriptElementKind.memberVariableElement,
                kindModifiers: '',
                textSpan: { start: node.getStart() + start, length: word.length },
                displayParts: [
                    { kind: 'text', text: '(state) ' },
                    { kind: 'propertyName', text: word },
                    { kind: 'punctuation', text: ': ' },
                    { kind: 'text', text: typeString }
                ],
                documentation: docParts
            };
        }

        // Check Methods
        const methods = componentInfo.methods;
        if (methods.has(word)) {
            const details = methods.get(word);
            log(`Hover on method: ${word}`);
            
            const typeChecker = program.getTypeChecker();
            // Try to get symbol from the name node of the member
            const symbol = typeChecker.getSymbolAtLocation(details.node.name);
            let docParts = [];
            
            if (symbol) {
                docParts = symbol.getDocumentationComment(typeChecker);
            }

            // Fallback if no doc found
            if (docParts.length === 0) {
                docParts = [{ kind: 'text', text: `Component member` }];
            }

            // Get method signature
            const type = typeChecker.getTypeAtLocation(details.node);
            const signature = typeChecker.typeToString(type);

            return {
                kind: ts.ScriptElementKind.memberFunctionElement,
                kindModifiers: '',
                textSpan: { start: node.getStart() + start, length: word.length },
                displayParts: [
                    { kind: 'text', text: `(${details.kind}) ` },
                    { kind: 'methodName', text: word },
                    { kind: 'punctuation', text: ': ' },
                    { kind: 'text', text: signature }
                ],
                documentation: docParts
            };
        }
    }

    return prior;
}

function getDefinition(info, fileName, position, prior) {
    if (prior) return prior;

    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo) return prior;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const fullText = node.getText();
        const relativePos = position - node.getStart();
        
        let start = relativePos;
        while (start > 0 && /[\w$]/.test(fullText[start - 1])) start--;
        let end = relativePos;
        while (end < fullText.length && /[\w$]/.test(fullText[end])) end++;
        
        const word = fullText.slice(start, end);
        
        const stateProps = componentInfo.state;
        if (stateProps.has(word)) {
            const details = stateProps.get(word);
            return {
                textSpan: { start: node.getStart() + start, length: word.length },
                definitions: [{
                    fileName: fileName,
                    textSpan: { start: details.node.getStart(), length: details.node.getWidth() },
                    kind: ts.ScriptElementKind.memberVariableElement,
                    name: word,
                    containerName: 'state',
                    containerKind: ts.ScriptElementKind.classElement
                }]
            };
        }

        const methods = componentInfo.methods;
        if (methods.has(word)) {
            const details = methods.get(word);
            return {
                textSpan: { start: node.getStart() + start, length: word.length },
                definitions: [{
                    fileName: fileName,
                    textSpan: { start: details.node.getStart(), length: details.node.getWidth() },
                    kind: ts.ScriptElementKind.memberFunctionElement,
                    name: word,
                    containerName: 'Component',
                    containerKind: ts.ScriptElementKind.classElement
                }]
            };
        }
    }
    return prior;
}

function getCompletions(info, fileName, position, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo) return prior;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const entries = prior ? prior.entries : [];
        
        const stateProps = componentInfo.state;
        stateProps.forEach((details, name) => {
            if (!entries.some(e => e.name === name)) {
                entries.push({
                    name: name,
                    kind: ts.ScriptElementKind.memberVariableElement,
                    sortText: '0',
                    insertText: name,
                    labelDetails: { detail: ' (state)' },
                    documentation: [{ kind: 'text', text: 'State property' }]
                });
            }
        });

        const methods = componentInfo.methods;
        methods.forEach((details, name) => {
            if (!entries.some(e => e.name === name)) {
                entries.push({
                    name: name,
                    kind: ts.ScriptElementKind.memberFunctionElement,
                    sortText: '0',
                    insertText: name,
                    labelDetails: { detail: ' (method)' },
                    documentation: [{ kind: 'text', text: 'Component method' }]
                });
            }
        });

        return {
            isGlobalCompletion: false,
            isMemberCompletion: true,
            isNewIdentifierLocation: false,
            entries: entries
        };
    }

    return prior;
}

module.exports = {
    getQuickInfo,
    getDefinition,
    getCompletions
};
