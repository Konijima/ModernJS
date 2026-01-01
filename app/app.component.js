import { Component } from './core/component/component.js';
import { Router } from './core/router/router.js';
import './core/router/router-outlet.component.js';
import './core/modal/modal.component.js';
import { HomePage } from './pages/home.page.js';
import { GetStartedPage } from './pages/get-started.page.js';
import { FeaturesPage } from './pages/features.page.js';
    
/**
 * Main Application Component.
 * Acts as the root container and layout for the application.
 */
export const App = Component.create({
    selector: 'my-app',
    inject: {
        router: Router
    },
    
    onInit() {
        // Define Routes
        this.router.register([
            { 
                path: '/', 
                component: HomePage,
                data: {
                    title: 'ModernJS - Home',
                    meta: [
                        { name: 'description', content: 'Welcome to ModernJS Framework' }
                    ]
                }
            },
            { 
                path: '/get-started', 
                component: GetStartedPage,
                data: {
                    title: 'ModernJS - Get Started',
                    meta: [
                        { name: 'description', content: 'Quick start guide for ModernJS' }
                    ]
                }
            },
            { 
                path: '/features', 
                component: FeaturesPage,
                data: {
                    title: 'ModernJS - Features',
                    meta: [
                        { name: 'description', content: 'Feature demonstrations and examples' }
                    ]
                }
            },
            { path: '**', component: HomePage }
        ]);

        // Subscribe to route changes to update nav
        this.router.subscribe(() => {
            this.update();
        });
    },

    navigateToHome(e) {
        e.preventDefault();
        this.router.navigate('/');
    },

    navigateToGetStarted(e) {
        e.preventDefault();
        this.router.navigate('/get-started');
    },

    navigateToFeatures(e) {
        e.preventDefault();
        this.router.navigate('/features');
    },

    styles: `
        :host {
            display: block;
            min-height: 100vh;
            background-color: var(--bg-color);
            font-family: inherit;
            color: var(--text-color);
            padding: 0;
            box-sizing: border-box;
        }
        main {
            flex: 1;
        }
    `,

    template() {
        const path = window.location.pathname;
        const isActive = (route) => path === route ? 'active' : '';
        return `
            <div class="app-container">
                <header class="app-header">
                    <h1 class="app-title">Modern <span class="highlight">JS</span></h1>
                    <p class="app-subtitle">Native Web Components • Reactive State • Dependency Injection</p>
                    
                    <nav class="nav-links">
                        <a href="/" class="nav-link ${isActive('/')}" (click)="navigateToHome">Home</a>
                        <a href="/get-started" class="nav-link ${isActive('/get-started')}" (click)="navigateToGetStarted">Get Started</a>
                        <a href="/features" class="nav-link ${isActive('/features')}" (click)="navigateToFeatures">Features</a>
                    </nav>
                </header>
                
                <main>
                    <router-outlet></router-outlet>
                </main>

                <app-modal></app-modal>

                <footer class="app-footer">
                    <p>View source on <a href="https://github.com/Konijima/ModernJS" target="_blank">GitHub</a></p>
                </footer>
            </div>
        `;
    }
});
