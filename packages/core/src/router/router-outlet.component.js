// ============================================================================
// Component System
// ============================================================================
import { Component } from '../component/component.js';

// ============================================================================
// Routing
// ============================================================================
import { Router } from './router.js';

// ============================================================================
// Features
// ============================================================================
import { AnimationManager } from '../animations/animation.js';

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

    styles: `
        :host {
            display: block;
            position: relative;
        }
    `,

    async loadComponent(route) {
        const root = this.shadowRoot;
        
        // If no route for this depth, clear
        if (!route) {
            root.innerHTML = '';
            return;
        }

        const currentElement = root.firstElementChild;

        // Optimization: Check if component class is same
        if (currentElement && currentElement.constructor === route.component) {
             // Update params if needed
             if (route.params) {
                 currentElement.params = route.params;
             }
             return;
        }

        // Helper to get animation config
        const getAnimationConfig = (componentClass) => {
            if (componentClass && componentClass.animations && componentClass.animations.route) {
                return componentClass.animations;
            }
            return null;
        };

        // Animate out current element
        if (currentElement) {
            const config = getAnimationConfig(currentElement.constructor);
            if (config) {
                await AnimationManager.animate(currentElement, 'route', ':leave', config);
            }
            
            if (currentElement.parentNode === root) {
                root.removeChild(currentElement);
            }
        } else {
            root.innerHTML = ''; // Safety clear
        }
        
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

                const config = getAnimationConfig(ComponentClass);
                
                // Set initial state for animation if config exists
                if (config) {
                    element.style.opacity = '0';
                }
                
                root.appendChild(element);

                // Animate in
                if (config) {
                    await AnimationManager.animate(element, 'route', ':enter', config);
                    element.style.opacity = '';
                }
            } else {
                console.error('[RouterOutlet] Component has no selector:', ComponentClass);
            }
        }
    }
});
