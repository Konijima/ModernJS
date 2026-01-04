const ts = require('typescript/lib/tsserverlibrary');
const { log } = require('../utils/logger');
const { getComponentInfo } = require('../utils/component-info');

function getDiagnostics(info, fileName, prior) {
    const program = info.languageService.getProgram();
    const sourceFile = program.getSourceFile(fileName);
    const componentInfo = getComponentInfo(sourceFile);

    if (!componentInfo) return prior;

    const stateProps = componentInfo.state;
    const newDiagnostics = [];

    const validateTemplate = (node) => {
        if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) {
            const fullText = node.getText();
            // Strip quotes (first and last char)
            const content = fullText.slice(1, -1);
            const startOffset = node.getStart() + 1;

            // Regex to find {{ variable }}
            const regex = /\{\{\s*(\w+)\s*\}\}/g;
            let match;

            while ((match = regex.exec(content)) !== null) {
                const varName = match[1];
                if (!stateProps.has(varName)) {
                    const varOffset = match[0].indexOf(varName);
                    const absoluteStart = startOffset + match.index + varOffset;
                    
                    newDiagnostics.push({
                        file: sourceFile,
                        start: absoluteStart,
                        length: varName.length,
                        messageText: `Property '${varName}' does not exist on component state.`,
                        category: ts.DiagnosticCategory.Error,
                        code: 9001 // Custom code for template error
                    });
                }
            }
        }
    };

    const componentNode = componentInfo.componentClass;

    if (ts.isClassDeclaration(componentNode)) {
        componentNode.members.forEach(member => {
            if (ts.isPropertyDeclaration(member) && 
                member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) &&
                member.name.getText() === 'template') {
                
                validateTemplate(member.initializer);
            }
        });
    } else if (ts.isObjectLiteralExpression(componentNode)) {
        componentNode.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && prop.name.getText() === 'template') {
                validateTemplate(prop.initializer);
            }
        });
    }

    return [...prior, ...newDiagnostics];
}

module.exports = {
    getDiagnostics
};
