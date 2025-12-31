/**
 * Base Service class for state management
 */
export class Service {
    constructor(initialState = null) {
        this.listeners = new Set();
        this.state = initialState;
    }

    /**
     * Update the state and notify subscribers
     * @param {any} newState 
     */
    setState(newState) {
        this.state = newState;
        this.notify();
    }

    /**
     * Get the current state
     * @returns {any}
     */
    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        // Return current state immediately
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}
