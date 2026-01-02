// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    FormGroup,
    FormControl,
    Validators,
    fadeAnimation,
    I18nService,
    ModalService,
    TranslatePipe,
    FormControlDirective
} from '@modernjs/core';

export const FormDemoComponent = Component.create({
    selector: 'form-demo',
    animations: fadeAnimation,
    inject: { 
        i18nService: I18nService,
        modalService: ModalService
    },
    pipes: { translate: TranslatePipe },
    directives: { formControl: FormControlDirective },
    styles: `
        :host {
            display: block;
        }
        .form-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 2rem;
            max-width: 800px;
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
        }
    `,
    onInit() {
        this.connect(this.i18nService, () => ({})); // Re-render on language change
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
            this.modalService.alert('Form Submitted!\n\n' + JSON.stringify(this.form.value, null, 2), 'Success');
            this.form.get('username').setValue('');
            this.form.get('email').setValue('');
            this.form.get('password').setValue('');
            this.form.statusChanges.next('INVALID'); // Reset status manually for demo
        }
    },
    template: `
        @if(this.form) {
        <div class="form-container" animate="fade">
            <h2 style="margin-top: 0; margin-bottom: 1.5rem;">{{ 'forms.title' | translate }}</h2>
            
            <form (submit)="handleSubmit">
                <div class="form-group">
                    <label>{{ 'forms.username' | translate }}</label>
                    <input 
                        type="text"
                        autocomplete="username"
                        [formControl]="form.get('username')"
                        class="{{ form.get('username').invalid && form.get('username').touched ? 'invalid' : '' }}"
                        placeholder="{{ 'forms.placeholder.username' | translate }}"
                    >
                    @if(form.get('username').invalid && form.get('username').touched) {
                        <div class="error-message">
                            @if(form.get('username').errors.required) {
                                {{ 'forms.error.required' | translate : getPipe('translate').transform('forms.username') }}
                            }
                            @else if(form.get('username').errors.minLength) {
                                {{ 'forms.error.minlength' | translate:'3' }}
                            }
                        </div>
                    }
                </div>

                <div class="form-group">
                    <label>{{ 'forms.email' | translate }}</label>
                    <input 
                        type="email"
                        autocomplete="email"
                        [formControl]="form.get('email')"
                        class="{{ form.get('email').invalid && form.get('email').touched ? 'invalid' : '' }}"
                        placeholder="{{ 'forms.placeholder.email' | translate }}"
                    >
                    @if(form.get('email').invalid && form.get('email').touched) {
                        <div class="error-message">
                            @if(form.get('email').errors.required) {
                                {{ 'forms.error.required' | translate : getPipe('translate').transform('forms.email') }}
                            }
                            @else if(form.get('email').errors.email) {
                                {{ 'forms.error.email' | translate }}
                            }
                        </div>
                    }
                </div>

                <div class="form-group">
                    <label>{{ 'forms.password' | translate }}</label>
                    <input 
                        type="password"
                        autocomplete="current-password"
                        [formControl]="form.get('password')"
                        class="{{ form.get('password').invalid && form.get('password').touched ? 'invalid' : '' }}"
                        placeholder="{{ 'forms.placeholder.password' | translate }}"
                    >
                    @if(form.get('password').invalid && form.get('password').touched) {
                        <div class="error-message">
                            @if(form.get('password').errors.required) {
                                {{ 'forms.error.required' | translate : getPipe('translate').transform('forms.password') }}
                            }
                            @else if(form.get('password').errors.minLength) {
                                {{ 'forms.error.minlength' | translate:'6' }}
                            }
                        </div>
                    }
                </div>

                <button type="submit" [disabled]="!form.valid">{{ 'forms.register' | translate }}</button>
            </form>

            <div class="debug-info">
                <strong>{{ 'forms.status' | translate }}:</strong> {{ form.valid ? 'VALID' : 'INVALID' }}
                <br>
                <strong>{{ 'forms.value' | translate }}:</strong>
                <pre style="margin: 0;">{{ JSON.stringify(form.value, null, 2) }}</pre>
            </div>
        </div>
        }
    `
});
