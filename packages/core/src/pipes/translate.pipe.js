// ============================================================================
// Internal Dependencies
// ============================================================================
import { Pipe } from './pipe.js';
import { resolve } from '../di/di.js';
import { I18nService } from '../services/i18n.service.js';

export class TranslatePipe extends Pipe {
    constructor(component) {
        super();
        this.i18n = resolve(I18nService);
        
        if (component) {
            this.subscription = this.i18n.onLangChange(() => {
                component.update();
            });
        }
    }

    /**
     * Transforms a key into a translated string.
     * @param {string} value - The translation key
     * @param {...any} args - Translation parameters
     * @returns {string} The translated string
     * 
     * @example
     * ```
     * // Basic usage
     * {{ 'hello.world' | translate }}
     * 
     * // With parameters
     * {{ 'welcome.message' | translate: userName }}
     * 
     * // With multiple parameters
     * {{ 'order.status' | translate: orderId : status }}
     * ```
     */
    transform(value, ...args) {
        // If the first argument is an array and it's the only argument, use it as the params
        if (args.length === 1 && Array.isArray(args[0])) {
            return this.i18n.translate(value, args[0]);
        }
        return this.i18n.translate(value, args);
    }

    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
