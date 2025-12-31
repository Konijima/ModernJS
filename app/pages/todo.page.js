import { Component } from '../core/component.js';
import '../components/todo-list.component.js';

export const TodoPage = Component.create({
    selector: 'todo-page',
    template: `
        <div class="page-container">
            <todo-list></todo-list>
        </div>
    `
});
