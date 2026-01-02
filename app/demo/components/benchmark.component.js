import { Component } from '../../core/component/component.js';

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

export const BenchmarkComponent = Component.create({
    selector: 'benchmark-test',
    state: {
        rows: [],
        selected: null,
        lastMeasure: 0
    },
    styles: `
        .container { padding: 20px; }
        .buttons { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
        button { padding: 8px 16px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 4px; }
        button:hover { background: #1d4ed8; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
        tr.danger { background-color: #f8d7da; }
        tr:hover td { background-color: #f8fafc; }
        .lbl { font-weight: bold; }
        .metric { margin-left: 20px; font-weight: bold; color: #2563eb; align-self: center; }
        .remove-btn { cursor: pointer; color: #ef4444; }
        .select-link { cursor: pointer; color: #2563eb; text-decoration: underline; }
    `,
    template: `
        <div class="container">
            <div class="buttons">
                <button (click)="run">Create 1,000 rows</button>
                <button (click)="runLots">Create 10,000 rows</button>
                <button (click)="add">Append 1,000 rows</button>
                <button (click)="runUpdate">Update every 10th row</button>
                <button (click)="clear">Clear</button>
                <button (click)="swapRows">Swap Rows</button>
                @if(this.state.lastMeasure > 0) {
                    <span class="metric">Last op: {{ this.state.lastMeasure.toFixed(2) }} ms</span>
                }
            </div>
            <table>
                <tbody>
                    @for(let row of this.state.rows) {
                        <tr key="{{ row.id }}" class="{{ row.id === this.state.selected ? 'danger' : '' }}">
                            <td>{{ row.id }}</td>
                            <td><a class="select-link" (click)="this.select('{{ this.bind(row) }}')">{{ row.label }}</a></td>
                            <td><a class="remove-btn" (click)="this.remove('{{ this.bind(row) }}')">❌</a></td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    `,
    
    measure(fn) {
        const start = performance.now();
        fn();
        // We need to wait for the render to complete.
        // Since update() uses requestAnimationFrame, we can schedule a callback
        // that will run after the update callback.
        requestAnimationFrame(() => {
            setTimeout(() => {
                const end = performance.now();
                this.state.lastMeasure = end - start;
            }, 0);
        });
    },

    run() {
        this.measure(() => {
            this.state.rows = buildData(1000);
            this.state.selected = null;
        });
    },

    runLots() {
        this.measure(() => {
            this.state.rows = buildData(10000);
            this.state.selected = null;
        });
    },

    add() {
        this.measure(() => {
            this.state.rows = [...this.state.rows, ...buildData(1000)];
        });
    },

    runUpdate() {
        this.measure(() => {
            const newRows = [...this.state.rows];
            for (let i = 0; i < newRows.length; i += 10) {
                newRows[i] = { ...newRows[i], label: newRows[i].label + ' !!!' };
            }
            this.state.rows = newRows;
        });
    },

    clear() {
        this.measure(() => {
            this.state.rows = [];
            this.state.selected = null;
        });
    },

    swapRows() {
        this.measure(() => {
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
        
        this.measure(() => {
            this.state.selected = row.id;
        });
    },

    remove(row) {
        if (typeof row === 'string' && row.startsWith('__ref_')) {
            row = this._refs[row];
        }
        if (!row) return;

        this.measure(() => {
            this.state.rows = this.state.rows.filter(r => r.id !== row.id);
        });
    }
});
