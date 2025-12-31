import { Component } from '../core/component/component.js';
import { CounterService } from '../services/counter.service.js';

/**
 * Counter Component.
 * A simple component to demonstrate state management and event handling.
 */
export const Counter = Component.create({
    selector: 'my-counter',
    inject: {
        counterService: CounterService
    },
    styles: `
        :host {
            display: block;
            text-align: center;
        }
        button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        button:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        button:active {
            transform: translateY(0);
        }
        .count {
            font-size: 2.5rem;
            font-weight: 800;
            color: #2563eb;
            margin: 0.5rem 0 1.5rem 0;
            line-height: 1;
            letter-spacing: -0.05em;
        }
        @media (min-width: 768px) {
            .count {
                font-size: 3.5rem;
            }
        }
    `,
    state: {
        count: 0
    },

    onInit() {
        this.connect(this.counterService, (count) => ({ count }));
    },

    /**
     * Setter for the count property.
     * Allows the parent component to bind to the count state.
     * @param {number} value - The new count value
     */
    set count(value) {
        this.state.count = value;
    },

    template() {
        return `
            <div>
                <div class="count">${this.state.count}</div>
                <button (click)="handleIncrement">Increment +</button>
            </div>
        `;
    },

    /**
     * Handle the increment button click.
     * Dispatches a custom 'increment' event to the parent.
     */
    handleIncrement() {
        this.counterService.increment();
        this.dispatchEvent(new CustomEvent('increment'));
    }
});
