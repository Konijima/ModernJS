# Dependency Injection

ModernJS includes a lightweight Dependency Injection (DI) system to manage services and dependencies across your application. It follows the Singleton pattern for all services.

## Defining Services

A service is a simple class. While not strictly required, it's good practice to keep them stateless or manage state explicitly (see State Management).

```javascript
export class ApiService {
    async fetchData() {
        return fetch('/api/data').then(r => r.json());
    }
}
```

## Injecting Dependencies

### In Components

You can inject services into components using the static `inject` property. Dependencies are automatically resolved and assigned to the component instance.

**Object Syntax (Recommended):**
Maps the service to a specific property name.

```javascript
import { Component } from '@modernjs/core';
import { ApiService } from '../services/api.service.js';

export class UserComponent extends Component {
    // this.api will hold the ApiService instance
    static inject = {
        api: ApiService
    };

    async onInit() {
        const data = await this.api.fetchData();
        this.state.users = data;
    }
}
```

**Array Syntax:**
Injects services based on the class name (camelCased).

```javascript
export class UserComponent extends Component {
    // this.apiService will hold the ApiService instance
    static inject = [ApiService];
}
```

### In Other Services

Services can also depend on other services. Use the static `inject` array to define dependencies passed to the constructor.

```javascript
import { HttpClient } from './http.client.js';

// Plain service class (no state management needed)
export class UserService {
    static inject = [HttpClient];

    constructor(http) {
        this.http = http;
    }

    getUsers() {
        return this.http.get('/users');
    }
}
```

## State Management

While services can be plain classes (as shown above), extending the `Service` class makes them reactive by default, as it extends `BehaviorSubject`.

```javascript
import { Service } from '@modernjs/core';

export class CounterService extends Service {
    constructor() {
        super({ count: 0 });
    }

    increment() {
        const current = this.value;
        this.next({ count: current.count + 1 });
    }
}
```

Components can subscribe to the entire state or select specific slices.

```javascript
// In Component
onInit() {
    // Select specific slice
    this.counterService.select(state => state.count, count => {
        this.state.count = count;
    });
}
```

## Manual Resolution

You can manually resolve a service instance using the `resolve` function. This is useful outside of the component/service context.

```javascript
import { inject } from '@modernjs/core';
import { AuthService } from '../services/auth.service.js';

const auth = inject(AuthService);
auth.login();
```
