import { Component } from '../../core/component/component.js';
import { BenchmarkComponent } from '../components/benchmark.component.js';

export const BenchmarkPage = Component.create({
    selector: 'benchmark-page',
    template: `
        <div class="page">
            <h1>Performance Benchmark</h1>
            <p>Measure the rendering performance of the framework.</p>
            <benchmark-test></benchmark-test>
        </div>
    `
});
