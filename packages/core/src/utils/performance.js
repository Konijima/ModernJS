/**
 * Performance monitoring utilities
 * Tracks rendering performance and provides insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.enabled = false;
        this.renderCount = 0;
        this.totalRenderTime = 0;
    }

    /**
     * Enable performance monitoring
     */
    enable() {
        this.enabled = true;
        console.log('[Performance] Monitoring enabled');
    }

    /**
     * Disable performance monitoring
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Start measuring a performance metric
     * @param {string} name - Name of the metric
     * @returns {number} Start timestamp
     */
    startMeasure(name) {
        if (!this.enabled) return 0;

        const start = performance.now();

        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0,
                lastTime: 0
            });
        }

        return start;
    }

    /**
     * End measuring a performance metric
     * @param {string} name - Name of the metric
     * @param {number} start - Start timestamp
     */
    endMeasure(name, start) {
        if (!this.enabled || !start) return;

        const duration = performance.now() - start;
        const metric = this.metrics.get(name);

        if (metric) {
            metric.count++;
            metric.totalTime += duration;
            metric.minTime = Math.min(metric.minTime, duration);
            metric.maxTime = Math.max(metric.maxTime, duration);
            metric.avgTime = metric.totalTime / metric.count;
            metric.lastTime = duration;
        }
    }

    /**
     * Measure a function execution
     * @param {string} name - Name of the metric
     * @param {Function} fn - Function to measure
     * @returns {*} Result of the function
     */
    measure(name, fn) {
        if (!this.enabled) return fn();

        const start = this.startMeasure(name);
        try {
            const result = fn();
            this.endMeasure(name, start);
            return result;
        } catch (error) {
            this.endMeasure(name, start);
            throw error;
        }
    }

    /**
     * Measure an async function execution
     * @param {string} name - Name of the metric
     * @param {Function} fn - Async function to measure
     * @returns {Promise<*>} Result of the async function
     */
    async measureAsync(name, fn) {
        if (!this.enabled) return fn();

        const start = this.startMeasure(name);
        try {
            const result = await fn();
            this.endMeasure(name, start);
            return result;
        } catch (error) {
            this.endMeasure(name, start);
            throw error;
        }
    }

    /**
     * Track a render operation
     * @param {number} duration - Render duration in ms
     */
    trackRender(duration) {
        if (!this.enabled) return;

        this.renderCount++;
        this.totalRenderTime += duration;
    }

    /**
     * Get a summary of all metrics
     * @returns {Object} Metrics summary
     */
    getSummary() {
        const summary = {
            renderCount: this.renderCount,
            avgRenderTime: this.renderCount > 0 ? this.totalRenderTime / this.renderCount : 0,
            totalRenderTime: this.totalRenderTime,
            metrics: {}
        };

        for (const [name, metric] of this.metrics) {
            summary.metrics[name] = { ...metric };
        }

        return summary;
    }

    /**
     * Print a formatted report to console
     */
    printReport() {
        if (!this.enabled) {
            console.log('[Performance] Monitoring is disabled');
            return;
        }

        console.group('[Performance Report]');

        console.log(`Renders: ${this.renderCount}`);
        console.log(`Total Render Time: ${this.totalRenderTime.toFixed(2)}ms`);
        console.log(`Average Render Time: ${(this.totalRenderTime / this.renderCount).toFixed(2)}ms`);

        if (this.metrics.size > 0) {
            console.table(
                Array.from(this.metrics.entries()).map(([name, metric]) => ({
                    Operation: name,
                    Count: metric.count,
                    'Last (ms)': metric.lastTime.toFixed(2),
                    'Avg (ms)': metric.avgTime.toFixed(2),
                    'Min (ms)': metric.minTime.toFixed(2),
                    'Max (ms)': metric.maxTime.toFixed(2),
                    'Total (ms)': metric.totalTime.toFixed(2)
                }))
            );
        }

        console.groupEnd();
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.clear();
        this.renderCount = 0;
        this.totalRenderTime = 0;
    }
}

// Global instance
export const perfMonitor = new PerformanceMonitor();

// Decorator for measuring method performance
export function measurePerformance(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {
        const name = `${target.constructor.name}.${propertyKey}`;
        return perfMonitor.measure(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
}

// Helper to enable performance monitoring via console
if (typeof window !== 'undefined') {
    window.__perf = {
        enable: () => perfMonitor.enable(),
        disable: () => perfMonitor.disable(),
        report: () => perfMonitor.printReport(),
        reset: () => perfMonitor.reset(),
        summary: () => perfMonitor.getSummary()
    };

    console.log('[Performance] Available commands: __perf.enable(), __perf.report(), __perf.reset()');
}