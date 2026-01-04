/**
 * Reactive Primitives for ModernJS
 * Implements a lightweight version of the Observable pattern.
 */

/**
 * @template T
 * @typedef {Object} Observer
 * @property {function(T): void} [next]
 * @property {function(any): void} [error]
 * @property {function(): void} [complete]
 */

/**
 * @typedef {Object} Subscription
 * @property {function(): void} unsubscribe
 */

/**
 * @template T
 */
export class Observable {
    /**
     * @param {function(Observer<T>): (Subscription|function(): void|void)} subscribe 
     */
    constructor(subscribe) {
        /** @type {function(Observer<T>): (Subscription|function(): void|void)} */
        this._subscribe = subscribe;
    }

    /**
     * Subscribe to the observable
     * @param {Observer<T>|function(T): void} observerOrNext 
     * @param {function(any): void} [error] 
     * @param {function(): void} [complete] 
     * @returns {Subscription}
     */
    subscribe(observerOrNext, error, complete) {
        const observer = typeof observerOrNext === 'function'
            ? { next: observerOrNext, error, complete }
            : observerOrNext;

        return this._subscribe(observer);
    }

    /**
     * Pipe operators
     * @param {...function(Observable<any>): Observable<any>} operators 
     * @returns {Observable<any>}
     */
    pipe(...operators) {
        return operators.reduce((source, operator) => operator(source), this);
    }
}

/**
 * @template T
 * @extends {Observable<T>}
 */
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
        /** @type {Observer<T>[]} */
        this.observers = [];
    }

    /**
     * Emit a value
     * @param {T} value 
     */
    next(value) {
        this.observers.forEach(o => o.next && o.next(value));
    }

    /**
     * Emit an error
     * @param {any} err 
     */
    error(err) {
        this.observers.forEach(o => o.error && o.error(err));
    }

    /**
     * Complete the subject
     */
    complete() {
        this.observers.forEach(o => o.complete && o.complete());
    }
    
    /**
     * @returns {Observable<T>}
     */
    asObservable() {
        return new Observable(observer => this.subscribe(observer));
    }
}

/**
 * @template T
 * @extends {Subject<T>}
 */
export class BehaviorSubject extends Subject {
    /**
     * @param {T} initialValue 
     */
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }

    /**
     * Get the current value
     * @returns {T}
     */
    get value() {
        return this._value;
    }

    /**
     * @param {T} value 
     */
    next(value) {
        this._value = value;
        super.next(value);
    }

    /**
     * @param {Observer<T>|function(T): void} observerOrNext 
     * @param {function(any): void} [error] 
     * @param {function(): void} [complete] 
     * @returns {Subscription}
     */
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
/**
 * @template T, R
 * @param {function(T): R} fn 
 * @returns {function(Observable<T>): Observable<R>}
 */
export const map = (fn) => (source) => new Observable(observer => {
    return source.subscribe({
        next: (value) => observer.next(fn(value)),
        error: (err) => observer.error(err),
        complete: () => observer.complete()
    });
});

/**
 * @template T
 * @param {function(T): boolean} fn 
 * @returns {function(Observable<T>): Observable<T>}
 */
export const filter = (fn) => (source) => new Observable(observer => {
    return source.subscribe({
        next: (value) => {
            if (fn(value)) observer.next(value);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete()
    });
});
