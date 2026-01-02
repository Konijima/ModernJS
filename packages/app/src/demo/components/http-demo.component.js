import { Component } from '@modernjs/core';
import { HttpClient } from '@modernjs/core';
import { TranslatePipe } from '@modernjs/core';
import { I18nService } from '@modernjs/core';
import { fadeAnimation } from '@modernjs/core';

export const HttpDemoComponent = Component.create({
    selector: 'http-demo',
    animations: fadeAnimation,
    inject: { 
        http: HttpClient,
        i18nService: I18nService
    },
    pipes: {
        translate: TranslatePipe
    },
    state: {
        users: [],
        loading: false,
        logs: []
    },
    onInit() {
        this.connect(this.i18nService, () => ({}));

        // Add a logging interceptor for demonstration
        // We store the reference to remove it later
        this.interceptor = {
            name: 'demoLogger',
            request: (req) => {
                let msg = `Request: ${req.method} ${req.url}`;
                if (req.headers && req.headers['Authorization']) {
                    msg += `\nAuth: ${req.headers['Authorization']}`;
                }
                this.log(msg, 'request');
                return req;
            },
            response: (res) => {
                this.log(`Response: ${res.status} ${res.statusText}`, 'response');
                return res;
            }
        };
        this.http.addInterceptor(this.interceptor);
    },

    onDestroy() {
        // Remove the interceptor to prevent stale references
        if (this.interceptor) {
            const index = this.http.interceptors.indexOf(this.interceptor);
            if (index !== -1) {
                this.http.interceptors.splice(index, 1);
            }
        }
    },
    
    log(message, type = 'info') {
        const logs = [...this.state.logs, { time: new Date().toLocaleTimeString(), message, type }];
        this.state.logs = logs;
    },

    fetchUsers() {
        this.state.loading = true;
        this.state.users = [];
        
        this.http.get('https://jsonplaceholder.typicode.com/users')
            .subscribe({
                next: (data) => {
                    // Take only first 5 for demo
                    this.state.users = data.slice(0, 5);
                    this.state.loading = false;
                },
                error: (err) => {
                    this.log(`Error: ${err.message}`, 'error');
                    this.state.loading = false;
                }
            });
    },

    styles: `
        .demo-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: start;
        }
        @media (max-width: 992px) {
            .demo-container {
                grid-template-columns: 1fr;
            }
        }
        .user-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .user-card {
            background: var(--card-bg);
            padding: 1.25rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 1.25rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .user-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border-color: var(--primary-color);
        }
        .user-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--primary-color);
            opacity: 0;
            transition: opacity 0.3s;
        }
        .user-card:hover::before {
            opacity: 1;
        }
        .avatar {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
            flex-shrink: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .user-info h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-color);
        }
        .user-info p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .logs-panel {
            background: #0f172a;
            color: #e2e8f0;
            border-radius: var(--radius-lg);
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            height: 400px;
            overflow-y: auto;
            font-size: 0.85rem;
            border: 1px solid var(--border-color);
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
        }
        .logs-header {
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            backdrop-filter: blur(4px);
        }
        .log-content {
            padding: 0.5rem;
            flex: 1;
        }
        .log-entry {
            margin-bottom: 0.5rem;
            padding: 0.75rem;
            border-radius: 0.375rem;
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid transparent;
            animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .log-entry.request {
            border-left-color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
        }
        .log-entry.response {
            border-left-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
        }
        .log-entry.error {
            border-left-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        .log-time {
            color: #64748b;
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
            display: block;
        }
        .log-message {
            word-break: break-all;
            line-height: 1.5;
        }
        .badge-method {
            display: inline-block;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.7rem;
            font-weight: bold;
            margin-right: 0.5rem;
            background: rgba(255,255,255,0.1);
        }
        /* Custom Scrollbar */
        .logs-panel::-webkit-scrollbar {
            width: 8px;
        }
        .logs-panel::-webkit-scrollbar-track {
            background: transparent;
        }
        .logs-panel::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        .logs-panel::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .main-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .card-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.02);
        }
        .card-body {
            padding: 2rem;
        }
        @media (max-width: 768px) {
            .card-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
                padding: 1.5rem;
            }
            .card-header .btn {
                width: 100%;
            }
            .card-body {
                padding: 1.5rem;
            }
        }
    `,
    template: `
        <div class="main-card">
            <div class="card-header">
                <div>
                    <h2 class="mb-1" style="font-size: 1.5rem;">{{ 'http.title' | translate }}</h2>
                    <p class="text-muted mb-0">{{ 'http.desc' | translate }}</p>
                </div>
                <div>
                    <button class="btn btn-primary" (click)="fetchUsers" [disabled]="state.loading">
                        <i class="fas fa-sync {{ state.loading ? 'fa-spin' : '' }}"></i> {{ 'http.refresh' | translate }}
                    </button>
                </div>
            </div>

            <div class="card-body">
                <div class="demo-container">
                    <div>
                        <h3 class="mb-4 section-title"><i class="fas fa-users text-primary"></i> {{ 'http.users_title' | translate }}</h3>
                        <div class="user-list">
                            @if (state.loading) {
                                <div class="text-center p-5">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <p class="mt-3 text-muted">Loading users...</p>
                                </div>
                            }
                            @if (!state.loading && state.users.length === 0) {
                                <div class="text-center p-5 text-muted" style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg);">
                                    <i class="fas fa-cloud-download-alt fa-3x mb-3" style="opacity: 0.5"></i>
                                    <p>Click "Refresh Data" to fetch users</p>
                                </div>
                            }
                            @for (let user of state.users) {
                                <div class="user-card">
                                    <div class="avatar">{{ user.name.charAt(0) }}</div>
                                    <div class="user-info">
                                        <h4>{{ user.name }}</h4>
                                        <p><i class="fas fa-envelope"></i> {{ user.email }}</p>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="mb-4 section-title"><i class="fas fa-terminal text-secondary"></i> {{ 'http.logs_title' | translate }}</h3>
                        <div class="logs-panel">
                            <div class="logs-header">
                                <span><i class="fas fa-network-wired"></i> Network Activity</span>
                                <span class="badge bg-dark">{{ state.logs.length }} events</span>
                            </div>
                            <div class="log-content">
                                @for (let log of state.logs) {
                                    <div class="log-entry {{ log.type }}">
                                        <span class="log-time">{{ log.time }}</span>
                                        <div class="log-message">
                                            @if (log.type === 'request') {
                                                <span class="badge-method">REQ</span>
                                            }
                                            @if (log.type === 'response') {
                                                <span class="badge-method">RES</span>
                                            }
                                            @if (log.type === 'error') {
                                                <span class="badge-method" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">ERR</span>
                                            }
                                            {{ log.message }}
                                        </div>
                                    </div>
                                }
                                @if (state.logs.length === 0) {
                                    <div class="text-center text-muted mt-5">
                                        <i class="fas fa-terminal fa-2x mb-3" style="opacity: 0.3"></i>
                                        <p>{{ 'http.no_logs' | translate }}</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});
