/**
 * Robust DOM Diffing and Rendering Engine.
 * Handles efficient DOM updates by comparing virtual/new nodes with the actual DOM.
 */

/**
 * Updates the target DOM element to match the source DOM element.
 * This is the main entry point for the diffing algorithm.
 * 
 * @param {Node} target - The current live DOM node
 * @param {Node} source - The new node to match
 * @param {Object} component - The component instance (for event binding)
 */
export function render(target, source, component) {
    // If target is a shadow root, we need to diff its children
    if (target instanceof ShadowRoot) {
        diffChildren(target, source, component);
    } else {
        diff(target, source, component);
    }
}

/**
 * Recursively diffs two nodes and updates the target.
 * 
 * @param {Node} target - The current live DOM node
 * @param {Node} source - The new node to match
 * @param {Object} component - The component instance
 */
export function diff(target, source, component) {
    // 1. Update Attributes and Events
    if (target.nodeType === Node.ELEMENT_NODE && source.nodeType === Node.ELEMENT_NODE) {
        updateAttributes(target, source, component);
    }

    // 2. Diff Children
    diffChildren(target, source, component);
}

/**
 * Diffs the children of two nodes.
 * 
 * @param {Node} target - The parent node in the live DOM
 * @param {Node} source - The parent node containing new children
 * @param {Object} component - The component instance
 */
function diffChildren(target, source, component) {
    const targetChildren = Array.from(target.childNodes);
    const sourceChildren = Array.from(source.childNodes);
    const maxLength = Math.max(targetChildren.length, sourceChildren.length);

    for (let i = 0; i < maxLength; i++) {
        const tChild = targetChildren[i];
        const sChild = sourceChildren[i];

        if (!tChild) {
            // New node
            target.appendChild(sChild);
            processBindings(sChild, component);
        } else if (!sChild) {
            // Remove node
            target.removeChild(tChild);
        } else if (isDifferent(tChild, sChild)) {
            // Replace node
            target.replaceChild(sChild, tChild);
            processBindings(sChild, component);
        } else if (tChild.nodeType === Node.TEXT_NODE) {
            // Update text
            if (tChild.nodeValue !== sChild.nodeValue) {
                tChild.nodeValue = sChild.nodeValue;
            }
        } else if (tChild.nodeType === Node.ELEMENT_NODE) {
            // Recurse
            diff(tChild, sChild, component);
        }
    }
}

/**
 * Checks if two nodes are different enough to require replacement.
 * 
 * @param {Node} node1 - First node
 * @param {Node} node2 - Second node
 * @returns {boolean} True if nodes are different
 */
function isDifferent(node1, node2) {
    return node1.nodeType !== node2.nodeType || 
           node1.tagName !== node2.tagName;
}

/**
 * Updates attributes and event listeners on a DOM element.
 * 
 * @param {Element} target - The element to update
 * @param {Element} source - The element with new attributes
 * @param {Object} component - The component instance
 */
function updateAttributes(target, source, component) {
    // Remove old attributes that are not in source
    Array.from(target.attributes).forEach(attr => {
        if (!source.hasAttribute(attr.name)) {
            // Cleanup manual listeners if needed
            if (attr.name.startsWith('on')) {
                const eventName = attr.name.slice(2).toLowerCase();
                if (target._listeners && target._listeners[eventName]) {
                    target.removeEventListener(eventName, target._listeners[eventName].handler);
                    delete target._listeners[eventName];
                }
            }
            // Cleanup (event) listeners
            if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
                 const eventName = attr.name.slice(1, -1);
                 if (target._listeners && target._listeners[eventName]) {
                    target.removeEventListener(eventName, target._listeners[eventName].handler);
                    delete target._listeners[eventName];
                }
            }

            target.removeAttribute(attr.name);
            // Handle checked property removal
            if (target.tagName === 'INPUT' && attr.name === 'checked') {
                target.checked = false;
            }
        }
    });

    // Set new attributes
    Array.from(source.attributes).forEach(attr => {
        const name = attr.name;
        const value = attr.value;

        // Event Binding: (event)="method"
        if (name.startsWith('(') && name.endsWith(')')) {
            const eventName = name.slice(1, -1);
            const methodName = value;
            
            // Only update listener if it changed (or if it's new)
            if (!target._listeners) target._listeners = {};
            
            if (!target._listeners[eventName] || target._listeners[eventName].method !== methodName) {
                if (target._listeners[eventName]) {
                    target.removeEventListener(eventName, target._listeners[eventName].handler);
                }

                const handler = (e) => {
                    if (component[methodName]) {
                        component[methodName](e);
                    } else {
                        console.warn(`Method ${methodName} not found on component`);
                    }
                };

                target.addEventListener(eventName, handler);
                target._listeners[eventName] = { method: methodName, handler };
            }
            return; // Don't set the attribute on DOM
        }

        // Property Binding: [prop]="value"
        if (name.startsWith('[') && name.endsWith(']')) {
            const propName = name.slice(1, -1);
            
            // Check if value is a reference key
            if (component._refs && value in component._refs) {
                target[propName] = component._refs[value];
            } else {
                target[propName] = value;
            }
            return; // Don't set the attribute on DOM
        }

        // Standard Attribute
        if (target.getAttribute(name) !== value) {
            target.setAttribute(name, value);
            // Sync checked property for inputs
            if (target.tagName === 'INPUT' && name === 'checked') {
                target.checked = true;
            }
        }
    });
}

/**
 * Recursively processes bindings for a new node tree.
 * Ensures that properties and events are correctly attached to new nodes.
 * 
 * @param {Node} node - The new node to process
 * @param {Object} component - The component instance
 */
function processBindings(node, component) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        // Apply attributes logic to set properties/events on new nodes
        updateAttributes(node, node, component);
        
        // Recurse
        node.childNodes.forEach(child => processBindings(child, component));
    }
}
