import { Component } from '../core/Component.js';

export const TodoItem = Component.create({
    selector: 'todo-item',
    styles: `
        :host {
            display: block;
        }
        li {
            display: flex;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid #f1f3f5;
            gap: 16px;
            transition: all 0.2s;
            border-radius: 12px;
            margin-bottom: 8px;
            background: white;
        }
        li:hover {
            background: #f8f9fa;
            transform: translateX(4px);
        }
        li.completed span {
            text-decoration: line-through;
            color: #adb5bd;
        }
        li.completed {
            background: #f8f9fa;
        }
        input[type="checkbox"] {
            width: 22px;
            height: 22px;
            cursor: pointer;
            accent-color: #007bff;
            margin: 0;
        }
        span {
            flex: 1;
            font-size: 1.1rem;
            color: #495057;
            transition: color 0.2s;
            cursor: pointer;
            user-select: none;
        }
        .delete-btn {
            background: transparent;
            color: #fa5252;
            border: 1px solid transparent;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        li:hover .delete-btn {
            opacity: 1;
        }
        .delete-btn:hover {
            background: #fff5f5;
            border-color: #ffc9c9;
        }
    `,
    
    state: {
        todo: null
    },

    // Setter to receive data from parent
    set todo(value) {
        this.state.todo = value;
    },

    template() {
        const todo = this.state.todo;
        if (!todo) return this.h('div', {}, 'Loading...');

        return this.h('li', { class: todo.completed ? 'completed' : '' },
            this.h('input', { 
                type: 'checkbox', 
                checked: todo.completed ? 'true' : undefined,
                onchange: (e) => {
                    this.dispatchEvent(new CustomEvent('toggle', { detail: todo.id }));
                }
            }),
            this.h('span', {
                onclick: () => this.dispatchEvent(new CustomEvent('toggle', { detail: todo.id }))
            }, todo.text),
            this.h('button', {
                class: 'delete-btn',
                title: 'Delete task',
                onclick: (e) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent('remove', { detail: todo.id }));
                }
            }, '🗑️')
        );
    }
});
