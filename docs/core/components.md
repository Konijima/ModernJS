# Component System

The Component System is the heart of ModernJS. It provides a lightweight, reactive wrapper around Web Components, enabling you to build encapsulated, reusable UI elements with ease.

## Creating Components

There are two ways to create components: using the class-based approach or the factory method.

### 1. Class-based Approach (Recommended)

Extend the `Component` class and define your component's behavior and structure.

```javascript
import { Component } from '@modernjs/core';

export class CounterComponent extends Component {
    static selector = 'app-counter';
    
    // Initial state
    static state = {
        count: 0
    };

    // Template
    render() {
        return `
            <div class="counter">
                <h2>Count: {{ count }}</h2>
                <button (click)="increment">+</button>
                <button (click)="decrement">-</button>
            </div>
        `;
    }

    increment() {
        this.state.count++;
    }

    decrement() {
        this.state.count--;
    }
}
```

### 2. Factory Method

For a more functional approach, you can use `Component.create()`.

```javascript
import { Component } from '@modernjs/core';

export const UserProfile = Component.create({
    selector: 'user-profile',
    state: { name: 'John' },
    template: `
        <div class="profile">
            <h3>{{ name }}</h3>
        </div>
    `
});
```

## Templates

Templates are defined using the `render()` method or the `template` property (for `Component.create`).

### Data Binding

Use `{{ expression }}` to output data. The expression is evaluated in the context of the component state.

```javascript
// State: { name: 'World' }
// Template:
<p>Hello {{ name }}</p>
```

### Event Handling

Use `(event)="handler"` to bind events.

```javascript
<button (click)="handleClick">Click Me</button>
```

### Property Binding

Use `[property]="reference"` to bind values to child component properties.

```javascript
// Parent
const ref = this.bind({ id: 1, data: 'test' });
return `<child-comp [config]="${ref}"></child-comp>`;
```

### Control Flow

ModernJS supports `@if` and `@for` blocks.

**Conditionals:**
```html
@if (isLoading) {
    <spinner-cmp></spinner-cmp>
} @else {
    <content-cmp></content-cmp>
}
```

**Loops:**
```html
<ul>
    @for (item of items) {
        <li>{{ item.name }}</li>
    }
</ul>
```

## Styling

Styles can be defined using the `styles` property. These styles are scoped to the component using Shadow DOM.

```javascript
class MyComponent extends Component {
    static styles = `
        :host {
            display: block;
            padding: 1rem;
        }
        h1 { color: blue; }
        .highlight { background: yellow; }
    `;
}
```

## Lifecycle Hooks

Components support standard Web Component lifecycle callbacks along with framework-specific hooks.

| Hook | Description |
|------|-------------|
| `onInit()` | Called when the component is connected to the DOM and initialized. |
| `onUpdate()` | Called after the component has re-rendered and the DOM has been updated. |
| `onDestroy()` | Called when the component is removed from the DOM. Use this for cleanup. |
| `connectedCallback()` | Native Web Component hook. Calls `onInit`. |
| `disconnectedCallback()` | Native Web Component hook. Calls `onDestroy`. |

```javascript
class LifecycleComponent extends Component {
    onInit() {
        console.log('Component initialized');
        this.interval = setInterval(() => this.tick(), 1000);
    }

    onDestroy() {
        console.log('Component destroyed');
        clearInterval(this.interval);
    }
}
```

## Reactivity & Rendering

ModernJS uses a hybrid reactivity system. Local component state is managed via **Proxies**, while shared state (Services) uses **Observables**.

### State Updates & Batching

When you modify `this.state`, the component automatically schedules a re-render. To ensure high performance, updates are **batched** using `requestAnimationFrame`.

```javascript
// In your component method
this.state.count++; 
this.state.title = 'New Title';

// Only ONE render will occur in the next animation frame
```

This means that reading the DOM immediately after a state change will return the *old* values. If you need to perform actions after the DOM has updated, you can wait for the next frame:

```javascript
this.state.count++;
requestAnimationFrame(() => {
    console.log(this.shadowRoot.innerHTML); // Updated DOM
});
```

### Manual Change Detection

In some scenarios (like testing or specific integrations), you may need to force a synchronous update. You can use the `detectChanges()` method:

```javascript
this.state.count++;
this.detectChanges(); // DOM is updated immediately
```

## Performance Optimizations

ModernJS includes several built-in performance optimizations that work automatically:

### Event Delegation
All components use event delegation to reduce the number of event listeners. Events are handled at the shadow root level and delegated to child elements.

### Smart List Operations
The framework automatically detects and optimizes common list operations:
- **Append**: Adding items to the end of a list
- **Prepend**: Adding items to the beginning
- **Swap**: Swapping two elements
- **Clear**: Removing all items

### Incremental DOM Updates
Simple property changes bypass the full VDOM diff and update the DOM directly when possible.

### Props Caching
Component props are cached and compared using shallow equality to avoid unnecessary updates.

For detailed performance information and benchmarks, see the [Performance Documentation](../../PERFORMANCE.md).
