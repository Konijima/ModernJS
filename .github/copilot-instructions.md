# ModernJS Project Agent Instructions

This document provides guidelines for AI agents working on the ModernJS project. ModernJS is a custom JavaScript framework based on Web Components, utilizing ES Modules and Vite.

## Project Overview

- **Type:** Custom JavaScript Framework (Web Components)
- **Build Tool:** Vite
- **Test Runner:** Vitest
- **Language:** JavaScript (ES Modules)
- **Entry Point:** `packages/app/index.html`

## Architecture

The project is a **Monorepo** (NPM Workspaces) divided into two main packages:

1.  **Core (`packages/core/`)**: The framework implementation.
    -   **Public API**: All public symbols are exported via `packages/core/index.js`.
    -   **Component**: Base `Component` class extending `HTMLElement`.
    -   **DI**: Dependency Injection system.
    -   **Router**: Client-side routing.
    -   **Services**: Core services (e.g., `I18nService`, `MetaService`).
    -   **Pipes**: Data transformation pipes.

2.  **Application (`packages/app/`)**: The user's application logic.
    -   Built using the framework's components, services, and routing.
    -   Depends on `@modernjs/core`.

## Coding Standards & Conventions

### Components

-   **Creation**: Use `Component.create(config)` factory method.
-   **Configuration**:
    -   `selector`: Kebab-case string (e.g., `'todo-list'`).
    -   `inject`: Object mapping property names to Service classes.
    -   `pipes`: Object mapping pipe names to Pipe classes.
    -   `state`: Initial state object.
    -   `styles`: CSS string for component-scoped styles.
    -   `template`: HTML string or render function.
-   **Lifecycle**: Use `onInit()` for initialization.
-   **Reactivity**:
    -   Use `this.state` for local state.
    -   Use `this.connect(service, mapper)` to subscribe to service state changes.

**Example:**
```javascript
import { Component } from '@modernjs/core';
import { MyService } from '../services/my.service.js';

export const MyComponent = Component.create({
    selector: 'my-component',
    inject: { myService: MyService },
    state: { count: 0 },
    onInit() {
        this.connect(this.myService, (state) => ({ data: state.data }));
    },
    template: `<div>{{state.count}}</div>`
});
```

### Services

-   Standard JavaScript classes.
-   Can be injected into components via the `inject` property.
-   Often implement a subscription mechanism (observable pattern) if they hold state.

### Imports

-   **Always include the `.js` extension** in import paths.
-   **In `packages/app`**: Use `@modernjs/core` for framework imports.
-   **In `packages/core`**: Use relative imports (e.g., `../services/service.js`).
-   Use relative paths for local app files.

## Testing

-   **Framework**: Vitest
-   **Location**: `packages/*/tests/` directory.
-   **Mocking**: Use `vi.mock()` for dependencies.
-   **Environment**: JSDOM (implied by Web Components usage).

**Running Tests:**
When running tests as an agent, **always disable watch mode** to prevent the process from hanging.
```bash
# Run all tests
npm test -- run

# Run core tests only
npm test -w @modernjs/core -- run

# Run app tests only
npm test -w @modernjs/demo-app -- run
```

## File Structure

```
packages/
  core/
    index.js  # Public API exports
    src/      # Framework internals
  app/
    src/      # Demo Application source
docs/         # Framework documentation
docker/       # Docker configuration
package.json  # Root workspace config
```

## Agent Workflow

1.  **Analyze**: Determine if the task involves Core framework logic or Application logic.
2.  **Context**:
    -   Read relevant files in `packages/core` for framework changes or `packages/app` for features.
    -   **Consult Documentation**: Read files in `docs/` for in-depth explanations of framework features (e.g., `docs/router.md`, `docs/dependency-injection.md`) if you need to understand how a specific system works.
3.  **Implementation**:
    -   Follow the `Component.create` pattern.
    -   Ensure all imports have `.js` extensions.
    -   Respect the Dependency Injection pattern.
    -   **Core Changes**: If adding a new public feature to `packages/core`, ensure it is exported in `packages/core/index.js`.
4.  **Verification**:
    -   Check if existing tests pass.
    -   Create new tests in `packages/*/tests/` if adding new functionality.
5.  **Versioning (Pre-Commit)**:
    -   If you modified `packages/core`, check `packages/core/src/version.js`.
    -   Increment `FRAMEWORK_VERSION` appropriately (SemVer).
    -   Update `FRAMEWORK_CODENAME` to something creative and relevant to the changes.

## Common Pitfalls

-   **Missing `.js` extension**: Vite/Browser will fail to resolve imports.
-   **Direct DOM manipulation**: Prefer using the framework's state/template system where possible, though direct DOM access is available since they are Web Components.
-   **Style Isolation**: Remember components use Shadow DOM (or emulated scoping), so global styles might need specific handling.
