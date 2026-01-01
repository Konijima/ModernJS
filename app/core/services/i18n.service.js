import { Service } from './service.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../i18n/config.js';

export class I18nService extends Service {
    constructor() {
        const savedLocale = localStorage.getItem('modernjs_locale') || DEFAULT_LANGUAGE;
        const initialLocale = LANGUAGES[savedLocale] ? savedLocale : DEFAULT_LANGUAGE;

        super({
            locale: initialLocale,
            translations: LANGUAGES[initialLocale].translations
        });
    }

    setLocale(locale) {
        if (LANGUAGES[locale]) {
            localStorage.setItem('modernjs_locale', locale);
            this.setState({
                locale,
                translations: LANGUAGES[locale].translations
            });
        }
    }

    get supportedLanguages() {
        return Object.values(LANGUAGES).map(l => ({ code: l.code, label: l.label }));
    }

    /**
     * Listen specifically for language changes.
     * @param {Function} callback - Called with the new locale string
     * @returns {Function} Unsubscribe function
     */
    onLangChange(callback) {
        return this.select(state => state.locale, callback);
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
