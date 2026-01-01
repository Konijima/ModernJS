<div align="center">

# ModernJS Framework

**A lightweight, dependency-free* JavaScript framework built from scratch.**
*Demonstrating modern web development concepts using native Web APIs.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/ES6%2B-JavaScript-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646Cff)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-729B1B)](https://vitest.dev/)

</div>

---

> **Note**: *Only `vite` is used for the dev server and bundling, and `vitest` for testing. The runtime framework has zero dependencies.*

## 📖 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Development](#-development)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Core Concepts](#-core-concepts)
  - [Components](#components)
  - [Services & DI](#services--dependency-injection)
  - [Templates](#templates)
  - [Routing](#routing)
  - [Pipes](#pipes)
  - [State Management](#state-management)
  - [Internationalization](#internationalization-i18n)
- [Examples](#-examples-included)

## 🚀 Features

- **Native Web Components**: Built on top of `HTMLElement` and Custom Elements v1.
- **Reactive State**: Uses `Proxy` for transparent state management and DOM updates.
- **Dependency Injection**: Built-in DI container for managing services and singletons.
- **Client-Side Routing**: Angular-inspired routing with `Router`, `RouterOutlet`, and lazy loading support.
- **Internationalization (i18n)**: Built-in support for multi-language applications.
- **Animations**: Native Web Animations API integration with `:enter` and `:leave` triggers.
- **Virtual DOM & Diffing**: Efficient DOM updates with a custom rendering engine.
- **Template Engine**: Custom syntax supporting `@if`, `@for`, and `{{ interpolation }}`.
- **Comprehensive Testing**: Fully tested core modules using Vitest and JSDOM.

## 🛠️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Konijima/ModernJS.git
cd ModernJS
npm install
```

## 🚦 Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🧪 Testing

The framework includes a comprehensive test suite using **Vitest** and **JSDOM**.

Run all tests:

```bash
npm test
```

Run tests in watch mode (default):

```bash
npm test -- --watch
```

Run with coverage:

```bash
npm test -- --coverage
```

## 📚 Documentation

Detailed documentation for the framework core is available in the `docs/` directory:

- [**Components**](docs/components.md): Lifecycle, templates, and styling.
- [**Templates**](docs/templates.md): Syntax, control flow (`@if`, `@for`), and pipes.
- [**Dependency Injection**](docs/dependency-injection.md): Services and injection.
- [**Router**](docs/router.md): Navigation and route configuration.
- [**Animations**](docs/animations.md): Enter/leave animations.
- [**Internationalization**](docs/i18n.md): Multi-language support.

## 📂 Project Structure

```
app/
├── components/     # Reusable UI Components
├── pages/          # Page Components (Route Views)
├── core/           # Framework Internals
│   ├── animations/ # Animation Manager
│   ├── component/  # Component Factory, Renderer & Template Engine
│   ├── di/         # Dependency Injection Container
│   ├── modal/      # Modal Service & Component
│   ├── pipes/      # Pipe System & Built-in Pipes
│   ├── router/     # Routing System
│   └── services/   # Base Service Class
├── services/       # Application Business Logic & State
├── pipes/          # Custom Application Pipes
├── i18n/           # Translation Files
└── utils/          # Utilities (e.g., Database)
tests/              # Unit Tests
```

## 🧩 Core Concepts

### Components

Components extend the `Component` class and use a declarative configuration. They are registered as Custom Elements.

```javascript
import { Component } from '../core/component/component.js';

export const MyComponent = Component.create({
    selector: 'my-component',
    state: { count: 0 },
    styles: `
        button { color: blue; }
    `,
    template() {
        return `<button (click)="increment">Count: {{ this.state.count }}</button>`;
    },
    increment() {
        this.state.count++;
    }
});
```

### Services & Dependency Injection

Services manage global state and business logic. They are singletons and can be injected into components automatically.

```javascript
// Define a service
export class UserService extends Service { ... }

// Inject into component
export const UserProfile = Component.create({
    inject: { userService: UserService },
    onInit() {
        this.user = this.userService.getUser();
    }
});
```

### Templates

The custom template engine supports control flow directives and interpolation:

- **Interpolation**: `{{ this.state.value }}`
- **Conditionals**: `@if (condition) { ... } @else { ... }`
- **Loops**: `@for (let item of list) { ... }`
- **Event Binding**: `(click)="methodName"`
- **Property Binding**: `[prop]="value"`

### Routing

The framework includes a robust routing system. Define routes in your main component:

```javascript
this.router.register([
    { 
        path: '/', 
        component: HomePage,
        data: { title: 'Home' } // Meta tags support
    },
    { path: '/features', component: FeaturesPage },
    { path: '**', component: HomePage } // Wildcard
]);
```

Use `<router-outlet>` to display the matched component and `this.router.navigate('/path')` to navigate programmatically.

### Pipes

Transform values in your templates using pipes. The framework comes with built-in pipes (`uppercase`, `lowercase`, `date`, `currency`) and supports custom pipes.

```javascript
// Register Pipes
export const MyComponent = Component.create({
    pipes: {
        uppercase: UpperCasePipe,
        date: DatePipe
    },
    template: `
        <p>Hello {{ 'world' | uppercase }}</p>
        <p>Date: {{ new Date() | date:'full' }}</p>
    `
});
```

### State Management

- **Component State**: Local reactive state using `this.state`.
- **Global State**: Services extend the `Service` class which provides `subscribe` and `notify` methods.
- **Persistence**: Examples included for `sessionStorage` and `IndexedDB`.

### Internationalization (i18n)

The framework provides a simple yet powerful i18n system using a service and a pipe.

```html
<!-- Use in Template -->
<h1>{{ 'HELLO' | translate }}</h1>
```

```javascript
// Switch Language
this.i18nService.setLocale('fr');
```

## 📝 Examples Included

1.  **Global Counter**: Demonstrates `sessionStorage` persistence and cross-component state sharing.
2.  **Todo List**: Demonstrates `IndexedDB` persistence, list rendering, and complex state updates.
3.  **Feature Demo**: Showcases the Pipe system, Modal service, and Internationalization (i18n).

---

Built with ❤️ using vanilla JavaScript.


