import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetaService } from '../../src/services/meta.service.js';

describe('MetaService', () => {
    let service;
    let mockI18nService;
    let langChangeCallback;

    beforeEach(() => {
        // Mock I18nService
        mockI18nService = {
            translate: vi.fn((key) => `translated_${key}`),
            onLangChange: vi.fn((cb) => {
                langChangeCallback = cb;
                return vi.fn();
            })
        };

        service = new MetaService(mockI18nService);
        
        // Clear document head
        document.title = '';
        document.head.innerHTML = '';
    });

    it('should set document title', () => {
        service.setTitle('New Title');
        expect(document.title).toBe('New Title');
    });

    it('should create meta tag if not exists', () => {
        service.setMeta('description', 'My Description');
        
        const meta = document.querySelector('meta[name="description"]');
        expect(meta).not.toBeNull();
        expect(meta.getAttribute('content')).toBe('My Description');
    });

    it('should update existing meta tag', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        meta.setAttribute('content', 'Old');
        document.head.appendChild(meta);
        
        service.setMeta('description', 'New');
        
        expect(meta.getAttribute('content')).toBe('New');
        expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
    });

    it('should update title and meta from config with translation', () => {
        const config = {
            title: 'PAGE_TITLE',
            meta: [
                { name: 'description', content: 'PAGE_DESC' }
            ]
        };
        
        service.update(config);
        
        expect(mockI18nService.translate).toHaveBeenCalledWith('PAGE_TITLE');
        expect(mockI18nService.translate).toHaveBeenCalledWith('PAGE_DESC');
        
        expect(document.title).toBe('translated_PAGE_TITLE');
        const meta = document.querySelector('meta[name="description"]');
        expect(meta.getAttribute('content')).toBe('translated_PAGE_DESC');
    });

    it('should re-apply config on language change', () => {
        const config = {
            title: 'PAGE_TITLE'
        };
        
        service.update(config);
        
        // Clear mocks to verify re-call
        mockI18nService.translate.mockClear();
        
        // Trigger language change
        langChangeCallback('fr');
        
        expect(mockI18nService.translate).toHaveBeenCalledWith('PAGE_TITLE');
    });
});
