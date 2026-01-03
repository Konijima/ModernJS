import { describe, it, expect } from 'vitest';
import { compileTemplate } from '../../src/component/template.js';

describe('Template Engine', () => {
    it('should compile simple text', () => {
        const template = 'Hello World';
        const result = compileTemplate(template, {});
        expect(result).toBe('Hello World');
    });

    it('should handle interpolation', () => {
        const template = 'Hello {{ name }}';
        const context = { name: 'ModernJS' };
        const result = compileTemplate(template, context);
        expect(result).toBe('Hello ModernJS');
    });

    it('should handle @if blocks', () => {
        const template = `
            @if(show) {
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
            @for(let item of items) {
                <span>{{ item }}</span>
            }
        `;
        const context = { items: ['A', 'B'] };
        const result = compileTemplate(template, context);
        
        expect(result).toContain('<span>A</span>');
        expect(result).toContain('<span>B</span>');
    });

    it('should handle pipes', () => {
        const template = '{{ value | uppercase }}';
        const context = {
            value: 'hello',
            _pipes: {
                uppercase: {
                    transform: (val) => val.toUpperCase()
                }
            }
        };
        const result = compileTemplate(template, context);
        expect(result).toBe('HELLO');
    });

    it('should handle pipes with arguments', () => {
        const template = '{{ value | slice:0:2 }}';
        const context = {
            value: 'hello',
            _pipes: {
                slice: {
                    transform: (val, start, end) => val.slice(start, end)
                }
            }
        };
        const result = compileTemplate(template, context);
        expect(result).toBe('he');
    });

    it('should handle template errors gracefully', () => {
        const template = '@if(this.show) {'; // Missing closing brace
        expect(() => compileTemplate(template, {})).toThrow(/Template Error/);
    });
});
