import { Component } from '../core/Component.js';
import './Counter.js';
import './TodoList.js';

export const App = Component.create({
    selector: 'my-app',
    styles: `
        :host {
            display: block;
            max-width: 1200px;
            margin: 0 auto;
        }

        .app-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .app-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
            color: #64748b;
            font-size: 1.1rem;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            align-items: start;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .counters-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .todo-section {
            grid-column: span 2;
        }

        @media (max-width: 768px) {
            .todo-section {
                grid-column: span 1;
            }
        }
    `,
    template() {
        return this.h('div', {},
            this.h('header', { class: 'app-header' },
                this.h('h1', { class: 'app-title' }, 'Modern JS Framework'),
                this.h('p', { class: 'app-subtitle' }, 'Native Web Components • Reactive State • Dependency Injection')
            ),
            this.h('main', { class: 'dashboard-grid' },
                // Counters Column
                this.h('div', { class: 'counters-section' },
                    this.h('div', {},
                        this.h('h2', { class: 'section-title' }, '⚡ Shared State'),
                        this.h('my-counter')
                    ),
                    this.h('div', {},
                        this.h('h2', { class: 'section-title' }, '🔄 Reactive Sync'),
                        this.h('my-counter')
                    )
                ),
                
                // Todo List Column
                this.h('div', { class: 'todo-section' },
                    this.h('h2', { class: 'section-title' }, '📝 Persistence (IndexedDB)'),
                    this.h('todo-list')
                )
            )
        );
    }
});
