import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../../app/core/router/router.js';

// Mock MetaService
class MockMetaService {
    update() {}
}

describe('Router', () => {
    let router;
    let metaService;

    beforeEach(() => {
        metaService = new MockMetaService();
        router = new Router(metaService);
        
        // Mock window.history
        vi.spyOn(window.history, 'pushState');
        
        // Mock console.warn to keep output clean
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register routes', () => {
        const routes = [{ path: '/', component: {} }];
        router.register(routes);
        expect(router.routes).toBe(routes);
    });

    it('should navigate to a route', () => {
        const routes = [
            { path: '/', component: { name: 'Home' } },
            { path: '/about', component: { name: 'About' } }
        ];
        router.register(routes);

        const listener = vi.fn();
        router.subscribe(listener);

        router.navigate('/about');

        expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/about');
        expect(router.currentRoute).toBe(routes[1]);
        expect(listener).toHaveBeenCalledWith(routes[1]);
    });

    it('should handle wildcard routes', () => {
        const routes = [
            { path: '/', component: {} },
            { path: '**', component: { name: '404' } }
        ];
        router.register(routes);

        router.navigate('/unknown');
        
        expect(router.currentRoute).toBe(routes[1]);
    });

    it('should update meta tags on navigation', () => {
        const updateSpy = vi.spyOn(metaService, 'update');
        const routes = [
            { 
                path: '/seo', 
                component: {}, 
                data: { title: 'SEO Page' } 
            }
        ];
        router.register(routes);

        router.navigate('/seo');
        
        expect(updateSpy).toHaveBeenCalledWith({ title: 'SEO Page' });
    });
});
