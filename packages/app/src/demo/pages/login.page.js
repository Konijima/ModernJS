// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    Router,
    FormControlDirective,
    FormGroup,
    FormControl,
    Validators,
    TranslatePipe,
    fadeAnimation
} from '@modernjs/core';

// ============================================================================
// Internal Dependencies
// ============================================================================
import { AuthService } from '../services/auth.service.js';

export const LoginPage = Component.create({
    selector: 'login-page',
    animations: fadeAnimation,
    inject: { 
        authService: AuthService,
        router: Router
    },
    directives: { formControl: FormControlDirective },
    pipes: { translate: TranslatePipe },
    
    onInit() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required])
        });

        // Subscribe to form changes to update the view
        this.sub = this.form.valueChanges.subscribe(() => {
            this.update();
        });
    },

    onDestroy() {
        if (this.sub) this.sub.unsubscribe();
    },

    styles: `
        :host {
            display: block;
            width: 100%;
            max-width: 100%;
        }
        .login-card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
            max-width: 100%;
            margin: 0;
        }
        h1 {
            margin-bottom: 0.25rem;
            color: var(--text-primary);
            font-size: 1.1rem;
            text-align: center;
            font-weight: 700;
        }
        .subtitle {
            color: var(--text-secondary);
            text-align: center;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.25rem;
            color: var(--text-secondary);
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            box-sizing: border-box;
            transition: all 0.2s;
            font-size: 0.875rem;
        }
        button {
            width: 100%;
            padding: 0.75rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
    `,

    handleLogin(e) {
        e.preventDefault();
        if (this.form.valid) {
            const username = this.form.get('username').value;
            this.authService.login(username);
            this.router.navigate('/features/dashboard');
        }
    },

    template: `
        <div class="login-card">
            <h1>{{ 'login.title' | translate }}</h1>
            <p class="subtitle">{{ 'login.subtitle' | translate }}</p>
            <form (submit)="handleLogin">
                <div class="form-group">
                    <label>{{ 'login.username' | translate }}</label>
                    <input 
                        type="text" 
                        [formControl]="this.form.get('username')"
                        placeholder="{{ 'login.placeholder' | translate }}"
                    >
                </div>
                <button type="submit" [disabled]="!this.form.valid">
                <i class="fas fa-sign-in-alt"></i> {{ 'login.button' | translate }}
            </button>
            </form>
        </div>
    `
});
