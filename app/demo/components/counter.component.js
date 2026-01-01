import { Component } from '../../core/component/component.js';
import { CounterService } from '../services/counter.service.js';
import { I18nService } from '../../core/services/i18n.service.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';

/**
 * Counter Component.
 * A simple component to demonstrate state management and event handling.
 */
export const CounterComponent = Component.create({
    selector: 'my-counter',
    inject: {
        counterService: CounterService,
        i18nService: I18nService
    },
    pipes: {
        translate: TranslatePipe
    },
    styles: `
        :host {
            display: block;
            text-align: center;
        }
        .count-display {
            padding: 2rem 0;
        }
        .count {
            font-size: 4rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-color), #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
            letter-spacing: -0.05em;
            margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
            .count {
                font-size: 5rem;
            }
        }
        .btn-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
    `,
    state: {
        count: 0
    },

    onInit() {
        this.connect(this.counterService, (count) => ({ count }));
        this.connect(this.i18nService, () => ({})); // Re-render on language change
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
            <div class="count-display">
                <div class="count">${this.state.count}</div>
                <div class="btn-group">
                    <button class="btn btn-primary btn-lg" (click)="handleIncrement">
                        <i class="fas fa-plus"></i> {{ 'counter.increment' | translate }}
                    </button>
                </div>
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
