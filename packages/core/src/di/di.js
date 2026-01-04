/**
 * Dependency Injection Container
 * @type {Map<Function, Object>}
 */
const container = new Map();

/**
 * Resolve a service instance, creating it if necessary (Singleton)
 * @template T
 * @param {new (...args: any[]) => T} Class - The class to resolve
 * @returns {T} The singleton instance
 */
export function resolve(Class) {
    if (container.has(Class)) {
        return container.get(Class);
    }

    // Resolve dependencies defined in static inject array
    const dependencies = /** @type {any} */ (Class).inject || [];
    const args = dependencies.map(dep => resolve(dep));
    
    const instance = new Class(...args);
    container.set(Class, instance);
    return instance;
}

export const inject = resolve;

/**
 * Decorator-like helper to mark a class as a Service
 * (Optional in this implementation, but good for semantics)
 * @template T
 * @param {T} Class 
 * @returns {T}
 */
export function Injectable(Class) {
    return Class;
}
