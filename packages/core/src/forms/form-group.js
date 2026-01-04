// ============================================================================
// Internal Dependencies
// ============================================================================
import { BehaviorSubject } from '../reactivity/observable.js';
import { FormControl } from './form-control.js';

export class FormGroup {
    /**
     * @param {Object.<string, FormControl>} controls 
     */
    constructor(controls) {
        /** @type {Object.<string, FormControl>} */
        this.controls = controls;
        /** @type {BehaviorSubject<Object>} */
        this.valueChanges = new BehaviorSubject(this._getGroupValue());
        /** @type {BehaviorSubject<string>} */
        this.statusChanges = new BehaviorSubject('VALID');
        
        Object.keys(controls).forEach(key => {
            controls[key].valueChanges.subscribe(() => {
                this.valueChanges.next(this._getGroupValue());
                this.validate();
            });
        });
        this.validate();
    }

    get value() { return this.valueChanges.value; }
    get valid() { return this.statusChanges.value === 'VALID'; }
    get invalid() { return this.statusChanges.value === 'INVALID'; }

    /**
     * Get a control by name
     * @param {string} controlName 
     * @returns {FormControl}
     */
    get(controlName) {
        return this.controls[controlName];
    }

    _getGroupValue() {
        const val = {};
        Object.keys(this.controls).forEach(key => {
            val[key] = this.controls[key].value;
        });
        return val;
    }

    validate() {
        let valid = true;
        Object.values(this.controls).forEach(control => {
            if (control.invalid) valid = false;
        });
        this.statusChanges.next(valid ? 'VALID' : 'INVALID');
    }
}
