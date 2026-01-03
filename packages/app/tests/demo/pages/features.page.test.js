import { describe, it, expect } from 'vitest';
import { FeaturesPage } from '../../../src/demo/pages/features.page.js';
import { RouterLinkDirective } from '@modernjs/core';

describe('FeaturesPage', () => {
    it('should have router-link directive registered', () => {
        expect(FeaturesPage.directives).toBeDefined();
        expect(FeaturesPage.directives['router-link']).toBe(RouterLinkDirective);
    });
});
