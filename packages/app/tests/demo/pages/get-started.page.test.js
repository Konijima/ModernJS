import { describe, it, expect } from 'vitest';
import { GetStartedPage } from '../../../src/demo/pages/get-started.page.js';
import { RouterLinkDirective } from '@modernjs/core';

describe('GetStartedPage', () => {
    it('should have router-link directive registered', () => {
        expect(GetStartedPage.directives).toBeDefined();
        expect(GetStartedPage.directives['router-link']).toBe(RouterLinkDirective);
    });
});
