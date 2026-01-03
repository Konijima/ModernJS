# Reactive Forms

ModernJS provides a model-driven approach to handling form inputs, inspired by Angular's Reactive Forms.

## Core Classes

- **FormControl**: Tracks the value and validation status of an individual form control.
- **FormGroup**: Tracks the same values and status for a collection of form controls.
- **Validators**: Built-in validation functions.

## Usage

### 1. Create the Form Model

```javascript
import { Component, FormGroup, FormControl, Validators } from '@modernjs/core';

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

Use the `[formControl]` directive to bind the input to the control. Note that you need to register the `FormControlDirective` in your component.

```javascript
import { FormControlDirective } from '@modernjs/core';

export const LoginParams = Component.create({
    // ...
    directives: { formControl: FormControlDirective },
    template: `
        <form>
            <div class="form-group">
                <label>Username</label>
                <input 
                    type="text"
                    [formControl]="{{ bind(form.get('username')) }}"
                >
                @if(form.get('username').invalid && form.get('username').touched) {
                    <div class="error">Username is required</div>
                }
            </div>
            
            <button [disabled]="!form.valid">Submit</button>
        </form>
    `
});
```

### 3. Handling Submission

You can handle form submission by listening to the `submit` event on the form element.

```javascript
    // ... inside component methods
    handleSubmit(e) {
        e.preventDefault();
        if (this.form.valid) {
            console.log('Form Data:', this.form.value);
        }
    }
```

And in your template:

```html
<form (submit)="handleSubmit">
    <!-- inputs -->
    <button [disabled]="!form.valid">Submit</button>
</form>
```

## Validators

Available validators in `Validators` class:

- `required`: Field must not be empty.
- `minLength(length)`: Field must have at least `length` characters.
- `maxLength(length)`: Field must have at most `length` characters.
- `email`: Field must be a valid email format.
- `alphanumeric`: Field must contain only letters and numbers.
- `pattern(regex)`: Field must match the provided regular expression.

You can also create custom validators:

```javascript
function myCustomValidator(control) {
    return control.value === 'invalid' ? { invalidValue: true } : null;
}
```
