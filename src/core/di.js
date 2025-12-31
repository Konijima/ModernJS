/**
 * Dependency Injection Container
 */
const container = new Map();

/**
 * Resolve a service instance, creating it if necessary (Singleton)
 * @param {Class} Class - The class to resolve
 * @returns {Object} The singleton instance
 */
export function resolve(Class) {
    if (container.has(Class)) {
        return container.get(Class);
    }

    // Resolve dependencies defined in static inject array
    const dependencies = Class.inject || [];
    const args = dependencies.map(dep => resolve(dep));
    
    const instance = new Class(...args);
    container.set(Class, instance);
    return instance;
}

export const inject = resolve;

/**
 * Decorator-like helper to mark a class as a Service
 * (Optional in this implementation, but good for semantics)
 */
export function Injectable(Class) {
    return Class;
}
