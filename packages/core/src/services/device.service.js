// ============================================================================
// Internal Dependencies
// ============================================================================
import { Service } from './service.js';

export class DeviceService extends Service {
    constructor() {
        super({ isMobile: false, browser: 'Unknown' });
        this.checkDevice();
        this.checkBrowser();
        this.initListeners();
    }

    checkBrowser() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';

        if (userAgent.indexOf("Firefox") > -1) {
            browser = "Firefox";
        } else if (userAgent.indexOf("SamsungBrowser") > -1) {
            browser = "Samsung Internet";
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            browser = "Opera";
        } else if (userAgent.indexOf("Trident") > -1) {
            browser = "Internet Explorer";
        } else if (userAgent.indexOf("Edge") > -1) {
            browser = "Edge";
        } else if (userAgent.indexOf("Chrome") > -1) {
            browser = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            browser = "Safari";
        }

        this.setState({ ...this.state, browser });
    }

    checkDevice() {
        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const isMobile = window.matchMedia('(pointer: coarse)').matches || 
                        window.matchMedia('(max-width: 768px)').matches;
        
        if (this.state.isMobile !== isMobile) {
            this.setState({ ...this.state, isMobile });
        }
    }

    initListeners() {
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                this.checkDevice();
            });
            resizeObserver.observe(document.body);
        }
        
        // Also listen for pointer capability changes (e.g. plugging in a mouse on a tablet)
        if (typeof window.matchMedia === 'function') {
            window.matchMedia('(pointer: coarse)').addEventListener('change', () => {
                this.checkDevice();
            });
        }
    }
}
