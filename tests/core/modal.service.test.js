import { describe, it, expect, beforeEach } from 'vitest';
import { ModalService } from '../../app/core/modal/modal.service.js';

describe('ModalService', () => {
    let modalService;

    beforeEach(() => {
        modalService = new ModalService();
    });

    it('should open modal with default state', async () => {
        modalService.open({ title: 'Test' });
        const state = modalService.getState();
        expect(state.isOpen).toBe(true);
        expect(state.title).toBe('Test');
        expect(state.type).toBe('custom');
    });

    it('should close modal', () => {
        modalService.open({ title: 'Test' });
        modalService.close();
        const state = modalService.getState();
        expect(state.isOpen).toBe(false);
    });

    it('should handle alert', async () => {
        const promise = modalService.alert('Alert Message');
        const state = modalService.getState();
        
        expect(state.isOpen).toBe(true);
        expect(state.type).toBe('alert');
        expect(state.content).toBe('Alert Message');
        
        // Simulate clicking OK
        state.actions[0].onClick();
        
        const result = await promise;
        expect(result).toBe(true);
        expect(modalService.getState().isOpen).toBe(false);
    });

    it('should handle confirm (OK)', async () => {
        const promise = modalService.confirm('Confirm Message');
        const state = modalService.getState();
        
        expect(state.type).toBe('confirm');
        
        // Simulate clicking OK (second action)
        state.actions[1].onClick();
        
        const result = await promise;
        expect(result).toBe(true);
    });

    it('should handle confirm (Cancel)', async () => {
        const promise = modalService.confirm('Confirm Message');
        const state = modalService.getState();
        
        // Simulate clicking Cancel (first action)
        state.actions[0].onClick();
        
        const result = await promise;
        expect(result).toBe(false);
    });

    it('should handle prompt', async () => {
        const promise = modalService.prompt('Prompt Message', 'Default');
        const state = modalService.getState();
        
        expect(state.type).toBe('prompt');
        expect(state.inputValue).toBe('Default');
        
        // Simulate typing
        modalService.setInputValue('New Value');
        
        // Simulate clicking OK (second action)
        // Note: In the service implementation, onClick calls this.close(this.state.inputValue)
        // Since we updated state via setInputValue, it should pick up 'New Value'
        state.actions[1].onClick();
        
        const result = await promise;
        expect(result).toBe('New Value');
    });
});
