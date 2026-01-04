// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    I18nService,
    DeviceService,
    TranslatePipe
} from '@modernjs/core';

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

function _random(max) {
    return Math.round(Math.random() * 1000) % max;
}

function buildData(count = 1000) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: Math.floor(Math.random() * 1000000) + i, // Ensure uniqueness
            label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
        });
    }
    return data;
}

// Angular v17 performance metrics (ms) for comparison
// Based on actual benchmark results - average of 4 runs with same sequence
const ANGULAR_METRICS = {
    create1k: 71.00,     // Average: (66 + 73 + 73 + 72) / 4
    create1k_2: 60.00,   // Average: (63 + 56 + 63 + 58) / 4
    append1k: 52.25,     // Average: (78 + 73 + 30 + 28) / 4
    update10th: 21.75,   // Average: (4 + 6 + 63 + 14) / 4
    clear: 32.25,        // Average: (30 + 30 + 21 + 48) / 4
    clear_2: 12.75,      // Average: (11 + 13 + 12 + 15) / 4
    swap: 10.25,         // Average: (10 + 10 + 12 + 9) / 4
    create10k: 764.25,   // Average: (740 + 740 + 801 + 776) / 4
    select: 30,          // Estimated
    remove: 35           // Estimated
};

// ModernJS performance metrics (ms) for reference
// Based on actual benchmark results - average of 4 runs with same sequence
const MODERNJS_METRICS = {
    create1k: 75.75,     // Average: (89 + 80 + 77 + 57) / 4
    create1k_2: 64.25,   // Average: (58 + 71 + 70 + 58) / 4
    append1k: 103.00,    // Average: (114 + 113 + 94 + 91) / 4
    update10th: 60.50,   // Average: (55 + 63 + 63 + 61) / 4
    clear: 24.25,        // Average: (17 + 29 + 32 + 19) / 4
    clear_2: 19.25,      // Average: (15 + 19 + 31 + 12) / 4
    swap: 34.50,         // Average: (34 + 35 + 41 + 28) / 4
    create10k: 582.25,   // Average: (584 + 592 + 566 + 587) / 4
};

const BENCHMARK_NOTES = {
    create1k: "Create 1,000 rows from scratch. Tests initial rendering performance.",
    create1k_2: "Create 1,000 rows again. Tests rendering performance with warm JIT.",
    append1k: "Append 1,000 rows to existing 1,000. Tests DOM insertion performance.",
    update10th: "Update every 10th row in 2,000 rows. Tests partial update performance.",
    clear: "Clear 2,000 rows. Tests DOM removal performance.",
    clear_2: "Clear 1,000 rows. Tests DOM removal performance with warm JIT.",
    swap: "Swap 2 rows in 1,000 rows. Tests row reordering performance.",
    create10k: "Create 10,000 rows. Stress test for large data rendering."
};

export const BenchmarkComponent = Component.create({
    selector: 'benchmark-test',
    inject: { i18nService: I18nService, deviceService: DeviceService },
    pipes: { translate: TranslatePipe },
    state: {
        rows: [],
        selected: null,
        lastMeasure: 0,
        lastOp: null,
        comparison: null,
        report: null,
        score: null,
        browser: ''
    },
    onInit() {
        this.connect(this.i18nService, () => ({}));
        this.connect(this.deviceService, (state) => ({ browser: state.browser }));
    },
    styles: `
        :host {
            display: block;
        }
        .page-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 2rem;
            text-align: center;
        }
        h2 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }
        
        .controls-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-2xl);
            padding: 1.5rem;
            margin-bottom: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
        }

        .btn {
            padding: 0.625rem 1.25rem;
            border-radius: var(--radius-lg);
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
        }
        
        .btn-secondary {
            background: var(--card-bg);
            border-color: var(--border-color);
            color: var(--text-color);
        }
        .btn-secondary:hover {
            border-color: var(--text-muted);
            background: var(--bg-color);
        }

        .btn-accent {
            background: var(--electric-violet, #7c3aed);
            color: white;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .btn-accent:hover {
            background: var(--french-violet, #6d28d9);
            transform: translateY(-1px);
        }

        .comparison-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-2xl);
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        .stat-box {
            padding: 1.25rem;
            border-radius: var(--radius-xl);
            background: var(--bg-color);
            border: 1px solid var(--border-subtle);
        }
        .stat-label { 
            font-size: 0.875rem; 
            color: var(--text-muted); 
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .stat-value { 
            font-size: 1.5rem; 
            font-weight: 700; 
            color: var(--text-color); 
            font-feature-settings: "tnum";
        }
        .stat-diff { 
            font-size: 0.875rem; 
            margin-top: 0.5rem;
            font-weight: 500;
        }
        .text-green { color: var(--success-color, #10b981); }
        .text-red { color: var(--danger-color, #ef4444); }

        .table-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-2xl);
            overflow: hidden;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th {
            text-align: left;
            padding: 1rem 1.5rem;
            background: var(--bg-color);
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.875rem;
            border-bottom: 1px solid var(--border-color);
        }
        td { 
            padding: 1rem 1.5rem; 
            border-bottom: 1px solid var(--border-subtle);
            color: var(--text-color);
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--hover-bg); }
        tr.danger td { background: rgba(239, 68, 68, 0.1); }
        
        .select-link { 
            cursor: pointer; 
            color: var(--text-color);
            font-weight: 500;
            transition: color 0.2s;
        }
        .select-link:hover { color: var(--primary-color); }
        
        .remove-btn { 
            cursor: pointer; 
            color: var(--text-muted);
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
        }
        .remove-btn:hover { 
            color: var(--danger-color);
            background: rgba(239, 68, 68, 0.1);
        }

        .report-table {
            width: 100%;
            margin-top: 1rem;
        }
        .report-table th, .report-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-subtle);
        }

        .report-badge {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-xl);
            border: 1px solid var(--border-subtle);
            background: var(--bg-color);
            height: 42px;
        }
        .report-badge.primary {
            border-color: var(--primary-color);
        }
        .report-badge .label {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-right: 0.5rem;
            font-weight: 500;
            display: flex;
            align-items: center;
        }
        .report-badge .value {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-color);
            line-height: 1;
        }
        .report-badge.primary .value {
            color: var(--primary-color);
        }
    `,
    template: `
        <div class="page-container">
            <div class="header">
                <span class="badge" style="margin-bottom: 1rem;"><i class="fas fa-tachometer-alt"></i> {{ 'benchmark.badge' | translate }}</span>
                <h2 style="margin-bottom: 0.5rem;">{{ 'benchmark.title' | translate }}</h2>
                <p class="text-muted" style="font-size: 0.9375rem;">
                    {{ 'benchmark.description' | translate }}
                </p>
            </div>
            
            <div class="controls-card" style="justify-content: center;">
                <button class="btn btn-accent" (click)="runAll" style="min-width: 200px;">
                    <i class="fas fa-play" style="margin-right: 0.5rem;"></i> {{ 'benchmark.run_all' | translate }}
                </button>
            </div>

            @if(report) {
                <div class="comparison-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin: 0; font-size: 1.25rem;">Full Report</h3>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            @if(browser) {
                                <div class="report-badge">
                                    <span class="label"><i class="fas fa-globe" style="margin-right: 0.5rem;"></i></span>
                                    <span class="value">{{ browser }}</span>
                                </div>
                            }
                            @if(score) {
                                <div class="report-badge primary">
                                    <span class="label">Score:</span>
                                    <span class="value">{{ score }}</span>
                                </div>
                            }
                        </div>
                    </div>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Note</th>
                                <th>Time (ms)</th>
                                <th>Angular (ms)</th>
                                <th>Diff</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for(let item of report) {
                                <tr>
                                    <td>{{ item.opName }}</td>
                                    <td style="font-size: 0.85rem; color: var(--text-muted);">{{ item.note }}</td>
                                    <td>{{ item.duration.toFixed(2) }}</td>
                                    <td>{{ item.comparison ? item.comparison.angular : '-' }}</td>
                                    <td class="{{ item.comparison && item.comparison.diff < 0 ? 'text-green' : 'text-red' }}">
                                        {{ item.comparison ? (item.comparison.diff > 0 ? '+' : '') + item.comparison.diff.toFixed(2) + ' ms (' + item.comparison.percent + '%)' : '-' }}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }

            @if(lastMeasure > 0 && !report) {
                <div class="comparison-card">
                    <h3 style="margin: 0; font-size: 1.25rem;">{{ 'benchmark.comparison.title' | translate }}</h3>
                    <div class="comparison-grid">
                        <div class="stat-box">
                            <div class="stat-label">Action</div>
                            <div class="stat-value">{{ lastOp }}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">{{ 'benchmark.comparison.modernjs' | translate }}</div>
                            <div class="stat-value">{{ lastMeasure.toFixed(2) }} ms</div>
                        </div>
                        
                        @if(comparison) {
                            <div class="stat-box">
                                <div class="stat-label">{{ 'benchmark.comparison.angular' | translate }}</div>
                                <div class="stat-value">{{ comparison.angular }} ms</div>
                            </div>
                            
                            <div class="stat-box">
                                <div class="stat-label">{{ 'benchmark.comparison.diff' | translate }}</div>
                                <div class="stat-value {{ comparison.diff < 0 ? 'text-green' : 'text-red' }}">
                                    {{ Math.abs(comparison.diff).toFixed(2) }} ms
                                </div>
                                <div class="stat-diff {{ comparison.diff < 0 ? 'text-green' : 'text-red' }}">
                                    {{ comparison.percent }}% {{ (comparison.diff < 0 ? 'benchmark.comparison.faster' : 'benchmark.comparison.slower') | translate }}
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            @if(rows.length > 0) {
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 100px">ID</th>
                                <th>Label</th>
                                <th style="width: 60px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            @for(let row of rows) {
                                <tr key="{{ row.id }}" class="{{ row.id === selected ? 'danger' : '' }}">
                                    <td>{{ row.id }}</td>
                                    <td><a class="select-link" (click)="select(row)">{{ row.label }}</a></td>
                                    <td><a class="remove-btn" (click)="remove(row)">×</a></td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    `,
    
    measure(opName, fn) {
        return new Promise(resolve => {
            const start = performance.now();
            fn();
            // We need to wait for the render to complete.
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const end = performance.now();
                    const duration = end - start;
                    this.state.lastMeasure = duration;
                    this.state.lastOp = opName;
                    
                    // Calculate comparison
                    let comparison = null;
                    if (ANGULAR_METRICS[opName]) {
                        const angularTime = ANGULAR_METRICS[opName];
                        const diff = duration - angularTime;
                        const percent = Math.abs((diff / angularTime) * 100).toFixed(1);
                        
                        comparison = {
                            angular: angularTime,
                            diff: diff,
                            percent: percent
                        };
                        this.state.comparison = comparison;
                    } else {
                        this.state.comparison = null;
                    }
                    resolve({ opName, duration, comparison });
                }, 0);
            });
        });
    },

    async runAll() {
        this.state.report = null;
        this.state.score = null;
        const report = [];
        let totalTime = 0;
        let totalAngularTime = 0;

        // Standard benchmark sequence - matches js-framework-benchmark
        // Start with clean state
        this.state.rows = [];
        this.state.selected = null;
        await new Promise(r => setTimeout(r, 100));

        console.log('Starting benchmark sequence...');

        const runStep = async (fn, nameOverride) => {
            const result = await fn();
            if (nameOverride) result.opName = nameOverride;
            
            result.note = BENCHMARK_NOTES[result.opName];
            
            if (result.comparison) {
                totalTime += result.duration;
                totalAngularTime += result.comparison.angular;
            }
            
            report.push(result);
            return result;
        };

        // 1. Create 1k rows from empty
        console.log('Test 1: Creating 1k rows from empty...');
        await runStep(() => this.run());
        console.log(`Rows after create1k: ${this.state.rows.length}`);

        // 2. Append 1k rows (now have 2k)
        console.log('Test 2: Appending 1k rows...');
        await runStep(() => this.add());
        console.log(`Rows after append: ${this.state.rows.length}`);

        // 3. Update every 10th row (on 2k dataset)
        console.log('Test 3: Updating every 10th row...');
        await runStep(() => this.runUpdate());

        // 4. Clear all rows (important: clear the 2k rows)
        console.log('Test 4: Clearing all rows...');
        await runStep(() => this.clear());
        console.log(`Rows after clear: ${this.state.rows.length}`);

        // 5. Create 1k rows again from empty
        console.log('Test 5: Creating 1k rows from empty (2nd time)...');
        await runStep(() => this.run('create1k_2'));
        console.log(`Rows after 2nd create1k: ${this.state.rows.length}`);

        // 6. Swap rows 1 and 998 (requires 1k rows)
        console.log('Test 6: Swapping rows 1 and 998...');
        await runStep(() => this.swapRows());

        // 7. Clear again
        console.log('Test 7: Clearing all rows (2nd time)...');
        await runStep(() => this.clear('clear_2'));

        // 8. Create 10k rows from empty
        console.log('Test 8: Creating 10k rows from empty...');
        await runStep(() => this.runLots());
        console.log(`Rows after create10k: ${this.state.rows.length}`);

        console.log('Benchmark sequence complete!');

        // Calculate Score
        if (totalTime > 0) {
            const score = (totalAngularTime / totalTime) * 100;
            this.state.score = score.toFixed(1);
        }

        this.state.report = report;

        // Clear at the end
        await new Promise(r => setTimeout(r, 1000));
        this.state.rows = [];
    },

    run(opName = 'create1k') {
        return this.measure(opName, () => {
            this.state.rows = buildData(1000);
            this.state.selected = null;
        });
    },

    runLots() {
        return this.measure('create10k', () => {
            this.state.rows = buildData(10000);
            this.state.selected = null;
        });
    },

    add() {
        return this.measure('append1k', () => {
            this.state.rows = [...this.state.rows, ...buildData(1000)];
        });
    },

    runUpdate() {
        return this.measure('update10th', () => {
            const newRows = [...this.state.rows];
            for (let i = 0; i < newRows.length; i += 10) {
                newRows[i] = { ...newRows[i], label: newRows[i].label + ' !!!' };
            }
            this.state.rows = newRows;
        });
    },

    clear(opName = 'clear') {
        return this.measure(opName, () => {
            this.state.rows = [];
            this.state.selected = null;
        });
    },

    swapRows() {
        return this.measure('swap', () => {
            if (this.state.rows.length > 998) {
                const newRows = [...this.state.rows];
                const temp = newRows[1];
                newRows[1] = newRows[998];
                newRows[998] = temp;
                this.state.rows = newRows;
            }
        });
    },

    select(row) {
        if (typeof row === 'string' && row.startsWith('__ref_')) {
            row = this._refs[row];
        }
        if (!row) return;
        
        return this.measure('select', () => {
            this.state.selected = row.id;
        });
    },

    remove(row) {
        if (typeof row === 'string' && row.startsWith('__ref_')) {
            row = this._refs[row];
        }
        if (!row) return;

        return this.measure('remove', () => {
            this.state.rows = this.state.rows.filter(r => r.id !== row.id);
        });
    }
});
