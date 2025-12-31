import { Component } from '../core/component/component.js';

/**
 * Todo Item Component.
 * Represents a single todo item in the list.
 */
export const TodoItem = Component.create({
    selector: 'todo-item',
    styles: `
        :host {
            display: block;
        }
        li {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            gap: 16px;
            transition: all 0.2s;
            border-radius: 8px;
            margin-bottom: 4px;
            background: white;
        }
        li:hover {
            background: #f9fafb;
        }
        li.completed span {
            text-decoration: line-through;
            color: #9ca3af;
        }
        li.completed {
            background: #f9fafb;
        }
        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #2563eb;
            margin: 0;
            border-radius: 4px;
        }
        span {
            flex: 1;
            font-size: 1rem;
            color: #374151;
            transition: color 0.2s;
            cursor: pointer;
            user-select: none;
        }
        .delete-btn {
            background: transparent;
            color: #ef4444;
            border: none;
            padding: 8px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
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
            background: #fee2e2;
            color: #dc2626;
        }
        @media (max-width: 640px) {
            .delete-btn {
                opacity: 1;
            }
        }
    `,
    
    state: {
        todo: null
    },

    /**
     * Setter to receive todo data from parent.
     * @param {object} value - The todo object
     */
    set todo(value) {
        this.state.todo = value;
    },

    template() {
        const todo = this.state.todo;
        
        return `
            @if (!this.state.todo) {
                <div>Loading...</div>
            } @else {
                <li class="${todo && todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        ${todo && todo.completed ? 'checked' : ''}
                        onchange="this.getRootNode().host.dispatchEvent(new CustomEvent('toggle', { detail: ${todo ? todo.id : 'null'} }))"
                    >
                    <span onclick="this.getRootNode().host.dispatchEvent(new CustomEvent('toggle', { detail: ${todo ? todo.id : 'null'} }))">
                        ${todo ? todo.text : ''}
                    </span>
                    <button 
                        class="delete-btn" 
                        title="Delete task"
                        onclick="event.stopPropagation(); this.getRootNode().host.dispatchEvent(new CustomEvent('remove', { detail: ${todo ? todo.id : 'null'} }))"
                    >🗑️</button>
                </li>
            }
        `;
    }
});
