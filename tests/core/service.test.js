import { describe, it, expect, vi } from 'vitest';
import { Service } from '../../app/core/services/service.js';

describe('Service', () => {
    it('should initialize with default state', () => {
        const service = new Service({ count: 0 });
        expect(service.getState()).toEqual({ count: 0 });
    });

    it('should update state and notify listeners', () => {
        const service = new Service(0);
        const listener = vi.fn();
        
        service.subscribe(listener);
        
        // Initial call
        expect(listener).toHaveBeenCalledWith(0);
        
        service.setState(1);
        expect(listener).toHaveBeenCalledWith(1);
        expect(service.getState()).toBe(1);
    });

    it('should unsubscribe correctly', () => {
        const service = new Service(0);
        const listener = vi.fn();
        
        const sub = service.subscribe(listener);
        sub.unsubscribe();
        
        service.setState(1);
        expect(listener).toHaveBeenCalledTimes(1); // Only the initial call
        expect(listener).not.toHaveBeenCalledWith(1);
    });
});
