import { Component } from '../component/component.js';
import { Router } from './router.js';

/**
 * Router Outlet Component
 * Acts as a placeholder that renders the component for the current route.
 */
export const RouterOutlet = Component.create({
    selector: 'router-outlet',
    noTemplate: true, // Suppress warnings as this component manages its own DOM
    inject: {
        router: Router
    },
    
    onInit() {
        // Determine depth
        this.depth = 0;
        let parent = this.getRootNode().host;
        while (parent) {
            if (parent._routeDepth !== undefined) {
                this.depth = parent._routeDepth + 1;
                break;
            }
            // Traverse up
            const root = parent.getRootNode();
            if (root && root.host) {
                parent = root.host;
            } else {
                break;
            }
        }

        this.router.subscribe(routes => {
            // Handle both array (new) and single object (legacy/fallback)
            const routeList = Array.isArray(routes) ? routes : [routes];
            const route = routeList[this.depth];
            this.loadComponent(route);
        });
    },

    loadComponent(route) {
        const root = this.shadowRoot;
        
        // If no route for this depth, clear
        if (!route) {
            root.innerHTML = '';
            return;
        }

        // Optimization: Check if component class is same
        const currentElement = root.firstElementChild;
        if (currentElement && currentElement.constructor === route.component) {
             // Update params if needed
             if (route.params) {
                 currentElement.params = route.params;
             }
             return;
        }

        root.innerHTML = ''; // Clear current view
        
        if (route.component) {
            const ComponentClass = route.component;
            const selector = ComponentClass.selector;
            
            if (selector) {
                const element = document.createElement(selector);
                
                // Mark depth on the element so child router-outlet can find it
                element._routeDepth = this.depth;
                
                // Pass route params to the component
                if (route.params) {
                    element.params = route.params;
                }
                
                root.appendChild(element);
            } else {
                console.error('[RouterOutlet] Component has no selector:', ComponentClass);
            }
        }
    }
});
