import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RouterLinkDirective } from '../../src/router/router-link.directive.js';
import { Router } from '../../src/router/router.js';
import { resolve } from '../../src/di/di.js';

// Mock Router
vi.mock('../../src/router/router.js', () => {
    return {
        Router: class {
            constructor() {
                this.listeners = [];
            }
            subscribe(fn) {
                this.listeners.push(fn);
                return () => {};
            }
            navigate(path) {}
            notify() {
                this.listeners.forEach(fn => fn([]));
            }
        }
    };
});

// Mock DI
vi.mock('../../src/di/di.js', () => {
    const instances = new Map();
    return {
        resolve: (Class) => {
            if (!instances.has(Class)) {
                instances.set(Class, new Class());
            }
            return instances.get(Class);
        }
    };
});

describe('RouterLinkDirective', () => {
    let element;
    let directive;
    let router;

    beforeEach(() => {
        element = document.createElement('a');
        router = resolve(Router);
        directive = new RouterLinkDirective(element);
        
        // Reset window.location
        Object.defineProperty(window, 'location', {
            value: { pathname: '/' },
            writable: true
        });
    });

    it('should set active class when path matches', () => {
        window.location.pathname = '/home';
        directive.onInit();
        directive.onUpdate('/home');
        
        expect(element.classList.contains('router-link-active')).toBe(true);
        expect(element.classList.contains('router-link-exact-active')).toBe(true);
    });

    it('should set active class when path is prefix', () => {
        window.location.pathname = '/home/details';
        directive.onInit();
        directive.onUpdate('/home');
        
        expect(element.classList.contains('router-link-active')).toBe(true);
        expect(element.classList.contains('router-link-exact-active')).toBe(false);
    });

    it('should handle trailing slashes in location', () => {
        window.location.pathname = '/home/';
        directive.onInit();
        directive.onUpdate('/home');
        
        expect(element.classList.contains('router-link-active')).toBe(true);
        expect(element.classList.contains('router-link-exact-active')).toBe(true);
    });

    it('should handle trailing slashes in link', () => {
        window.location.pathname = '/home';
        directive.onInit();
        directive.onUpdate('/home/');
        
        expect(element.classList.contains('router-link-active')).toBe(true);
        expect(element.classList.contains('router-link-exact-active')).toBe(true);
    });

    it('should update active state when router notifies', () => {
        window.location.pathname = '/about';
        directive.onInit();
        directive.onUpdate('/home');
        
        expect(element.classList.contains('router-link-active')).toBe(false);
        
        // Simulate navigation
        window.location.pathname = '/home';
        router.notify();
        
        expect(element.classList.contains('router-link-active')).toBe(true);
    });
});
