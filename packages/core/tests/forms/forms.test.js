import { describe, it, expect } from 'vitest';
import { FormControl } from '../../src/forms/form-control.js';
import { FormGroup } from '../../src/forms/form-group.js';
import { Validators } from '../../src/forms/validators.js';

describe('Forms', () => {
    describe('FormControl', () => {
        it('should initialize with value', () => {
            const control = new FormControl('test');
            expect(control.value).toBe('test');
            expect(control.valid).toBe(true);
        });

        it('should validate required', () => {
            const control = new FormControl('', [Validators.required]);
            expect(control.valid).toBe(false);
            expect(control.errors).toEqual({ required: true });
            control.setValue('test');
            expect(control.valid).toBe(true);
        });
    });

    describe('FormGroup', () => {
        it('should aggregate values', () => {
            const group = new FormGroup({
                name: new FormControl('John'),
                age: new FormControl(30)
            });
            expect(group.value).toEqual({ name: 'John', age: 30 });
        });

        it('should be invalid if any control is invalid', () => {
            const group = new FormGroup({
                name: new FormControl('', [Validators.required]),
                age: new FormControl(30)
            });
            expect(group.valid).toBe(false);
            group.get('name').setValue('John');
            expect(group.valid).toBe(true);
        });
    });
});
