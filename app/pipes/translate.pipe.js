import { Pipe } from '../core/pipes/pipe.js';
import { resolve } from '../core/di/di.js';
import { I18nService } from '../services/i18n.service.js';

export class TranslatePipe extends Pipe {
    constructor() {
        super();
        this.i18n = resolve(I18nService);
    }

    transform(value, ...args) {
        return this.i18n.translate(value, args);
    }
}
