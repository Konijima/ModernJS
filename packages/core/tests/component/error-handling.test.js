import { describe, it, expect, vi } from 'vitest';
import { Component } from '../../src/component/component.js';

describe('Component Error Handling', () => {
    it('should catch render errors and log them', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        // Mock setTimeout to prevent the async throw from crashing the test runner
        const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(() => {});
        // Mock dispatchEvent to prevent JSDOM from throwing unhandled ErrorEvent
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
        
        const ErrorComponent = Component.create({
            selector: 'error-comp',
            template: '<div>{{ missingVar }}</div>'
        });
        
        const instance = new ErrorComponent();
        document.body.appendChild(instance);
        
        // The error is caught, logged, dispatched, and scheduled to be rethrown
        instance._performUpdate();
        
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Framework] Error updating ERROR-COMP'),
            expect.any(Error)
        );

        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ErrorEvent));
        
        // Verify we attempted to rethrow asynchronously
        expect(setTimeoutSpy).toHaveBeenCalled();
        
        document.body.removeChild(instance);
        consoleSpy.mockRestore();
        setTimeoutSpy.mockRestore();
        dispatchSpy.mockRestore();
    });
});
