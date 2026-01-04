const ts = require('typescript/lib/tsserverlibrary');

/**
 * Finds the Component definition in a source file.
 * Can be a class extending Component or Component.create() call.
 * @param {ts.SourceFile} sourceFile 
 * @returns {{ type: 'class' | 'create', node: ts.Node } | undefined}
 */
function findComponentDefinition(sourceFile) {
    let componentDef;
    
    function visit(node) {
        // 1. Class extends Component
        if (ts.isClassDeclaration(node)) {
            const isComponent = node.heritageClauses?.some(h => 
                h.types.some(t => {
                    const text = t.expression.getText();
                    return text === 'Component' || text.endsWith('.Component');
                })
            );

            if (isComponent) {
                componentDef = { type: 'class', node };
                return; 
            }
        }

        // 2. Component.create({...})
        if (ts.isCallExpression(node)) {
            const expr = node.expression;
            if (ts.isPropertyAccessExpression(expr) && 
                expr.name.getText() === 'create' &&
                (expr.expression.getText() === 'Component' || expr.expression.getText().endsWith('.Component'))) {
                
                if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
                    componentDef = { type: 'create', node: node.arguments[0] };
                    return;
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    if (sourceFile) {
        visit(sourceFile);
    }
    return componentDef;
}

/**
 * Finds the Component class declaration in a source file.
 * @deprecated Use findComponentDefinition instead
 * @param {ts.SourceFile} sourceFile 
 * @returns {ts.ClassDeclaration | undefined}
 */
function findComponentClass(sourceFile) {
    const def = findComponentDefinition(sourceFile);
    return def && def.type === 'class' ? def.node : undefined;
}

/**
 * Finds the node at a specific position.
 * @param {ts.Node} sourceFile 
 * @param {number} position 
 * @returns {ts.Node | null}
 */
function findNodeAtPosition(sourceFile, position) {
    let node = null;
    function find(n) {
        if (n.getStart() <= position && n.getEnd() >= position) {
            node = n;
            ts.forEachChild(n, find);
        }
    }
    find(sourceFile);
    return node;
}

module.exports = {
    findComponentClass,
    findComponentDefinition,
    findNodeAtPosition
};
