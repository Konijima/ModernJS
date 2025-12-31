import { Pipe } from '../core/pipes/pipe.js';

export class ReversePipe extends Pipe {
    transform(value) {
        if (typeof value !== 'string') return value;
        return value.split('').reverse().join('');
    }
}
