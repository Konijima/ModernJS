/**
 * Robust DOM Diffing and Rendering Engine
 */

/**
 * Updates the target DOM element to match the source DOM element
 * @param {Node} target - The current live DOM node
 * @param {Node} source - The new node to match
 * @param {Object} component - The component instance (for event binding)
 */
export function diff(target, source, component) {
    // 1. Update Attributes and Events
    if (target.nodeType === Node.ELEMENT_NODE && source.nodeType === Node.ELEMENT_NODE) {
        updateAttributes(target, source, component);
    }

    // 2. Diff Children
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

function isDifferent(node1, node2) {
    return node1.nodeType !== node2.nodeType || 
           node1.tagName !== node2.tagName;
}

function updateAttributes(target, source, component) {
    // Remove old attributes that are not in source
    Array.from(target.attributes).forEach(attr => {
        if (!source.hasAttribute(attr.name)) {
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

                if (typeof component[methodName] === 'function') {
                    const handler = component[methodName].bind(component);
                    target.addEventListener(eventName, handler);
                    target._listeners[eventName] = { method: methodName, handler };
                } else {
                    console.warn(`Method ${methodName} not found on component`);
                }
            }
            target.removeAttribute(name);
        } 
        // Property Binding: [prop]="value"
        else if (name.startsWith('[') && name.endsWith(']')) {
            const propName = name.slice(1, -1);
            if (target.getAttribute(propName) !== value) {
                target.setAttribute(propName, value);
            }
        }
        // Standard Attribute
        else {
            if (target.tagName === 'INPUT' && name === 'value' && target.value === value) {
                return; 
            }
            if (target.tagName === 'INPUT' && name === 'checked') {
                target.checked = value !== null && value !== 'false';
            }
            if (target.getAttribute(name) !== value) {
                target.setAttribute(name, value);
            }
        }
    });

    // Handle _properties (Complex Data Binding from createElement)
    if (source._properties || target._properties) {
        const sourceProps = source._properties || {};
        const targetProps = target._properties || {};
        
        Object.keys(sourceProps).forEach(prop => {
            if (target[prop] !== sourceProps[prop]) {
                target[prop] = sourceProps[prop];
            }
        });
        target._properties = sourceProps;
    }

    // Handle _props (Event Listeners from createElement)
    if (source._props || target._props) {
        const sourceProps = source._props || {};
        const targetProps = target._props || {};
        
        const allEvents = new Set([...Object.keys(sourceProps), ...Object.keys(targetProps)]);
        
        allEvents.forEach(event => {
            const newHandler = sourceProps[event];
            const oldHandler = targetProps[event];
            
            if (newHandler !== oldHandler) {
                if (oldHandler) target.removeEventListener(event, oldHandler);
                if (newHandler) target.addEventListener(event, newHandler);
            }
        });
        
        target._props = sourceProps;
    }
}

function processBindings(node, component) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        updateAttributes(node, node, component);
        Array.from(node.children).forEach(child => processBindings(child, component));
    }
}

/**
 * Main render function
 */
export function render(content, shadowRoot, component) {
    let sourceNode;

    if (typeof content === 'string') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        sourceNode = doc.body;
    } else if (content instanceof Node) {
        if (content.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            sourceNode = content;
        } else {
            const frag = document.createDocumentFragment();
            frag.appendChild(content);
            sourceNode = frag;
        }
    } else if (Array.isArray(content)) {
        const frag = document.createDocumentFragment();
        content.forEach(c => frag.appendChild(c));
        sourceNode = frag;
    } else {
        return; // Nothing to render
    }

    diff(shadowRoot, sourceNode, component);
}
