// ============================================================================
// Internal Dependencies
// ============================================================================
import { Service } from '../services/service.js';

export class ModalService extends Service {
    constructor() {
        super({
            isOpen: false,
            type: 'custom', // custom, alert, confirm, prompt
            title: '',
            content: '',
            inputValue: '',
            placeholder: '',
            actions: [], // { label: 'OK', onClick: () => {}, type: 'primary'|'secondary' }
            options: {} // size, backdrop, etc.
        });
        this._currentResolve = null;
    }

    open(config) {
        return new Promise((resolve) => {
            this._currentResolve = resolve;
            this.setState({
                isOpen: true,
                type: config.type || 'custom',
                title: config.title || '',
                content: config.content || '',
                inputValue: config.inputValue || '',
                placeholder: config.placeholder || '',
                actions: config.actions || [{ label: 'Close', onClick: () => this.close(), type: 'secondary' }],
                options: config.options || {}
            });
        });
    }

    close(result) {
        if (this._currentResolve) {
            this._currentResolve(result);
            this._currentResolve = null;
        }
        this.setState({
            ...this.state,
            isOpen: false
        });
    }

    alert(message, title = 'Alert', options = {}) {
        return this.open({
            type: 'alert',
            title,
            content: message,
            options,
            actions: [
                { label: 'OK', type: 'primary', onClick: () => this.close(true) }
            ]
        });
    }

    confirm(message, title = 'Confirm', options = {}) {
        return this.open({
            type: 'confirm',
            title,
            content: message,
            options,
            actions: [
                { label: 'Cancel', type: 'secondary', onClick: () => this.close(false) },
                { label: 'OK', type: 'primary', onClick: () => this.close(true) }
            ]
        });
    }

    prompt(message, defaultValue = '', title = 'Prompt', options = {}) {
        return this.open({
            type: 'prompt',
            title,
            content: message,
            inputValue: defaultValue,
            placeholder: options.placeholder || '',
            options,
            actions: [
                { label: 'Cancel', type: 'secondary', onClick: () => this.close(null) },
                { label: 'OK', type: 'primary', onClick: () => this.close(this.state.inputValue) }
            ]
        });
    }

    setInputValue(value) {
        this.setState({
            ...this.state,
            inputValue: value
        });
    }
}
