# Contributing to ModernJS

Thank you for your interest in contributing to ModernJS! We welcome contributions from the community to help make this framework better.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat everyone with respect and kindness.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub. Include as much detail as possible:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS version
- Code snippets or a reproduction repository

### Suggesting Enhancements

We love hearing ideas for new features! Please open an issue to discuss your idea before implementing it. This ensures that your work aligns with the project's goals and avoids duplicated effort.

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**: `npm install`
3. **Make your changes**. Ensure your code follows the project's style and conventions.
4. **Run tests**: `npm test`. Add new tests for your changes if applicable.
5. **Commit your changes** using descriptive commit messages.
6. **Push to your fork** and submit a Pull Request.

## Development Setup

The project uses **NPM Workspaces** to manage the Framework and the Application in a single repository.

1. Clone the repository:

    ```bash
    git clone https://github.com/Konijima/ModernJS.git
    cd ModernJS
    ```

2. Install dependencies (installs for all workspaces):

    ```bash
    npm install
    ```

3. Start the development server (runs the App):

    ```bash
    npm run dev
    ```

### Working with Workspaces

- **Core Framework**: Located in `packages/core`. Changes here are immediately reflected in the App thanks to symlinking.
- **Demo App**: Located in `packages/app`.

To run tests for a specific workspace:

```bash
npm test --workspace=@modernjs/core
# OR
npm test --workspace=@modernjs/demo-app
```

    ```bash
    npm run dev
    ```

4. Run tests:

    ```bash
    npm test
    ```

## Coding Standards

- Use modern JavaScript (ES6+).
- Follow the existing project structure.
- Keep components and services focused and single-purpose.
- Write clean, readable code with comments where necessary.
- Ensure all tests pass before submitting a PR.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
