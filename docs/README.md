# ModernJS Documentation

Welcome to the documentation for ModernJS, a lightweight, performant web component framework with Virtual DOM.

## 📚 Documentation Structure

### [🎯 Core Concepts](./core/)
Fundamental building blocks of ModernJS:
- [Components](./core/components.md) - Component system and lifecycle
- [Templates](./core/templates.md) - Template syntax and compilation
- [Reactivity](./core/reactivity.md) - Reactive state management
- [Dependency Injection](./core/dependency-injection.md) - Service management

### [✨ Features](./features/)
Advanced capabilities for modern applications:
- [Router](./features/router.md) - Client-side routing with guards
- [Forms](./features/forms.md) - Reactive forms with validation
- [HTTP Client](./features/http.md) - HTTP requests with interceptors
- [Animations](./features/animations.md) - Web Animations API integration
- [Internationalization](./features/i18n.md) - Multi-language support
- [Modal](./features/modal.md) - Dialogs and user interactions

### [🔧 API Reference](./api/)
Complete API documentation:
- [Services](./api/services.md) - Built-in services (Storage, Device, Meta)
- [Pipes](./api/pipes.md) - Data transformation pipes
- [Directives](./api/directives.md) - Custom directives

### [⚙️ Internals](./internals/)
Deep dive into framework architecture:
- [Architecture](./internals/architecture.md) - Component, Rendering & VDOM internals
- [Rendering Flow](./internals/rendering-flow.md) - Visual diagrams of pipelines

### [📖 Guides](./guides/)
Practical guides and tutorials:
- [Getting Started](./guides/getting-started.md) - Quick start guide
- [Best Practices](./guides/best-practices.md) - Performance and architecture tips
- [Docker & Deployment](./guides/docker.md) - Production deployment

### [🚀 Performance](../PERFORMANCE.md)
Benchmarks and optimization strategies

## Quick Start

```javascript
import { Component } from '@modernjs/core';

class MyComponent extends Component {
    static selector = 'my-component';
    static state = { count: 0 };

    render() {
        return `
            <div>
                <h2>Count: {{ count }}</h2>
                <button (click)="increment">+</button>
            </div>
        `;
    }

    increment() {
        this.state.count++;
    }
}

MyComponent.define();
```

## Learning Path

### For Beginners
1. Start with [Getting Started](./guides/getting-started.md)
2. Learn [Components](./core/components.md)
3. Understand [Templates](./core/templates.md)
4. Explore [Reactivity](./core/reactivity.md)

### For Advanced Users
1. Study [Architecture](./internals/architecture.md)
2. Review [Best Practices](./guides/best-practices.md)
3. Explore [Performance](../PERFORMANCE.md) optimizations
4. Understand [Rendering Flow](./internals/rendering-flow.md)

## Key Features

✅ **Web Components** - Built on native standards
✅ **Virtual DOM** - Efficient updates with smart diffing
✅ **Reactive State** - Automatic UI updates via Proxy
✅ **Performance** - Outperforms Angular in clear operations (25% faster) and large datasets (24% faster)
✅ **TypeScript Ready** - Full JSDoc annotations
✅ **Zero Dependencies** - Runtime has no external dependencies

## Resources

- [Demo Application](../packages/app/src/demo/) - Full example application
- [GitHub Repository](https://github.com/Konijima/ModernJS)
- [Performance Benchmarks](../PERFORMANCE.md)
- [Project Summary](../SUMMARY.md)

## Getting Help

- Check the relevant documentation section
- Review the demo application for examples
- Examine the test files for usage patterns
- Open an issue on GitHub for bugs or questions

---

*ModernJS - A modern framework proving VDOM can compete with compile-time approaches.*