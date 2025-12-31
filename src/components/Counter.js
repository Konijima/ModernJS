import { Component } from '../core/Component.js';
import { CounterService } from '../services/CounterService.js';

export const Counter = Component.create({
    selector: 'my-counter',
    inject: {
        counterService: CounterService
    },

    styles: `
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        h2 {
            color: #333;
            margin-bottom: 1rem;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #0056b3;
        }
        .count {
            font-size: 2rem;
            font-weight: bold;
            color: #007bff;
            margin: 1rem 0;
        }
    `,

    template() {
        return `
            <div class="card">
                <h2>Reactive Web Component</h2>
                <div class="count">${this.counterService.state}</div>
                <button (click)="increment">Increment Count</button>
            </div>
        `;
    },

    increment() {
        this.counterService.increment();
    }
});
