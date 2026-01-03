// ============================================================================
// Component System
// ============================================================================
import { VNodeFlags } from './vdom.js';

// ============================================================================
// Performance & Optimizations
// ============================================================================
import { registerDelegatedHandler, shouldDelegate } from './event-delegation.js';
import { perfMonitor } from '../utils/performance.js';

// ============================================================================
// Features
// ============================================================================
import { AnimationManager } from '../animations/animation.js';

/**
 * Robust DOM Diffing and Rendering Engine.
 * Handles efficient DOM updates by comparing virtual/new nodes with the actual DOM.
 */

/**
 * Updates the target DOM element to match the source DOM element.
 * This is the main entry point for the diffing algorithm.
 * 
 * @param {Node} target - The current live DOM node
 * @param {Node|Object} source - The new node to match (DOM Node or VNode)
 * @param {Object} component - The component instance (for event binding)
 * @param {Object} [refs] - The references map for the current render cycle
 */
export function render(target, source, component, refs) {
    const start = perfMonitor.startMeasure('render');

    try {
        // If target is a shadow root, we need to diff its children
        if (target instanceof ShadowRoot) {
            if (Array.isArray(source) || source.flags) {
                // VNode Root (usually an array or a single element)
                // If source is an array (fragment), diff children directly
                const vnodes = Array.isArray(source) ? source : [source];
                diffChildrenVNode(target, vnodes, component, refs);
            } else {
                diffChildren(target, source, component, refs);
            }
        } else {
            if (source.flags) {
                diffVNode(target, source, component, refs);
            } else {
                diff(target, source, component, refs);
            }
        }
    } finally {
        perfMonitor.endMeasure('render', start);
    }
}

/**
 * Diffs a real DOM node against a VNode.
 */
function diffVNode(target, vnode, component, refs) {
    if (!vnode) {
        if (target) handleRemoval(target.parentNode, target, component);
        return;
    }

    // Legacy Support: Handle real DOM nodes
    if (vnode.nodeType) {
        if (target !== vnode) {
            if (target && target.parentNode) {
                target.parentNode.replaceChild(vnode, target);
            }
            return vnode;
        }
        return target;
    }

    // If target doesn't exist or is different type, replace/create
    if (!target || isDifferentVNode(target, vnode)) {
        const newNode = createNode(vnode, component, refs);
        if (target && target.parentNode) {
            handleReplacement(target.parentNode, target, newNode, component, refs);
        }
        return newNode;
    }

    // Update Element
    if (vnode.flags & VNodeFlags.ELEMENT) {
        updateAttributesVNode(target, vnode.props, component, refs);
        
        // Skip children diffing if innerHTML is managed by props
        // This prevents diffChildrenVNode from clearing the content set by innerHTML
        const hasInnerHTML = vnode.props && vnode.props['[innerHTML]'] !== undefined;
        
        if (!hasInnerHTML) {
            diffChildrenVNode(target, vnode.children || [], component, refs);
        }
    } 
    // Update Text
    else if (vnode.flags & VNodeFlags.TEXT) {
        if (target.nodeValue !== vnode.text) {
            target.nodeValue = vnode.text;
        }
    }
    
    return target;
}

function isDifferentVNode(node, vnode) {
    if (vnode.nodeType) {
        return node !== vnode;
    }
    if (vnode.flags & VNodeFlags.TEXT) {
        return node.nodeType !== Node.TEXT_NODE;
    }
    
    // Safety check for malformed VNodes
    if (!vnode.tag) {
        return true;
    }

    return node.nodeType !== Node.ELEMENT_NODE || 
           node.tagName.toLowerCase() !== vnode.tag.toLowerCase();
}

function createNode(vnode, component, refs) {
    if (vnode.nodeType) {
        return vnode;
    }

    if (vnode.flags & VNodeFlags.TEXT) {
        return document.createTextNode(vnode.text);
    }
    
    // Safety check for malformed VNodes
    if (!vnode.tag) {
        console.warn('Render Error: Malformed VNode (missing tag)', {
            vnode,
            component: component ? component.tagName : 'unknown',
            json: JSON.stringify(vnode)
        });
        return document.createComment('error: malformed vnode');
    }

    const el = document.createElement(vnode.tag);
    // Store key on the element for efficient retrieval during diffing
    if (vnode.key != null) {
        el._key = vnode.key;
    }
    updateAttributesVNode(el, vnode.props, component, refs, true);
    
    if (!vnode.children) {
        // This can happen if a VNode is manually created without children or malformed
        vnode.children = [];
    }

    vnode.children.forEach(child => {
        if (child) {
            el.appendChild(createNode(child, component, refs));
        }
    });
    
    return el;
}

function updateAttributesVNode(target, props, component, refs, isNew = false) {
    if (!props) return;

    // Optimization: Check if props are identical to last render
    // We store the previous props on the DOM node
    if (!isNew && target._props && arePropsEqual(target._props, props)) {
        return;
    }
    target._props = props;

    // Remove old attributes
    // Note: We don't track old props on the DOM node easily without storing them.
    // For now, we iterate over attributes on the DOM and remove those not in props.
    // This is slightly expensive but correct.
    if (!isNew) {
        // Optimization: Iterate backwards to safely remove attributes
        // and avoid Array.from allocation
        const attrs = target.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
            const attr = attrs[i];
            if (!(attr.name in props) && !isEventProp(attr.name) && !isBindingProp(attr.name)) {
                 target.removeAttribute(attr.name);
            }
        }
    }

    // Set new attributes
    for (const [name, value] of Object.entries(props)) {
        // Event Binding: (event)="method"
        if (name.startsWith('(') && name.endsWith(')')) {
            const eventName = name.slice(1, -1);
            const handlerFn = value;

            // Try to use event delegation for better performance
            if (shouldDelegate(eventName)) {
                // Use delegation for supported events
                registerDelegatedHandler(target, eventName, handlerFn);
            } else {
                // Fall back to direct listeners for unsupported events
                if (!target._listeners) target._listeners = {};

                // If handler changed
                if (!target._listeners[eventName] || target._listeners[eventName].raw !== handlerFn) {
                    if (target._listeners[eventName]) {
                        target.removeEventListener(eventName, target._listeners[eventName].handler);
                    }

                    const handler = (e) => {
                        if (typeof handlerFn === 'function') {
                            handlerFn(e);
                        } else if (typeof component[handlerFn] === 'function') {
                            // Legacy string support
                            component[handlerFn](e);
                        } else {
                            // Legacy eval support
                            try {
                                new Function('$event', handlerFn).call(component, e);
                            } catch (err) {
                                console.warn(`Event handler failed:`, err);
                            }
                        }
                    };

                    target.addEventListener(eventName, handler);
                    target._listeners[eventName] = { raw: handlerFn, handler };
                }
            }
            continue;
        }

        // Property Binding: [prop]="value"
        if (name.startsWith('[') && name.endsWith(']')) {
            const propName = name.slice(1, -1);
            let resolvedValue = value;
            
            // Check for Directives
            if (component.getDirective && component.getDirective(propName)) {
                applyDirective(target, propName, resolvedValue, component);
                continue;
            }

            if (propName === 'innerHTML') {
                if (target.innerHTML !== resolvedValue) {
                    target.innerHTML = resolvedValue;
                }
                continue;
            }

            target[propName] = resolvedValue;
            continue;
        }

        // Standard Attribute
        if (component.getDirective && component.getDirective(name)) {
            applyDirective(target, name, value, component);
            // Continue to set the attribute as well
        }

        if (name.startsWith('@')) {
            // Skip framework specific attributes that leaked through
            return;
        }

        if (target.getAttribute(name) !== String(value)) {
            target.setAttribute(name, value);
            if (target.tagName === 'INPUT' && name === 'checked') {
                target.checked = true; // Handle boolean attribute quirk
            }
        }
    }
}

function isEventProp(name) {
    return name.startsWith('(') && name.endsWith(')');
}

function isBindingProp(name) {
    return name.startsWith('[') && name.endsWith(']');
}

/**
 * Diffs children using VNodes.
 */
/**
 * Helper to check if a DOM node can be reused for a VNode
 */
function canReuseNode(domNode, vnode) {
    if (!domNode || !vnode) return false;

    // Check node type compatibility
    if (vnode.flags & VNodeFlags.TEXT) {
        return domNode.nodeType === Node.TEXT_NODE;
    }

    if (vnode.flags & VNodeFlags.ELEMENT) {
        return domNode.nodeType === Node.ELEMENT_NODE &&
               domNode.tagName.toLowerCase() === vnode.tag.toLowerCase();
    }

    return false;
}

function diffChildrenVNode(target, vnodes, component, refs) {
    // Optimization: Fast Clear
    if (vnodes.length === 0 && target.firstChild) {
        // If no animations, we can try to be faster
        if (!component.constructor.animations) {
             let child = target.firstChild;
             let hasDirectives = false;
             while (child) {
                 if (child._directives) {
                     hasDirectives = true;
                     break;
                 }
                 child = child.nextSibling;
             }

             if (!hasDirectives) {
                 target.textContent = '';
                 return;
             }
        }
    }

    // Fast path optimizations for common list operations
    const oldChildren = [];
    let child = target.firstChild;
    while (child) {
        oldChildren.push(child);
        child = child.nextSibling;
    }
    const oldLength = oldChildren.length;
    const newLength = vnodes.length;

    // Optimization 1: Complete replacement (different lengths, no keys)
    if (oldLength === 0 && newLength > 0) {
        // Just append all new nodes
        for (const vnode of vnodes) {
            target.appendChild(createNode(vnode, component, refs));
        }
        return;
    }

    // Optimization 2: Append detection (most common in benchmarks)
    if (oldLength > 0 && newLength > oldLength) {
        let isAppend = true;
        // Check if the first oldLength items match
        for (let i = 0; i < oldLength && isAppend; i++) {
            if (!canReuseNode(oldChildren[i], vnodes[i])) {
                isAppend = false;
            }
        }

        if (isAppend) {
            // Update existing nodes
            for (let i = 0; i < oldLength; i++) {
                diffVNode(oldChildren[i], vnodes[i], component, refs);
            }
            // Append new nodes
            for (let i = oldLength; i < newLength; i++) {
                target.appendChild(createNode(vnodes[i], component, refs));
            }
            return;
        }
    }

    // Optimization 3: Swap detection (common in benchmarks)
    if (oldLength === newLength && oldLength > 1) {
        let swapIndices = [];
        for (let i = 0; i < oldLength; i++) {
            if (!canReuseNode(oldChildren[i], vnodes[i])) {
                swapIndices.push(i);
            }
        }

        // Check if it's a simple two-element swap
        if (swapIndices.length === 2) {
            const [i, j] = swapIndices;
            if (canReuseNode(oldChildren[i], vnodes[j]) &&
                canReuseNode(oldChildren[j], vnodes[i])) {
                // Perform the swap
                const tempNode = oldChildren[i];
                const nextSibling = oldChildren[j].nextSibling;

                // Move node i to position j
                target.insertBefore(oldChildren[i], nextSibling);
                // Move node j to position i
                target.insertBefore(oldChildren[j], tempNode.nextSibling);

                // Update the swapped nodes
                diffVNode(oldChildren[i], vnodes[j], component, refs);
                diffVNode(oldChildren[j], vnodes[i], component, refs);

                // Update all other nodes
                for (let k = 0; k < oldLength; k++) {
                    if (k !== i && k !== j) {
                        diffVNode(oldChildren[k], vnodes[k], component, refs);
                    }
                }
                return;
            }
        }
    }

    // Keyed Diffing Check
    let hasKeys = false;
    let checkNode = target.firstChild;
    while (checkNode) {
        if (checkNode.nodeType === Node.ELEMENT_NODE && checkNode._key != null) {
            hasKeys = true;
            break;
        }
        checkNode = checkNode.nextSibling;
    }

    if (hasKeys) {
        const oldChildren = [];
        let child = target.firstChild;
        while (child) {
            oldChildren.push(child);
            child = child.nextSibling;
        }

        let oldStartIdx = 0;
        let oldEndIdx = oldChildren.length - 1;
        let newStartIdx = 0;
        let newEndIdx = vnodes.length - 1;

        let oldStartVNode = oldChildren[0];
        let oldEndVNode = oldChildren[oldEndIdx];
        let newStartVNode = vnodes[0];
        let newEndVNode = vnodes[newEndIdx];

        // Sync Head
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVNode == null) {
                oldStartVNode = oldChildren[++oldStartIdx];
            } else if (oldEndVNode == null) {
                oldEndVNode = oldChildren[--oldEndIdx];
            } else if (isSameKey(oldStartVNode, newStartVNode)) {
                diffVNode(oldStartVNode, newStartVNode, component, refs);
                oldStartVNode = oldChildren[++oldStartIdx];
                newStartVNode = vnodes[++newStartIdx];
            } else if (isSameKey(oldEndVNode, newEndVNode)) {
                diffVNode(oldEndVNode, newEndVNode, component, refs);
                oldEndVNode = oldChildren[--oldEndIdx];
                newEndVNode = vnodes[--newEndIdx];
            } else if (isSameKey(oldStartVNode, newEndVNode)) {
                // Node moved right
                target.insertBefore(oldStartVNode, oldEndVNode.nextSibling);
                diffVNode(oldStartVNode, newEndVNode, component, refs);
                oldStartVNode = oldChildren[++oldStartIdx];
                newEndVNode = vnodes[--newEndIdx];
            } else if (isSameKey(oldEndVNode, newStartVNode)) {
                // Node moved left
                target.insertBefore(oldEndVNode, oldStartVNode);
                diffVNode(oldEndVNode, newStartVNode, component, refs);
                oldEndVNode = oldChildren[--oldEndIdx];
                newStartVNode = vnodes[++newStartIdx];
            } else {
                // Unknown sequence, map based
                break;
            }
        }

        // If we broke out, we have a middle section to handle
        if (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            const keyedMap = new Map();
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                const child = oldChildren[i];
                if (child && child._key != null) {
                    keyedMap.set(child._key, child);
                }
            }

            while (newStartIdx <= newEndIdx) {
                const newVNode = vnodes[newStartIdx];
                const key = newVNode.key;
                
                if (key != null && keyedMap.has(key)) {
                    const oldNode = keyedMap.get(key);
                    target.insertBefore(oldNode, oldStartVNode);
                    diffVNode(oldNode, newVNode, component, refs);
                    keyedMap.delete(key);
                    // Mark the old node as processed in the array so we don't remove it later
                    // We can't easily find its index in oldChildren without scanning or storing it
                    // But we can just remove it from DOM, and later cleanup whatever is left in DOM?
                    // Actually, we need to mark it as reused.
                    oldNode._reused = true;
                } else {
                    const newNode = createNode(newVNode, component, refs);
                    target.insertBefore(newNode, oldStartVNode);
                    if (component.constructor.animations && newNode.nodeType === Node.ELEMENT_NODE && newNode.hasAttribute('animate')) {
                        checkAnimations(newNode, component, ':enter');
                    }
                }
                newStartIdx++;
            }
        }

        // Add remaining new nodes
        if (oldStartIdx > oldEndIdx) {
            const referenceNode = newEndIdx + 1 < vnodes.length ? oldChildren[oldStartIdx] : null; // This logic is tricky with mixed DOM/VNodes
            // Simpler: insert before the current oldStartVNode (which is where we are)
            const anchor = oldStartVNode; 
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                const newNode = createNode(vnodes[i], component, refs);
                target.insertBefore(newNode, anchor);
                if (component.constructor.animations && newNode.nodeType === Node.ELEMENT_NODE && newNode.hasAttribute('animate')) {
                    checkAnimations(newNode, component, ':enter');
                }
            }
        }

        // Remove remaining old nodes
        if (newStartIdx > newEndIdx) {
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                const node = oldChildren[i];
                if (node && !node._reused) {
                    handleRemoval(target, node, component);
                }
                if (node) delete node._reused;
            }
        }
        
        // Cleanup reused flags from map section
        // (Handled above by only removing if !reused)
        
        return;
    }

    // Index-based Diffing (Optimized)
    let tChild = target.firstChild;
    
    for (let i = 0; i < vnodes.length; i++) {
        const vChild = vnodes[i];
        
        if (!tChild) {
            // Append new node
            if (vChild) {
                const newNode = createNode(vChild, component, refs);
                target.appendChild(newNode);
                if (component.constructor.animations && newNode.nodeType === Node.ELEMENT_NODE && newNode.hasAttribute('animate')) {
                    checkAnimations(newNode, component, ':enter');
                }
            }
        } else {
            // Diff or Replace
            const nextNode = tChild.nextSibling;
            diffVNode(tChild, vChild, component, refs);
            tChild = nextNode;
        }
    }
    
    // Remove remaining nodes
    while (tChild) {
        const next = tChild.nextSibling;
        handleRemoval(target, tChild, component);
        tChild = next;
    }
}

function isSameKey(node, vnode) {
    if (!node || !vnode) return false;
    return node._key === vnode.key;
}

/**
 * Recursively diffs two nodes and updates the target.
 * 
 * @param {Node} target - The current live DOM node
 * @param {Node} source - The new node to match
 * @param {Object} component - The component instance
 * @param {Object} [refs] - The references map for the current render cycle
 */
export function diff(target, source, component, refs) {
    // 1. Update Attributes and Events
    if (target.nodeType === Node.ELEMENT_NODE && source.nodeType === Node.ELEMENT_NODE) {
        updateAttributes(target, source, component, refs);
    }

    // 2. Diff Children
    diffChildren(target, source, component, refs);
}

/**
 * Diffs the children of two nodes.
 * 
 * @param {Node} target - The parent node in the live DOM
 * @param {Node} source - The parent node containing new children
 * @param {Object} component - The component instance
 * @param {Object} [refs] - The references map for the current render cycle
 */
function diffChildren(target, source, component, refs) {
    const targetChildren = Array.from(target.childNodes);
    const sourceChildren = Array.from(source.childNodes);

    // 1. Keyed Diffing Check
    const keyedMap = new Map();
    let hasKeys = false;

    targetChildren.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('key')) {
            keyedMap.set(child.getAttribute('key'), child);
            hasKeys = true;
        }
    });

    if (hasKeys) {
        const targetChildrenSet = new Set(targetChildren);
        let nextSibling = target.firstChild;

        sourceChildren.forEach((sChild) => {
            const key = sChild.nodeType === Node.ELEMENT_NODE ? sChild.getAttribute('key') : null;
            let tChild = null;

            if (key && keyedMap.has(key)) {
                tChild = keyedMap.get(key);
                keyedMap.delete(key); // Mark as claimed
            }

            if (tChild) {
                // We found a matching node.
                if (tChild !== nextSibling) {
                    // Move it to the current position
                    target.insertBefore(tChild, nextSibling);
                } else {
                    // It's already in place, just advance the cursor
                    nextSibling = nextSibling.nextSibling;
                }
                
                // Mark as reused so we don't delete it
                targetChildrenSet.delete(tChild);
                
                // Diff it
                diff(tChild, sChild, component, refs);
            } else {
                // New node (or non-keyed). Insert it.
                if (nextSibling) {
                    target.insertBefore(sChild, nextSibling);
                } else {
                    target.appendChild(sChild);
                }
                processBindings(sChild, component, refs);
                checkAnimations(sChild, component, ':enter');
            }
        });

        // Remove remaining nodes
        targetChildrenSet.forEach(node => {
            handleRemoval(target, node, component);
        });
        
        return;
    }

    // 2. Fallback to Index-based Diffing
    const maxLength = Math.max(targetChildren.length, sourceChildren.length);

    for (let i = 0; i < maxLength; i++) {
        const tChild = targetChildren[i];
        const sChild = sourceChildren[i];

        if (!tChild) {
            // New node
            target.appendChild(sChild);
            processBindings(sChild, component, refs);
            checkAnimations(sChild, component, ':enter');
        } else if (!sChild) {
            // Remove node
            handleRemoval(target, tChild, component);
        } else if (isDifferent(tChild, sChild)) {
            // Replace node
            handleReplacement(target, tChild, sChild, component, refs);
        } else if (tChild.nodeType === Node.TEXT_NODE) {
            // Update text
            if (tChild.nodeValue !== sChild.nodeValue) {
                tChild.nodeValue = sChild.nodeValue;
            }
        } else if (tChild.nodeType === Node.ELEMENT_NODE) {
            // Recurse
            diff(tChild, sChild, component, refs);
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

function arePropsEqual(oldProps, newProps) {
    if (oldProps === newProps) return true;
    const keys1 = Object.keys(oldProps);
    const keys2 = Object.keys(newProps);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
        if (oldProps[key] !== newProps[key]) return false;
    }
    return true;
}

/**
 * Updates attributes and event listeners on a DOM element.
 * 
 * @param {Element} target - The element to update
 * @param {Element} source - The element with new attributes
 * @param {Object} component - The component instance
 * @param {Object} [refs] - The references map for the current render cycle
 */
function updateAttributes(target, source, component, refs) {
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
                    // 1. Try direct method call
                    if (typeof component[methodName] === 'function') {
                        component[methodName](e);
                        return;
                    }

                    // 2. Try evaluating as expression
                    try {
                        // Create function with $event available and 'this' bound to component
                        new Function('$event', methodName).call(component, e);
                    } catch (err) {
                        console.warn(`Method ${methodName} not found on component and evaluation failed:`, err);
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
            
            let resolvedValue = value;
            // Check if value is a reference key
            // Use passed refs if available, otherwise fallback to component._refs
            const currentRefs = refs || component._refs;
            
            if (currentRefs && value in currentRefs) {
                resolvedValue = currentRefs[value];
            }

            // Check for Directives
            if (component.getDirective && component.getDirective(propName)) {
                applyDirective(target, propName, resolvedValue, component);
                return;
            }

            target[propName] = resolvedValue;
            return; // Don't set the attribute on DOM
        }

        // Standard Attribute
        if (component.getDirective && component.getDirective(name)) {
            applyDirective(target, name, value, component);
            // Continue to set the attribute as well
        }

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
 * Applies a directive to an element.
 * 
 * @param {Element} element - The target element
 * @param {string} selector - The directive selector
 * @param {any} value - The bound value
 * @param {Object} component - The component instance
 */
function applyDirective(element, selector, value, component) {
    if (!element._directives) {
        element._directives = {};
    }

    let directive = element._directives[selector];
    
    if (!directive) {
        const DirectiveClass = component.getDirective(selector);
        if (DirectiveClass) {
            directive = new DirectiveClass(element, component);
            element._directives[selector] = directive;
            if (directive.onInit) directive.onInit();
        }
    }

    if (directive && directive.onUpdate) {
        directive.onUpdate(value);
    }
}

/**
 * Recursively processes bindings for a new node tree.
 * Ensures that properties and events are correctly attached to new nodes.
 * 
 * @param {Node} node - The new node to process
 * @param {Object} component - The component instance
 * @param {Object} [refs] - The references map for the current render cycle
 */
function processBindings(node, component, refs) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        // Apply attributes logic to set properties/events on new nodes
        updateAttributes(node, node, component, refs);
        
        // Recurse
        node.childNodes.forEach(child => processBindings(child, component, refs));
    }
}

/**
 * Handles node removal with optional animation.
 */
function handleRemoval(parent, node, component) {
    // Cleanup directives
    if (node._directives) {
        Object.values(node._directives).forEach(directive => {
            if (directive.onDestroy) directive.onDestroy();
        });
        node._directives = null;
    }

    const result = checkAnimations(node, component, ':leave');

    if (result && typeof result.then === 'function') {
        result.then(() => {
            if (parent.contains(node)) {
                parent.removeChild(node);
            }
        });
    } else {
        if (parent.contains(node)) {
            parent.removeChild(node);
        }
    }
}

/**
 * Handles node replacement with optional animation.
 */
function handleReplacement(parent, oldNode, newNode, component, refs) {
    const result = checkAnimations(oldNode, component, ':leave');
    
    const replace = () => {
        if (parent.contains(oldNode)) {
            parent.replaceChild(newNode, oldNode);
            processBindings(newNode, component, refs);
            checkAnimations(newNode, component, ':enter');
        }
    };

    if (result && typeof result.then === 'function') {
        result.then(replace);
    } else {
        replace();
    }
}

/**
 * Checks and executes animations for a node.
 * @returns {Promise<boolean>|boolean} True if an animation was played
 */
function checkAnimations(node, component, state) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    
    const animationsConfig = component.constructor.animations;
    if (!animationsConfig) return false;

    // Look for animation triggers in attributes
    // We support *animate="triggerName" or just matching trigger names if we had a parser
    // For now, let's look for a specific attribute `animate`
    const triggerName = node.getAttribute('animate');
    
    if (triggerName) {
        return AnimationManager.animate(node, triggerName, state, animationsConfig).then(() => true);
    }
    return false;
}
