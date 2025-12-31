import { Component } from '../core/component/component.js';
import '../components/counter.component.js';

export const CounterPage = Component.create({
    selector: 'counter-page',
    animations: {
        'scale-in': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'scale(0.95)' },
                    { opacity: 1, transform: 'scale(1)' }
                ],
                options: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
            }
        }
    },
    styles: `
        :host {
            display: block;
        }
        .page-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 768px) {
            .page-container {
                padding: 2rem;
            }
        }

        h2 {
            text-align: center;
            color: #374151;
            margin-top: 0;
        }
    `,
    template: `
        <div class="page-container" animate="scale-in">
            <h2>Counter Demo</h2>
            <my-counter></my-counter>
        </div>
    `
});
