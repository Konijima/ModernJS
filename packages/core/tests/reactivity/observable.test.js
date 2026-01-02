import { describe, it, expect, vi } from 'vitest';
import { Observable, Subject, BehaviorSubject } from '../../src/reactivity/observable.js';

describe('Reactivity', () => {
    describe('Observable', () => {
        it('should subscribe and receive values', () => {
            const obs = new Observable(observer => {
                observer.next(1);
                observer.complete();
            });
            const next = vi.fn();
            const complete = vi.fn();
            obs.subscribe({ next, complete });
            expect(next).toHaveBeenCalledWith(1);
            expect(complete).toHaveBeenCalled();
        });
    });

    describe('Subject', () => {
        it('should multicast values', () => {
            const subject = new Subject();
            const sub1 = vi.fn();
            const sub2 = vi.fn();
            subject.subscribe(sub1);
            subject.subscribe(sub2);
            subject.next(1);
            expect(sub1).toHaveBeenCalledWith(1);
            expect(sub2).toHaveBeenCalledWith(1);
        });
    });

    describe('BehaviorSubject', () => {
        it('should hold initial value', () => {
            const subject = new BehaviorSubject(0);
            expect(subject.value).toBe(0);
        });

        it('should emit current value on subscription', () => {
            const subject = new BehaviorSubject(1);
            const sub = vi.fn();
            subject.subscribe(sub);
            expect(sub).toHaveBeenCalledWith(1);
        });
    });
});
