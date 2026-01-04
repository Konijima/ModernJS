const ts = require('typescript/lib/tsserverlibrary');
const { log } = require('../utils/logger');
const { findNodeAtPosition } = require('../utils/ast');
const { getComponentInfo } = require('../utils/component-info');

function getQuickInfo(info, fileName, position, prior) {
    // Don't bail out if TS returns info, we might have better info
    // if (prior) return prior;

    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.pipes.size === 0) return prior;
    const pipes = componentInfo.pipes;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    // 1. Check if we are in a template string
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const fullText = node.getText();
        // Calculate relative position inside the string
        // node.getStart() includes the quote
        const relativePos = position - node.getStart();
        
        // We are inside the string. Let's check if we are hovering a pipe name.
        // Simple regex approach for now.
        // Match: {{ ... | pipeName ... }}
        // We need to find the word at the cursor position and check if it's a pipe.
        
        const textContent = fullText; // includes quotes
        // Find the word at relativePos
        // We can scan backwards and forwards from relativePos to find the word boundaries
        
        let start = relativePos;
        while (start > 0 && /\w/.test(textContent[start - 1])) start--;
        
        let end = relativePos;
        while (end < textContent.length && /\w/.test(textContent[end])) end++;
        
        const word = textContent.slice(start, end);
        
        // Check if this word is preceded by a pipe operator '|'
        // We need to look backwards from 'start' ignoring whitespace
        let lookback = start - 1;
        while (lookback > 0 && /\s/.test(textContent[lookback])) lookback--;
        
        if (textContent[lookback] === '|') {
            if (pipes.has(word)) {
                const details = pipes.get(word);
                log(`Hover on pipe in template: ${word}`);
                
                const typeChecker = program.getTypeChecker();
                const symbol = typeChecker.getSymbolAtLocation(details.node);
                let docParts = [];
                let displayParts = [];
                
                if (symbol) {
                    // If it's an alias (import), get the aliased symbol
                    const aliasedSymbol = (symbol.flags & ts.SymbolFlags.Alias) 
                        ? typeChecker.getAliasedSymbol(symbol) 
                        : symbol;
                    
                    // Try to find the transform method on the instance type
                    try {
                        const instanceType = typeChecker.getDeclaredTypeOfSymbol(aliasedSymbol);
                        const transformSymbol = instanceType.getProperty('transform');

                        if (transformSymbol) {
                            // Use transform docs
                            docParts = [...transformSymbol.getDocumentationComment(typeChecker)];
                            
                            // Append @example tags
                            const tags = transformSymbol.getJsDocTags();
                            const examples = new Set();
                            
                            tags.forEach(tag => {
                                if (tag.name === 'example' && tag.text) {
                                    // Normalize text
                                    const textParts = Array.isArray(tag.text) ? tag.text : [{ kind: 'text', text: tag.text }];
                                    const fullText = textParts.map(p => p.text).join('');
                                    
                                    if (!examples.has(fullText)) {
                                        examples.add(fullText);
                                        
                                        // Add header only for the first example
                                        if (examples.size === 1) {
                                            docParts.push({ kind: 'lineBreak', text: '\n' });
                                            docParts.push({ kind: 'text', text: '\n**Example**\n' });
                                        } else {
                                            // Add separator between examples
                                            docParts.push({ kind: 'lineBreak', text: '\n' });
                                        }

                                        docParts.push(...textParts);
                                    }
                                }
                            });
                            
                            // Get signature
                            const transformType = typeChecker.getTypeOfSymbolAtLocation(transformSymbol, details.node);
                            const signatures = transformType.getCallSignatures();
                            
                            if (signatures.length > 0) {
                                const signature = signatures[0];
                                const signatureStr = typeChecker.signatureToString(signature);
                                
                                displayParts = [
                                    { kind: 'text', text: '(pipe) ' },
                                    { kind: 'aliasName', text: word },
                                    { kind: 'punctuation', text: ': ' },
                                    { kind: 'text', text: signatureStr }
                                ];
                            }
                        }
                    } catch (e) {
                        log(`Error getting pipe signature: ${e.message}`);
                    }

                    // Fallback docs to class docs if transform has no docs
                    if (docParts.length === 0) {
                        docParts = aliasedSymbol.getDocumentationComment(typeChecker);
                    }
                }

                if (displayParts.length === 0) {
                    displayParts = [
                        { kind: 'text', text: '(pipe) ' },
                        { kind: 'aliasName', text: word },
                        { kind: 'punctuation', text: ': ' },
                        { kind: 'className', text: details.className }
                    ];
                }

                if (docParts.length === 0) {
                    docParts = [{ kind: 'text', text: `Pipe: ${details.className}` }];
                }

                return {
                    kind: ts.ScriptElementKind.alias,
                    kindModifiers: '',
                    textSpan: { start: node.getStart() + start, length: word.length },
                    displayParts: displayParts,
                    documentation: docParts
                };
            }
        }
    }

    // 2. Check if we are accessing this._pipes.pipeName in JS
    if (ts.isIdentifier(node)) {
        const text = node.getText();
        if (pipes.has(text)) {
            // Check parent chain: this._pipes.text
            if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
                const expr = node.parent.expression;
                if (ts.isPropertyAccessExpression(expr) && 
                    expr.name.getText() === '_pipes' &&
                    expr.expression.kind === ts.SyntaxKind.ThisKeyword) {
                    
                    const details = pipes.get(text);
                    log(`Hover on this._pipes.${text}`);
                    
                    const typeChecker = program.getTypeChecker();
                    const symbol = typeChecker.getSymbolAtLocation(details.node);
                    let docParts = [];
                    
                    if (symbol) {
                        const aliasedSymbol = (symbol.flags & ts.SymbolFlags.Alias) 
                            ? typeChecker.getAliasedSymbol(symbol) 
                            : symbol;
                        docParts = aliasedSymbol.getDocumentationComment(typeChecker);
                    }

                    if (docParts.length === 0) {
                        docParts = [{ kind: 'text', text: `Instance of ${details.className}` }];
                    }

                    return {
                        kind: ts.ScriptElementKind.memberVariableElement,
                        kindModifiers: '',
                        textSpan: { start: node.getStart(), length: node.getWidth() },
                        displayParts: [
                            { kind: 'text', text: '(pipe instance) ' },
                            { kind: 'propertyName', text: text },
                            { kind: 'punctuation', text: ': ' },
                            { kind: 'className', text: details.className }
                        ],
                        documentation: docParts
                    };
                }
            }
        }
    }

    return prior;
}

function getCompletions(info, fileName, position, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.pipes.size === 0) return prior;
    const pipes = componentInfo.pipes;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    // 1. Template completions
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const fullText = node.getText();
        const relativePos = position - node.getStart();
        const textBeforeCursor = fullText.slice(0, relativePos);
        
        // Check if we are after a pipe operator '|'
        // Regex: /\|\s*$/
        if (/\|\s*$/.test(textBeforeCursor) || /\|\s*\w+$/.test(textBeforeCursor)) {
            const entries = prior ? prior.entries : [];
            
            pipes.forEach((details, name) => {
                if (!entries.some(e => e.name === name)) {
                    entries.push({
                        name: name,
                        kind: ts.ScriptElementKind.alias,
                        sortText: '0',
                        insertText: name,
                        labelDetails: {
                            detail: `: ${details.className}`
                        },
                        documentation: [{ kind: 'text', text: `Pipe: ${details.className}` }]
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
    }

    return prior;
}

function getDefinition(info, fileName, position, prior) {
    if (prior) return prior;

    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo || componentInfo.pipes.size === 0) return prior;
    const pipes = componentInfo.pipes;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return prior;

    // Check template usage
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const fullText = node.getText();
        const relativePos = position - node.getStart();
        
        let start = relativePos;
        while (start > 0 && /\w/.test(fullText[start - 1])) start--;
        let end = relativePos;
        while (end < fullText.length && /\w/.test(fullText[end])) end++;
        
        const word = fullText.slice(start, end);
        
        let lookback = start - 1;
        while (lookback > 0 && /\s/.test(fullText[lookback])) lookback--;
        
        if (fullText[lookback] === '|') {
            if (pipes.has(word)) {
                const details = pipes.get(word);
                return {
                    textSpan: { start: node.getStart() + start, length: word.length },
                    definitions: [{
                        fileName: fileName,
                        textSpan: { start: details.node.getStart(), length: details.node.getWidth() },
                        kind: ts.ScriptElementKind.classElement,
                        name: word,
                        containerName: 'pipes',
                        containerKind: ts.ScriptElementKind.classElement
                    }]
                };
            }
        }
    }

    return prior;
}

module.exports = {
    getQuickInfo,
    getCompletions,
    getDefinition
};
