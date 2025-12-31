import { Component } from '../core/component/component.js';
import '../components/todo-list.component.js';

export const TodoPage = Component.create({
    selector: 'todo-page',
    animations: {
        'slide-in': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'translateX(-20px)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ],
                options: { duration: 300, easing: 'ease-out', fill: 'forwards' }
            }
        }
    },
    template: `
        <div class="page-container" animate="slide-in">
            <todo-list></todo-list>
        </div>
    `
});
