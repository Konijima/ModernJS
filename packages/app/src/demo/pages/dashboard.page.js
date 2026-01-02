// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    Router,
    fadeAnimation
} from '@modernjs/core';

// ============================================================================
// Internal Dependencies
// ============================================================================
import { AuthService } from '../services/auth.service.js';

export const DashboardPage = Component.create({
    selector: 'dashboard-page',
    animations: fadeAnimation,
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
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: var(--shadow-sm);
            max-width: 100%;
            margin: 0;
        }
        .icon-circle {
            width: 64px;
            height: 64px;
            background: var(--bg-secondary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: var(--primary-color);
            font-size: 1.5rem;
        }
        h1 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
            font-weight: 700;
        }
        .welcome-text {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-size: 1rem;
            line-height: 1.5;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .user-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--primary-color-alpha);
            color: var(--primary-color);
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }
        .logout-btn {
            padding: 0.75rem 2rem;
            background: transparent;
            border: 1px solid var(--danger-color);
            color: var(--danger-color);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
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
