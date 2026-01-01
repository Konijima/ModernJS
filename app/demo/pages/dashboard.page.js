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
            width: 100%;
            max-width: 100%;
        }
        .card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: var(--shadow-sm);
            max-width: 800px;
            margin: 0 auto;
        }
        .icon-circle {
            width: 80px;
            height: 80px;
            background: var(--bg-secondary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            color: var(--primary-color);
            font-size: 2rem;
        }
        h1 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-size: 2.5rem;
            font-weight: 800;
        }
        .welcome-text {
            color: var(--text-secondary);
            margin-bottom: 3rem;
            font-size: 1.25rem;
            line-height: 1.6;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .user-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: var(--primary-color-alpha);
            color: var(--primary-color);
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 1.5rem;
        }
        .logout-btn {
            padding: 1rem 2.5rem;
            background: transparent;
            border: 2px solid var(--danger-color);
            color: var(--danger-color);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
        }
        .logout-btn:hover {
            background: var(--danger-color);
            color: white;
            transform: translateY(-1px);
        }
    `,

    handleLogout() {
        this.authService.logout();
        this.router.navigate('/features/login');
    },

    template: `
        <div class="card">
            <div class="icon-circle">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h1>Protected Dashboard</h1>
            @if(this.state.user) {
                <div class="user-badge">
                    <i class="fas fa-user"></i> {{ this.state.user.name }}
                </div>
                <p class="welcome-text">
                    You have successfully accessed this protected route.<br>
                    The <strong>AuthGuard</strong> allowed navigation because you are authenticated.
                </p>
            }
            <button class="logout-btn" (click)="handleLogout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `
});
