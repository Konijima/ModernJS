import { Component } from '../component/component.js';
import { ModalService } from './modal.service.js';

export const ModalComponent = Component.create({
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

    template: `
        @if (!state.isOpen) {
            
        } @else {
            <div class="modal-backdrop open" (click)="handleBackdropClick">
                <div class="modal-container {{ state.options && state.options.size ? 'modal-' + state.options.size : '' }} {{ state.options && state.options.customClass ? state.options.customClass : '' }}" (click)="handleContainerClick">
                    <header class="modal-header">
                        <h3 class="modal-title">{{ state.title }}</h3>
                        <button class="btn-close" (click)="handleCloseClick">×</button>
                    </header>
                    
                    <div class="modal-body">
                        <p>{{ state.content }}</p>
                        
                        @if (state.type === 'prompt') {
                            <input 
                                type="text" 
                                class="form-control" 
                                [value]="state.inputValue"
                                placeholder="{{ state.placeholder }}"
                                (input)="handleInput"
                                (keydown)="handleKeydown"
                            />
                        }
                    </div>

                    <footer class="modal-footer">
                        @for (let action of state.actions) {
                            <button 
                                class="btn btn-{{ action.type || 'secondary' }}"
                                (click)="action.onClick()">
                                {{ action.label }}
                            </button>
                        }
                    </footer>
                </div>
            </div>
        }
    `,

    handleBackdropClick(e) {
        if (this.state.options && this.state.options.backdrop === 'static') return;
        this.modalService.close(null);
    },

    handleContainerClick(e) {
        e.stopPropagation();
    },

    handleCloseClick(e) {
        this.modalService.close(null);
    }
});
