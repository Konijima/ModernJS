// ============================================================================
// Framework Imports
// ============================================================================
import { Service } from '@modernjs/core';

/**
 * Service for managing the global counter state.
 * Persists state to sessionStorage.
 */
export class CounterService extends Service {
    /**
     * Initialize the counter service.
     * Loads initial state from sessionStorage if available.
     */
    constructor() {
        const saved = sessionStorage.getItem('counter_state');
        const initial = saved ? JSON.parse(saved) : 0;
        super(initial);
    }

    /**
     * Update the state and persist to sessionStorage.
     * @param {number} newState - The new counter value
     */
    setState(newState) {
        super.setState(newState);
        sessionStorage.setItem('counter_state', JSON.stringify(newState));
    }

    /**
     * Increment the counter by 1.
     */
    increment() {
        this.setState(this.state + 1);
    }

    /**
     * Decrement the counter by 1.
     */
    decrement() {
        this.setState(this.state - 1);
    }
}
