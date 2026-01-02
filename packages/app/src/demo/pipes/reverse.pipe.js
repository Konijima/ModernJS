import { Pipe } from '@modernjs/core';

export class ReversePipe extends Pipe {
    transform(value) {
        if (typeof value !== 'string') return value;
        return value.split('').reverse().join('');
    }
}
