// ============================================================================
// Internal Dependencies
// ============================================================================
import { Service } from './service.js';

export class I18nService extends Service {
    constructor() {
        super({
            locale: 'en',
            translations: {}
        });
        this.languages = {};
        this.defaultLanguage = 'en';
    }

    configure(config) {
        this.languages = config.languages;
        this.defaultLanguage = config.defaultLanguage;

        const savedLocale = localStorage.getItem('modernjs_locale') || this.defaultLanguage;
        const initialLocale = this.languages[savedLocale] ? savedLocale : this.defaultLanguage;

        this.setState({
            locale: initialLocale,
            translations: this.languages[initialLocale].translations
        });
    }

    setLocale(locale) {
        if (this.languages[locale]) {
            localStorage.setItem('modernjs_locale', locale);
            this.setState({
                locale,
                translations: this.languages[locale].translations
            });
        }
    }

    get supportedLanguages() {
        return Object.values(this.languages).map(l => ({ code: l.code, label: l.label }));
    }

    get locale() {
        return this.state.locale;
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
