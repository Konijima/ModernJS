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
            margin: 4rem auto;
            padding: 2rem;
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            text-align: center;
        }
        h1 {
            margin-bottom: 2rem;
            color: var(--text-primary);
        }
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            box-sizing: border-box;
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
        }
        button:hover {
            opacity: 0.9;
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
        <h1>Login Demo</h1>
        <form (submit)="handleLogin">
            <div class="form-group">
                <label>Username</label>
                <input 
                    type="text" 
                    [formControl]="{{ this.bind(this.form.get('username')) }}"
                    placeholder="Enter any username"
                >
            </div>
            <button type="submit" [disabled]="!this.form.valid">Login</button>
        </form>
    `
});
