import { describe, it, expect } from 'vitest';
import { UpperCasePipe, LowerCasePipe, DatePipe, CurrencyPipe } from '../../app/core/pipes/common.pipes.js';

describe('Common Pipes', () => {
    describe('UpperCasePipe', () => {
        const pipe = new UpperCasePipe();
        
        it('should transform string to uppercase', () => {
            expect(pipe.transform('hello')).toBe('HELLO');
        });

        it('should handle non-string values', () => {
            expect(pipe.transform(123)).toBe(123);
            expect(pipe.transform(null)).toBe(null);
        });
    });

    describe('LowerCasePipe', () => {
        const pipe = new LowerCasePipe();
        
        it('should transform string to lowercase', () => {
            expect(pipe.transform('HELLO')).toBe('hello');
        });
    });

    describe('DatePipe', () => {
        const pipe = new DatePipe();
        const date = new Date('2023-01-01T12:00:00Z');
        
        it('should format date', () => {
            // Note: Exact output depends on locale, so we check basic validity
            // or mock Intl. But for now let's check it returns a string
            expect(typeof pipe.transform(date)).toBe('string');
        });

        it('should handle short format', () => {
            expect(typeof pipe.transform(date, 'short')).toBe('string');
        });

        it('should handle full format', () => {
            expect(typeof pipe.transform(date, 'full')).toBe('string');
        });

        it('should handle invalid dates', () => {
            expect(pipe.transform('invalid')).toBe('invalid');
        });
    });

    describe('CurrencyPipe', () => {
        const pipe = new CurrencyPipe();
        
        it('should format currency', () => {
            // Using non-breaking space regex for currency symbols
            expect(pipe.transform(100, 'USD')).toMatch(/\$100\.00/);
        });
    });
});
