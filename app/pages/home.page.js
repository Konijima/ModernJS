import { Component } from '../core/component/component.js';

export const HomePage = Component.create({
    selector: 'home-page',
    animations: {
        'fade-in': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                options: { duration: 500, easing: 'ease-out', fill: 'forwards' }
            }
        },
        'stagger': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'scale(0.9)' },
                    { opacity: 1, transform: 'scale(1)' }
                ],
                options: { duration: 400, easing: 'ease-out', fill: 'forwards' }
            }
        }
    },
    styles: `
        :host {
            display: block;
            text-align: center;
            padding: 2rem;
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
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
            text-align: left;
        }
        .feature-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
        }
        .feature-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    `,
    template: `
        <div animate="fade-in">
            <h2>Welcome to ModernJS</h2>
            <p>
                A lightweight, dependency-free JavaScript framework demonstrating 
                modern web capabilities with Web Components, Reactive State, and Dependency Injection.
            </p>

            <div class="features">
                <div class="feature-card" animate="stagger" style="animation-delay: 100ms">
                    <div class="feature-title">⚡️ Web Components</div>
                    <p>Built on standard Custom Elements and Shadow DOM for true encapsulation.</p>
                </div>
                <div class="feature-card" animate="stagger" style="animation-delay: 200ms">
                    <div class="feature-title">🔄 Reactive State</div>
                    <p>Proxy-based state management with automatic DOM updates and diffing.</p>
                </div>
                <div class="feature-card" animate="stagger" style="animation-delay: 300ms">
                    <div class="feature-title">💉 Dependency Injection</div>
                    <p>Built-in DI container for managing services and component dependencies.</p>
                </div>
                <div class="feature-card" animate="stagger" style="animation-delay: 400ms">
                    <div class="feature-title">🛣️ Routing</div>
                    <p>Client-side routing system for Single Page Application experience.</p>
                </div>
            </div>
        </div>
    `
});
