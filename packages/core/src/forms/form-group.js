import { BehaviorSubject } from '../reactivity/observable.js';

export class FormGroup {
    constructor(controls) {
        this.controls = controls;
        this.valueChanges = new BehaviorSubject(this._getGroupValue());
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
