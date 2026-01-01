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
        expect(router.currentRoute).toHaveLength(1);
        expect(router.currentRoute[0]).toMatchObject({ ...routes[1], params: {} });
        // Listener receives the array of routes
        expect(listener).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ ...routes[1], params: {} })]));
    });

    it('should handle wildcard routes', () => {
        const routes = [
            { path: '/', component: {} },
            { path: '**', component: { name: '404' } }
        ];
        router.register(routes);

        router.navigate('/unknown');
        
        expect(router.currentRoute[0]).toMatchObject({ ...routes[1], params: {} });
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

    it('should warn if route not found', () => {
        const routes = [{ path: '/', component: {} }];
        router.register(routes);
        
        router.navigate('/unknown');
        
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No route found'));
    });

    it('should handle popstate event', () => {
        const routes = [
            { path: '/', component: { name: 'Home' } },
            { path: '/back', component: { name: 'Back' } }
        ];
        router.register(routes);
        
        // Simulate navigation to /back
        Object.defineProperty(window, 'location', {
            value: { pathname: '/back' },
            writable: true
        });
        
        const event = new PopStateEvent('popstate');
        window.dispatchEvent(event);
        
        expect(router.currentRoute[0]).toMatchObject({ ...routes[1], params: {} });
    });

    it('should handle dynamic route parameters', () => {
        const routes = [
            { path: '/user/:id', component: { name: 'User' } },
            { path: '/post/:postId/comment/:commentId', component: { name: 'Comment' } }
        ];
        router.register(routes);

        router.navigate('/user/123');
        expect(router.currentRoute[0].component.name).toBe('User');
        expect(router.currentRoute[0].params).toEqual({ id: '123' });

        router.navigate('/post/456/comment/789');
        expect(router.currentRoute[0].component.name).toBe('Comment');
        expect(router.currentRoute[0].params).toEqual({ postId: '456', commentId: '789' });
    });
});
