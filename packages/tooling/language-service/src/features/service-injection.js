const ts = require('typescript/lib/tsserverlibrary');
const { log } = require('../utils/logger');
const { findNodeAtPosition } = require('../utils/ast');
const { getComponentInfo } = require('../utils/component-info');

function getCompletions(info, fileName, position, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo) return prior;
    const injectedProps = componentInfo.inject;

    // Check if we are accessing a property of an injected service
    const textUntilPosition = sourceFile.text.slice(0, position);
    const match = textUntilPosition.match(/this\.(\w+)\.$/);
    
    if (match) {
        const propName = match[1];
        if (injectedProps.has(propName)) {
            const details = injectedProps.get(propName);
            const typeChecker = program.getTypeChecker();
            const serviceSymbol = typeChecker.getSymbolAtLocation(details.node);
            
            if (serviceSymbol) {
                const constructorType = typeChecker.getTypeOfSymbolAtLocation(serviceSymbol, details.node);
                const constructSignatures = constructorType.getConstructSignatures();
                if (constructSignatures.length > 0) {
                    const instanceType = constructSignatures[0].getReturnType();
                    const properties = instanceType.getApparentProperties();
                    
                    const entries = properties
                        .filter(prop => !prop.getName().startsWith('_') && prop.getName() !== 'prototype' && prop.getName() !== 'constructor')
                        .map(prop => {
                            const type = typeChecker.getTypeOfSymbolAtLocation(prop, details.node);
                            const typeString = typeChecker.typeToString(type);
                            let docParts = prop.getDocumentationComment(typeChecker);
                            
                            const callSignatures = type.getCallSignatures();
                            const isMethod = callSignatures.length > 0;
                            
                            const kind = isMethod 
                                ? ts.ScriptElementKind.memberFunctionElement 
                                : ts.ScriptElementKind.memberVariableElement;

                            return {
                                name: prop.getName(),
                                kind: kind,
                                sortText: '0',
                                insertText: prop.getName(),
                                labelDetails: {
                                    detail: isMethod ? '' : `: ${typeString}`,
                                    description: isMethod ? typeString : ''
                                },
                                documentation: docParts
                            };
                        });
                    
                    log(`Providing ${entries.length} members for ${propName} (${details.serviceName})`);

                    return {
                        isGlobalCompletion: false,
                        isMemberCompletion: true,
                        isNewIdentifierLocation: false,
                        entries: entries
                    };
                }
            }
        }
    }

    if (injectedProps.size > 0) {
        const entries = prior ? prior.entries : [];
        
        injectedProps.forEach((details, propName) => {
            if (!entries.some(e => e.name === propName)) {
                entries.push({
                    name: propName,
                    kind: ts.ScriptElementKind.memberVariableElement,
                    kindModifiers: '',
                    sortText: '0',
                    insertText: propName,
                    labelDetails: {
                        detail: `: ${details.serviceName}`
                    },
                    documentation: [{ kind: 'text', text: `Injected service: ${details.serviceName}` }]
                });
            }
        });

        if (!prior) {
            return {
                isGlobalCompletion: false,
                isMemberCompletion: true,
                isNewIdentifierLocation: false,
                entries: entries
            };
        }
    }

    return prior;
}

function getDiagnostics(info, fileName, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.inject.size === 0) return prior;
    const injectedProps = componentInfo.inject;

    return prior.filter(diag => {
        if (diag.code === 2339) { 
            const message = typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
            for (const propName of injectedProps.keys()) {
                if (message && message.includes(`'${propName}'`)) {
                    return false; // Suppress error
                }
            }
        }
        return true;
    });
}

function getDefinition(info, fileName, position, prior) {
    if (prior) return prior;

    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.inject.size === 0) return prior;
    const injectedProps = componentInfo.inject;

    if (injectedProps.size > 0) {
        const node = findNodeAtPosition(sourceFile, position);

        if (node && ts.isIdentifier(node)) {
            const text = node.getText();
            if (injectedProps.has(text)) {
                const details = injectedProps.get(text);
                return {
                    textSpan: { start: node.getStart(), length: node.getWidth() },
                    definitions: [{
                        fileName: fileName,
                        textSpan: { start: details.node.getStart(), length: details.node.getWidth() },
                        kind: ts.ScriptElementKind.memberVariableElement,
                        name: text,
                        containerName: 'inject',
                        containerKind: ts.ScriptElementKind.classElement
                    }]
                };
            }
        }
    }
    return prior;
}

function getQuickInfo(info, fileName, position, prior) {
    // if (prior) return prior; // Don't bail out if TS returns info, as we might have better info for injected services

    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.inject.size === 0) return prior;
    const injectedProps = componentInfo.inject;

    if (injectedProps.size > 0) {
        const node = findNodeAtPosition(sourceFile, position);

        if (node && ts.isIdentifier(node)) {
            const text = node.getText();
            
            // Case 1: Hovering over the service property itself
            if (injectedProps.has(text)) {
                const details = injectedProps.get(text);
                log(`Hover on injected property: ${text}`);
                return {
                    kind: ts.ScriptElementKind.memberVariableElement,
                    kindModifiers: '',
                    textSpan: { start: node.getStart(), length: node.getWidth() },
                    displayParts: [
                        { kind: 'text', text: '(property) ' },
                        { kind: 'propertyName', text: text },
                        { kind: 'punctuation', text: ': ' },
                        { kind: 'className', text: details.serviceName }
                    ],
                    documentation: [{ kind: 'text', text: `Injected service: ${details.serviceName}` }]
                };
            }

            // Case 2: Hovering over a member of the service
            if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
                const expression = node.parent.expression;
                if (ts.isPropertyAccessExpression(expression) && 
                    expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
                    
                    const serviceName = expression.name.getText();
                    if (injectedProps.has(serviceName)) {
                        const details = injectedProps.get(serviceName);
                        const typeChecker = program.getTypeChecker();
                        const serviceSymbol = typeChecker.getSymbolAtLocation(details.node);
                        
                        if (serviceSymbol) {
                            const constructorType = typeChecker.getTypeOfSymbolAtLocation(serviceSymbol, details.node);
                            const constructSignatures = constructorType.getConstructSignatures();
                            
                            if (constructSignatures.length > 0) {
                                const instanceType = constructSignatures[0].getReturnType();
                                const memberSymbol = instanceType.getProperty(text);
                                
                                if (memberSymbol) {
                                    const type = typeChecker.getTypeOfSymbolAtLocation(memberSymbol, details.node);
                                    const typeString = typeChecker.typeToString(type);
                                    const docParts = memberSymbol.getDocumentationComment(typeChecker);
                                    
                                    log(`Hover on service member: ${serviceName}.${text}`);

                                    return {
                                        kind: ts.ScriptElementKind.memberFunctionElement,
                                        kindModifiers: '',
                                        textSpan: { start: node.getStart(), length: node.getWidth() },
                                        displayParts: [
                                            { kind: 'text', text: '(method) ' },
                                            { kind: 'className', text: details.serviceName },
                                            { kind: 'punctuation', text: '.' },
                                            { kind: 'methodName', text: text },
                                            { kind: 'punctuation', text: ': ' },
                                            { kind: 'text', text: typeString }
                                        ],
                                        documentation: docParts
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return prior;
}

module.exports = {
    getCompletions,
    getDiagnostics,
    getDefinition,
    getQuickInfo
};
