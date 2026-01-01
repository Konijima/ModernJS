import { MetaService } from '../services/meta.service.js';

/**
 * Router Service
 * Handles client-side routing and navigation.
 */
export class Router {
    static inject = [MetaService];

    constructor(metaService) {
        this.metaService = metaService;
        this.routes = [];
        this.currentRoute = null;
        this.listeners = [];
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
    }

    /**
     * Register routes configuration
     * @param {Array<{path: string, component: any}>} routes 
     */
    register(routes) {
        this.routes = routes;
        // Handle initial route
        this.handleRoute(window.location.pathname);
    }

    /**
     * Navigate to a specific path
     * @param {string} path 
     */
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute(path);
    }

    /**
     * Internal method to handle route matching and notification
     * @param {string} path 
     */
    handleRoute(path) {
        let route = null;
        let params = {};

        // Find matching route
        for (const r of this.routes) {
            if (r.path === '**') continue;

            const match = this.matchPath(path, r.path);
            if (match) {
                route = r;
                params = match;
                break;
            }
        }
        
        // Fallback to wildcard route if defined
        if (!route) {
            route = this.routes.find(r => r.path === '**');
        }

        if (route) {
            // Create a new route object with params to avoid mutating the original config
            this.currentRoute = { ...route, params };
            
            // Update Meta Tags if data is present
            if (route.data) {
                this.metaService.update(route.data);
            }

            this.notify();
        } else {
            console.warn(`[Router] No route found for path: ${path}`);
        }
    }

    /**
     * Matches a URL against a route path pattern.
     * Supports :param syntax.
     * @param {string} url 
     * @param {string} routePath 
     * @returns {Object|null} Params object if matched, null otherwise
     */
    matchPath(url, routePath) {
        // Exact match
        if (url === routePath) return {};

        // Convert route path to regex
        const paramNames = [];
        const regexPath = routePath.replace(/:([^\/]+)/g, (_, key) => {
            paramNames.push(key);
            return '([^/]+)';
        });

        // If no params were found and it wasn't an exact match (checked above),
        // then it's not a match unless the regex logic matches (which it shouldn't if no params)
        // But we need to be careful: if routePath has no params, regexPath === routePath.
        if (regexPath === routePath) return null;

        const regex = new RegExp(`^${regexPath}$`);
        const match = url.match(regex);

        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            return params;
        }
        return null;
    }

    /**
     * Subscribe to route changes
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        // Immediate callback with current route if available
        if (this.currentRoute) {
            callback(this.currentRoute);
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.currentRoute));
    }
}
