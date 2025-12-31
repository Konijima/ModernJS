import { Component } from './core/component.js';
import { CounterService } from './services/counter.service.js';
import './components/counter.component.js';
import './components/todo-list.component.js';
    
/**
 * Main Application Component.
 * Acts as the root container and layout for the application.
 */
export const App = Component.create({
    selector: 'my-app',
    inject: {
        counterService: CounterService
    },
    
    state: {
        localCount: 0,
        globalCount: 0
    },

    onInit() {
        this.connect(this.counterService, (count) => ({ globalCount: count }));
    },

    styles: `
        :host {
            display: block;
            min-height: 100vh;
            background-color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            padding: 2rem;
            box-sizing: border-box;
        }

        .app-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .app-header {
            text-align: center;
            margin-bottom: 3rem;
            padding-top: 1rem;
        }

                .app-title {
            font-size: 3rem;
            font-weight: 800;
            color: #111827;
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

        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: start;
        }

        @media (min-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 300px 1fr;
            }
        }

        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e5e7eb;
        }
        
        .section-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6b7280;
            margin-top: 0;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    `,

    /**
     * Helper getter for global count binding.
     * @returns {string} Reference key for the global count
     */
    get globalCount() {
        return this.bind(this.state.globalCount);
    },

    /**
     * Helper getter for local count binding.
     * @returns {string} Reference key for the local count
     */
    get localCount() {
        return this.bind(this.state.localCount);
    },

    template() {
        return `
            <div class="app-container">
                <header class="app-header">
                    <h1 class="app-title">Modern <span class="highlight">JS</span></h1>
                    <p class="app-subtitle">Native Web Components • Reactive State • Dependency Injection</p>
                </header>
                
                <main class="dashboard-grid">
                    <aside>
                        <div class="card">
                            <h3 class="section-title">Global State (Service)</h3>
                            <my-counter 
                                [count]="{{ this.globalCount }}"
                                (increment)="incrementService"
                            ></my-counter>
                        </div>
                        <div class="card">
                            <h3 class="section-title">Local State (Component)</h3>
                            <my-counter 
                                [count]="{{ this.localCount }}"
                                (increment)="incrementLocal"
                            ></my-counter>
                        </div>
                    </aside>
                    
                    <section>
                        <todo-list></todo-list>
                    </section>
                </main>

                <footer class="app-footer">
                    <p>View source on <a href="https://github.com/Konijima/ModernJS" target="_blank">GitHub</a></p>
                </footer>
            </div>
        `;
    },

    /**
     * Increment the global counter service.
     */
    incrementService() {
        this.counterService.increment();
    },

    /**
     * Increment the local component state.
     */
    incrementLocal() {
        this.state.localCount++;
    }
});
