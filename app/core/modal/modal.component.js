import { Component } from '../component/component.js';
import { ModalService } from './modal.service.js';

export const Modal = Component.create({
    selector: 'app-modal',
    inject: {
        modalService: ModalService
    },
    state: {
        isOpen: false,
        title: '',
        content: '',
        actions: []
    },
    
    onInit() {
        this.connect(this.modalService, (state) => state);
    },

    styles: `
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .modal-backdrop.open {
            opacity: 1;
            visibility: visible;
        }

        .modal-container {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden;
        }

        .modal-backdrop.open .modal-container {
            transform: scale(1);
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
        }

        .modal-body {
            padding: 1.5rem;
            color: #4b5563;
            line-height: 1.5;
        }

        .modal-footer {
            padding: 1rem 1.5rem;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }

        .btn {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
            border-color: transparent;
        }
        .btn-primary:hover { background: #1d4ed8; }

        .btn-secondary {
            background: white;
            color: #374151;
            border-color: #d1d5db;
        }
        .btn-secondary:hover { background: #f3f4f6; }
        
        .btn-danger {
            background: #dc2626;
            color: white;
        }
        .btn-danger:hover { background: #b91c1c; }
    `,

    template() {
        // We need to handle the actions array manually in the template since @for might be limited
        // But our template engine supports @for, so let's try to use it.
        // However, binding functions in @for loop might be tricky if we don't have a way to pass the item.
        // Let's use a helper method to render buttons or just assume a fixed structure for now?
        // No, let's try to make it dynamic.
        
        // Since we can't easily bind dynamic functions from an array in the current template engine 
        // (it expects methods on the component), we will use a workaround:
        // We'll attach the actions to the component instance temporarily or use event delegation.
        // A better way for this framework: The template engine compiles to `this.method(e)`.
        // If we want dynamic actions, we might need to store them in a registry.
        
        // Workaround: We will render buttons with data-index and handle click centrally.
        
        return `
            <div class="modal-backdrop ${this.state.isOpen ? 'open' : ''}" (click)="handleBackdropClick">
                <div class="modal-container" (click)="handleContainerClick">
                    <header class="modal-header">
                        <h3 class="modal-title">{{ this.state.title }}</h3>
                    </header>
                    
                    <div class="modal-body">
                        {{ this.state.content }}
                    </div>

                    <footer class="modal-footer">
                        @for (let i = 0; i < this.state.actions.length; i++) {
                            <button 
                                class="btn btn-{{ this.state.actions[i].type || 'secondary' }}"
                                data-index="{{ i }}"
                                (click)="handleActionClick">
                                {{ this.state.actions[i].label }}
                            </button>
                        }
                    </footer>
                </div>
            </div>
        `;
    },

    handleBackdropClick(e) {
        this.modalService.close();
    },

    handleContainerClick(e) {
        e.stopPropagation();
    },

    handleActionClick(e) {
        const index = e.target.getAttribute('data-index');
        const action = this.state.actions[index];
        if (action && action.onClick) {
            action.onClick();
        }
    }
});
