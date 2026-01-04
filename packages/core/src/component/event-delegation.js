/**
 * Event Delegation System
 * Manages events at the component root level to reduce listener overhead
 */

// Map of delegated event types to their root handlers
const delegatedEvents = new WeakMap();

// Events that should be delegated (most common interactive events)
const DELEGATED_EVENTS = new Set([
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'keydown',
    'keyup',
    'keypress',
    'focus',
    'blur',
    'input',
    'change',
    'submit'
]);

/**
 * Setup event delegation for a component root
 * @param {Element|ShadowRoot} root - The component's root element (or shadow root)
 * @param {Object} component - The component instance
 */
export function setupEventDelegation(root, component) {
    if (!root || delegatedEvents.has(root)) return;

    const handlers = new Map();
    delegatedEvents.set(root, handlers);

    // Setup listeners for each delegated event type
    for (const eventType of DELEGATED_EVENTS) {
        const handler = createDelegatedHandler(eventType, component);
        handlers.set(eventType, handler);

        // Use capture for focus/blur to handle non-bubbling correctly
        const useCapture = eventType === 'focus' || eventType === 'blur';
        root.addEventListener(eventType, handler, useCapture);
    }
}

/**
 * Clean up event delegation for a component
 * @param {Element|ShadowRoot} root - The component's root element
 */
export function teardownEventDelegation(root) {
    const handlers = delegatedEvents.get(root);
    if (!handlers) return;

    for (const [eventType, handler] of handlers) {
        const useCapture = eventType === 'focus' || eventType === 'blur';
        root.removeEventListener(eventType, handler, useCapture);
    }

    delegatedEvents.delete(root);
}

/**
 * Create a delegated event handler for a specific event type
 * @param {string} eventType - The event type
 * @param {Object} component - The component instance
 */
function createDelegatedHandler(eventType, component) {
    return function(event) {
        // Walk up from target to find elements with handlers
        let target = event.target;
        const root = event.currentTarget;

        while (target && target !== root) {
            // Check if this element has a handler for this event
            const handler = target._delegatedHandlers?.[eventType];

            if (handler) {
                // Execute the handler
                if (typeof handler === 'function') {
                    handler.call(component, event);
                } else if (typeof component[handler] === 'function') {
                    component[handler](event);
                } else {
                    // Legacy eval support
                    try {
                        new Function('$event', handler).call(component, event);
                    } catch (err) {
                        console.warn(`Delegated event handler failed:`, err);
                    }
                }

                // Stop if the event was stopped
                if (event.cancelBubble) break;
            }

            target = target.parentElement;
        }
    };
}

/**
 * Register a delegated event handler on an element
 * @param {Element} element - The target element
 * @param {string} eventType - The event type
 * @param {Function|string} handler - The event handler
 * @returns {boolean} True if delegated, false if needs direct listener
 */
export function registerDelegatedHandler(element, eventType, handler) {
    // Check if this event type should be delegated
    if (!DELEGATED_EVENTS.has(eventType)) {
        return false; // Needs direct listener
    }

    // Store the handler on the element for delegation
    if (!element._delegatedHandlers) {
        element._delegatedHandlers = {};
    }

    element._delegatedHandlers[eventType] = handler;
    return true; // Successfully delegated
}

/**
 * Remove a delegated event handler from an element
 * @param {Element} element - The target element
 * @param {string} eventType - The event type
 */
export function removeDelegatedHandler(element, eventType) {
    if (element._delegatedHandlers) {
        delete element._delegatedHandlers[eventType];

        // Clean up the object if empty
        if (Object.keys(element._delegatedHandlers).length === 0) {
            delete element._delegatedHandlers;
        }
    }
}

/**
 * Check if an event should be delegated
 * @param {string} eventType - The event type
 * @returns {boolean}
 */
export function shouldDelegate(eventType) {
    return DELEGATED_EVENTS.has(eventType);
}