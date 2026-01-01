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
        this.router.subscribe(route => {
            this.loadComponent(route);
        });
    },

    loadComponent(route) {
        const root = this.shadowRoot;
        root.innerHTML = ''; // Clear current view
        
        if (route && route.component) {
            const ComponentClass = route.component;
            const selector = ComponentClass.selector;
            
            if (selector) {
                const element = document.createElement(selector);
                root.appendChild(element);
            } else {
                console.error('[RouterOutlet] Component has no selector:', ComponentClass);
            }
        }
    }
});
