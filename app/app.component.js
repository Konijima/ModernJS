import { Component } from './core/component.js';
import { Router } from './core/router.js';
import './core/router-outlet.component.js';
import { HomePage } from './pages/home.page.js';
import { TodoPage } from './pages/todo.page.js';
import { CounterPage } from './pages/counter.page.js';
    
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
            { path: '/', component: HomePage },
            { path: '/todo', component: TodoPage },
            { path: '/counter', component: CounterPage },
            { path: '**', component: HomePage }
        ]);
    },

    navigateToHome(e) {
        e.preventDefault();
        this.router.navigate('/');
    },

    navigateToTodo(e) {
        e.preventDefault();
        this.router.navigate('/todo');
    },

    navigateToCounter(e) {
        e.preventDefault();
        this.router.navigate('/counter');
    },

    styles: `
        :host {
            display: block;
            min-height: 100vh;
            background-color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            padding: 1rem;
            box-sizing: border-box;
        }

        @media (min-width: 768px) {
            :host {
                padding: 2rem;
            }
        }

        .app-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }

        .app-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-top: 1rem;
        }

        @media (min-width: 768px) {
            .app-header {
                margin-bottom: 3rem;
            }
        }

        .app-title {
            font-size: 2rem;
            font-weight: 800;
            color: #111827;
        }

        @media (min-width: 768px) {
            .app-title {
                font-size: 3rem;
            }
        }

        .app-footer {
            margin-top: 3rem;
            text-align: center;
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }

        .app-footer a {
            color: #3b82f6;
            text-decoration: none;
        }

        .app-footer a:hover {
            text-decoration: underline;
        }
        
        .highlight {
            background: linear-gradient(135deg, #dd0031 0%, #c3002f 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
            color: #6b7280;
            font-size: 1.25rem;
            margin-top: 1rem;
            font-weight: 400;
        }

        .nav-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .nav-links a {
            text-decoration: none;
            color: #4b5563;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: all 0.2s;
            background: white;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .nav-links a:hover {
            background-color: #f9fafb;
            color: #2563eb;
        }
    `,

    template() {
        return `
            <div class="app-container">
                <header class="app-header">
                    <h1 class="app-title">Modern <span class="highlight">JS</span></h1>
                    <p class="app-subtitle">Native Web Components • Reactive State • Dependency Injection</p>
                    
                    <nav class="nav-links">
                        <a href="/" (click)="navigateToHome">Home</a>
                        <a href="/todo" (click)="navigateToTodo">Todo List</a>
                        <a href="/counter" (click)="navigateToCounter">Counter</a>
                    </nav>
                </header>
                
                <main>
                    <router-outlet></router-outlet>
                </main>

                <footer class="app-footer">
                    <p>View source on <a href="https://github.com/Konijima/ModernJS" target="_blank">GitHub</a></p>
                </footer>
            </div>
        `;
    }
});
