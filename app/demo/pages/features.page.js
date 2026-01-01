import { Component } from '../../core/component/component.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';
import { Router } from '../../core/router/router.js';
import { fadeAnimation } from '../../core/animations/fade.animation.js';
import '../../core/router/router-outlet.component.js';

export const FeaturesPage = Component.create({
    selector: 'features-page',
    animations: fadeAnimation,
    inject: {
        router: Router
    },
    pipes: {
        translate: TranslatePipe
    },
    onInit() {
        this.routerSub = this.router.subscribe(() => {
            this.update();
        });
    },
    onDestroy() {
        if (this.routerSub) this.routerSub();
    },
    
    handleTabClick(e) {
        const btn = e.target.closest('.tab');
        if (btn && btn.dataset.path) {
            this.router.navigate(btn.dataset.path);
        }
    },
    
    isActive(path) {
        return window.location.pathname.includes(path);
    },

    styles: `
        :host {
            display: block;
        }
        .tabs {
            display: flex;
            gap: 0.25rem;
            background: var(--card-bg);
            padding: 0.375rem;
            border-radius: var(--radius-xl);
            border: 1px solid var(--border-color);
            margin-bottom: 1.5rem;
        }
        .tab {
            flex: 1;
            padding: 0.625rem 1rem;
            border: none;
            background: transparent;
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.875rem;
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .tab:hover {
            background: var(--hover-bg);
            color: var(--text-color);
        }
        .tab.active {
            background: var(--bg-color);
            color: var(--primary-color);
            box-shadow: var(--shadow-sm);
        }
    `,
    template() {
        return `
        <div class="page-container">
            <div class="text-center" style="margin-bottom: 2rem;">
                <span class="badge" style="margin-bottom: 1rem;"><i class="fas fa-star"></i> {{ 'features.showcase.title' | translate }}</span>
                <h2 style="margin-bottom: 0.5rem;">{{ 'features.showcase.title' | translate }}</h2>
                <p class="text-muted" style="font-size: 0.9375rem;">
                    {{ 'features.showcase.desc' | translate }}
                </p>
            </div>

            <div class="tabs">
                <button class="tab ${this.isActive('/features/todo') ? 'active' : ''}" data-path="/features/todo" (click)="handleTabClick">
                    <i class="fas fa-check-square"></i> {{ 'features.tabs.todo' | translate }}
                </button>
                <button class="tab ${this.isActive('/features/counter') ? 'active' : ''}" data-path="/features/counter" (click)="handleTabClick">
                    <i class="fas fa-calculator"></i> {{ 'features.tabs.counter' | translate }}
                </button>
                <button class="tab ${this.isActive('/features/pipes') ? 'active' : ''}" data-path="/features/pipes" (click)="handleTabClick">
                    <i class="fas fa-filter"></i> {{ 'features.tabs.pipes' | translate }}
                </button>
            </div>

            <router-outlet></router-outlet>
        </div>
        `;
    }
});
