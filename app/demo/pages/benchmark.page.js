import { Component } from '../../core/component/component.js';
import { BenchmarkComponent } from '../components/benchmark.component.js';

export const BenchmarkPage = Component.create({
    selector: 'benchmark-page',
    template: `
        <div class="page">
            <benchmark-test></benchmark-test>
        </div>
    `
});
