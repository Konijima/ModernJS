import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App } from '../src/app.component.js';
import { RouterLinkDirective, Router, inject } from '@modernjs/core';

describe('App Component', () => {
    let app;
    let router;

    beforeEach(() => {
        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Mock indexedDB
        global.indexedDB = {
            open: vi.fn().mockReturnValue({
                onerror: null,
                onsuccess: null,
                result: {
                    createObjectStore: vi.fn(),
                    transaction: vi.fn().mockReturnValue({
                        objectStore: vi.fn().mockReturnValue({
                            getAll: vi.fn().mockReturnValue({
                                onsuccess: null,
                                result: []
                            }),
                            add: vi.fn(),
                            put: vi.fn(),
                            delete: vi.fn()
                        })
                    })
                }
            })
        };

        // Mock ResizeObserver
        global.ResizeObserver = class ResizeObserver {
            constructor(callback) {}
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        // Reset DOM
        document.body.innerHTML = '';
        
        // Get router instance
        router = inject(Router);
        
        // Create app instance
        app = new App();
        document.body.appendChild(app);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        // Reset router if needed, or just rely on new instance if DI is reset (it's not usually)
        // But for this test, we just navigate.
    });

    it('should have router-link directive registered', () => {
        expect(App.directives).toBeDefined();
        expect(App.directives['router-link']).toBe(RouterLinkDirective);
    });

    it('should apply active class to features link when navigating to /features', async () => {
        // Wait for initial render
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Find the link in shadow DOM
        const link = app.shadowRoot.querySelector('a[router-link="/features"]');
        expect(link).toBeTruthy();
        
        // Navigate to /features
        router.navigate('/features');
        
        // Wait for updates
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        expect(link.classList.contains('router-link-active')).toBe(true);
    });

    it('should apply active class to home link when navigating to /', async () => {
        // Wait for initial render
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Find the link
        const link = app.shadowRoot.querySelector('a[router-link="/"]');
        expect(link).toBeTruthy();
        
        // Navigate to /
        router.navigate('/');
        
        // Wait for updates
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        expect(link.classList.contains('router-link-exact-active')).toBe(true);
    });
});
