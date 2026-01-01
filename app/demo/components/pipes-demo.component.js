import { Component } from '../../core/component/component.js';
import { UpperCasePipe, LowerCasePipe, DatePipe, CurrencyPipe } from '../../core/pipes/common.pipes.js';
import { ReversePipe } from '../pipes/reverse.pipe.js';
import { TranslatePipe } from '../../core/pipes/translate.pipe.js';
import { ModalService } from '../../core/modal/modal.service.js';
import { I18nService } from '../../core/services/i18n.service.js';

export const PipesDemoComponent = Component.create({
    selector: 'pipes-demo',
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
        if (this.langSub) this.langSub();
    },
    handleLangClick(e) {
        const lang = e.target.closest('.btn-secondary').dataset.lang;
        if (lang) {
            this.i18nService.setLocale(lang);
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
    `,
    template() {
        return `
        <div class="card">
            <div class="demo-header">
                <div class="demo-icon primary"><i class="fas fa-globe"></i></div>
                <h3>{{ 'DEMO_TITLE' | translate }}</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem;">{{ 'WELCOME' | translate }}</p>
            <p class="text-subtle" style="font-size: 0.875rem; margin-top: 0.5rem;">{{ 'CURRENT_LANG' | translate:this.i18nService.state.locale }}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                ${this.i18nService.supportedLanguages.map(lang => `
                    <button 
                        class="btn btn-secondary" 
                        data-lang="${lang.code}"
                        (click)="handleLangClick">
                        ${lang.label === 'EN' ? 'English' : 'Français'}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div class="demo-header">
                <div class="demo-icon accent"><i class="fas fa-calendar"></i></div>
                <h3>{{ 'features.pipes.date_modal.title' | translate }}</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem;">
                {{ 'features.pipes.date_modal.current_date' | translate }} <strong style="color: var(--text-color);">{{ this.state.currentDate | date:'full' }}</strong>
            </p>
            <button class="btn btn-accent" style="margin-top: 1rem;" (click)="showModal">
                <i class="fas fa-external-link-alt"></i> {{ 'features.pipes.date_modal.show_modal' | translate }}
            </button>
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

        <div class="card">
            <div class="demo-header">
                <div class="demo-icon warning"><i class="fas fa-image"></i></div>
                <h3>{{ 'features.pipes.static.title' | translate }}</h3>
            </div>
            <p class="text-muted" style="font-size: 0.9375rem; margin-bottom: 1rem;">
                {{ 'features.pipes.static.desc' | translate }}
            </p>
            <div style="border-radius: 0.5rem; overflow: hidden; border: 1px solid var(--border-color);">
                <img src="/images/placeholder.svg" alt="Placeholder" style="width: 100%; display: block;">
            </div>
        </div>
    `;
    }
});
