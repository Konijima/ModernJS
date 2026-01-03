<div align="center">

<img src="packages/app/public/favicon.svg" alt="ModernJS Logo" width="120" height="120" />

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

### 🏗️ Core Architecture
- **Native Web Components**: Built on standard `HTMLElement` and Custom Elements v1 for maximum compatibility and performance.
- **Monorepo Structure**: Designed for scale with strict separation between framework core and application logic.
- **Dependency Injection**: Robust built-in DI container for managing services, singletons, and modular architecture.

### ⚡ Reactivity & State
- **Transparent Reactivity**: Uses `Proxy` for seamless state management and automatic DOM updates without boilerplate.
- **Advanced Streams**: RxJS-inspired Observables and Subjects for handling asynchronous data flows and event handling.
- **Efficient Rendering**: Custom Virtual DOM with smart diffing and a powerful template engine supporting `@if`, `@for`, and interpolation.

### 🛠️ Developer Experience
- **Powerful CLI**: Complete toolchain for project generation, scaffolding components, and development server management.
- **Client-Side Routing**: Full-featured router with lazy loading, guards (`canActivate`), and nested routes.
- **Reactive Forms**: Model-driven form handling with `FormGroup`, `FormControl`, and built-in validation.
- **HTTP Client**: Reactive HTTP client with interceptors for handling API requests and responses.

### 🎨 UI & Performance
- **Directives System**: Extend DOM capabilities with Angular-style directives for custom behaviors.
- **Animations**: Integrated support for the Web Animations API, including complex enter/leave transitions.
- **Internationalization**: Built-in i18n support for creating multi-language global applications.
- **High Performance**: Optimized rendering engine, outperforming traditional frameworks in large dataset operations (see [Performance](PERFORMANCE.md)).

## 🛠️ Installation

### Using the CLI (Recommended)

```bash
# Install the CLI globally
npm install -g @modernjs/cli

# Create a new project
modernjs create my-app
cd my-app
npm run dev
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/Konijima/ModernJS.git
cd ModernJS

# Install dependencies
npm install

# Start development server
npm run dev
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

- [**Components**](docs/core/components.md): Lifecycle, templates, and styling.
- [**Templates**](docs/core/templates.md): Syntax, control flow (`@if`, `@for`), and pipes.
- [**Reactivity**](docs/core/reactivity.md): Observables, Subjects, and AsyncPipe.
- [**Forms**](docs/features/forms.md): Reactive forms, validation, and controls.
- [**HTTP Client**](docs/features/http.md): HTTP requests and interceptors.
- [**Dependency Injection**](docs/core/dependency-injection.md): Services and injection.
- [**Core Services**](docs/api/services.md): Built-in services (Storage, Device, Meta).
- [**Pipes**](docs/api/pipes.md): Data transformation pipes.
- [**Directives**](docs/api/directives.md): Custom directives.
- [**Router**](docs/features/router.md): Navigation and route configuration.
- [**Animations**](docs/features/animations.md): Enter/leave animations.
- [**Modal**](docs/features/modal.md): Dialogs, alerts, confirms, and prompts.
- [**Internationalization**](docs/features/i18n.md): Multi-language support.
- [**Docker**](docs/guides/docker.md): Deployment with Docker and Nginx.

## 📂 Project Structure

The project is organized as a **Monorepo** using NPM Workspaces:

```
packages/
├── core/           # @modernjs/core (The Framework)
│   ├── index.js    # Public API
│   └── src/        # Framework Internals
│       ├── component/
│       ├── di/
│       ├── router/
│       └── ...
├── app/            # @modernjs/demo-app (The Application)
│   ├── index.html  # Entry Point
│   └── src/        # App Logic
│       ├── demo/
│       └── ...
└── cli/            # @modernjs/cli (Command Line Interface)
    ├── bin/        # Executable
    └── src/        # CLI Logic
ng-benchmark/       # Angular Benchmark Comparison
docker/             # Docker Configuration
docs/               # Documentation
```

---

Built with ❤️ using vanilla JavaScript.


