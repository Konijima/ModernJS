import { describe, it, expect } from 'vitest';
import { FormControl } from '../../../app/core/forms/form-control.js';
import { Validators } from '../../../app/core/forms/validators.js';

describe('Validators', () => {
    describe('required', () => {
        it('should return error for empty string', () => {
            const control = new FormControl('');
            expect(Validators.required(control)).toEqual({ required: true });
        });

        it('should return null for non-empty string', () => {
            const control = new FormControl('test');
            expect(Validators.required(control)).toBeNull();
        });
    });

    describe('minLength', () => {
        it('should return error if length is less than min', () => {
            const control = new FormControl('ab');
            const validator = Validators.minLength(3);
            expect(validator(control)).toEqual({ minLength: { requiredLength: 3, actualLength: 2 } });
        });

        it('should return null if length is equal or greater', () => {
            const control = new FormControl('abc');
            const validator = Validators.minLength(3);
            expect(validator(control)).toBeNull();
        });
    });

    describe('maxLength', () => {
        it('should return error if length is greater than max', () => {
            const control = new FormControl('abcd');
            const validator = Validators.maxLength(3);
            expect(validator(control)).toEqual({ maxLength: { requiredLength: 3, actualLength: 4 } });
        });

        it('should return null if length is equal or less', () => {
            const control = new FormControl('abc');
            const validator = Validators.maxLength(3);
            expect(validator(control)).toBeNull();
        });

        it('should return null for empty value', () => {
            const control = new FormControl('');
            const validator = Validators.maxLength(3);
            expect(validator(control)).toBeNull();
        });
    });

    describe('alphanumeric', () => {
        it('should return error for special characters', () => {
            const control = new FormControl('abc@');
            expect(Validators.alphanumeric(control)).toEqual({ alphanumeric: true });
        });

        it('should return null for letters and numbers', () => {
            const control = new FormControl('abc123');
            expect(Validators.alphanumeric(control)).toBeNull();
        });

        it('should return null for empty value', () => {
            const control = new FormControl('');
            expect(Validators.alphanumeric(control)).toBeNull();
        });
    });

    describe('pattern', () => {
        it('should return error if pattern does not match', () => {
            const control = new FormControl('abc');
            const validator = Validators.pattern(/^\d+$/);
            expect(validator(control)).toEqual({ pattern: { requiredPattern: '/^\\d+$/', actualValue: 'abc' } });
        });

        it('should return null if pattern matches', () => {
            const control = new FormControl('123');
            const validator = Validators.pattern(/^\d+$/);
            expect(validator(control)).toBeNull();
        });
    });
});
