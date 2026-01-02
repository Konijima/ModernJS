/**
 * Virtual DOM implementation.
 */

export const VNodeFlags = {
    ELEMENT: 1,
    TEXT: 2,
    COMPONENT: 4
};

export function h(tag, props, children) {
    let key = null;
    let flags = VNodeFlags.ELEMENT;

    if (props && props.key) {
        key = props.key;
        delete props.key;
    }

    // Normalize children
    let normalizedChildren = [];
    if (children) {
        if (Array.isArray(children)) {
            // Flatten nested arrays (e.g. from maps/loops)
            // Custom recursive flatten is faster than flat(Infinity) and handles deep nesting
            const flattened = [];
            flatten(children, flattened);
            normalizedChildren = flattened.map(c => normalizeChild(c)).filter(c => c != null);
        } else {
            const normalized = normalizeChild(children);
            if (normalized != null) {
                normalizedChildren = [normalized];
            }
        }
    }

    return {
        tag,
        props: props || {},
        children: normalizedChildren,
        key,
        flags
    };
}

function flatten(arr, result) {
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }
}

function normalizeChild(child) {
    if (child === null || child === undefined || child === false) {
        return null;
    }
    if (typeof child === 'string' || typeof child === 'number') {
        return createTextVNode(String(child));
    }
    return child;
}

export function createTextVNode(text) {
    return {
        tag: null,
        props: {},
        children: [],
        text,
        flags: VNodeFlags.TEXT
    };
}
