import { describe, it, expect } from 'vitest';
import { resolve, Injectable } from '../../app/core/di/di.js';

class MockServiceA {}
class MockServiceB {
    static inject = [MockServiceA];
    constructor(serviceA) {
        this.serviceA = serviceA;
    }
}

describe('Dependency Injection', () => {
    it('should resolve a singleton instance', () => {
        const instance1 = resolve(MockServiceA);
        const instance2 = resolve(MockServiceA);
        
        expect(instance1).toBeInstanceOf(MockServiceA);
        expect(instance1).toBe(instance2);
    });

    it('should inject dependencies recursively', () => {
        const serviceB = resolve(MockServiceB);
        
        expect(serviceB).toBeInstanceOf(MockServiceB);
        expect(serviceB.serviceA).toBeInstanceOf(MockServiceA);
        
        // Verify singleton property across injections
        const serviceA = resolve(MockServiceA);
        expect(serviceB.serviceA).toBe(serviceA);
    });

    it('should return class when using Injectable helper', () => {
        class MyService {}
        const Result = Injectable(MyService);
        expect(Result).toBe(MyService);
    });
});
