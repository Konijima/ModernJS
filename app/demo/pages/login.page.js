import { Component } from '../../core/component/component.js';
import { AuthService } from '../services/auth.service.js';
import { Router } from '../../core/router/router.js';
import { FormControlDirective } from '../../core/forms/form-control.directive.js';
import { FormGroup } from '../../core/forms/form-group.js';
import { FormControl } from '../../core/forms/form-control.js';
import { Validators } from '../../core/forms/validators.js';

export const LoginPage = Component.create({
    selector: 'login-page',
    inject: { 
        authService: AuthService,
        router: Router
    },
    directives: { formControl: FormControlDirective },
    
    onInit() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required])
        });
    },

    styles: `
        :host {
            display: block;
            max-width: 400px;
            margin: 0 auto;
        }
        .login-card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
        }
        h1 {
            margin-bottom: 0.5rem;
            color: var(--text-primary);
            font-size: 1.5rem;
            text-align: center;
        }
        .subtitle {
            color: var(--text-secondary);
            text-align: center;
            margin-bottom: 2rem;
            font-size: 0.875rem;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
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
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-color-alpha);
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
            <h1>Login Demo</h1>
            <p class="subtitle">Enter a username to access the dashboard</p>
            <form (submit)="handleLogin">
                <div class="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        [formControl]="{{ this.bind(this.form.get('username')) }}"
                        placeholder="e.g. John Doe"
                    >
                </div>
                <button type="submit" [disabled]="!this.form.valid">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>
        </div>
    `
});
