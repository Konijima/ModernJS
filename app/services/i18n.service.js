import { Service } from '../core/services/service.js';
import { en } from '../i18n/en.js';
import { fr } from '../i18n/fr.js';

export class I18nService extends Service {
    constructor() {
        super({
            locale: 'en',
            translations: en
        });
        this.dictionaries = { en, fr };
    }

    setLocale(locale) {
        if (this.dictionaries[locale]) {
            this.setState({
                locale,
                translations: this.dictionaries[locale]
            });
        }
    }

    translate(key, params = []) {
        let value = this.state.translations[key] || key;
        if (params && params.length) {
            params.forEach((param, index) => {
                value = value.replace(`{${index}}`, param);
            });
        }
        return value;
    }
}
