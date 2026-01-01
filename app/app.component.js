import { Component } from './core/component/component.js';
import { Router } from './core/router/router.js';
import { I18nService } from './core/services/i18n.service.js';
import { TranslatePipe } from './core/pipes/translate.pipe.js';
import './core/router/router-outlet.component.js';
import './core/modal/modal.component.js';
import './demo/components/cursor.component.js';
import { HomePage } from './demo/pages/home.page.js';
import { GetStartedPage } from './demo/pages/get-started.page.js';
import { FeaturesPage } from './demo/pages/features.page.js';
    
/**
 * Main Application Component.
 * Acts as the root container and layout for the application.
 */
export const App = Component.create({
    selector: 'my-app',
    inject: {
        router: Router,
        i18nService: I18nService
    },
    pipes: {
        translate: TranslatePipe
    },
    
    onInit() {
        // Define Routes
        this.router.register([
            { 
                path: '/', 
                component: HomePage,
                data: {
                    title: 'meta.home.title',
                    meta: [
                        { name: 'description', content: 'meta.home.desc' }
                    ]
                }
            },
            { 
                path: '/get-started', 
                component: GetStartedPage,
                data: {
                    title: 'meta.get_started.title',
                    meta: [
                        { name: 'description', content: 'meta.get_started.desc' }
                    ]
                }
            },
            { 
                path: '/features', 
                component: FeaturesPage,
                data: {
                    title: 'meta.features.title',
                    meta: [
                        { name: 'description', content: 'meta.features.desc' }
                    ]
                }
            },
            { path: '**', component: HomePage }
        ]);

        // Subscribe to route changes to update nav
        this.router.subscribe(() => {
            this.update();
        });

        // Subscribe to language changes to update UI
        this.i18nService.onLangChange(() => {
            this.update();
        });
    },

    setLang(lang) {
        this.i18nService.setLocale(lang);
    },

    handleLangClick(e) {
        const lang = e.target.closest('.btn-lang').dataset.lang;
        if (lang) {
            this.setLang(lang);
        }
    },

    navigateToHome(e) {
        e.preventDefault();
        this.router.navigate('/');
    },

    navigateToGetStarted(e) {
        e.preventDefault();
        this.router.navigate('/get-started');
    },

    navigateToFeatures(e) {
        e.preventDefault();
        this.router.navigate('/features');
    },

    styles: `
        :host {
            display: block;
            min-height: 100vh;
            background-color: var(--bg-color);
            font-family: inherit;
            color: var(--text-color);
            padding: 0;
            box-sizing: border-box;
        }
        main {
            flex: 1;
        }
        .app-header {
            padding: 2rem 1rem;
            text-align: center;
            background: var(--bg-color);
            border-bottom: 1px solid var(--border-color);
        }
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            max-width: 1200px;
            margin: 0 auto 1.5rem;
            padding: 0 1rem;
        }
        .brand {
            text-align: left;
        }
        .lang-switcher {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--bg-color);
            padding: 0.25rem 0.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
        }
        .btn-lang {
            background: none;
            border: none;
            color: var(--text-subtle);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            transition: all 0.2s;
        }
        .btn-lang:hover {
            color: var(--primary-color);
        }
        .btn-lang.active {
            background: var(--primary-glow);
            color: var(--primary-color);
        }
        .divider {
            color: var(--border-color);
            font-size: 0.875rem;
        }
        .app-title {
            margin: 0;
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.05em;
            background: linear-gradient(135deg, var(--primary-color), #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .app-subtitle {
            margin: 0.5rem 0 0;
            color: var(--text-subtle);
            font-size: 1rem;
        }
        .nav-links {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    `,

    template() {
        const path = window.location.pathname;
        const isActive = (route) => path === route ? 'active' : '';
        return `
            <div class="app-container">
                <cursor-overlay></cursor-overlay>
                <header class="app-header">
                    <div class="header-content">
                        <div class="brand">
                            <h1 class="app-title">{{ 'app.title' | translate }}</h1>
                            <p class="app-subtitle">{{ 'app.subtitle' | translate }}</p>
                        </div>
                        <div class="lang-switcher">
                            ${this.i18nService.supportedLanguages.map((lang, index, arr) => `
                                <button 
                                    class="btn-lang ${this.i18nService.state.locale === lang.code ? 'active' : ''}" 
                                    data-lang="${lang.code}"
                                    (click)="handleLangClick">
                                    ${lang.label}
                                </button>
                                ${index < arr.length - 1 ? '<span class="divider">|</span>' : ''}
                            `).join('')}
                        </div>
                    </div>
                    
                    <nav class="nav-links">
                        <a href="/" class="nav-link ${isActive('/')}" (click)="navigateToHome">{{ 'app.nav.home' | translate }}</a>
                        <a href="/get-started" class="nav-link ${isActive('/get-started')}" (click)="navigateToGetStarted">{{ 'app.nav.get_started' | translate }}</a>
                        <a href="/features" class="nav-link ${isActive('/features')}" (click)="navigateToFeatures">{{ 'app.nav.features' | translate }}</a>
                    </nav>
                </header>
                
                <main>
                    <router-outlet></router-outlet>
                </main>

                <app-modal></app-modal>

                <footer class="app-footer">
                    <p>{{ 'app.footer.view_source' | translate }} <a href="https://github.com/Konijima/ModernJS" target="_blank">GitHub</a></p>
                </footer>
            </div>
        `;
    }
});
