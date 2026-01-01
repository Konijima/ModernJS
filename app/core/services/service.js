import { BehaviorSubject } from '../reactivity/observable.js';

/**
 * Base Service class for state management.
 * Implements a simple observable pattern for state changes.
 */
export class Service extends BehaviorSubject {
    /**
     * Create a new Service instance.
     * @param {any} [initialState=null] - The initial state of the service
     */
    constructor(initialState = null) {
        super(initialState);
        this.state = initialState; // Keep for backward compatibility
    }

    /**
     * Update the state and notify subscribers.
     * @param {any} newState - The new state value
     */
    setState(newState) {
        this.state = newState;
        this.next(newState);
    }

    /**
     * Get the current state.
     * @returns {any} The current state
     */
    getState() {
        return this.value;
    }

    /**
     * Subscribe to a specific slice of the state.
     * Only triggers when the selected value changes (distinctUntilChanged).
     * 
     * @param {Function} selector - Function to select part of the state (state) => value
     * @param {Function} callback - Function called with the new value (value) => void
     * @returns {Object} Subscription object
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
