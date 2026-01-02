# Best Practices

## Performance Optimization

### 1. Use Keys for Lists

Always provide unique keys when rendering lists for efficient diffing:

```javascript
// ✅ Good
template: `
    @for(item of state.items) {
        <div key="{{ item.id }}">{{ item.name }}</div>
    }
`

// ❌ Bad - no keys
template: `
    @for(item of state.items) {
        <div>{{ item.name }}</div>
    }
`
```

### 2. Avoid Inline Functions

Create methods instead of inline functions to prevent unnecessary re-renders:

```javascript
// ✅ Good
template: `<button (click)="handleClick">Click</button>`

handleClick() {
    // handler logic
}

// ❌ Bad - creates new function each render
template: `<button (click)="() => state.count++">Click</button>`
```

### 3. Batch State Updates

Update multiple state properties at once:

```javascript
// ✅ Good - single update
Object.assign(this.state, {
    name: 'John',
    age: 30,
    email: 'john@example.com'
});

// ❌ Bad - multiple updates trigger multiple renders
this.state.name = 'John';
this.state.age = 30;
this.state.email = 'john@example.com';
```

### 4. Use Computed Properties

Cache expensive computations:

```javascript
class MyComponent extends Component {
    static state = {
        items: []
    };

    // Computed property - cached
    get filteredItems() {
        if (!this._filteredItems) {
            this._filteredItems = this.state.items.filter(item => item.active);
        }
        return this._filteredItems;
    }

    render() {
        return `
            @for(item of filteredItems) {
                <div>{{ item.name }}</div>
            }
        `;
    }
}
```

## Architecture Best Practices

### 1. Component Organization

Keep components focused and single-purpose:

```javascript
// ✅ Good - focused components
class UserListComponent { /* lists users */ }
class UserDetailComponent { /* shows user detail */ }
class UserFormComponent { /* handles user form */ }

// ❌ Bad - monolithic component
class UserComponent { /* does everything */ }
```

### 2. Service Layer

Use services for business logic and data management:

```javascript
// ✅ Good - logic in service
class UserService extends Service {
    async fetchUsers() { /* ... */ }
    async saveUser(user) { /* ... */ }
}

class UserComponent extends Component {
    static inject = { userService: UserService };

    async onInit() {
        this.state.users = await this.userService.fetchUsers();
    }
}
```

### 3. State Management

Keep state close to where it's used:

- **Component State**: UI-specific state (open/closed, selected item)
- **Service State**: Shared application data
- **Global State**: User session, theme, language

### 4. Template Organization

Keep templates readable and maintainable:

```javascript
// ✅ Good - clear structure
template: `
    <div class="user-list">
        <header>
            <h2>Users</h2>
            <button (click)="addUser">Add User</button>
        </header>

        <main>
            @if(state.loading) {
                <div class="spinner">Loading...</div>
            } @else {
                @for(user of state.users) {
                    <user-card [user]="user"></user-card>
                }
            }
        </main>
    </div>
`
```

## Memory Management

### 1. Clean Up Subscriptions

Always unsubscribe in `onDestroy`:

```javascript
class MyComponent extends Component {
    onInit() {
        // Subscribe to service
        this._subscription = this.userService.users$.subscribe(users => {
            this.state.users = users;
        });
    }

    onDestroy() {
        // Clean up
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
```

### 2. Avoid Memory Leaks

Clear references to large objects:

```javascript
onDestroy() {
    // Clear large data structures
    this.state.largeDataset = null;
    this._cache = null;
}
```

## Testing Best Practices

### 1. Test Component Logic

Focus on behavior, not implementation:

```javascript
test('should increment count', () => {
    const component = new CounterComponent();
    component.connectedCallback();

    const initialCount = component.state.count;
    component.increment();

    expect(component.state.count).toBe(initialCount + 1);
});
```

### 2. Mock Services

```javascript
test('should load users', async () => {
    const mockService = {
        fetchUsers: vi.fn().mockResolvedValue([
            { id: 1, name: 'John' }
        ])
    };

    const component = new UserListComponent();
    component.userService = mockService;

    await component.onInit();

    expect(component.state.users).toHaveLength(1);
});
```

## Bundle Size Optimization

### 1. Lazy Load Routes

```javascript
const routes = [
    {
        path: '/admin',
        // Lazy load admin module
        component: () => import('./pages/admin.page.js')
    }
];
```

### 2. Tree Shaking

Only import what you need:

```javascript
// ✅ Good - specific imports
import { Component, Service } from '@modernjs/core';

// ❌ Bad - imports everything
import * as ModernJS from '@modernjs/core';
```

## Security Best Practices

### 1. Sanitize User Input

Always sanitize dynamic content:

```javascript
// Use the framework's built-in sanitization
template: `<div>{{ userInput }}</div>` // Automatically escaped
```

### 2. Validate Forms

Use validators for all user input:

```javascript
const form = new FormGroup({
    email: new FormControl('', [
        Validators.required,
        Validators.email
    ]),
    password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
    ])
});
```

## Development Workflow

### 1. Use TypeScript (Optional)

Add type safety with JSDoc or TypeScript:

```javascript
/**
 * @param {User} user
 * @returns {Promise<void>}
 */
async saveUser(user) {
    // Type-safe code
}
```

### 2. Enable Performance Monitoring

During development:

```javascript
// In browser console
__perf.enable();

// Run your operations
// ...

// View report
__perf.report();
```

### 3. Use Browser DevTools

- **Performance Tab**: Profile rendering performance
- **Memory Tab**: Check for memory leaks
- **Network Tab**: Monitor API calls
- **Elements Tab**: Inspect Shadow DOM

## Common Pitfalls to Avoid

1. **Don't mutate arrays directly** - Use spread operator or array methods
2. **Don't use array index as key** - Use stable, unique IDs
3. **Don't put business logic in templates** - Keep templates simple
4. **Don't ignore cleanup** - Always clean up resources
5. **Don't over-optimize** - Profile first, optimize what matters

## Summary

Following these best practices will help you build:
- **Performant** applications that scale
- **Maintainable** code that's easy to understand
- **Reliable** software with fewer bugs
- **Efficient** apps with optimal bundle sizes

Remember: ModernJS is designed to be fast by default. Focus on writing clean, maintainable code, and let the framework handle the optimizations.