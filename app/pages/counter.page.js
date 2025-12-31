import { Component } from '../core/component.js';
import '../components/counter.component.js';

export const CounterPage = Component.create({
    selector: 'counter-page',
    styles: `
        :host {
            display: block;
        }
        .page-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        h2 {
            text-align: center;
            color: #374151;
            margin-top: 0;
        }
    `,
    template: `
        <div class="page-container">
            <h2>Counter Demo</h2>
            <my-counter></my-counter>
        </div>
    `
});
