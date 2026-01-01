import { Component } from '../../core/component/component.js';
import { AuthService } from '../services/auth.service.js';
import { Router } from '../../core/router/router.js';

export const DashboardPage = Component.create({
    selector: 'dashboard-page',
    inject: { 
        authService: AuthService,
        router: Router
    },
    
    state: {
        user: null
    },

    onInit() {
        this.connect(this.authService, (state) => ({ user: state.user }));
    },

    styles: `
        :host {
            display: block;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        .card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            padding: 2rem;
            text-align: center;
        }
        h1 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        .logout-btn {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1px solid var(--danger-color);
            color: var(--danger-color);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .logout-btn:hover {
            background: var(--danger-color);
            color: white;
        }
    `,

    handleLogout() {
        this.authService.logout();
        this.router.navigate('/features/login');
    },

    template: `
        <div class="card">
            <h1>Dashboard</h1>
            @if(this.state.user) {
                <p>Welcome back, <strong>{{ this.state.user.name }}</strong>!</p>
                <p>This is a protected route. You can only see this if you are logged in.</p>
            }
            <button class="logout-btn" (click)="handleLogout">Logout</button>
        </div>
    `
});
