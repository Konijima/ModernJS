// ============================================================================
// Internal Dependencies
// ============================================================================
import { Service } from './service.js';

export class DeviceService extends Service {
    constructor() {
        super({ isMobile: false });
        this.checkDevice();
        this.initListeners();
    }

    checkDevice() {
        const isMobile = window.matchMedia('(pointer: coarse)').matches || 
                        window.matchMedia('(max-width: 768px)').matches;
        
        if (this.state.isMobile !== isMobile) {
            this.setState({ isMobile });
        }
    }

    initListeners() {
        const resizeObserver = new ResizeObserver(() => {
            this.checkDevice();
        });
        resizeObserver.observe(document.body);
        
        // Also listen for pointer capability changes (e.g. plugging in a mouse on a tablet)
        window.matchMedia('(pointer: coarse)').addEventListener('change', () => {
            this.checkDevice();
        });
    }
}
