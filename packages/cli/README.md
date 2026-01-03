# ModernJS CLI

The official command-line interface for creating and managing ModernJS applications.

## Features

- 🚀 **Quick Project Setup** - Create new ModernJS projects with a single command
- 📦 **Zero Configuration** - Pre-configured with Vite for fast development and optimized builds
- 🧩 **Code Generation** - Generate components, services, guards, and more
- ⚡ **Fast Development** - Lightning-fast HMR with Vite
- 🧪 **Testing Ready** - Optional Vitest setup for unit testing
- 🎨 **Pure JavaScript** - No TypeScript configuration needed

## Installation

### Global Installation (Recommended)

```bash
npm install -g @modernjs/cli
```

Or with yarn:

```bash
yarn global add @modernjs/cli
```

Or with pnpm:

```bash
pnpm add -g @modernjs/cli
```

### Local Installation

You can also use npx without installing globally:

```bash
npx @modernjs/cli create my-app
```

## Usage

### Creating a New Project

```bash
modernjs create my-app
```

Or use the `new` alias:

```bash
modernjs new my-app
```

#### Options

- `--template <template>` - Choose a project template (default: `basic`)
  - `basic` - Minimal setup with core features
  - `full` - Complete setup with all features
- `--no-git` - Skip git repository initialization
- `--no-install` - Skip automatic dependency installation

#### Interactive Setup

The CLI will guide you through the setup process:

1. **Project Description** - Brief description of your project
2. **Author Name** - Your name for package.json
3. **Routing** - Add ModernJS router for SPA navigation
4. **Testing** - Set up Vitest for unit testing

### Adding Components and Files

Generate new files in your existing project:

```bash
modernjs add <type> <name>
```

Or use shortcuts:

```bash
modernjs g component user-profile
```

#### Available Types

- `component` - UI component with template, styles, and tests
- `service` - Service class for API calls and business logic
- `guard` - Route guard for navigation protection
- `directive` - Custom directive for DOM manipulation
- `pipe` - Data transformation pipe
- `store` - State management store
- `model` - Data model class
- `util` - Utility functions

#### Options

- `-p, --path <path>` - Custom path for the generated file
- `-f, --force` - Overwrite existing files

#### Examples

```bash
# Generate a component
modernjs add component user-card

# Generate a service in a custom location
modernjs add service auth -p src/core/services

# Generate and overwrite existing file
modernjs add guard admin -f
```

### Development Server

Start the development server:

```bash
modernjs serve
```

Or use the `dev` alias:

```bash
modernjs dev
```

#### Options

- `-p, --port <port>` - Specify port (default: 5173)
- `-o, --open` - Open browser automatically

## Generated Project Structure

```
my-app/
├── src/
│   ├── components/      # UI components
│   ├── services/        # Business logic and API calls
│   ├── guards/          # Route guards (if routing enabled)
│   ├── routes/          # Application routes (if routing enabled)
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── __tests__/       # Test files (if testing enabled)
│   └── main.js          # Application entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies
├── README.md            # Project documentation
└── .gitignore          # Git ignore rules
```

## File Generation Templates

### Component

```javascript
import { Component } from '@modernjs/core';
import './user-card.css';

export class UserCardComponent extends Component {
  constructor() {
    super();
    this.state = {
      // Component state
    };
  }

  template() {
    return `
      <div class="user-card-container">
        <h2>UserCard Component</h2>
        <!-- Component HTML -->
      </div>
    `;
  }

  mounted() {
    // Lifecycle: component mounted
  }

  updated() {
    // Lifecycle: component updated
  }

  destroyed() {
    // Lifecycle: cleanup
  }
}
```

### Service

```javascript
export class AuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  async login(credentials) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  }

  async logout() {
    // Logout logic
  }
}
```

### Guard

```javascript
export function authGuard(to, from, next) {
  const isAuthenticated = checkAuthentication();

  if (isAuthenticated) {
    next(); // Allow navigation
  } else {
    next('/login'); // Redirect to login
  }
}

function checkAuthentication() {
  const token = localStorage.getItem('auth_token');
  return !!token;
}
```

## Commands Reference

| Command | Alias | Description |
|---------|-------|-------------|
| `modernjs create <name>` | `new` | Create a new project |
| `modernjs add <type> <name>` | `g`, `generate` | Generate files |
| `modernjs serve` | `dev` | Start dev server |
| `modernjs --version` | `-V` | Show CLI version |
| `modernjs --help` | `-h` | Show help |

## Configuration

### Vite Configuration

The generated `vite.config.js` is pre-configured for ModernJS projects:

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

### Environment Variables

Create a `.env` file in your project root:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=My ModernJS App
```

Access in your code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
```

## Requirements

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

## Troubleshooting

### Command not found

If `modernjs` command is not found after global installation:

1. Check npm/yarn global bin path:
   ```bash
   npm bin -g
   # or
   yarn global bin
   ```

2. Add the path to your system PATH environment variable

3. Or use npx:
   ```bash
   npx @modernjs/cli create my-app
   ```

### Permission Errors

On macOS/Linux, you might need to use sudo:

```bash
sudo npm install -g @modernjs/cli
```

Or configure npm to use a different directory for global packages.

### Project Creation Fails

1. Ensure you have write permissions in the current directory
2. Check that the project name is valid (no spaces or special characters)
3. Make sure you have a stable internet connection for dependency installation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://modernjs.dev)
- 💬 [Discord Community](https://discord.gg/modernjs)
- 🐛 [Issue Tracker](https://github.com/modernjs/modernjs/issues)
- 📧 [Email Support](mailto:support@modernjs.dev)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ by the ModernJS Team