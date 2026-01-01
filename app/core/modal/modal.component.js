import { Component } from '../component/component.js';
import { ModalService } from './modal.service.js';

export const Modal = Component.create({
    selector: 'app-modal',
    inject: {
        modalService: ModalService
    },
    state: {
        isOpen: false,
        type: 'custom',
        title: '',
        content: '',
        inputValue: '',
        placeholder: '',
        actions: [],
        options: {}
    },
    
    onInit() {
        this.connect(this.modalService, (state) => state);
    },

    onUpdate() {
        if (this.state.isOpen && this.state.type === 'prompt') {
            const input = this.shadowRoot.querySelector('input');
            if (input) {
                // Small timeout to ensure DOM is ready and transition is started
                setTimeout(() => input.focus(), 50);
            }
        } else if (this.state.isOpen) {
            // For other modals, focus the primary button or the first button
            const primaryBtn = this.shadowRoot.querySelector('.btn-primary');
            if (primaryBtn) {
                setTimeout(() => primaryBtn.focus(), 50);
            }
        }
    },

    handleInput(e) {
        this.modalService.setInputValue(e.target.value);
    },

    handleKeydown(e) {
        if (e.key === 'Enter' && this.state.type === 'prompt') {
            this.modalService.close(this.state.inputValue);
        }
        if (e.key === 'Escape') {
            this.modalService.close(null);
        }
    },

    template() {
        if (!this.state.isOpen) return '';

        const sizeClass = this.state.options && this.state.options.size ? `modal-${this.state.options.size}` : '';
        const customClass = this.state.options && this.state.options.customClass ? this.state.options.customClass : '';

        return `
            <div class="modal-backdrop open" (click)="handleBackdropClick">
                <div class="modal-container ${sizeClass} ${customClass}" (click)="handleContainerClick">
                    <header class="modal-header">
                        <h3 class="modal-title">{{ this.state.title }}</h3>
                        <button class="btn-close" (click)="handleCloseClick">&times;</button>
                    </header>
                    
                    <div class="modal-body">
                        <p>{{ this.state.content }}</p>
                        
                        @if (this.state.type === 'prompt') {
                            <input 
                                type="text" 
                                class="form-control" 
                                value="{{ this.state.inputValue }}"
                                placeholder="{{ this.state.placeholder }}"
                                (input)="handleInput"
                                (keydown)="handleKeydown"
                            />
                        }
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
        if (this.state.options && this.state.options.backdrop === 'static') return;
        this.modalService.close(null);
    },

    handleContainerClick(e) {
        e.stopPropagation();
    },

    handleCloseClick(e) {
        this.modalService.close(null);
    },

    handleActionClick(e) {
        const index = e.target.getAttribute('data-index');
        const action = this.state.actions[index];
        if (action && action.onClick) {
            action.onClick();
        }
    }
});
