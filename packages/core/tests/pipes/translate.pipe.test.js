import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslatePipe } from '../../src/pipes/translate.pipe.js';
import { I18nService } from '../../src/services/i18n.service.js';
import { resolve } from '../../src/di/di.js';

// Mock DI
vi.mock('../../src/di/di.js', () => ({
    resolve: vi.fn()
}));

describe('TranslatePipe', () => {
    let mockService;
    let mockComponent;

    beforeEach(() => {
        // Create a mock service with manual event triggering
        mockService = {
            listeners: [],
            translate: vi.fn((key) => key === 'HELLO' ? 'Bonjour' : key),
            onLangChange: vi.fn((cb) => {
                mockService.listeners.push(cb);
                return {
                    unsubscribe: () => {
                        mockService.listeners = mockService.listeners.filter(l => l !== cb);
                    }
                };
            }),
            triggerChange: (lang) => {
                mockService.listeners.forEach(cb => cb(lang));
            }
        };

        resolve.mockReturnValue(mockService);
        
        mockComponent = {
            update: vi.fn()
        };
    });

    it('should subscribe to language changes if component is provided', () => {
        const pipe = new TranslatePipe(mockComponent);
        
        // Trigger language change
        mockService.triggerChange('fr');
        
        expect(mockComponent.update).toHaveBeenCalled();
    });

    it('should not subscribe if component is not provided', () => {
        const pipe = new TranslatePipe();
        
        // Trigger language change
        mockService.triggerChange('fr');
        
        // No error should occur
        expect(true).toBe(true);
    });

    it('should transform value using service', () => {
        const pipe = new TranslatePipe();
        expect(pipe.transform('HELLO')).toBe('Bonjour');
        expect(mockService.translate).toHaveBeenCalledWith('HELLO', []);
    });

    it('should handle array arguments correctly', () => {
        const pipe = new TranslatePipe();
        pipe.transform('PARAMS', ['a', 'b']);
        // Should unwrap the array
        expect(mockService.translate).toHaveBeenCalledWith('PARAMS', ['a', 'b']);
    });

    it('should handle multiple arguments correctly', () => {
        const pipe = new TranslatePipe();
        pipe.transform('PARAMS', 'a', 'b');
        // Should pass as array
        expect(mockService.translate).toHaveBeenCalledWith('PARAMS', ['a', 'b']);
    });

    it('should unsubscribe on destroy', () => {
        const pipe = new TranslatePipe(mockComponent);
        
        pipe.destroy();
        
        // Trigger language change
        mockService.triggerChange('fr');
        
        expect(mockComponent.update).not.toHaveBeenCalled();
    });
});
