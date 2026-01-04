// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    Router,
    TranslatePipe,
    fadeAnimation,
    RouterLinkDirective
} from '@modernjs/core';

export const FeaturesPage = Component.create({
    selector: 'features-page',
    animations: fadeAnimation,
    inject: {
        router: Router
    },
    pipes: {
        translate: TranslatePipe
    },
    directives: {
        'router-link': RouterLinkDirective
    },
    state: {
        tabs: [
            { link: '/features/todo', icon: 'fas fa-check-square', label: 'features.tabs.todo' },
            { link: '/features/counter', icon: 'fas fa-calculator', label: 'features.tabs.counter' },
            { link: '/features/pipes', icon: 'fas fa-filter', label: 'features.tabs.pipes' },
            { link: '/features/form', icon: 'fas fa-edit', label: 'features.tabs.forms' },
            { link: '/features/http', icon: 'fas fa-cloud', label: 'features.tabs.http' },
            { link: '/features/dashboard', icon: 'fas fa-lock', label: 'features.tabs.auth', activeCheck: '/features/login' }
        ]
    },
    checkScroll(e) {
        const tabs = e.target || this.shadowRoot.querySelector('.tabs');
        if (!tabs) return;

        const left = this.shadowRoot.querySelector('.scroll-hint.left');
        const right = this.shadowRoot.querySelector('.scroll-hint.right');
        
        if (!left || !right) return;

        // Show left hint if scrolled
        if (tabs.scrollLeft > 10) {
            left.classList.add('visible');
        } else {
            left.classList.remove('visible');
        }

        // Show right hint if not at end (with tolerance)
        // Use 1px tolerance for subpixel rendering differences
        if (tabs.scrollLeft < tabs.scrollWidth - tabs.clientWidth - 5) {
            right.classList.add('visible');
        } else {
            right.classList.remove('visible');
        }
    },

    onInit() {
        this.routerSub = this.router.subscribe(() => {
            this.update();
            setTimeout(() => this.checkScroll({}), 50);
        });
        
        // Initial check after render
        setTimeout(() => this.checkScroll({}), 50);
    },
    
    onDestroy() {
        if (this.routerSub) this.routerSub();
    },
    
    isActive(path) {
        return window.location.pathname.includes(path);
    },

    styles: `
        :host {
            display: block;
        }
        .page-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 2rem;
            align-items: start;
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            grid-column: 1 / -1;
            margin-bottom: 1rem;
        }
        .tabs {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            background: var(--card-bg);
            padding: 1rem;
            border-radius: var(--radius-xl);
            border: 1px solid var(--border-color);
            position: sticky;
            top: 2rem;
        }
        .tab {
            width: 100%;
            padding: 0.75rem 1rem;
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
            justify-content: flex-start;
            gap: 0.75rem;
            text-align: left;
        }
        .tab:hover {
            background: var(--hover-bg);
            color: var(--text-color);
        }
        .tab.active, .tab.router-link-active {
            background: var(--bg-color);
            color: var(--primary-color);
            box-shadow: var(--shadow-sm);
        }
        .content-area {
            min-width: 0; /* Prevent overflow */
        }
        
        .tabs-wrapper {
            display: contents;
        }
        .scroll-hint {
            display: none;
        }

        @media (max-width: 768px) {
            .page-container {
                grid-template-columns: 1fr;
                padding: 1rem;
                gap: 1.5rem;
            }
            .tabs-wrapper {
                display: block;
                position: relative;
                overflow: hidden;
                border-radius: var(--radius-xl);
            }
            .tabs {
                position: static;
                flex-direction: row;
                overflow-x: auto;
                padding: 0.5rem;
                margin-bottom: 0;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE/Edge */
                border: none;
                border-radius: 0;
                background: var(--card-bg);
                scroll-behavior: smooth;
            }
            .tabs::-webkit-scrollbar {
                display: none; /* Chrome/Safari */
            }
            .tab {
                width: auto;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .scroll-hint {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 0;
                bottom: 0;
                width: 2.5rem;
                color: var(--primary-color);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 10;
            }
            .scroll-hint.visible {
                opacity: 1;
            }
            .scroll-hint.left {
                left: 0;
                background: linear-gradient(to right, var(--card-bg) 20%, transparent);
                justify-content: flex-start;
                padding-left: 0.5rem;
            }
            .scroll-hint.right {
                right: 0;
                background: linear-gradient(to left, var(--card-bg) 20%, transparent);
                justify-content: flex-end;
                padding-right: 0.5rem;
            }
            .scroll-hint i {
                font-size: 0.875rem;
            }
            .scroll-hint.right i {
                animation: bounce-right 1.5s infinite;
            }
            .scroll-hint.left i {
                animation: bounce-left 1.5s infinite;
            }
            @keyframes bounce-right {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(3px); }
            }
            @keyframes bounce-left {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-3px); }
            }
        }
    `,
    template: `
        <div class="page-container">
            <div class="header text-center">
                <span class="badge" style="margin-bottom: 1rem;"><i class="fas fa-star"></i> {{ 'features.showcase.title' | translate }}</span>
                <h2 style="margin-bottom: 0.5rem;">{{ 'features.showcase.title' | translate }}</h2>
                <p class="text-muted" style="font-size: 0.9375rem;">
                    {{ 'features.showcase.desc' | translate }}
                </p>
            </div>

            <div class="tabs-wrapper">
                <div class="scroll-hint left">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="tabs" (scroll)="checkScroll">
                    @for (const tab of tabs) {
                        <button class="tab {{ (tab.activeCheck && isActive(tab.activeCheck)) ? 'router-link-active' : '' }}" [router-link]="tab.link">
                            <i class="{{ tab.icon }}"></i> {{ tab.label | translate }}
                        </button>
                    }
                </div>
                <div class="scroll-hint right">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        
            <div class="content-area">
                <router-outlet></router-outlet>
            </div>
        </div>
    `
});
