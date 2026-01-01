import { Pipe } from './pipe.js';
import { resolve } from '../di/di.js';
import { I18nService } from '../services/i18n.service.js';

export class TranslatePipe extends Pipe {
    constructor(component) {
        super();
        this.i18n = resolve(I18nService);
        
        if (component) {
            this.unsubscribe = this.i18n.onLangChange(() => {
                component.update();
            });
        }
    }

    transform(value, ...args) {
        return this.i18n.translate(value, args);
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
