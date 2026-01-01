/**
 * Reactive Primitives for ModernJS
 * Implements a lightweight version of the Observable pattern.
 */

export class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }

    subscribe(observerOrNext, error, complete) {
        const observer = typeof observerOrNext === 'function'
            ? { next: observerOrNext, error, complete }
            : observerOrNext;

        return this._subscribe(observer);
    }

    pipe(...operators) {
        return operators.reduce((source, operator) => operator(source), this);
    }
}

export class Subject extends Observable {
    constructor() {
        super(observer => {
            this.observers.push(observer);
            return {
                unsubscribe: () => {
                    this.observers = this.observers.filter(o => o !== observer);
                }
            };
        });
        this.observers = [];
    }

    next(value) {
        this.observers.forEach(o => o.next && o.next(value));
    }

    error(err) {
        this.observers.forEach(o => o.error && o.error(err));
    }

    complete() {
        this.observers.forEach(o => o.complete && o.complete());
    }
    
    asObservable() {
        return new Observable(observer => this.subscribe(observer));
    }
}

export class BehaviorSubject extends Subject {
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }

    get value() {
        return this._value;
    }

    next(value) {
        this._value = value;
        super.next(value);
    }

    subscribe(observerOrNext, error, complete) {
        const subscription = super.subscribe(observerOrNext, error, complete);
        const observer = typeof observerOrNext === 'function'
            ? { next: observerOrNext }
            : observerOrNext;
            
        if (observer.next) {
            observer.next(this._value);
        }
        return subscription;
    }
}

// Operators
export const map = (fn) => (source) => new Observable(observer => {
    return source.subscribe({
        next: (value) => observer.next(fn(value)),
        error: (err) => observer.error(err),
        complete: () => observer.complete()
    });
});

export const filter = (fn) => (source) => new Observable(observer => {
    return source.subscribe({
        next: (value) => {
            if (fn(value)) observer.next(value);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete()
    });
});
