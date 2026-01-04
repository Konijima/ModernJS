import { BehaviorSubject } from '../reactivity/observable.js';

/**
 * Base Service class for state management.
 * Implements a simple observable pattern for state changes.
 * @template T
 * @extends {BehaviorSubject<T>}
 */
export class Service extends BehaviorSubject {
    /**
     * Create a new Service instance.
     * @param {T} [initialState=null] - The initial state of the service
     */
    constructor(initialState = null) {
        super(initialState);
        /** @type {T} */
        this.state = initialState; // Keep for backward compatibility
    }

    /**
     * Update the state and notify subscribers.
     * @param {T} newState - The new state value
     */
    setState(newState) {
        this.state = newState;
        this.next(newState);
    }

    /**
     * Get the current state.
     * @returns {T} The current state
     */
    getState() {
        return this.value;
    }

    /**
     * Subscribe to a specific slice of the state.
     * Only triggers when the selected value changes (distinctUntilChanged).
     * 
     * @template R
     * @param {function(T): R} selector - Function to select part of the state (state) => value
     * @param {function(R): void} callback - Function called with the new value (value) => void
     * @returns {import('../reactivity/observable.js').Subscription} Subscription object
     */
    select(selector, callback) {
        let previousValue = selector(this.value);
        
        // Emit initial value immediately
        callback(previousValue);

        // Subscribe to state changes
        return this.subscribe((state) => {
            const newValue = selector(state);
            // Simple strict equality check
            if (newValue !== previousValue) {
                previousValue = newValue;
                callback(newValue);
            }
        });
    }
}
