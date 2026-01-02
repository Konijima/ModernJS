// ============================================================================
// Internal Dependencies
// ============================================================================
import { Pipe } from './pipe.js';

export class AsyncPipe extends Pipe {
    constructor(component) {
        super();
        this.component = component;
        this.latestValue = null;
        this.subscription = null;
        this.observable = null;
    }

    transform(observable) {
        if (!this.observable) {
            this.observable = observable;
            this.subscribe(observable);
        } else if (this.observable !== observable) {
            this.dispose();
            this.observable = observable;
            this.subscribe(observable);
        }
        return this.latestValue;
    }

    subscribe(observable) {
        if (!observable) return;

        if (typeof observable.subscribe === 'function') {
            this.subscription = observable.subscribe(value => {
                this.latestValue = value;
                this.component.update();
            });
        } else if (typeof observable.then === 'function') {
             // Promise support
             observable.then(value => {
                this.latestValue = value;
                this.component.update();
             });
        }
    }

    dispose() {
        if (this.subscription) {
            if (typeof this.subscription === 'function') {
                this.subscription();
            } else if (this.subscription.unsubscribe) {
                this.subscription.unsubscribe();
            }
            this.subscription = null;
        }
    }

    destroy() {
        this.dispose();
    }
}
