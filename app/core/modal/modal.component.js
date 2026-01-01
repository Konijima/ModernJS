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
