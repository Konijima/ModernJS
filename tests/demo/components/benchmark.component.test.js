import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BenchmarkComponent } from '../../../app/demo/components/benchmark.component.js';
import * as renderer from '../../../app/core/component/renderer.js';

// Mock renderer
vi.mock('../../../app/core/component/renderer.js', () => ({
    render: vi.fn()
}));

describe('BenchmarkComponent', () => {
    let instance;

    beforeEach(() => {
        vi.clearAllMocks();
        // BenchmarkComponent is already defined by the import
        instance = new BenchmarkComponent();
        document.body.appendChild(instance);
    });

    afterEach(() => {
        document.body.removeChild(instance);
    });

    it('should initialize with empty rows', () => {
        expect(instance.state.rows).toEqual([]);
    });

    it('should create 1000 rows on run', async () => {
        instance.run();
        
        // Wait for RAF
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        expect(instance.state.rows.length).toBe(1000);
    });

    it('should clear rows', async () => {
        instance.run();
        await new Promise(resolve => requestAnimationFrame(resolve));
        expect(instance.state.rows.length).toBe(1000);

        instance.clear();
        await new Promise(resolve => requestAnimationFrame(resolve));
        expect(instance.state.rows.length).toBe(0);
    });

    it('should measure performance', async () => {
        instance.run();
        
        // Wait for RAF and setTimeout
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
        
        expect(instance.state.lastMeasure).toBeGreaterThan(0);
    });
});
