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
        // Simple exact match for now, can be extended for params
        let route = this.routes.find(r => r.path === path);
        
        // Fallback to wildcard route if defined
        if (!route) {
            route = this.routes.find(r => r.path === '**');
        }

        if (route) {
            this.currentRoute = route;
            
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
