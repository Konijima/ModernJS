import { Service } from '../core/Service.js';

export class CounterService extends Service {
    constructor() {
        super(0); // Initial state is 0
    }

    increment() {
        this.setState(this.state + 1);
    }

    decrement() {
        this.setState(this.state - 1);
    }
}
