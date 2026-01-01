import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../app/core/component/renderer.js';
import { Directive } from '../../app/core/directive/directive.js';

describe('Directive System', () => {
    let container;
    let component;

    class MockDirective extends Directive {
        onInit() {}
        onUpdate() {}
        onDestroy() {}
    }

    beforeEach(() => {
        container = document.createElement('div');
        // Mock component with directive registry
        component = {
            constructor: {
                directives: {
                    'mockDirective': MockDirective
                }
            },
            getDirective: (name) => {
                 // console.log('getDirective called with:', name);
                 if (name.toLowerCase() === 'mockdirective') return MockDirective;
                 return undefined;
            },
            state: { value: 'initial' },
            _refs: {
                'state.value': 'initial'
            }
        };
        
        // Spy on lifecycle methods
        vi.spyOn(MockDirective.prototype, 'onInit');
        vi.spyOn(MockDirective.prototype, 'onUpdate');
        vi.spyOn(MockDirective.prototype, 'onDestroy');
    });

    it('should initialize directive when attribute is present', () => {
        const newDom = document.createElement('div');
        // The renderer expects [prop] syntax for directives
        newDom.innerHTML = '<div [mockDirective]="state.value"></div>';
        
        render(container, newDom, component);
        
        expect(MockDirective.prototype.onInit).toHaveBeenCalled();
        // The first argument to onInit is the element, second is the value
        // Wait, onInit in Directive base class doesn't take arguments, the constructor does.
        // But applyDirective calls onInit() without args.
        // The constructor receives (element, component).
    });

    it('should update directive when value changes', () => {
        // Initial render
        const dom1 = document.createElement('div');
        dom1.innerHTML = '<div [mockDirective]="state.value"></div>';
        render(container, dom1, component);
        
        // Update state and render again
        component._refs['state.value'] = 'updated';
        const dom2 = document.createElement('div');
        dom2.innerHTML = '<div [mockDirective]="state.value"></div>';
        
        render(container, dom2, component);
        
        expect(MockDirective.prototype.onUpdate).toHaveBeenCalledWith('updated');
    });
});
