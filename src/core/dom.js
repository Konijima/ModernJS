/**
 * Helper to create DOM elements
 * @param {string} tag 
 * @param {object} props 
 * @param {...(string|Node|Array)} children 
 * @returns {HTMLElement}
 */
export function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);

    Object.entries(props || {}).forEach(([name, value]) => {
        if (name.startsWith('on') && typeof value === 'function') {
            const eventName = name.toLowerCase().substring(2);
            element.addEventListener(eventName, value);
            // Store for diffing
            if (!element._props) element._props = {};
            element._props[eventName] = value;
        } else if (name.startsWith('[') && name.endsWith(']')) {
            // Property Binding
            const propName = name.slice(1, -1);
            element[propName] = value;
            if (!element._properties) element._properties = {};
            element._properties[propName] = value;
        } else {
            if (value !== undefined && value !== null && value !== false) {
                element.setAttribute(name, value);
            }
            // Handle checked property for checkboxes
            if (tag === 'input' && name === 'checked' && value) {
                element.checked = true;
            }
        }
    });

    children.flat().forEach(child => {
        if (child === null || child === undefined) return;
        
        if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}
