# ModernJS Framework

[https://github.com/Konijima/ModernJS](https://github.com/Konijima/ModernJS)

A lightweight, dependency-free* JavaScript framework built from scratch to demonstrate modern web development concepts using native Web APIs.

*Only `vite` is used for the dev server and bundling. The runtime framework has zero dependencies.

## 🚀 Features

- **Native Web Components**: Built on top of `HTMLElement` and Custom Elements v1.
- **Reactive State**: Uses `Proxy` for transparent state management and DOM updates.
- **Dependency Injection**: Built-in DI container for managing services and singletons.
- **Client-Side Routing**: Angular-inspired routing with `Router`, `RouterOutlet`, and lazy loading support.
- **Animations**: Native Web Animations API integration with `:enter` and `:leave` triggers.
- **Virtual DOM & Diffing**: Efficient DOM updates with a custom rendering engine.
- **Template Engine**: Custom syntax supporting `@if`, `@for`, and `{{ interpolation }}`.
- **State Management**:
  - Component-level local state.
  - Global services with `subscribe` pattern.
  - Persistence examples (SessionStorage, IndexedDB).

## 🛠️ Installation

```bash
npm install
```

## 🚦 Running the App

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## 📂 Project Structure

```
app/
├── components/     # UI Components
├── pages/          # Page Components (Route Views)
├── core/           # Framework Internals
│   ├── animations/ # Animation Manager
│   ├── component/  # Component & Renderer
│   ├── di/         # Dependency Injection
│   ├── pipes/      # Pipe System
│   ├── router/     # Routing System
│   └── services/   # Base Services
├── services/       # Business Logic & State
└── utils/          # Utilities (e.g., Database)
```

## 🧩 Core Concepts

### Components

Components extend the `Component` class and use a declarative configuration:

```javascript
import { Component } from '../core/component.js';

export const MyComponent = Component.create({
    selector: 'my-component',
    state: { count: 0 },
    template() {
        return `<button (click)="increment">Count: {{ this.state.count }}</button>`;
    },
    increment() {
        this.state.count++;
    }
});
```

### Services & DI

Services manage global state and business logic. They are injected into components automatically.

```javascript
// Define a service
export class UserService extends Service { ... }

// Inject into component
export const UserProfile = Component.create({
    inject: { userService: UserService },
    // ...
});
```

### Templates

The template engine supports control flow directives:

- **Interpolation**: `{{ this.state.value }}`
- **Conditionals**: `@if (condition) { ... } @else { ... }`
- **Loops**: `@for (let item of list) { ... }`
- **Event Binding**: `(click)="methodName"`
- **Property Binding**: `[prop]="value"`

## 📝 Examples Included

1.  **Global Counter**: Demonstrates `sessionStorage` persistence and cross-component state sharing.
2.  **Todo List**: Demonstrates `IndexedDB` persistence, list rendering, and complex state updates.

---

Built with ❤️ using vanilla JavaScript.

### Routing

The framework includes a robust routing system. Define routes in your main component:

```javascript
this.router.register([
    { 
        path: '/', 
        component: HomePage,
        data: { title: 'Home' } // Meta tags support
    },
    { path: '/todo', component: TodoPage },
    { path: '**', component: HomePage } // Wildcard
]);
```

Use `<router-outlet>` to display the matched component and `this.router.navigate('/path')` to navigate.

### Animations

Add animations to your components using the Web Animations API syntax:

```javascript
export const MyPage = Component.create({
    animations: {
        'fade-in': {
            ':enter': {
                keyframes: [{ opacity: 0 }, { opacity: 1 }],
                options: { duration: 300 }
            }
        }
    },
    template: `<div animate="fade-in">...</div>`
});
```

### Pipes

Transform values in your templates using pipes. The framework comes with built-in pipes (`uppercase`, `lowercase`, `date`, `currency`) and supports custom pipes.

1. **Register Pipes in Component:**
```javascript
import { UpperCasePipe, DatePipe } from '../core/pipes/common.pipes.js';

export const MyComponent = Component.create({
    pipes: {
        uppercase: UpperCasePipe,
        date: DatePipe
    },
    // ...
});
```

2. **Use in Template:**
```html
<p>Hello {{ 'world' | uppercase }}</p>
<p>Date: {{ new Date() | date:'full' }}</p>
```

3. **Use Programmatically:**
```javascript
const datePipe = this.getPipe('date');
const formatted = datePipe.transform(new Date(), 'full');
```

### Modal System

A global modal service is available to show dialogs from anywhere in the app.

```javascript
this.modalService.open({
    title: 'Hello',
    content: 'This is a modal',
    actions: [
        { label: 'Close', onClick: () => this.modalService.close(), type: 'primary' }
    ]
});
```
