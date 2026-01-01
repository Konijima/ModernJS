# Router

The ModernJS Router handles client-side navigation, mapping URLs to components.

## Configuration

Define your routes as an array of objects and register them with the router. Typically, this is done in your main application entry point.

```javascript
import { Router } from './core/router/router.js';
import { resolve } from './core/di/di.js';

// Import your page components
import { HomePage } from './pages/home.page.js';
import { AboutPage } from './pages/about.page.js';
import { NotFoundPage } from './pages/not-found.page.js';

const routes = [
    { 
        path: '/', 
        component: HomePage,
        data: { title: 'Home' } // Optional meta data
    },
    { 
        path: '/about', 
        component: AboutPage,
        data: { title: 'About Us' }
    },
    // Dynamic route with parameter
    {
        path: '/user/:id',
        component: UserPage,
        data: { title: 'User Profile' }
    },
    // Wildcard route for 404s
    { 
        path: '**', 
        component: NotFoundPage,
        data: { title: 'Page Not Found' }
    }
];


const router = resolve(Router);
router.register(routes);
```

## Navigation

### Programmatic Navigation

Inject the `Router` service into your component to navigate programmatically.

```javascript
import { Component } from '../core/component/component.js';
import { Router } from '../core/router/router.js';

export class MenuComponent extends Component {
    static inject = { router: Router };

    goToAbout() {
        this.router.navigate('/about');
    }
}
```

### Router Outlet

The `<router-outlet>` component is a placeholder where the matched component will be rendered.

```html
<!-- app.component.html -->
<nav>
    <button (click)="navigate('/')">Home</button>
    <button (click)="navigate('/about')">About</button>
</nav>

<main>
    <router-outlet></router-outlet>
</main>
```

## Route Parameters

You can define dynamic segments in your routes using the `:paramName` syntax.

```javascript
{ path: '/user/:id', component: UserPage }
```

### Accessing Parameters

The parameters are automatically passed to the component instance as a `params` property.

```javascript
export class UserPage extends Component {
    onInit() {
        // Access the 'id' parameter
        const userId = this.params.id;
        this.loadUser(userId);
    }
}
```

Alternatively, you can access them via the injected `Router` service:

```javascript
export class UserPage extends Component {
    static inject = { router: Router };

    onInit() {
        const userId = this.router.currentRoute.params.id;
    }
}
```

## Route Data & Meta Tags

You can attach arbitrary data to a route using the `data` property. The router automatically integrates with the `MetaService` to update the document title and meta tags based on this data.

```javascript
{
    path: '/features',
    component: FeaturesPage,
    data: {
        title: 'Features - ModernJS',
        description: 'Explore the powerful features of ModernJS.'
    }
}
```

## Wildcard Routes

Use `path: '**'` to define a catch-all route. This is commonly used for 404 "Not Found" pages. This route should be defined last if you implement more complex matching logic in the future, though currently, the router looks for exact matches first.
