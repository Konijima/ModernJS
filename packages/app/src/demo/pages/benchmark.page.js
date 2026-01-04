// ============================================================================
// Framework Imports
// ============================================================================
import { Component, fadeAnimation } from '@modernjs/core';

// ============================================================================
// Internal Dependencies
// ============================================================================
import '../components/benchmark.component.js';

export const BenchmarkPage = Component.create({
    selector: 'benchmark-page',
    animations: fadeAnimation,
    template: `
        <div class="page">
            <benchmark-test></benchmark-test>
        </div>
    `
});
