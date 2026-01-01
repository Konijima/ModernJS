# Reactivity System

ModernJS 1.1.0 introduces a robust reactivity system based on the Observable pattern, similar to RxJS but lightweight and dependency-free.

## Core Concepts

### Observable

An `Observable` represents a stream of values over time. You can subscribe to it to receive updates.

```javascript
import { Observable } from '../core/reactivity/observable.js';

const stream$ = new Observable(observer => {
    observer.next(1);
    observer.next(2);
    observer.complete();
});

stream$.subscribe({
    next: (val) => console.log(val),
    complete: () => console.log('Done')
});
```

### Subject

A `Subject` is a special type of Observable that allows values to be multicasted to many Observers. It is both an Observable and an Observer.

```javascript
import { Subject } from '../core/reactivity/observable.js';

const subject = new Subject();

subject.subscribe(val => console.log('Sub A:', val));
subject.subscribe(val => console.log('Sub B:', val));

subject.next('Hello'); // Both subscribers receive 'Hello'
```

### BehaviorSubject

A `BehaviorSubject` is a Subject that requires an initial value and emits its current value to new subscribers. This is the foundation of State Management in ModernJS Services.

```javascript
import { BehaviorSubject } from '../core/reactivity/observable.js';

const state$ = new BehaviorSubject({ count: 0 });

console.log(state$.value); // { count: 0 }

state$.subscribe(state => console.log('State:', state));

state$.next({ count: 1 });
```

## AsyncPipe

The `AsyncPipe` allows you to subscribe to Observables directly in your templates. It handles subscription and unsubscription automatically.

```javascript
import { Component } from '../core/component/component.js';
import { AsyncPipe } from '../core/pipes/async.pipe.js';

export const MyComponent = Component.create({
    selector: 'my-comp',
    pipes: { async: AsyncPipe },
    template: `
        <div>Count: {{ state$ | async }}</div>
    `
});
```
