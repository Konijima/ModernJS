import { MetaService } from '../services/meta.service.js';
import { resolve } from '../di/di.js';

/**
 * Router Service
 * Handles client-side routing and navigation.
 */
export class Router {
    static inject = [MetaService];

    constructor(metaService) {
        this.metaService = metaService;
        this.routes = [];
        this.currentRoute = [];
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
    async handleRoute(path) {
        let matchedRoutes = this.findRoutes(this.routes, path);
        
        // Fallback to wildcard route if defined
        if (!matchedRoutes) {
            const wildcard = this.routes.find(r => r.path === '**');
            if (wildcard) {
                matchedRoutes = [{ ...wildcard, params: {} }];
            }
        }

        if (matchedRoutes) {
            // Check Guards
            for (const route of matchedRoutes) {
                if (route.canActivate) {
                    for (const Guard of route.canActivate) {
                        try {
                            const guard = resolve(Guard);
                            let result = guard.canActivate(route, this.currentRoute);
                            
                            if (result && typeof result.then === 'function') {
                                result = await result;
                            } else if (result && typeof result.subscribe === 'function') {
                                // Simple Observable handling: take first value
                                result = await new Promise((resolve) => {
                                    const sub = result.subscribe(val => {
                                        resolve(val);
                                        if (sub.unsubscribe) sub.unsubscribe();
                                        else if (typeof sub === 'function') sub();
                                    });
                                });
                            }

                            if (!result) {
                                console.warn(`[Router] Navigation prevented by guard ${Guard.name}`);
                                return;
                            }
                        } catch (e) {
                            console.error(`[Router] Error in guard ${Guard.name}`, e);
                            return;
                        }
                    }
                }
            }

            // Handle Redirects
            const lastRoute = matchedRoutes[matchedRoutes.length - 1];
            if (lastRoute.redirectTo) {
                const currentPath = window.location.pathname;
                const newPath = currentPath.endsWith('/') 
                   ? currentPath + lastRoute.redirectTo 
                   : currentPath + '/' + lastRoute.redirectTo;
                
                this.navigate(newPath);
                return;
            }

            this.currentRoute = matchedRoutes;
            
            // Update Meta Tags from the last route
            const leaf = matchedRoutes[matchedRoutes.length - 1];
            if (leaf.data) {
                this.metaService.update(leaf.data);
            }

            this.notify();
        } else {
            console.warn(`[Router] No route found for path: ${path}`);
        }
    }

    findRoutes(routes, url) {
        for (const route of routes) {
            if (route.path === '**') continue;

            const match = this.matchPath(url, route.path, !!route.children);
            
            if (match) {
                const { params, remaining } = match;
                const matchedRoute = { ...route, params };
                
                if (route.children) {
                    const childUrl = remaining.startsWith('/') ? remaining.slice(1) : remaining;
                    const childMatches = this.findRoutes(route.children, childUrl);
                    
                    if (childMatches) {
                        return [matchedRoute, ...childMatches];
                    }
                } else if (!remaining || remaining === '/' || remaining === '') {
                    return [matchedRoute];
                }
            }
        }
        return null;
    }

    /**
     * Matches a URL against a route path pattern.
     * Supports :param syntax.
     * @param {string} url 
     * @param {string} routePath 
     * @param {boolean} prefix - Whether to match as a prefix
     * @returns {Object|null} Params object if matched, null otherwise
     */
    matchPath(url, routePath, prefix = false) {
        // Normalize url
        if (url.startsWith('/')) url = url.slice(1);
        if (routePath.startsWith('/')) routePath = routePath.slice(1);
        
        // Handle empty path (e.g. default child)
        if (routePath === '') {
            return { params: {}, remaining: url };
        }

        // Convert route path to regex
        const paramNames = [];
        const regexPath = routePath.replace(/:([^\/]+)/g, (_, key) => {
            paramNames.push(key);
            return '([^/]+)';
        });

        const regex = new RegExp(`^${regexPath}${prefix ? '(?:/(.*))?$' : '$'}`);
        const match = url.match(regex);

        if (match) {
            const params = {};
            let remaining = '';
            
            const paramCount = paramNames.length;
            
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            if (prefix) {
                remaining = match[paramCount + 1] || '';
            }

            return { params, remaining };
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
