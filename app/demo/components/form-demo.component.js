import { Component } from '../../core/component/component.js';
import { FormGroup } from '../../core/forms/form-group.js';
import { FormControl } from '../../core/forms/form-control.js';
import { Validators } from '../../core/forms/validators.js';
import { fadeAnimation } from '../../core/animations/fade.animation.js';

export const FormDemoComponent = Component.create({
    selector: 'form-demo',
    animations: fadeAnimation,
    styles: `
        :host {
            display: block;
        }
        .form-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 2rem;
            max-width: 500px;
            margin: 0 auto;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-primary);
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        input.invalid {
            border-color: #ef4444;
        }
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        button {
            width: 100%;
            padding: 0.75rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .debug-info {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            font-family: monospace;
            font-size: 0.875rem;
            white-space: pre-wrap;
        }
    `,
    onInit() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(3)]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(6)])
        });

        // Subscribe to form changes to update the view
        this.sub = this.form.valueChanges.subscribe(() => {
            this.update();
        });
    },
    onDestroy() {
        if (this.sub) this.sub.unsubscribe();
    },
    handleSubmit(e) {
        e.preventDefault();
        if (this.form.valid) {
            console.log('Form Submitted:', this.form.value);
            alert('Form Submitted!\n\n' + JSON.stringify(this.form.value, null, 2));
            this.form.get('username').setValue('');
            this.form.get('email').setValue('');
            this.form.get('password').setValue('');
            this.form.statusChanges.next('INVALID'); // Reset status manually for demo
        }
    },
    template: `
        <div class="form-container" @animation="fade">
            <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Reactive Form Demo</h2>
            
            <form (submit)="handleSubmit">
                <div class="form-group">
                    <label>Username</label>
                    <input 
                        type="text"
                        [value]="{{ this.form.get('username').value }}"
                        (input)="this.form.get('username').setValue($event.target.value)"
                        (blur)="this.form.get('username').markAsTouched(); update()"
                        class="{{ this.form.get('username').invalid && this.form.get('username').touched ? 'invalid' : '' }}"
                        placeholder="Enter username"
                    >
                    @if(this.form.get('username').invalid && this.form.get('username').touched) {
                        <div class="error-message">
                            @if(this.form.get('username').errors.required) {
                                Username is required
                            }
                            @else if(this.form.get('username').errors.minLength) {
                                Must be at least 3 characters
                            }
                        </div>
                    }
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input 
                        type="email"
                        [value]="{{ this.form.get('email').value }}"
                        (input)="this.form.get('email').setValue($event.target.value)"
                        (blur)="this.form.get('email').markAsTouched(); update()"
                        class="{{ this.form.get('email').invalid && this.form.get('email').touched ? 'invalid' : '' }}"
                        placeholder="Enter email"
                    >
                    @if(this.form.get('email').invalid && this.form.get('email').touched) {
                        <div class="error-message">
                            @if(this.form.get('email').errors.required) {
                                Email is required
                            }
                            @else if(this.form.get('email').errors.email) {
                                Invalid email format
                            }
                        </div>
                    }
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input 
                        type="password"
                        [value]="{{ this.form.get('password').value }}"
                        (input)="this.form.get('password').setValue($event.target.value)"
                        (blur)="this.form.get('password').markAsTouched(); update()"
                        class="{{ this.form.get('password').invalid && this.form.get('password').touched ? 'invalid' : '' }}"
                        placeholder="Enter password"
                    >
                    @if(this.form.get('password').invalid && this.form.get('password').touched) {
                        <div class="error-message">
                            @if(this.form.get('password').errors.required) {
                                Password is required
                            }
                            @else if(this.form.get('password').errors.minLength) {
                                Must be at least 6 characters
                            }
                        </div>
                    }
                </div>

                <button type="submit" {{ !this.form.valid ? 'disabled' : '' }}>Register</button>
            </form>

            <div class="debug-info">
                <strong>Form Status:</strong> {{ this.form.valid ? 'VALID' : 'INVALID' }}
                <br>
                <strong>Form Value:</strong>
                {{ JSON.stringify(this.form.value, null, 2) }}
            </div>
        </div>
    `
});
