# HTTP Client

The `HttpClient` provides a simplified API for making HTTP requests, returning `Observable`s for easy integration with the reactivity system.

## Usage

Inject `HttpClient` into your components or services.

```javascript
import { HttpClient } from '../core/http/http.client.js';
import { Component } from '../core/component/component.js';

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

```javascript
import { resolve } from '../core/di/di.js';
import { HttpClient } from '../core/http/http.client.js';

const http = resolve(HttpClient);

http.addInterceptor({
    // Modify request
    request: (req) => {
        req.headers = { ...req.headers, 'Authorization': 'Bearer token' };
        return req;
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
