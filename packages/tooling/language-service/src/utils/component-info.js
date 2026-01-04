const ts = require('typescript/lib/tsserverlibrary');
const { findComponentDefinition } = require('./ast');

/**
 * @typedef {Object} ComponentInfo
 * @property {ts.Node} componentClass - The class declaration or object literal
 * @property {Map<string, { node: ts.Node, value: ts.Node }>} state
 * @property {Map<string, { serviceName: string, node: ts.Node }>} inject
 * @property {Map<string, { className: string, node: ts.Node }>} pipes
 * @property {Map<string, { node: ts.Node, kind: 'method' | 'getter' | 'setter' }>} methods
 */

/**
 * Extracts metadata from the component definition in the source file.
 * @param {ts.SourceFile} sourceFile 
 * @returns {ComponentInfo | null}
 */
function getComponentInfo(sourceFile) {
    const def = findComponentDefinition(sourceFile);
    if (!def) return null;

    const info = {
        componentClass: def.node,
        state: new Map(),
        inject: new Map(),
        pipes: new Map(),
        methods: new Map()
    };

    if (def.type === 'class') {
        extractFromClass(def.node, info);
    } else {
        extractFromObject(def.node, info);
    }

    return info;
}

function extractFromClass(classNode, info) {
    classNode.members.forEach(member => {
        const name = member.name ? member.name.getText() : null;
        if (!name) return;

        // 1. Static Properties (state, inject, pipes)
        if (ts.isPropertyDeclaration(member) && 
            member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword)) {
            
            if (member.initializer && ts.isObjectLiteralExpression(member.initializer)) {
                
                // State
                if (name === 'state') {
                    member.initializer.properties.forEach(prop => {
                        if (ts.isPropertyAssignment(prop)) {
                            info.state.set(prop.name.getText(), {
                                node: prop,
                                value: prop.initializer
                            });
                        }
                    });
                }
                
                // Inject
                else if (name === 'inject') {
                    member.initializer.properties.forEach(prop => {
                        if (ts.isPropertyAssignment(prop)) {
                            info.inject.set(prop.name.getText(), {
                                serviceName: prop.initializer.getText(),
                                node: prop.initializer
                            });
                        }
                    });
                }

                // Pipes
                else if (name === 'pipes') {
                    member.initializer.properties.forEach(prop => {
                        if (ts.isPropertyAssignment(prop)) {
                            info.pipes.set(prop.name.getText(), {
                                className: prop.initializer.getText(),
                                node: prop.initializer
                            });
                        }
                    });
                }
            }
        }

        // 2. Methods and Accessors
        if (ts.isMethodDeclaration(member)) {
            info.methods.set(name, { node: member, kind: 'method' });
        } else if (ts.isPropertyDeclaration(member) && member.initializer && 
            (ts.isArrowFunction(member.initializer) || ts.isFunctionExpression(member.initializer))) {
            info.methods.set(name, { node: member, kind: 'method' });
        } else if (ts.isGetAccessor(member)) {
            info.methods.set(name, { node: member, kind: 'getter' });
        } else if (ts.isSetAccessor(member)) {
            if (!info.methods.has(name)) {
                info.methods.set(name, { node: member, kind: 'setter' });
            }
        }
    });
}

function extractFromObject(objNode, info) {
    objNode.properties.forEach(prop => {
        const name = prop.name ? prop.name.getText() : null;
        if (!name) return;

        // State, Inject, Pipes (Properties)
        if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
            if (name === 'state') {
                prop.initializer.properties.forEach(p => {
                    if (ts.isPropertyAssignment(p)) {
                        info.state.set(p.name.getText(), {
                            node: p,
                            value: p.initializer
                        });
                    }
                });
            } else if (name === 'inject') {
                prop.initializer.properties.forEach(p => {
                    if (ts.isPropertyAssignment(p)) {
                        info.inject.set(p.name.getText(), {
                            serviceName: p.initializer.getText(),
                            node: p.initializer
                        });
                    }
                });
            } else if (name === 'pipes') {
                prop.initializer.properties.forEach(p => {
                    if (ts.isPropertyAssignment(p)) {
                        info.pipes.set(p.name.getText(), {
                            className: p.initializer.getText(),
                            node: p.initializer
                        });
                    }
                });
            }
        }

        // Methods
        if (ts.isMethodDeclaration(prop)) {
            info.methods.set(name, { node: prop, kind: 'method' });
        } else if (ts.isPropertyAssignment(prop) && 
            (ts.isArrowFunction(prop.initializer) || ts.isFunctionExpression(prop.initializer))) {
            info.methods.set(name, { node: prop, kind: 'method' });
        }
    });
}

module.exports = {
    getComponentInfo
};
