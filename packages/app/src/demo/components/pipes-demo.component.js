import { Component } from '@modernjs/core';
import { UpperCasePipe, LowerCasePipe, DatePipe, CurrencyPipe } from '@modernjs/core';
import { ReversePipe } from '../pipes/reverse.pipe.js';
import { TranslatePipe } from '@modernjs/core';
import { ModalService } from '@modernjs/core';
import { I18nService } from '@modernjs/core';
import { fadeAnimation } from '@modernjs/core';

export const PipesDemoComponent = Component.create({
    selector: 'pipes-demo',
    animations: fadeAnimation,
    inject: {
        modalService: ModalService,
        i18nService: I18nService
    },
    pipes: {
        uppercase: UpperCasePipe,
        lowercase: LowerCasePipe,
        date: DatePipe,
        currency: CurrencyPipe,
        reverse: ReversePipe,
        translate: TranslatePipe
    },
    state: {
        currentDate: new Date()
    },
    onInit() {
        this.timer = setInterval(() => {
            this.state.currentDate = new Date();
        }, 1000);

        this.langSub = this.i18nService.subscribe(() => {
            this.update();
        });
    },
    onDestroy() {
        if (this.timer) clearInterval(this.timer);
        if (this.langSub) this.langSub.unsubscribe();
    },
    handleLangClick(e) {
        const lang = e.target.closest('.btn-secondary').dataset.lang;
        if (lang) {
            this.i18nService.setLocale(lang);
        }
    },
    async showAlert() {
        await this.modalService.alert('This is a simple alert dialog.', 'Alert');
    },

    async showConfirm() {
        const result = await this.modalService.confirm('Do you want to proceed with this action?', 'Confirm Action');
        if (result) {
            this.modalService.alert('You clicked OK!', 'Confirmed');
        } else {
            this.modalService.alert('You clicked Cancel.', 'Cancelled');
        }
    },

    async showPrompt() {
        const name = await this.modalService.prompt('Please enter your name:', 'Guest', 'Welcome');
        if (name !== null) {
            this.modalService.alert(`Hello, ${name}!`, 'Welcome');
        }
    },

    showModal() {
        const datePipe = this.getPipe('date');
        const formatted = datePipe.transform(new Date(), 'full');
        
        this.modalService.open({
            title: this.i18nService.translate('features.modal.title'),
            content: this.i18nService.translate('features.modal.content', [formatted]),
            actions: [
                { 
                    label: this.i18nService.translate('features.modal.action.got_it'), 
                    type: 'primary', 
                    onClick: () => this.modalService.close()
                },
                {
                    label: this.i18nService.translate('features.modal.action.cancel'),
                    type: 'secondary',
                    onClick: () => this.modalService.close()
                }
            ]
        });
    },
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .demo-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        .demo-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
        }
        .demo-icon.primary {
            background: rgba(56, 189, 248, 0.15);
            color: var(--primary-color);
            border: 1px solid rgba(56, 189, 248, 0.2);
        }
        .demo-icon.accent {
            background: rgba(244, 114, 182, 0.15);
            color: var(--accent-color);
            border: 1px solid rgba(244, 114, 182, 0.2);
        }
        .demo-icon.success {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .demo-icon.warning {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.2);
        }
        h3 {
            margin: 0;
            font-size: 1.125rem;
        }
        .code-block {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 0.75rem;
            padding: 1rem;
            font-family: monospace;
            font-size: 0.875rem;
            margin-top: 1rem;
        }
        .code-line {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        .code-line:last-child {
            border-bottom: none;
        }
        .code-label {
            color: var(--text-subtle);
        }
        .code-value {
            color: var(--primary-color);
            font-weight: 500;
        }
        .btn-group {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
    `,
    getLangLabel(lang) {
        const labels = {
            'en': 'English',
            'fr': 'Français',
            'es': 'Español'
        };
        return labels[lang.code] || lang.label;
    },

    template: `
        <div class="card">
            <div class="demo-header">
                <div class="demo-icon primary"><i class="fas fa-globe"></i></div>
                <h3>{{ 'DEMO_TITLE' | translate }}</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem;">{{ 'WELCOME' | translate }}</p>
            <p class="text-subtle" style="font-size: 0.875rem; margin-top: 0.5rem;">{{ 'CURRENT_LANG' | translate:i18nService.state.locale }}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                @for (let lang of i18nService.supportedLanguages) {
                    <button 
                        class="btn btn-secondary" 
                        data-lang="{{ lang.code }}"
                        (click)="handleLangClick">
                        {{ getLangLabel(lang) }}
                    </button>
                }
            </div>
        </div>

        <div class="card">
            <div class="demo-header">
                <div class="demo-icon accent"><i class="fas fa-window-maximize"></i></div>
                <h3>Modal System</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem; margin-bottom: 1rem;">
                Demonstration of the new Promise-based modal system with various types.
            </p>
            <div class="btn-group">
                <button class="btn btn-primary" (click)="showAlert">Alert</button>
                <button class="btn btn-secondary" (click)="showConfirm">Confirm</button>
                <button class="btn btn-secondary" (click)="showPrompt">Prompt</button>
                <button class="btn btn-accent" (click)="showModal">Custom</button>
            </div>
        </div>

        <div class="card">
            <div class="demo-header">
                <div class="demo-icon warning"><i class="fas fa-clock"></i></div>
                <h3>Date & Time</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem; margin-bottom: 1rem;">
                Live updates using the DatePipe with various formats.
            </p>
            <div class="code-block">
                <div class="code-line">
                    <span class="code-label">Full:</span>
                    <span class="code-value">{{ state.currentDate | date:'full' }}</span>
                </div>
                <div class="code-line">
                    <span class="code-label">Short:</span>
                    <span class="code-value">{{ state.currentDate | date:'short' }}</span>
                </div>
                <div class="code-line">
                    <span class="code-label">Time:</span>
                    <span class="code-value">{{ state.currentDate | date:'time' }}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="demo-header">
                <div class="demo-icon success"><i class="fas fa-filter"></i></div>
                <h3>{{ 'features.pipes.common.title' | translate }}</h3>
            </div>
            <div class="code-block">
                <div class="code-line">
                    <span class="code-label">Uppercase:</span>
                    <span class="code-value">{{ 'hello world' | uppercase }}</span>
                </div>
                <div class="code-line">
                    <span class="code-label">Lowercase:</span>
                    <span class="code-value">{{ 'HELLO WORLD' | lowercase }}</span>
                </div>
                <div class="code-line">
                    <span class="code-label">Currency:</span>
                    <span class="code-value">{{ 1234.56 | currency:'USD' }}</span>
                </div>
                <div class="code-line">
                    <span class="code-label">Reverse:</span>
                    <span class="code-value">{{ 'epip esrever' | reverse }}</span>
                </div>
            </div>
        </div>
    `,
});