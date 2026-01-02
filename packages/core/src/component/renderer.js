import { AnimationManager } from '../animations/animation.js';
import { VNodeFlags } from './vdom.js';

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
        diffChildrenVNode(target, vnode.children || [], component, refs);
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
    updateAttributesVNode(el, vnode.props, component, refs);
    
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

function updateAttributesVNode(target, props, component, refs) {
    if (!props) return;

    // Remove old attributes
    // Note: We don't track old props on the DOM node easily without storing them.
    // For now, we iterate over attributes on the DOM and remove those not in props.
    // This is slightly expensive but correct.
    Array.from(target.attributes).forEach(attr => {
        if (!(attr.name in props) && !isEventProp(attr.name) && !isBindingProp(attr.name)) {
             target.removeAttribute(attr.name);
        }
    });

    // Set new attributes
    for (const [name, value] of Object.entries(props)) {
        // Event Binding: (event)="method"
        if (name.startsWith('(') && name.endsWith(')')) {
            const eventName = name.slice(1, -1);
            const handlerFn = value;
            
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
function diffChildrenVNode(target, vnodes, component, refs) {
    const targetChildren = Array.from(target.childNodes);
    
    // Keyed Diffing
    const keyedMap = new Map();
    let hasKeys = false;

    targetChildren.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('key')) {
            keyedMap.set(child.getAttribute('key'), child);
            hasKeys = true;
        }
    });

    // If we have keys in the DOM, we try to match them with keys in VNodes
    // Note: VNodes store key in `key` property, not props.
    
    if (hasKeys) {
        const targetChildrenSet = new Set(targetChildren);
        let nextSibling = target.firstChild;

        vnodes.forEach((vnode) => {
            if (!vnode) return;
            
            const key = vnode.key;
            let tChild = null;

            if (key && keyedMap.has(key)) {
                tChild = keyedMap.get(key);
                keyedMap.delete(key);
            }

            if (tChild) {
                if (tChild !== nextSibling) {
                    target.insertBefore(tChild, nextSibling);
                } else {
                    nextSibling = nextSibling.nextSibling;
                }
                targetChildrenSet.delete(tChild);
                diffVNode(tChild, vnode, component, refs);
            } else {
                const newNode = createNode(vnode, component, refs);
                if (nextSibling) {
                    target.insertBefore(newNode, nextSibling);
                } else {
                    target.appendChild(newNode);
                }
                // processBindings is handled in createNode via updateAttributesVNode
                checkAnimations(newNode, component, ':enter');
            }
        });

        targetChildrenSet.forEach(node => {
            handleRemoval(target, node, component);
        });
        return;
    }

    // Index-based Diffing
    const maxLength = Math.max(targetChildren.length, vnodes.length);

    for (let i = 0; i < maxLength; i++) {
        const tChild = targetChildren[i];
        const vChild = vnodes[i];

        if (!tChild) {
            if (vChild) {
                const newNode = createNode(vChild, component, refs);
                target.appendChild(newNode);
                checkAnimations(newNode, component, ':enter');
            }
        } else if (!vChild) {
            handleRemoval(target, tChild, component);
        } else {
            const newNode = diffVNode(tChild, vChild, component, refs);
            // If diffVNode returned a new node (replacement), it's already handled in diffVNode via handleReplacement
            // But wait, diffVNode returns the node. If it replaced it, we need to know?
            // My diffVNode implementation handles replacement internally if needed.
        }
    }
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
async function handleRemoval(parent, node, component) {
    // Cleanup directives
    if (node._directives) {
        Object.values(node._directives).forEach(directive => {
            if (directive.onDestroy) directive.onDestroy();
        });
        node._directives = null;
    }

    await checkAnimations(node, component, ':leave');
    if (parent.contains(node)) {
        parent.removeChild(node);
    }
}

/**
 * Handles node replacement with optional animation.
 */
async function handleReplacement(parent, oldNode, newNode, component, refs) {
    // For replacement, we can animate out the old node then swap
    // Or just swap immediately if no animation.
    // Simpler approach: just swap for now, or animate leave then swap.
    
    // Check if oldNode has leave animation
    const hasAnimation = await checkAnimations(oldNode, component, ':leave');
    
    if (parent.contains(oldNode)) {
        parent.replaceChild(newNode, oldNode);
        processBindings(newNode, component, refs);
        checkAnimations(newNode, component, ':enter');
    }
}

/**
 * Checks and executes animations for a node.
 * @returns {Promise<boolean>} True if an animation was played
 */
async function checkAnimations(node, component, state) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    
    const animationsConfig = component.constructor.animations;
    if (!animationsConfig) return false;

    // Look for animation triggers in attributes
    // We support *animate="triggerName" or just matching trigger names if we had a parser
    // For now, let's look for a specific attribute `animate`
    const triggerName = node.getAttribute('animate');
    
    if (triggerName) {
        await AnimationManager.animate(node, triggerName, state, animationsConfig);
        return true;
    }
    return false;
}
