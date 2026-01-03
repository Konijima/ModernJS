# ModernJS Architecture: Component, Rendering & VDOM System

## Table of Contents
1. [Overview](#overview)
2. [Component Lifecycle](#component-lifecycle)
3. [VDOM System](#vdom-system)
4. [Rendering Pipeline](#rendering-pipeline)
5. [Diffing Algorithm](#diffing-algorithm)
6. [Performance Optimizations](#performance-optimizations)
7. [Code Flow Examples](#code-flow-examples)

## Overview

ModernJS uses a hybrid approach combining Web Components with a Virtual DOM (VDOM) system. This provides the encapsulation benefits of Web Components with the efficient updates of VDOM.

```
User Code → Component → VDOM → Diffing → DOM Updates
                ↑                           ↓
             State Change ← ← ← ← ← ← Event Handler
```

## Component Lifecycle

### 1. Component Definition & Registration

```javascript
// Step 1: Define component
class MyComponent extends Component {
    static selector = 'my-component';
    static state = { count: 0 };

    // Render method returns template string
    render() {
        return `<div>Count: {{ count }}</div>`;
    }
}
```

### 2. Dependency Injection (DI)

// Step 2: Register with Custom Elements
MyComponent.define(); // → customElements.define('my-component', MyComponent)
```

### 2. Component Instantiation

When a component is created (either via HTML or JavaScript):

```javascript
constructor() {
    super(); // HTMLElement constructor

    // 1. Create Shadow DOM
    this.attachShadow({ mode: 'open' });

    // 2. Initialize state with Proxy
    this.state = new Proxy(initialState, {
        set: (target, prop, value) => {
            if (target[prop] !== value) {
                target[prop] = value;
                this.update(); // Trigger re-render
            }
            return true;
        }
    });

    // 3. Setup internal structures
    this._refs = {};           // Reference storage
    this._subscriptions = [];  // Observable subscriptions
    this._previousState = null; // For incremental updates
}
```

### 3. Connection to DOM

```javascript
connectedCallback() {
    // 1. Setup event delegation for performance
    setupEventDelegation(this.shadowRoot, this);

    // 2. Schedule initial render
    this.update();

    // 3. Call lifecycle hooks
    if (this.onInit) this.onInit();
}
```

### 4. Disconnection from DOM

```javascript
disconnectedCallback() {
    // 1. Cancel pending updates
    if (this._rafId) cancelAnimationFrame(this._rafId);

    // 2. Clean up event delegation
    teardownEventDelegation(this.shadowRoot);

    // 3. Clear bindings and subscriptions
    clearBindings(this);
    this._subscriptions.forEach(unsub => unsub());

    // 4. Call lifecycle hooks
    if (this.onDestroy) this.onDestroy();
}
```

## VDOM System

### VNode Structure

The Virtual DOM is built from VNodes (Virtual Nodes):

```javascript
// VNode structure
{
    tag: 'div',                    // Element tag name
    props: { class: 'container' }, // Properties/attributes
    children: [...],               // Child VNodes
    key: 'unique-key',            // For keyed diffing
    flags: VNodeFlags.ELEMENT,    // Node type flags
    _el: null                     // Reference to real DOM node
}

// VNode Flags
const VNodeFlags = {
    ELEMENT: 1,    // Regular DOM element
    TEXT: 2,       // Text node
    COMPONENT: 4   // Custom component
};
```

### VNode Creation

The `h` function (hyperscript) creates VNodes:

```javascript
function h(tag, props, children) {
    // Normalize children (flatten arrays, convert strings to text nodes)
    const normalizedChildren = normalizeChildren(children);

    return {
        tag,
        props: props || {},
        children: normalizedChildren,
        key: props?.key,
        flags: typeof tag === 'string' ? VNodeFlags.ELEMENT : VNodeFlags.COMPONENT
    };
}

function createTextVNode(text) {
    return {
        tag: null,
        props: {},
        children: [],
        text: String(text),
        flags: VNodeFlags.TEXT
    };
}
```

## Rendering Pipeline

### 1. Update Scheduling

Updates are batched using `requestAnimationFrame`:

```javascript
update(changes = null) {
    if (!this.isConnected) return;

    // Store changes for incremental updates
    this._pendingChanges = changes;

    // Batch updates
    if (this._updatePending) return;
    this._updatePending = true;

    this._rafId = requestAnimationFrame(() => {
        this._performUpdate();
        this._updatePending = false;
        this._rafId = null;
    });
}
```

### 2. Template Processing

Templates are compiled into render functions:

```javascript
_performUpdate() {
    // 1. Call render method
    const templateResult = this.render();

    if (typeof templateResult === 'string') {
        // 2a. Compile string template to VNode-generating function
        if (!this._renderFn) {
            this._renderFn = compileToVNode(templateResult);
        }
        newDom = this._renderFn.call(this, h, createTextVNode, this);
    } else {
        // 2b. Direct VNode return
        newDom = templateResult;
    }

    // 3. Ensure array format
    if (!Array.isArray(newDom)) {
        newDom = [newDom];
    }

    // 4. Flatten nested arrays (from @if/@for)
    const flattened = [];
    flatten(newDom, flattened);
    newDom = flattened;

    // 5. Inject styles
    if (this.constructor.styles) {
        newDom.unshift(h('style', {}, [createTextVNode(this.constructor.styles)]));
    }

    // 6. Perform rendering
    render(this.shadowRoot, newDom, this, this._refs);
}
```

### 3. Template Compilation

String templates are compiled to functions:

```javascript
// Template: `<div>{{ count }}</div>`
// VDOM: { tag: 'div', children: ['Count: ', 0] }
```

### 2. Diffing
// Compiles to:
function(h, text, context) {
    return h('div', {}, [text(context.state.count)]);
}

// @if/@for compilation
// Template: `@if(state.show) { <div>Content</div> }`
// Compiles to:
function(h, text, context) {
    return context.state.show ? h('div', {}, [text('Content')]) : [];
}
```

## Diffing Algorithm

### Overview

The diffing algorithm compares old and new VNodes to determine minimal DOM updates:

```javascript
function render(target, source, component, refs) {
    if (target instanceof ShadowRoot) {
        const vnodes = Array.isArray(source) ? source : [source];
        diffChildrenVNode(target, vnodes, component, refs);
    } else {
        diffVNode(target, source, component, refs);
    }
}
```

### Diffing Process

#### 1. Node Comparison

```javascript
function diffVNode(target, vnode, component, refs) {
    // 1. Handle removal
    if (!vnode) {
        target.parentNode.removeChild(target);
        return;
    }

    // 2. Check if nodes are compatible
    if (!isSameNode(target, vnode)) {
        // Replace if different type
        const newNode = createNode(vnode, component, refs);
        target.parentNode.replaceChild(newNode, target);
        return;
    }

    // 3. Update properties/attributes
    updateAttributes(target, vnode.props, component);

    // 4. Diff children
    diffChildren(target, vnode.children, component, refs);
}
```

#### 2. Children Diffing

The framework uses different strategies based on the situation:

##### A. Fast Path Optimizations

```javascript
function diffChildrenVNode(target, vnodes, component, refs) {
    const oldChildren = Array.from(target.childNodes);
    const oldLength = oldChildren.length;
    const newLength = vnodes.length;

    // Optimization 1: Complete replacement (empty → populated)
    if (oldLength === 0 && newLength > 0) {
        for (const vnode of vnodes) {
            target.appendChild(createNode(vnode, component, refs));
        }
        return;
    }

    // Optimization 2: Append detection
    if (oldLength > 0 && newLength > oldLength) {
        let isAppend = true;
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

    // Optimization 3: Swap detection
    if (oldLength === newLength && oldLength > 1) {
        let swapIndices = [];
        for (let i = 0; i < oldLength; i++) {
            if (!canReuseNode(oldChildren[i], vnodes[i])) {
                swapIndices.push(i);
            }
        }

        if (swapIndices.length === 2) {
            const [i, j] = swapIndices;
            if (canReuseNode(oldChildren[i], vnodes[j]) &&
                canReuseNode(oldChildren[j], vnodes[i])) {
                // Perform swap
                swapNodes(target, i, j);
                return;
            }
        }
    }

    // Fall back to keyed or index-based diffing...
}
```

##### B. Keyed Diffing (Two-ended Algorithm)

For lists with keys, the framework uses a two-ended diffing algorithm:

```javascript
// Two-ended diffing with four pointers
let oldStartIdx = 0;
let oldEndIdx = oldChildren.length - 1;
let newStartIdx = 0;
let newEndIdx = vnodes.length - 1;

while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isSameKey(oldStart, newStart)) {
        // Heads match
        diffVNode(oldStart, newStart);
        oldStartIdx++; newStartIdx++;
    } else if (isSameKey(oldEnd, newEnd)) {
        // Tails match
        diffVNode(oldEnd, newEnd);
        oldEndIdx--; newEndIdx--;
    } else if (isSameKey(oldStart, newEnd)) {
        // Old head matches new tail (moved right)
        target.insertBefore(oldStart, oldEnd.nextSibling);
        diffVNode(oldStart, newEnd);
        oldStartIdx++; newEndIdx--;
    } else if (isSameKey(oldEnd, newStart)) {
        // Old tail matches new head (moved left)
        target.insertBefore(oldEnd, oldStart);
        diffVNode(oldEnd, newStart);
        oldEndIdx--; newStartIdx++;
    } else {
        // Complex case - use key map
        // ...
    }
}
```

##### C. Index-based Diffing

For lists without keys, simple index-based matching:

```javascript
for (let i = 0; i < Math.max(oldLength, newLength); i++) {
    if (i < oldLength && i < newLength) {
        // Update existing
        diffVNode(oldChildren[i], vnodes[i], component, refs);
    } else if (i < newLength) {
        // Add new
        target.appendChild(createNode(vnodes[i], component, refs));
    } else {
        // Remove old
        target.removeChild(oldChildren[i]);
    }
}
```

## Performance Optimizations

### 1. Incremental DOM Updates

For simple property changes, bypass VDOM entirely:

```javascript
// Analyze state changes
const patchAnalysis = analyzePatch(this._previousState, this.state, this);

if (patchAnalysis.mode === PatchMode.INCREMENTAL) {
    // Direct DOM updates for simple changes
    const updatedCount = applyIncrementalUpdates(this, patchAnalysis.changes);
    if (updatedCount > 0) {
        this._previousState = JSON.parse(JSON.stringify(this.state));
        return; // Skip full VDOM diff
    }
}
```

### 2. Props Caching

Avoid unnecessary attribute updates:

```javascript
function updateAttributes(target, props, component) {
    // Check if props are identical to last render
    if (target._props && arePropsEqual(target._props, props)) {
        return; // Skip update
    }
    target._props = props;

    // Update attributes...
}

function arePropsEqual(a, b) {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every(k => a[k] === b[k]); // Shallow comparison
}
```

### 3. Event Delegation

All events are handled at the shadow root level:

```javascript
function setupEventDelegation(root, component) {
    // Single listener per event type
    root.addEventListener('click', (event) => {
        let target = event.target;
        while (target && target !== root) {
            const handler = target._delegatedHandlers?.['click'];
            if (handler) {
                handler.call(component, event);
                if (event.cancelBubble) break;
            }
            target = target.parentElement;
        }
    });
}
```

### 4. Clear Optimization

Fast path for clearing all children:

```javascript
if (vnodes.length === 0 && target.firstChild) {
    // Check for animations/directives
    if (!hasAnimationsOrDirectives(target)) {
        target.textContent = ''; // Fast clear
        return;
    }
}
```

## Code Flow Examples

### Example 1: State Update Flow

```javascript
// User action
button.click()
    ↓
// Event handler
this.state.count++
    ↓
// Proxy setter triggered
set(target, 'count', newValue)
    ↓
// Schedule update
this.update()
    ↓
// RAF callback
requestAnimationFrame(() => this._performUpdate())
    ↓
// Check for incremental update possibility
analyzePatch(oldState, newState)
    ↓
// If simple change: Direct DOM update
// If complex: Full VDOM diff
    ↓
// Update DOM
element.textContent = newValue
```

### Example 2: List Append Flow

```javascript
// Add items to list
this.state.items = [...this.state.items, ...newItems]
    ↓
// Render creates new VNodes
render() → VNodes for all items
    ↓
// Diff detects append pattern
diffChildrenVNode() → isAppend = true
    ↓
// Fast path: Only create and append new nodes
for (i = oldLength; i < newLength; i++) {
    target.appendChild(createNode(vnodes[i]))
}
```

### Example 3: Keyed List Reorder

```javascript
// Swap items in list
[items[1], items[998]] = [items[998], items[1]]
    ↓
// VNodes have keys
vnodes.forEach(v => v.key = item.id)
    ↓
// Two-ended diff detects swap
isSameKey(oldStart, newEnd) → true
    ↓
// Move nodes efficiently
target.insertBefore(oldStart, oldEnd.nextSibling)
```

## Summary

The ModernJS architecture combines:

1. **Web Components** for encapsulation
2. **VDOM** for efficient updates
3. **Smart diffing** with fast paths for common operations
4. **Incremental updates** for simple changes
5. **Event delegation** for performance
6. **Batched updates** via requestAnimationFrame

This hybrid approach provides the simplicity of VDOM with performance that rivals compile-time frameworks like Angular, while maintaining a clean, understandable codebase.