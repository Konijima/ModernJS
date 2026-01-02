<div align="center">

<img src="public/favicon.svg" alt="ModernJS Logo" width="120" height="120" />

# ModernJS Framework

**A modern, lightweight JavaScript framework built on native Web Standards.**

*Features a custom component system, dependency injection, and reactive state management—all with zero runtime dependencies.*

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

## 🚀 Features

- **Native Web Components**: Built on top of `HTMLElement` and Custom Elements v1.
- **Reactive State**: Uses `Proxy` for transparent state management and DOM updates.
- **Reactivity System**: **NEW** RxJS-like Observables, Subjects, and AsyncPipe.
- **Dependency Injection**: Built-in DI container for managing services and singletons.
- **Client-Side Routing**: Angular-inspired routing with Guards (`canActivate`), `RouterOutlet`, and lazy loading support.
- **Reactive Forms**: **NEW** Model-driven forms with `FormGroup`, `FormControl`, and Validators.
- **Directives**: **NEW** Angular-style directives for extending DOM behavior (e.g., `[formControl]`).
- **HTTP Client**: **NEW** Reactive HTTP client with Interceptor support.
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
- [**Reactivity**](docs/reactivity.md): Observables, Subjects, and AsyncPipe.
- [**Forms**](docs/forms.md): Reactive forms, validation, and controls.
- [**HTTP Client**](docs/http.md): HTTP requests and interceptors.
- [**Dependency Injection**](docs/dependency-injection.md): Services and injection.
- [**Core Services**](docs/services.md): Built-in services (Storage, Device, Meta).
- [**Pipes**](docs/pipes.md): Data transformation pipes.
- [**Directives**](docs/directives.md): Custom directives.
- [**Router**](docs/router.md): Navigation and route configuration.
- [**Animations**](docs/animations.md): Enter/leave animations.
- [**Modal**](docs/modal.md): Dialogs, alerts, confirms, and prompts.
- [**Internationalization**](docs/i18n.md): Multi-language support.
- [**Docker**](docs/docker.md): Deployment with Docker and Nginx.

## 📂 Project Structure

```
app/
├── demo/           # Demo Application
├── core/           # Framework Internals
│   ├── animations/ # Animation Manager
│   ├── component/  # Component Factory, Renderer & Template Engine
│   ├── di/         # Dependency Injection Container
│   ├── directive/  # Directives System
│   ├── forms/      # Reactive Forms
│   ├── http/       # HTTP Client
│   ├── modal/      # Modal Service & Component
│   ├── pipes/      # Pipe System & Built-in Pipes
│   ├── reactivity/ # Observables & Signals
│   ├── router/     # Routing System
│   └── services/   # Base Service Class
├── i18n/           # Translation Files
docs/               # Documentation
tests/              # Unit Tests
```

---

Built with ❤️ using vanilla JavaScript.


