import { Component } from '../../core/component/component.js';
import { TodoService } from '../services/todo.service.js';
import { I18nService } from '../../core/services/i18n.service.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';
import { fadeAnimation } from '../../core/animations/fade.animation.js';
import './todo-item.component.js';

/**
 * Todo List Component.
 * Displays a list of todo items and allows adding new ones.
 */
export const TodoListComponent = Component.create({
    selector: 'todo-list',
    animations: fadeAnimation,
    inject: {
        todoService: TodoService,
        i18nService: I18nService
    },
    pipes: {
        translate: TranslatePipe
    },

    state: {
        todos: []
    },

    onInit() {
        this.connect(this.todoService, (todos) => ({ todos }));
        this.connect(this.i18nService, () => ({})); // Re-render on language change
    },

    styles: `
        :host {
            display: block;
            font-family: inherit;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        .header-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-glow);
            color: var(--primary-color);
            border: 1px solid rgba(56, 189, 248, 0.2);
        }
        h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
            .input-group {
                flex-direction: row;
            }
        }
        /* Input styles - defined here to prevent flash of unstyled content */
        .form-input {
            width: 100%;
            padding: 0.75rem 1.25rem;
            border: 1px solid var(--border-color, #1f2937);
            border-radius: 1rem;
            font-size: 0.9375rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            background: var(--input-bg, #111827);
            color: var(--text-color, #f9fafb);
            box-sizing: border-box;
        }
        .form-input::placeholder {
            color: var(--text-subtle, #6b7280);
        }
        .form-input:focus {
            border-color: var(--primary-color, #38bdf8);
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
            background: var(--bg-color, #030712);
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .empty-state {
            text-align: center;
            color: var(--text-muted);
            padding: 3rem 2rem;
            background: var(--bg-color);
            border-radius: 1rem;
            border: 1px dashed var(--border-subtle);
        }
        .empty-state i {
            display: block;
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        .stats {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            color: var(--text-subtle);
            font-size: 0.8125rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .success-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 9999px;
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
    `,

    template() {
        return `
            <div class="card">
                <div class="header">
                    <div class="header-icon"><i class="fas fa-check-double"></i></div>
                    <h2>{{ 'todo.title' | translate }}</h2>
                </div>
                
                <div class="input-group">
                    <input class="form-input" placeholder="{{ 'todo.placeholder' | translate }}" onkeydown="if(event.key==='Enter') this.getRootNode().host.addTodo()">
                    <button class="btn btn-primary" onclick="this.getRootNode().host.addTodo()">
                        <i class="fas fa-plus"></i> {{ 'todo.add' | translate }}
                    </button>
                </div>

                @if (this.state.todos.length === 0) {
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        {{ 'todo.empty' | translate }}
                    </div>
                } @else {
                    <ul>
                        @for (let todo of this.state.todos) {
                            <todo-item 
                                [todo]="{{ this.bind(todo) }}"
                                (toggle)="handleToggle"
                                (remove)="handleRemove"
                            ></todo-item>
                        }
                    </ul>

                    <div class="stats">
                        <span>{{ 'todo.stats.completed' | translate:[this.state.todos.filter(t => t.completed).length, this.state.todos.length] }}</span>
                        @if (this.state.todos.every(t => t.completed)) {
                            <span class="success-badge"><i class="fas fa-check"></i> {{ 'todo.stats.all_done' | translate }}</span>
                        }
                    </div>
                }
            </div>
        `;
    },

    /**
     * Add a new todo item from the input field.
     */
    addTodo() {
        const input = this.shadowRoot.querySelector('input');
        if (input.value.trim()) {
            this.todoService.addTodo(input.value.trim());
            input.value = '';
            input.focus();
        }
    },

    /**
     * Handle toggle event from todo item.
     * @param {CustomEvent} event 
     */
    handleToggle(event) {
        this.todoService.toggleTodo(event.detail);
    },

    /**
     * Handle remove event from todo item.
     * @param {CustomEvent} event 
     */
    handleRemove(event) {
        this.todoService.removeTodo(event.detail);
    }
});
