import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../src/component/renderer.js';
import { AnimationManager } from '../../src/animations/animation.js';

// Mock AnimationManager
vi.mock('../../src/animations/animation.js', () => ({
    AnimationManager: {
        animate: vi.fn().mockResolvedValue(true)
    }
}));

// Helper to flush microtasks
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Renderer', () => {
    let container;
    let component;

    beforeEach(() => {
        container = document.createElement('div');
        component = {
            handleClick: vi.fn(),
            _refs: {
                'ref1': { data: 'test' }
            },
            constructor: {
                animations: {}
            }
        };
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render a simple element', () => {
            const newDom = document.createElement('div');
            newDom.innerHTML = '<span>Hello</span>';
            
            render(container, newDom, component);
            
            expect(container.innerHTML).toBe('<span>Hello</span>');
        });

        it('should update text content', () => {
            container.innerHTML = '<span>Old</span>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<span>New</span>';
            
            render(container, newDom, component);
            
            expect(container.innerHTML).toBe('<span>New</span>');
        });
    });

    describe('DOM Diffing', () => {
        it('should add new nodes', () => {
            container.innerHTML = '<div>1</div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<div>1</div><div>2</div>';
            
            render(container, newDom, component);
            
            expect(container.children.length).toBe(2);
            expect(container.children[1].textContent).toBe('2');
        });

        it('should remove nodes', async () => {
            container.innerHTML = '<div>1</div><div>2</div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<div>1</div>';
            
            render(container, newDom, component);
            
            // Wait for async removal
            await flushPromises();
            
            expect(container.children.length).toBe(1);
            expect(container.children[0].textContent).toBe('1');
        });

        it('should replace different nodes', async () => {
            container.innerHTML = '<div>Old</div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<span>New</span>';
            
            render(container, newDom, component);
            
            // Wait for async replacement
            await flushPromises();
            
            expect(container.children[0].tagName).toBe('SPAN');
            expect(container.children[0].textContent).toBe('New');
        });
    });

    describe('Attributes & Bindings', () => {
        it('should update attributes', () => {
            container.innerHTML = '<div id="old" class="foo"></div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<div id="new" class="bar"></div>';
            
            render(container, newDom, component);
            
            const el = container.firstElementChild;
            expect(el.id).toBe('new');
            expect(el.className).toBe('bar');
        });

        it('should remove attributes', () => {
            container.innerHTML = '<div title="remove me"></div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<div></div>';
            
            render(container, newDom, component);
            
            expect(container.firstElementChild.hasAttribute('title')).toBe(false);
        });

        it('should bind events with (event)', () => {
            const newDom = document.createElement('div');
            // Use innerHTML to avoid setAttribute validation errors
            newDom.innerHTML = '<button (click)="handleClick"></button>';
            
            render(container, newDom, component);
            
            const renderedBtn = container.firstElementChild;
            renderedBtn.click();
            
            expect(component.handleClick).toHaveBeenCalled();
        });

        it('should bind properties with [prop]', () => {
            const newDom = document.createElement('div');
            // Use innerHTML to avoid setAttribute validation errors
            newDom.innerHTML = '<div [customprop]="ref1"></div>';
            
            render(container, newDom, component);
            
            const renderedEl = container.firstElementChild;
            expect(renderedEl.customprop).toEqual({ data: 'test' }); // DOM property, not attribute
        });
        
        it('should handle input checked property', () => {
            container.innerHTML = '<input type="checkbox">';
            const newDom = document.createElement('div');
            newDom.innerHTML = '<input type="checkbox" checked="true">';
            
            render(container, newDom, component);
            
            expect(container.firstElementChild.checked).toBe(true);
            
            // Now uncheck
            const newerDom = document.createElement('div');
            newerDom.innerHTML = '<input type="checkbox">';
            
            render(container, newerDom, component);
            expect(container.firstElementChild.checked).toBe(false);
        });
    });

    describe('Animations', () => {
        it('should check for animations on add', () => {
            const newDom = document.createElement('div');
            newDom.innerHTML = '<div animate="fade"></div>';
            
            render(container, newDom, component);
            
            expect(AnimationManager.animate).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                'fade',
                ':enter',
                component.constructor.animations
            );
        });

        it('should check for animations on remove', async () => {
            container.innerHTML = '<div animate="fade"></div>';
            const newDom = document.createElement('div');
            newDom.innerHTML = '';
            
            render(container, newDom, component);
            
            // Wait for async removal
            await flushPromises();
            
            expect(AnimationManager.animate).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                'fade',
                ':leave',
                component.constructor.animations
            );
        });
    });
});
