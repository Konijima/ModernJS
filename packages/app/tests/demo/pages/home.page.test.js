import { describe, it, expect } from 'vitest';
import { HomePage } from '../../../src/demo/pages/home.page.js';
import { RouterLinkDirective } from '@modernjs/core';

describe('HomePage', () => {
    it('should have router-link directive registered', () => {
        expect(HomePage.directives).toBeDefined();
        expect(HomePage.directives['router-link']).toBe(RouterLinkDirective);
    });
});
