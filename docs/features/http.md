# HTTP Client

The `HttpClient` provides a simplified API for making HTTP requests, returning `Observable`s for easy integration with the reactivity system.

## Usage

Inject `HttpClient` into your components or services.

```javascript
import { HttpClient, Component } from '@modernjs/core';

export const UserList = Component.create({
    selector: 'user-list',
    inject: [HttpClient],
    onInit() {
        this.users$ = this.httpClient.get('/api/users');
    },
    template: `
        <ul>
            @for(user of users$ | async) {
                <li>{{user.name}}</li>
            }
        </ul>
    `
});
```

## Methods

- `get(url, options)`
- `post(url, body, options)`
- `put(url, body, options)`
- `delete(url, options)`
- `request(method, url, options)`

All methods return an `Observable`.

## Interceptors

You can add interceptors to modify requests or responses globally (e.g., adding auth tokens).

### Functional Interceptors (Runtime)

You can add interceptors dynamically at runtime:

```javascript
import { inject, HttpClient } from '@modernjs/core';

const http = inject(HttpClient);

http.addInterceptor({
    name: 'auth-interceptor',
    // Modify request
    request: (req) => {
        const headers = { ...req.headers, 'Authorization': 'Bearer token' };
        return { ...req, headers };
    },
    // Modify response
    response: (res) => {
        if (res.status === 401) {
            // Handle unauthorized
        }
        return res;
    }
});
```

### Global Class-Based Interceptors

For application-wide interceptors (like Authentication), you can define a class and register it globally.

**1. Define the Interceptor:**

```javascript
export class AuthInterceptor {
    request(req) {
        const token = sessionStorage.getItem('token');
        if (token) {
            const headers = { ...req.headers, 'Authorization': `Bearer ${token}` };
            return { ...req, headers };
        }
        return req;
    }

    response(res) {
        return res;
    }
}
```

**2. Register it in your main entry point (e.g., `app.component.js`):**

```javascript
import { HttpClient } from './core/http/http.client.js';
import { AuthInterceptor } from './interceptors/auth.interceptor.js';

// Register before app initialization
HttpClient.provide(AuthInterceptor);

export const App = Component.create({ ... });
```
