import { describe, it, expect } from 'vitest';
import { Pipe } from '../../../app/core/pipes/pipe.js';

describe('Pipe', () => {
    it('should return value as is by default', () => {
        const pipe = new Pipe();
        const value = 'test';
        expect(pipe.transform(value)).toBe(value);
    });
});
