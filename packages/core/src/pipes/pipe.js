/**
 * Base Pipe class for value transformation.
 */
export class Pipe {
    /**
     * Transform a value.
     * @param {any} value - The value to transform
     * @param {...any} args - Optional arguments
     * @returns {any} The transformed value
     */
    transform(value, ...args) {
        return value;
    }

    /**
     * Lifecycle hook called when the component using the pipe is destroyed.
     */
    destroy() {}
}
