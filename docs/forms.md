# Reactive Forms

ModernJS provides a model-driven approach to handling form inputs, inspired by Angular's Reactive Forms.

## Core Classes

- **FormControl**: Tracks the value and validation status of an individual form control.
- **FormGroup**: Tracks the same values and status for a collection of form controls.
- **Validators**: Built-in validation functions.

## Usage

### 1. Create the Form Model

```javascript
import { Component } from '../core/component/component.js';
import { FormGroup, FormControl, Validators } from '../core/forms/index.js';

export const LoginParams = Component.create({
    selector: 'login-form',
    onInit() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)])
        });
    },
    // ...
});
```

### 2. Bind to Template

Bind the input value to the control's value and update it on input.

```javascript
    template: `
        <form>
            <div class="form-group">
                <label>Username</label>
                <input 
                    [value]="form.get('username').value" 
                    (input)="form.get('username').setValue($event.target.value)"
                >
                @if(form.get('username').invalid && form.get('username').touched) {
                    <div class="error">Username is required</div>
                }
            </div>
            
            <button [disabled]="!form.valid">Submit</button>
        </form>
    `
```

## Validators

Available validators in `Validators` class:

- `required`: Field must not be empty.
- `minLength(length)`: Field must have at least `length` characters.
- `email`: Field must be a valid email format.

You can also create custom validators:

```javascript
function myCustomValidator(control) {
    return control.value === 'invalid' ? { invalidValue: true } : null;
}
```
