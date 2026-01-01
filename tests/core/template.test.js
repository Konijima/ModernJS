import { describe, it, expect } from 'vitest';
import { compileTemplate } from '../../app/core/component/template.js';

describe('Template Engine', () => {
    it('should compile simple text', () => {
        const template = 'Hello World';
        const result = compileTemplate(template, {});
        expect(result).toBe('Hello World');
    });

    it('should handle interpolation', () => {
        const template = 'Hello {{ this.name }}';
        const context = { name: 'ModernJS' };
        const result = compileTemplate(template, context);
        expect(result).toBe('Hello ModernJS');
    });

    it('should handle @if blocks', () => {
        const template = `
            @if(this.show) {
                Visible
            } @else {
                Hidden
            }
        `;
        
        expect(compileTemplate(template, { show: true }).trim()).toBe('Visible');
        expect(compileTemplate(template, { show: false }).trim()).toBe('Hidden');
    });

    it('should handle @for loops', () => {
        const template = `
            @for(let item of this.items) {
                <span>{{ item }}</span>
            }
        `;
        const context = { items: ['A', 'B'] };
        const result = compileTemplate(template, context);
        
        expect(result).toContain('<span>A</span>');
        expect(result).toContain('<span>B</span>');
    });
});
