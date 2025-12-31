import { Component } from '../core/Component.js';
import { TodoService } from '../services/TodoService.js';
import './TodoItem.js';

export const TodoList = Component.create({
    selector: 'todo-list',
    inject: {
        todoService: TodoService
    },

    styles: `
        :host {
            display: block;
            font-family: 'Roboto', sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        h2 {
            margin-top: 0;
            color: #1a1a1a;
            font-weight: 700;
            font-size: 1.8rem;
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
            padding: 14px 18px;
            border: 2px solid #eef0f2;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.2s;
            outline: none;
            background: #f8f9fa;
        }
        input:focus {
            border-color: #007bff;
            background: white;
            box-shadow: 0 0 0 4px rgba(0,123,255,0.1);
        }
        button.add-btn {
            padding: 0 28px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1rem;
        }
        button.add-btn:hover {
            background: #0056b3;
            transform: translateY(-1px);
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
            color: #adb5bd;
            padding: 3rem 2rem;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px dashed #dee2e6;
        }
        .stats {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eee;
            color: #868e96;
            font-size: 0.9rem;
            display: flex;
            justify-content: space-between;
        }
    `,

    template() {
        // Access state directly from service (auto-subscribed)
        const todos = this.todoService.state || [];
        const completedCount = todos.filter(t => t.completed).length;
        
        return this.h('div', { class: 'container' },
            this.h('h2', {}, '✨ My Tasks'),
            this.h('div', { class: 'input-group' },
                this.h('input', { 
                    placeholder: 'What needs to be done?',
                    onkeydown: (e) => {
                        if (e.key === 'Enter') this.addTodo();
                    }
                }),
                this.h('button', { 
                    class: 'add-btn',
                    onclick: () => this.addTodo() 
                }, 'Add')
            ),
            todos.length === 0 
                ? this.h('div', { class: 'empty-state' }, 'No tasks yet. Add one above to get started! ��')
                : this.h('div', {},
                    this.h('ul', {},
                        todos.map(todo => 
                            this.h('todo-item', { 
                                '[todo]': todo,
                                ontoggle: (e) => this.todoService.toggleTodo(e.detail),
                                onremove: (e) => this.todoService.removeTodo(e.detail)
                            })
                        )
                    ),
                    this.h('div', { class: 'stats' },
                        this.h('span', {}, `${completedCount} / ${todos.length} completed`),
                        completedCount > 0 && completedCount === todos.length
                            ? this.h('span', { style: 'color: #20c997; font-weight: 600;' }, 'All done! 🎉')
                            : null
                    )
                )
        );
    },

    addTodo() {
        const input = this.shadowRoot.querySelector('input');
        if (input.value.trim()) {
            this.todoService.addTodo(input.value.trim());
            input.value = '';
            input.focus();
        }
    }
});
