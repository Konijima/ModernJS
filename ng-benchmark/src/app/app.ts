import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Data {
  id: number;
  label: string;
}

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

function _random(max: number) {
    return Math.round(Math.random() * 1000) % max;
}

function buildData(count = 1000): Data[] {
    const data: Data[] = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: Math.floor(Math.random() * 1000000) + i,
            label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
        });
    }
    return data;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  rows = signal<Data[]>([]);
  selected = signal<number | null>(null);
  lastMeasure = signal<number>(0);
  lastOp = signal<string>('');
  report = signal<{opName: string, duration: number}[] | null>(null);

  measure(opName: string, fn: () => void): Promise<{opName: string, duration: number}> {
    return new Promise(resolve => {
        const start = performance.now();
        fn();
        // Wait for render
        setTimeout(() => {
            const end = performance.now();
            const duration = end - start;
            this.lastMeasure.set(duration);
            this.lastOp.set(opName);
            resolve({ opName, duration });
        }, 0);
    });
  }

  async runAll() {
    this.report.set(null);
    const reportData = [];

    // Standard benchmark sequence - matches ModernJS and js-framework-benchmark
    // Start with clean state
    this.rows.set([]);
    this.selected.set(null);
    await new Promise(r => setTimeout(r, 100));

    console.log('Starting benchmark sequence...');

    // 1. Create 1k rows from empty
    console.log('Test 1: Creating 1k rows from empty...');
    reportData.push(await this.run());
    console.log(`Rows after create1k: ${this.rows().length}`);

    // 2. Append 1k rows (now have 2k)
    console.log('Test 2: Appending 1k rows...');
    reportData.push(await this.add());
    console.log(`Rows after append: ${this.rows().length}`);

    // 3. Update every 10th row (on 2k dataset)
    console.log('Test 3: Updating every 10th row...');
    reportData.push(await this.runUpdate());

    // 4. Clear all rows (important: clear the 2k rows)
    console.log('Test 4: Clearing all rows...');
    reportData.push(await this.clear());
    console.log(`Rows after clear: ${this.rows().length}`);

    // 5. Create 1k rows again from empty
    console.log('Test 5: Creating 1k rows from empty (2nd time)...');
    const create1kAgain = await this.run();
    create1kAgain.opName = 'create1k_2';
    reportData.push(create1kAgain);
    console.log(`Rows after 2nd create1k: ${this.rows().length}`);

    // 6. Swap rows 1 and 998 (requires 1k rows)
    console.log('Test 6: Swapping rows 1 and 998...');
    reportData.push(await this.swapRows());

    // 7. Clear again
    console.log('Test 7: Clearing all rows (2nd time)...');
    const clearAgain = await this.clear();
    clearAgain.opName = 'clear_2';
    reportData.push(clearAgain);

    // 8. Create 10k rows from empty
    console.log('Test 8: Creating 10k rows from empty...');
    reportData.push(await this.runLots());
    console.log(`Rows after create10k: ${this.rows().length}`);

    console.log('Benchmark sequence complete!');

    this.report.set(reportData);
  }

  run() {
    return this.measure('create1k', () => {
        this.rows.set(buildData(1000));
        this.selected.set(null);
    });
  }

  runLots() {
    return this.measure('create10k', () => {
        this.rows.set(buildData(10000));
        this.selected.set(null);
    });
  }

  add() {
    return this.measure('append1k', () => {
        this.rows.update(rows => [...rows, ...buildData(1000)]);
    });
  }

  runUpdate() {
    return this.measure('update10th', () => {
        this.rows.update(rows => {
            const newRows = [...rows];
            for (let i = 0; i < newRows.length; i += 10) {
                newRows[i] = { ...newRows[i], label: newRows[i].label + ' !!!' };
            }
            return newRows;
        });
    });
  }

  clear() {
    return this.measure('clear', () => {
        this.rows.set([]);
        this.selected.set(null);
    });
  }

  swapRows() {
    return this.measure('swap', () => {
        this.rows.update(rows => {
            if (rows.length > 998) {
                const newRows = [...rows];
                const temp = newRows[1];
                newRows[1] = newRows[998];
                newRows[998] = temp;
                return newRows;
            }
            return rows;
        });
    });
  }

  select(row: Data) {
    return this.measure('select', () => {
        this.selected.set(row.id);
    });
  }

  remove(row: Data) {
    return this.measure('remove', () => {
        this.rows.update(rows => rows.filter(r => r.id !== row.id));
    });
  }
}
