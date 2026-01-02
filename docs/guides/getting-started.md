# Getting Started with ModernJS

## Installation

```bash
# Clone the repository
git clone https://github.com/Konijima/ModernJS.git
cd ModernJS

# Install dependencies
npm install

# Start development server
npm run dev
```

## Creating Your First Component

### 1. Basic Component

```javascript
import { Component } from '@modernjs/core';

class HelloWorldComponent extends Component {
    static selector = 'hello-world';

    render() {
        return `<h1>Hello, World!</h1>`;
    }
}

// Register the component
HelloWorldComponent.define();
```

### 2. Component with State

```javascript
class CounterComponent extends Component {
    static selector = 'app-counter';
    static state = {
        count: 0
    };

    render() {
        return `
            <div class="counter">
                <h2>Count: {{ state.count }}</h2>
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

CounterComponent.define();
```

### 3. Using Your Component

In HTML:
```html
<app-counter></app-counter>
```

Or in another component's template:
```javascript
template: `
    <div>
        <h1>My App</h1>
        <app-counter></app-counter>
    </div>
`
```

## Project Structure

```
your-app/
├── src/
│   ├── components/       # Your components
│   ├── services/         # Your services
│   ├── pages/           # Route pages
│   └── main.js          # Entry point
├── index.html           # HTML entry
└── package.json         # Dependencies
```

## Key Concepts to Learn

1. **Components** - Building blocks of your UI
2. **Templates** - Declarative HTML with data binding
3. **State Management** - Reactive state with automatic updates
4. **Services** - Shared logic and data
5. **Routing** - Navigation between pages

## Next Steps

1. Explore the [Component System](../core/components.md)
2. Learn about [Templates](../core/templates.md)
3. Understand [Reactivity](../core/reactivity.md)
4. Build a complete app with [Routing](../features/router.md)

## Resources

- [Demo Application](/packages/app/src/demo/) - Full example application
- [API Reference](../api/) - Complete API documentation
- [Performance Guide](../../PERFORMANCE.md) - Optimization tips
- [Architecture](../internals/architecture.md) - Deep dive into internals