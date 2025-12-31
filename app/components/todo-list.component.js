import { Component } from '../core/component.js';
import { TodoService } from '../services/todo.service.js';
import './todo-item.component.js';

/**
 * Todo List Component.
 * Displays a list of todo items and allows adding new ones.
 */
export const TodoList = Component.create({
    selector: 'todo-list',
    inject: {
        todoService: TodoService
    },

    state: {
        todos: []
    },

    onInit() {
        this.connect(this.todoService, (todos) => ({ todos }));
    },

    styles: `
        :host {
            display: block;
            font-family: inherit;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
        }
        h2 {
            margin-top: 0;
            color: #111827;
            font-weight: 700;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 2rem;
        }
        input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
            outline: none;
            background: #f9fafb;
            color: #1f2937;
        }
        input:focus {
            border-color: #2563eb;
            background: white;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        button.add-btn {
            padding: 0 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.95rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        button.add-btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        button.add-btn:active {
            transform: translateY(0);
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .empty-state {
            text-align: center;
            color: #6b7280;
            padding: 3rem 2rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #e5e7eb;
        }
        .stats {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.875rem;
            display: flex;
            justify-content: space-between;
            font-weight: 500;
        }
    `,

    template() {
        return `
            <div class="container">
                <h2>✨ My Tasks</h2>
                
                <div class="input-group">
                    <input placeholder="What needs to be done?" onkeydown="if(event.key==='Enter') this.getRootNode().host.addTodo()">
                    <button class="add-btn" onclick="this.getRootNode().host.addTodo()">Add</button>
                </div>

                @if (this.state.todos.length === 0) {
                    <div class="empty-state">No tasks yet. Add one above to get started! 🚀</div>
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
                        <span>{{ this.state.todos.filter(t => t.completed).length }} / {{ this.state.todos.length }} completed</span>
                        @if (this.state.todos.every(t => t.completed)) {
                            <span style="color: #059669; font-weight: 600;">All done! 🎉</span>
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
