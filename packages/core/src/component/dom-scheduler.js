/**
 * DOM Scheduler for batching read/write operations to prevent layout thrashing
 * This ensures all DOM reads happen before DOM writes in a single frame
 */
export class DOMScheduler {
    constructor() {
        this.reads = [];
        this.writes = [];
        this.scheduled = false;
    }

    /**
     * Schedule a DOM read operation
     * @param {Function} fn - Function containing DOM read operations
     */
    scheduleRead(fn) {
        this.reads.push(fn);
        this._scheduleFlush();
        return this;
    }

    /**
     * Schedule a DOM write operation
     * @param {Function} fn - Function containing DOM write operations
     */
    scheduleWrite(fn) {
        this.writes.push(fn);
        this._scheduleFlush();
        return this;
    }

    /**
     * Schedule a flush of all pending operations
     */
    _scheduleFlush() {
        if (this.scheduled) return;
        this.scheduled = true;

        // Use requestAnimationFrame for optimal timing
        requestAnimationFrame(() => {
            this.flush();
        });
    }

    /**
     * Execute all pending operations in the correct order
     */
    flush() {
        // Execute all reads first (prevents layout thrashing)
        const reads = this.reads.slice();
        this.reads.length = 0;

        for (const read of reads) {
            read();
        }

        // Then execute all writes
        const writes = this.writes.slice();
        this.writes.length = 0;

        for (const write of writes) {
            write();
        }

        this.scheduled = false;

        // If new operations were scheduled during flush, schedule another flush
        if (this.reads.length || this.writes.length) {
            this._scheduleFlush();
        }
    }

    /**
     * Clear all pending operations without executing them
     */
    clear() {
        this.reads.length = 0;
        this.writes.length = 0;
        this.scheduled = false;
    }
}

// Global singleton instance
export const domScheduler = new DOMScheduler();

/**
 * Helper function to batch DOM measurements
 * @param {Function} fn - Function that reads from DOM
 * @returns {Promise} Resolves when read is complete
 */
export function measureDOM(fn) {
    return new Promise(resolve => {
        domScheduler.scheduleRead(() => {
            const result = fn();
            resolve(result);
        });
    });
}

/**
 * Helper function to batch DOM mutations
 * @param {Function} fn - Function that writes to DOM
 * @returns {Promise} Resolves when write is complete
 */
export function mutateDOM(fn) {
    return new Promise(resolve => {
        domScheduler.scheduleWrite(() => {
            const result = fn();
            resolve(result);
        });
    });
}

/**
 * Execute a function that needs to read then write to DOM
 * @param {Function} readFn - Function that reads from DOM
 * @param {Function} writeFn - Function that writes to DOM based on read
 */
export function readWriteDOM(readFn, writeFn) {
    let readResult;
    domScheduler.scheduleRead(() => {
        readResult = readFn();
    });
    domScheduler.scheduleWrite(() => {
        writeFn(readResult);
    });
}