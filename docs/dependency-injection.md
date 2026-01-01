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
import { Component } from '../core/component/component.js';
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

## Manual Resolution

You can manually resolve a service instance using the `resolve` function. This is useful outside of the component/service context.

```javascript
import { resolve } from '../core/di/di.js';
import { AuthService } from '../services/auth.service.js';

const auth = resolve(AuthService);
auth.login();
```
