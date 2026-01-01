/**
 * Base Service class for state management.
 * Implements a simple observable pattern for state changes.
 */
export class Service {
    /**
     * Create a new Service instance.
     * @param {any} [initialState=null] - The initial state of the service
     */
    constructor(initialState = null) {
        this.listeners = new Set();
        this.state = initialState;
    }

    /**
     * Update the state and notify subscribers.
     * @param {any} newState - The new state value
     */
    setState(newState) {
        this.state = newState;
        this.notify();
    }

    /**
     * Get the current state.
     * @returns {any} The current state
     */
    getState() {
        return this.state;
    }

    /**
     * Subscribe to state changes.
     * The listener is called immediately with the current state.
     * 
     * @param {Function} listener - Callback function receiving the state
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Return current state immediately
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    /**
     * Subscribe to a specific slice of the state.
     * Only triggers when the selected value changes (distinctUntilChanged).
     * 
     * @param {Function} selector - Function to select part of the state (state) => value
     * @param {Function} callback - Function called with the new value (value) => void
     * @returns {Function} Unsubscribe function
     */
    select(selector, callback) {
        let previousValue = selector(this.state);
        
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

    /**
     * Notify all listeners of the current state.
     * @protected
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}
