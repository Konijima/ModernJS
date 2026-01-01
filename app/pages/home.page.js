import { Component } from '../core/component/component.js';
import { Router } from '../core/router/router.js';
import { UpperCasePipe } from '../core/pipes/common.pipes.js';

export const HomePage = Component.create({
    selector: 'home-page',
    inject: {
        router: Router
    },
    pipes: {
        uppercase: UpperCasePipe
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
                <i class="fas fa-code"></i> Open Source Framework
            </span>
            
            <h2 class="hero-title">
                Build <span class="highlight">Modern</span> Web Apps
            </h2>
            
            <p class="hero-description">
                A lightweight, dependency-free JavaScript framework demonstrating 
                modern web capabilities with Web Components, Reactive State, and Dependency Injection.
            </p>
            
            <div class="hero-actions">
                <button class="btn btn-primary btn-lg" (click)="goToGetStarted">
                    <i class="fas fa-play"></i> Get Started
                </button>
                <button class="btn btn-secondary btn-lg" (click)="openGitHub">
                    <i class="fab fa-github"></i> View on GitHub
                </button>
            </div>
        </div>

        <div class="features-grid">
            <div class="card hover-card">
                <div class="icon-box"><i class="fas fa-bolt"></i></div>
                <h3 class="feature-title">Web Components</h3>
                <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Built on standard Custom Elements and Shadow DOM for true encapsulation.</p>
            </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-sync"></i></div>
                    <h3 class="feature-title">Reactive State</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Proxy-based state management with automatic DOM updates and diffing.</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-syringe"></i></div>
                    <h3 class="feature-title">Dependency Injection</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Built-in DI container for managing services and component dependencies.</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-route"></i></div>
                    <h3 class="feature-title">Routing</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Client-side routing system for Single Page Application experience.</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-filter"></i></div>
                    <h3 class="feature-title">Pipes</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Transform data in templates with built-in or custom pipes.</p>
                </div>
                <div class="card hover-card">
                    <div class="icon-box"><i class="fas fa-globe"></i></div>
                    <h3 class="feature-title">i18n Support</h3>
                    <p class="text-muted" style="font-size: 0.9375rem; line-height: 1.6; margin: 0;">Built-in internationalization service for multi-language support.</p>
                </div>
            </div>
    `
});
