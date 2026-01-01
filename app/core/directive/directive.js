/**
 * Base class for Directives.
 * Directives allow attaching behavior to DOM elements.
 */
export class Directive {
    constructor(element, component) {
        this.element = element;
        this.component = component;
    }

    /**
     * Called when the directive is initialized.
     */
    onInit() {}

    /**
     * Called when the bound value changes.
     * @param {any} value - The new value
     */
    onUpdate(value) {}

    /**
     * Called when the directive (or element) is destroyed.
     */
    onDestroy() {}
}
