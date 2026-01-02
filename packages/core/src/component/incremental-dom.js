/**
 * Incremental DOM System
 * Provides direct DOM manipulation for performance-critical updates
 * Bypasses VDOM for simple property/text changes
 */

// Map to track bindings between state paths and DOM nodes
const stateBindings = new WeakMap();

// Map to track text nodes and their expressions
const textNodeBindings = new WeakMap();

// Map to track attribute bindings
const attrBindings = new WeakMap();

/**
 * Patch modes for different update types
 */
export const PatchMode = {
    FULL: 'full',        // Full VDOM diff (fallback)
    INCREMENTAL: 'incremental',  // Direct DOM updates
    NONE: 'none'         // No update needed
};

/**
 * Analyze a state change to determine the optimal patch mode
 */
export function analyzePatch(oldState, newState, component) {
    // If states are identical, no update needed
    if (oldState === newState) {
        return { mode: PatchMode.NONE };
    }

    // Collect changed paths
    const changedPaths = [];
    const changes = {};

    function compareObjects(old, new_, path = '') {
        // Handle primitives
        if (typeof old !== 'object' || typeof new_ !== 'object' ||
            old === null || new_ === null) {
            if (old !== new_) {
                changedPaths.push(path);
                changes[path] = { old, new: new_ };
            }
            return;
        }

        // Handle arrays specially
        if (Array.isArray(old) && Array.isArray(new_)) {
            if (old.length !== new_.length) {
                // Length changed - needs full update
                changedPaths.push(path);
                changes[path] = { old, new: new_, type: 'array' };
                return;
            }

            // Check each item
            for (let i = 0; i < old.length; i++) {
                compareObjects(old[i], new_[i], path ? `${path}[${i}]` : `[${i}]`);
            }
            return;
        }

        // Handle objects
        const allKeys = new Set([...Object.keys(old), ...Object.keys(new_)]);
        for (const key of allKeys) {
            const subPath = path ? `${path}.${key}` : key;

            if (!(key in new_)) {
                // Property deleted
                changedPaths.push(subPath);
                changes[subPath] = { old: old[key], new: undefined, deleted: true };
            } else if (!(key in old)) {
                // Property added
                changedPaths.push(subPath);
                changes[subPath] = { old: undefined, new: new_[key], added: true };
            } else {
                compareObjects(old[key], new_[key], subPath);
            }
        }
    }

    compareObjects(oldState, newState);

    // Determine if we can use incremental updates
    const canUseIncremental = changedPaths.every(path => {
        const change = changes[path];
        // Arrays and complex object changes need full diff
        return !change.type && !change.added && !change.deleted;
    });

    return {
        mode: canUseIncremental ? PatchMode.INCREMENTAL : PatchMode.FULL,
        changedPaths,
        changes
    };
}

/**
 * Track a text node binding
 */
export function trackTextBinding(node, expression, component) {
    if (!textNodeBindings.has(component)) {
        textNodeBindings.set(component, new Map());
    }

    const bindings = textNodeBindings.get(component);
    bindings.set(node, {
        expression,
        lastValue: node.textContent
    });
}

/**
 * Track an attribute binding
 */
export function trackAttributeBinding(element, attrName, expression, component) {
    if (!attrBindings.has(component)) {
        attrBindings.set(component, new Map());
    }

    const bindings = attrBindings.get(component);
    const key = `${element}_${attrName}`;

    bindings.set(key, {
        element,
        attrName,
        expression,
        lastValue: element.getAttribute(attrName)
    });
}

/**
 * Apply incremental updates based on state changes
 */
export function applyIncrementalUpdates(component, changes) {
    const textBindings = textNodeBindings.get(component);
    const attributeBindings = attrBindings.get(component);
    let updatedCount = 0;

    // Update text nodes
    if (textBindings) {
        for (const [node, binding] of textBindings) {
            // Check if this binding is affected by any change
            let needsUpdate = false;
            let newValue = binding.expression;

            // Simple path matching (can be improved)
            for (const path of Object.keys(changes)) {
                if (binding.expression.includes(path)) {
                    needsUpdate = true;
                    // Evaluate the new value (simplified)
                    try {
                        // This is a simplified evaluation - in production you'd want proper expression evaluation
                        newValue = evaluateExpression(binding.expression, component.state);
                    } catch (e) {
                        console.warn('Failed to evaluate expression:', binding.expression);
                        continue;
                    }
                    break;
                }
            }

            if (needsUpdate && node.textContent !== newValue) {
                node.textContent = newValue;
                binding.lastValue = newValue;
                updatedCount++;
            }
        }
    }

    // Update attributes
    if (attributeBindings) {
        for (const [key, binding] of attributeBindings) {
            let needsUpdate = false;
            let newValue = binding.expression;

            for (const path of Object.keys(changes)) {
                if (binding.expression.includes(path)) {
                    needsUpdate = true;
                    try {
                        newValue = evaluateExpression(binding.expression, component.state);
                    } catch (e) {
                        console.warn('Failed to evaluate expression:', binding.expression);
                        continue;
                    }
                    break;
                }
            }

            if (needsUpdate && binding.element.getAttribute(binding.attrName) !== newValue) {
                if (newValue === null || newValue === undefined || newValue === false) {
                    binding.element.removeAttribute(binding.attrName);
                } else {
                    binding.element.setAttribute(binding.attrName, newValue);
                }
                binding.lastValue = newValue;
                updatedCount++;
            }
        }
    }

    return updatedCount;
}

/**
 * Simple expression evaluator (for demo - needs proper implementation)
 */
function evaluateExpression(expr, state) {
    // Handle simple property access like "state.name" or "state.items[0].label"
    if (expr.startsWith('state.')) {
        const path = expr.substring(6); // Remove 'state.'
        return getValueByPath(state, path);
    }

    // Handle template literals or complex expressions
    // In production, you'd want a proper expression parser
    try {
        // Create a function that evaluates the expression in the context of state
        const fn = new Function('state', `return ${expr}`);
        return fn(state);
    } catch (e) {
        return expr; // Return as-is if evaluation fails
    }
}

/**
 * Get value from object by path string
 */
function getValueByPath(obj, path) {
    const keys = path.split(/\.|\[|\]/).filter(Boolean);
    let result = obj;

    for (const key of keys) {
        if (result == null) return undefined;
        result = result[key];
    }

    return result;
}

/**
 * Clear all bindings for a component
 */
export function clearBindings(component) {
    textNodeBindings.delete(component);
    attrBindings.delete(component);
    stateBindings.delete(component);
}

/**
 * Optimize list operations by detecting common patterns
 */
export function optimizeListOperation(oldItems, newItems) {
    if (!oldItems || !newItems) {
        return { type: 'replace' };
    }

    const oldLen = oldItems.length;
    const newLen = newItems.length;

    // Empty to populated
    if (oldLen === 0 && newLen > 0) {
        return { type: 'create', items: newItems };
    }

    // Populated to empty
    if (oldLen > 0 && newLen === 0) {
        return { type: 'clear' };
    }

    // Check for append
    if (newLen > oldLen) {
        let isAppend = true;
        for (let i = 0; i < oldLen; i++) {
            if (!itemsEqual(oldItems[i], newItems[i])) {
                isAppend = false;
                break;
            }
        }
        if (isAppend) {
            return {
                type: 'append',
                items: newItems.slice(oldLen),
                startIndex: oldLen
            };
        }
    }

    // Check for prepend
    if (newLen > oldLen) {
        const diff = newLen - oldLen;
        let isPrepend = true;
        for (let i = 0; i < oldLen; i++) {
            if (!itemsEqual(oldItems[i], newItems[i + diff])) {
                isPrepend = false;
                break;
            }
        }
        if (isPrepend) {
            return {
                type: 'prepend',
                items: newItems.slice(0, diff)
            };
        }
    }

    // Check for single swap (common in benchmarks)
    if (oldLen === newLen && oldLen > 1) {
        let differences = [];
        for (let i = 0; i < oldLen; i++) {
            if (!itemsEqual(oldItems[i], newItems[i])) {
                differences.push(i);
            }
        }

        if (differences.length === 2) {
            const [i, j] = differences;
            if (itemsEqual(oldItems[i], newItems[j]) &&
                itemsEqual(oldItems[j], newItems[i])) {
                return {
                    type: 'swap',
                    index1: i,
                    index2: j
                };
            }
        }
    }

    // Check for updates (same length, some items changed)
    if (oldLen === newLen) {
        const updates = [];
        for (let i = 0; i < oldLen; i++) {
            if (!itemsEqual(oldItems[i], newItems[i])) {
                updates.push({ index: i, item: newItems[i] });
            }
        }

        if (updates.length > 0 && updates.length < oldLen / 2) {
            return { type: 'update', updates };
        }
    }

    // Fallback to full replacement
    return { type: 'replace' };
}

/**
 * Check if two items are equal (for list optimization)
 */
function itemsEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    // Check by id if available
    if ('id' in a && 'id' in b) return a.id === b.id;
    if ('key' in a && 'key' in b) return a.key === b.key;

    // Shallow comparison of properties
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => a[key] === b[key]);
}