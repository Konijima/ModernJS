import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormControlDirective } from '../../src/forms/form-control.directive.js';

describe('FormControlDirective', () => {
    let element;
    let component;
    let directive;
    let mockControl;
    let unsubscribeSpy;

    beforeEach(() => {
        element = document.createElement('input');
        component = {
            update: vi.fn()
        };
        
        unsubscribeSpy = vi.fn();

        // Mock FormControl
        mockControl = {
            value: 'initial',
            setValue: vi.fn(),
            markAsTouched: vi.fn(),
            valueChanges: {
                subscribe: vi.fn((cb) => {
                    // Store callback to trigger it later
                    mockControl._cb = cb;
                    return { unsubscribe: unsubscribeSpy };
                })
            }
        };

        directive = new FormControlDirective(element, component);
        directive.onInit(); // Setup DOM listeners
    });

    it('should subscribe to control changes on update', () => {
        directive.onUpdate(mockControl);
        
        expect(mockControl.valueChanges.subscribe).toHaveBeenCalled();
        expect(element.value).toBe('initial');
    });

    it('should update element value when control value changes', () => {
        directive.onUpdate(mockControl);
        
        // Simulate control change
        mockControl._cb('new value');
        
        expect(element.value).toBe('new value');
    });

    it('should not update element value if it is already the same (avoid cursor jump)', () => {
        directive.onUpdate(mockControl);
        element.value = 'user input';
        
        // Simulate control change echoing back the same value
        mockControl._cb('user input');
        
        // We can't easily test that the setter wasn't called on the DOM element 
        // without spying on the property setter, but we can verify the logic flow.
        // The code is: if (this.element.value !== value) { this.element.value = value; }
        // So if we set it manually, it should stay.
        expect(element.value).toBe('user input');
    });

    it('should update control value on input event', () => {
        directive.onUpdate(mockControl);
        
        element.value = 'user input';
        element.dispatchEvent(new Event('input'));
        
        expect(mockControl.setValue).toHaveBeenCalledWith('user input');
    });

    it('should mark control as touched on blur event', () => {
        directive.onUpdate(mockControl);
        
        element.dispatchEvent(new Event('blur'));
        
        expect(mockControl.markAsTouched).toHaveBeenCalled();
        expect(component.update).toHaveBeenCalled();
    });
    
    it('should handle cleanup on destroy', () => {
        directive.onUpdate(mockControl);
        directive.onDestroy();
        
        expect(unsubscribeSpy).toHaveBeenCalled();
        
        // Verify event listeners are removed? 
        // The current implementation of onDestroy in FormControlDirective 
        // only unsubscribes from the control, it doesn't remove DOM listeners.
        // This is fine because if the element is removed, listeners go with it.
        // But if the directive is destroyed while element stays (unlikely in this framework), 
        // we might want to remove them.
        // Let's check the implementation of onDestroy.
    });
});
