import { Service } from '../core/services/service.js';

export class ModalService extends Service {
    constructor() {
        super({
            isOpen: false,
            title: '',
            content: '',
            actions: [] // { label: 'OK', onClick: () => {}, type: 'primary'|'secondary' }
        });
    }

    open(config) {
        this.setState({
            isOpen: true,
            title: config.title || '',
            content: config.content || '',
            actions: config.actions || [{ label: 'Close', onClick: () => this.close(), type: 'secondary' }]
        });
    }

    close() {
        this.setState({
            ...this.state,
            isOpen: false
        });
    }
}
