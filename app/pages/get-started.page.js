import { Component } from '../core/component/component.js';
import { Router } from '../core/router/router.js';

export const GetStartedPage = Component.create({
    selector: 'get-started-page',
    inject: {
        router: Router
    },
    animations: {
        'fade-in': {
            ':enter': {
                keyframes: [
                    { opacity: 0 },
                    { opacity: 1 }
                ],
                options: { duration: 300, easing: 'ease-out', fill: 'forwards' }
            }
        }
    },
    goToFeatures() {
        this.router.navigate('/features');
    },
    openGitHub() {
        window.open('https://github.com/Konijima/ModernJS', '_blank');
    },
    styles: `
        :host {
            display: block;
        }
        .step {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }
        .step-number {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: var(--primary-glow);
            color: var(--primary-color);
            border: 1px solid rgba(56, 189, 248, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
            flex-shrink: 0;
        }
        .step-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.125rem;
        }
        .step-content p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.9375rem;
            line-height: 1.6;
        }
        .code-snippet {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            font-family: 'Fira Code', 'Monaco', monospace;
            font-size: 0.8125rem;
            color: var(--primary-color);
            margin-top: 0.75rem;
            overflow-x: auto;
        }
        .feature-list {
            display: grid;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .feature-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: var(--bg-color);
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
        }
        .feature-item i {
            color: var(--success-color);
        }
        .feature-item span {
            font-size: 0.9375rem;
        }
    `,
    template: `
        <div class="page-container" animate="fade-in" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="text-center" style="margin-bottom: 1rem;">
                <span class="badge" style="margin-bottom: 1rem;"><i class="fas fa-rocket"></i> Quick Start</span>
                <h2 style="margin-bottom: 0.5rem;">Get Started</h2>
                <p class="text-muted" style="font-size: 0.9375rem;">
                    Set up ModernJS in minutes and start building.
                </p>
            </div>

            <div class="card">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Clone the Repository</h3>
                        <p>Get the source code from GitHub to start exploring.</p>
                        <div class="code-snippet">git clone https://github.com/Konijima/ModernJS.git</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Install Dependencies</h3>
                        <p>Install the minimal dev dependencies (just Vite for dev server).</p>
                        <div class="code-snippet">cd ModernJS && npm install</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Start Development Server</h3>
                        <p>Launch the development server with hot reload.</p>
                        <div class="code-snippet">npm run dev</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Explore the Features</h3>
                        <p>Check out the live demos to see what ModernJS can do.</p>
                        <div class="feature-list">
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Web Components with Shadow DOM</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Reactive State Management</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Dependency Injection</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Client-side Routing</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Pipes & i18n Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <button class="btn btn-primary btn-lg" (click)="goToFeatures">
                    <i class="fas fa-flask"></i> View Features
                </button>
                <button class="btn btn-secondary btn-lg" (click)="openGitHub">
                    <i class="fab fa-github"></i> GitHub
                </button>
            </div>
        </div>
    `
});
