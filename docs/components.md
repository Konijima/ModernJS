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
                <h2>Count: {{ this.state.count }}</h2>
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

// Register the component
CounterComponent.define();
```

### 2. Factory Method

Use `Component.create()` for a more functional configuration style.

```javascript
import { Component } from '@modernjs/core';

const UserCard = Component.create({
    selector: 'user-card',
    state: { name: 'John' },
    template: `
        <div class="card">
            <h3>{{ this.state.name }}</h3>
        </div>
    `
});
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
class MyComponent extends Component {
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

## Templates & Rendering

Templates are defined in the `render()` method and support a custom syntax for control flow and data binding.

### Interpolation
Use `{{ expression }}` to output data.
```html
<p>Hello {{ this.state.name }}</p>
```

### Event Binding
Use `(event)="methodName"` to bind DOM events to component methods.
```html
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
The template engine supports `@if` and `@for` blocks.

**Conditionals:**
```html
@if(this.state.isLoading) {
    <spinner-cmp></spinner-cmp>
} @else {
    <content-cmp></content-cmp>
}
```

**Loops:**
```html
<ul>
    @for(let item of this.state.items) {
        <li>{{ item.name }}</li>
    }
</ul>
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

## Styling

Styles can be scoped to the component using the static `styles` property.

```javascript
class StyledComponent extends Component {
    static styles = `
        :host {
            display: block;
            padding: 1rem;
        }
        .highlight {
            color: var(--primary-color);
        }
    `;
}
```
