import { Component } from '@modernjs/core';
import { Router } from '@modernjs/core';
import { I18nService } from '@modernjs/core';
import { TranslatePipe } from '@modernjs/core';
import { routes } from './app.routes.js';
import { HttpClient } from '@modernjs/core';
import { AuthInterceptor } from './demo/interceptors/auth.interceptor.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from './i18n/config.js';
import './demo/components/cursor.component.js';

// Register Global Interceptors
HttpClient.provide(AuthInterceptor);
    
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
        // Configure I18n
        this.i18nService.configure({
            languages: LANGUAGES,
            defaultLanguage: DEFAULT_LANGUAGE
        });

        // Define Routes
        this.router.register(routes);

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

    navigateToBenchmark(e) {
        e.preventDefault();
        this.router.navigate('/benchmark');
    },

    isActive(route) {
        const path = window.location.pathname;
        if (route === '/') {
            return path === '/' ? 'active' : '';
        }
        return path === route || path.startsWith(route + '/') ? 'active' : '';
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

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
            .brand {
                text-align: center;
            }
        }
    `,

    template: `
            <div class="app-container">
                <cursor-overlay></cursor-overlay>
                <header class="app-header">
                    <div class="header-content">
                        <div class="brand">
                            <h1 class="app-title">{{ 'app.title' | translate }}</h1>
                            <p class="app-subtitle">{{ 'app.subtitle' | translate }}</p>
                        </div>
                        <div class="lang-switcher">
                            @for(let lang of this.i18nService.supportedLanguages) {
                                <button 
                                    class="btn-lang {{ this.i18nService.state.locale === lang.code ? 'active' : '' }}" 
                                    data-lang="{{ lang.code }}"
                                    (click)="handleLangClick">
                                    {{ lang.label }}
                                </button>
                            }
                        </div>
                    </div>
                    
                    <nav class="nav-links">
                        <a href="/" class="nav-link {{ this.isActive('/') }}" (click)="navigateToHome">{{ 'app.nav.home' | translate }}</a>
                        <a href="/get-started" class="nav-link {{ this.isActive('/get-started') }}" (click)="navigateToGetStarted">{{ 'app.nav.get_started' | translate }}</a>
                        <a href="/features" class="nav-link {{ this.isActive('/features') }}" (click)="navigateToFeatures">{{ 'app.nav.features' | translate }}</a>
                        <a href="/benchmark" class="nav-link {{ this.isActive('/benchmark') }}" (click)="navigateToBenchmark">Benchmark</a>
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
    `
});
