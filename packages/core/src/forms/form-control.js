// ============================================================================
// Internal Dependencies
// ============================================================================
import { BehaviorSubject } from '../reactivity/observable.js';

/**
 * @typedef {function(FormControl): (Object|null)} ValidatorFn
 */

export class FormControl {
    /**
     * @param {any} [initialValue=''] 
     * @param {ValidatorFn[]} [validators=[]] 
     */
    constructor(initialValue = '', validators = []) {
        /** @type {BehaviorSubject<any>} */
        this.valueChanges = new BehaviorSubject(initialValue);
        /** @type {BehaviorSubject<string>} */
        this.statusChanges = new BehaviorSubject('VALID');
        /** @type {ValidatorFn[]} */
        this.validators = validators;
        this._value = initialValue;
        this._touched = false;
        /** @type {Object|null} */
        this.errors = null;
        
        this.validate();
    }

    get value() { return this._value; }
    get valid() { return this.statusChanges.value === 'VALID'; }
    get invalid() { return this.statusChanges.value === 'INVALID'; }
    get touched() { return this._touched; }

    /**
     * Set the value of the control
     * @param {any} value 
     * @param {Object} [options]
     * @param {boolean} [options.emitEvent=true]
     */
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
