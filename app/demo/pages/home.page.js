import { Component } from '../../core/component/component.js';
import { Router } from '../../core/router/router.js';
import { UpperCasePipe } from '../../core/pipes/common.pipes.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';
import { I18nService } from '../../core/services/i18n.service.js';
import { fadeAnimation } from '../../core/animations/fade.animation.js';

export const HomePage = Component.create({
    selector: 'home-page',
    animations: fadeAnimation,
    inject: {
        router: Router,
        i18nService: I18nService
    },
    pipes: {
        uppercase: UpperCasePipe,
        translate: TranslatePipe
    },
    
    openGitHub() {
        window.open('https://github.com/Konijima/ModernJS', '_blank');
    },

    goToGetStarted() {
        this.router.navigate('/get-started');
    },

    styles: `
        :host {
            display: block;
        }
    `,
    template: `
        <div class="hero-section">
            <span class="badge" style="margin-bottom: 1.5rem;">
                <i class="fas fa-code"></i> {{ 'home.hero.badge' | translate }}
            </span>
            
            <h2 class="hero-title">
                {{ 'home.hero.title' | translate }}
            </h2>
            
            <p class="hero-description">
                {{ 'home.hero.description' | translate }}
            </p>
            
            <div class="hero-actions">
                <button class="btn btn-primary btn-lg" (click)="goToGetStarted">
                    <i class="fas fa-play"></i> {{ 'home.hero.get_started' | translate }}
                </button>
                <button class="btn btn-secondary btn-lg" (click)="openGitHub">
                    <i class="fab fa-github"></i> {{ 'home.hero.github' | translate }}
                </button>
            </div>
        </div>

        <div class="features-grid">
            <div class="card hover-card">
                <div class="icon-box"><i class="fas fa-bolt"></i></div>
                <h3 class="feature-title">{{ 'home.features.web_components.title' | translate }}</h3>
                <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.web_components.desc' | translate }}</p>
            </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-sync"></i></div>
                    <h3 class="feature-title">{{ 'home.features.reactive_state.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.reactive_state.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-syringe"></i></div>
                    <h3 class="feature-title">{{ 'home.features.di.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.di.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-route"></i></div>
                    <h3 class="feature-title">{{ 'home.features.routing.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.routing.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-filter"></i></div>
                    <h3 class="feature-title">{{ 'home.features.pipes.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.pipes.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-globe"></i></div>
                    <h3 class="feature-title">{{ 'home.features.i18n.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.i18n.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-magic"></i></div>
                    <h3 class="feature-title">{{ 'home.features.directives.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.directives.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-clipboard-check"></i></div>
                    <h3 class="feature-title">{{ 'home.features.forms.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.forms.desc' | translate }}</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-cloud"></i></div>
                    <h3 class="feature-title">{{ 'home.features.http.title' | translate }}</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">{{ 'home.features.http.desc' | translate }}</p>
                </div>
            </div>
    `
});
