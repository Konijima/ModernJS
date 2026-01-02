import { Component } from '../../core/component/component.js';
import { I18nService } from '../../core/services/i18n.service.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';

/**
 * Todo Item Component.
 * Represents a single todo item in the list.
 */
export const TodoItemComponent = Component.create({
    selector: 'todo-item',
    inject: {
        i18nService: I18nService
    },
    pipes: {
        translate: TranslatePipe
    },
    styles: `
        :host {
            display: block;
        }
        li {
            display: flex;
            align-items: center;
            padding: 0.875rem 1rem;
            gap: 1rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0.75rem;
            margin-bottom: 0.5rem;
            background: var(--bg-color);
            border: 1px solid transparent;
            cursor: pointer;
        }
        li:hover {
            background: var(--card-hover);
            border-color: var(--border-color);
        }
        li.completed span {
            text-decoration: line-through;
            color: var(--text-subtle);
        }
        li.completed {
            opacity: 0.6;
        }
        span {
            flex: 1;
            font-size: 0.9375rem;
            color: var(--text-color);
            transition: color 0.2s;
            user-select: none;
            line-height: 1.4;
        }
        .btn-icon {
            opacity: 0.4;
            padding: 0.5rem;
            border-radius: 0.5rem;
            background: transparent;
            color: var(--text-subtle);
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
        }
        .btn-icon:hover {
            opacity: 1;
            background: rgba(239, 68, 68, 0.15);
            color: var(--danger-color);
        }
        li:hover .btn-icon {
            opacity: 1;
        }
        @media (max-width: 640px) {
            .btn-icon {
                opacity: 1;
            }
        }
    `,
    
    state: {
        todo: null
    },

    onInit() {
        this.connect(this.i18nService, () => ({})); // Re-render on language change
    },

    /**
     * Setter to receive todo data from parent.
     * @param {object} value - The todo object
     */
    set todo(value) {
        this.state.todo = value;
    },

    template: `
            @if (!state.todo) {
                <div>{{ 'LOADING' | translate }}</div>
            } @else {
                <li 
                    class="{{ state.todo.completed ? 'completed' : '' }}"
                    (click)="handleToggle"
                >
                    <input 
                        type="checkbox" 
                        class="form-checkbox"
                        [checked]="state.todo.completed"
                        (click)="handleCheckboxClick"
                        (change)="handleToggle"
                    >
                    <span>
                        {{ state.todo.text }}
                    </span>
                    <button 
                        class="btn-icon danger" 
                        title="Delete task"
                        (click)="handleRemove"
                    ><i class="fas fa-trash"></i></button>
                </li>
            }
    `,

    handleCheckboxClick(e) {
        e.stopPropagation();
    },

    handleToggle(e) {
        this.dispatchEvent(new CustomEvent('toggle', { detail: this.state.todo.id }));
    },

    handleRemove(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('remove', { detail: this.state.todo.id }));
    }
});
