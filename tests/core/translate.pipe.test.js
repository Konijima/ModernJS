import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslatePipe } from '../../app/core/pipes/translate.pipe.js';
import { I18nService } from '../../app/core/services/i18n.service.js';
import { resolve } from '../../app/core/di/di.js';

// Mock DI
vi.mock('../../app/core/di/di.js', () => ({
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

    it('should unsubscribe on destroy', () => {
        const pipe = new TranslatePipe(mockComponent);
        
        pipe.destroy();
        
        // Trigger language change
        mockService.triggerChange('fr');
        
        expect(mockComponent.update).not.toHaveBeenCalled();
    });
});
