import { Component } from '../core/component/component.js';
import { UpperCasePipe, LowerCasePipe, DatePipe, CurrencyPipe } from '../core/pipes/common.pipes.js';
import { ReversePipe } from '../pipes/reverse.pipe.js';
import { TranslatePipe } from '../pipes/translate.pipe.js';
import { ModalService } from '../services/modal.service.js';
import { I18nService } from '../services/i18n.service.js';

export const DemoPage = Component.create({
    selector: 'demo-page',
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

        // Subscribe to language changes to trigger re-render
        this.langSub = this.i18nService.subscribe(() => {
            this.update();
        });
    },
    onDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.langSub) {
            this.langSub();
        }
    },
    setLangEn() {
        this.i18nService.setLocale('en');
    },
    setLangFr() {
        this.i18nService.setLocale('fr');
    },
    showDateAlert() {
        const datePipe = this.getPipe('date');
        const formatted = datePipe.transform(new Date(), 'full');
        
        this.modalService.open({
            title: 'Current Date',
            content: `The formatted date is: ${formatted}`,
            actions: [
                { 
                    label: 'Awesome!', 
                    type: 'primary', 
                    onClick: () => {
                        console.log('User clicked Awesome');
                        this.modalService.close();
                    }
                },
                {
                    label: 'Close',
                    type: 'secondary',
                    onClick: () => this.modalService.close()
                }
            ]
        });
    },
    animations: {
        'fade-in': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                options: { duration: 500, easing: 'ease-out', fill: 'forwards' }
            }
        }
    },
    styles: `
        :host {
            display: block;
            text-align: center;
            padding: 1rem;
        }

        @media (min-width: 768px) {
            :host {
                padding: 2rem;
            }
        }

        h2 {
            color: #1f2937;
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        p {
            color: #4b5563;
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .demo-section {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
            margin: 1.5rem auto;
            max-width: 600px;
        }

        @media (min-width: 768px) {
            .demo-section {
                padding: 2rem;
                margin: 2rem auto;
            }
        }

        .btn-primary {
            background: #2563eb;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            margin-left: 10px;
        }
        .btn-primary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    `,
    template: `
        <div animate="fade-in">
            <h2>Feature Demo</h2>
            <p>
                Showcasing Pipes, Modals, and programmatic usage.
            </p>

            <div class="demo-section">
                <h3>{{ 'DEMO_TITLE' | translate }}</h3>
                <p>{{ 'WELCOME' | translate }}</p>
                <p>{{ 'CURRENT_LANG' | translate:this.i18nService.state.locale }}</p>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" (click)="setLangEn">English</button>
                    <button class="btn-primary" (click)="setLangFr">Français</button>
                </div>
            </div>

            <div class="demo-section">
                <h3>Date Pipe & Modal</h3>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #6b7280;">
                    Current Date: {{ this.state.currentDate | date:'full' }}
                    <br><br>
                    <button class="btn-primary" (click)="showDateAlert">Show Modal Alert</button>
                </p>
            <div class="demo-section">
                <h3>Common Pipes</h3>
                <div style="text-align: left; display: inline-block;">
                    <p><strong>Uppercase:</strong> {{ 'hello world' | uppercase }}</p>
                    <p><strong>Lowercase:</strong> {{ 'HELLO WORLD' | lowercase }}</p>
                    <p><strong>Currency:</strong> {{ 1234.56 | currency:'USD' }}</p>
                </div>
            </div>

            <div class="demo-section">
                <h3>Custom Pipe (Reverse)</h3>
            <div class="demo-section">
                <h3>Custom Pipe (Reverse)</h3>
                <p>Original: "reverse pipe"</p>
                <p>Reversed: <strong>{{ 'epip esrever' | reverse }}</strong></p>
            </div>
        </div>
    `
});
