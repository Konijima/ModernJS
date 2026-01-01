import { BehaviorSubject } from '../reactivity/observable.js';

export class FormControl {
    constructor(initialValue = '', validators = []) {
        this.valueChanges = new BehaviorSubject(initialValue);
        this.statusChanges = new BehaviorSubject('VALID');
        this.validators = validators;
        this._value = initialValue;
        this._touched = false;
        this.errors = null;
        
        this.validate();
    }

    get value() { return this._value; }
    get valid() { return this.statusChanges.value === 'VALID'; }
    get invalid() { return this.statusChanges.value === 'INVALID'; }
    get touched() { return this._touched; }

    setValue(value, { emitEvent = true } = {}) {
        if (this._value !== value) {
            this._value = value;
            this.validate();
            if (emitEvent) {
                this.valueChanges.next(value);
            }
        }
    }

    markAsTouched() {
        this._touched = true;
    }

    validate() {
        let errors = null;
        for (const validator of this.validators) {
            const error = validator(this);
            if (error) {
                errors = { ...errors, ...error };
            }
        }
        this.errors = errors;
        this.statusChanges.next(errors ? 'INVALID' : 'VALID');
    }
}
