import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { I18nService } from '../../src/services/i18n.service.js';

const MOCK_CONFIG = {
    defaultLanguage: 'en',
    languages: {
        en: {
            code: 'en',
            label: 'English',
            translations: {
                'HELLO': 'Hello',
                'GREETING': 'Hello {0}'
            }
        },
        fr: {
            code: 'fr',
            label: 'French',
            translations: {
                'HELLO': 'Bonjour',
                'GREETING': 'Bonjour {0}'
            }
        }
    }
};

describe('I18nService', () => {
    let service;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        service = new I18nService();
        service.configure(MOCK_CONFIG);
    });

    it('should initialize with default language', () => {
        expect(service.getState().locale).toBe('en');
        expect(service.translate('HELLO')).toBe('Hello');
    });

    it('should initialize with saved language from localStorage', () => {
        localStorage.setItem('modernjs_locale', 'fr');
        service = new I18nService();
        service.configure(MOCK_CONFIG);
        expect(service.getState().locale).toBe('fr');
        expect(service.translate('HELLO')).toBe('Bonjour');
    });

    it('should fallback to default if saved language is invalid', () => {
        localStorage.setItem('modernjs_locale', 'de');
        service = new I18nService();
        service.configure(MOCK_CONFIG);
        expect(service.getState().locale).toBe('en');
    });

    it('should change language using setLocale', () => {
        service.setLocale('fr');
        
        expect(service.getState().locale).toBe('fr');
        expect(localStorage.getItem('modernjs_locale')).toBe('fr');
        expect(service.translate('HELLO')).toBe('Bonjour');
    });

    it('should not change language if locale is invalid', () => {
        service.setLocale('de');
        
        expect(service.getState().locale).toBe('en');
        expect(localStorage.getItem('modernjs_locale')).toBeNull();
    });

    it('should translate with parameters', () => {
        expect(service.translate('GREETING', ['World'])).toBe('Hello World');
    });

    it('should return key if translation missing', () => {
        expect(service.translate('MISSING_KEY')).toBe('MISSING_KEY');
    });

    it('should return supported languages', () => {
        const languages = service.supportedLanguages;
        expect(languages).toHaveLength(2);
        expect(languages).toContainEqual({ code: 'en', label: 'English' });
        expect(languages).toContainEqual({ code: 'fr', label: 'French' });
    });
    
    it('should notify on language change', () => {
        const spy = vi.fn();
        service.onLangChange(spy);
        
        service.setLocale('fr');
        expect(spy).toHaveBeenCalledWith('fr');
    });
});
