import { I18nService } from './i18n.service.js';

/**
 * Service for managing document metadata (title, meta tags).
 */
export class MetaService {
    static inject = [I18nService];

    constructor(i18nService) {
        this.i18nService = i18nService;
        this.currentConfig = null;

        // Re-apply meta tags when language changes
        this.i18nService.onLangChange(() => {
            if (this.currentConfig) {
                this.update(this.currentConfig);
            }
        });
    }

    /**
     * Set the document title
     * @param {string} title 
     */
    setTitle(title) {
        document.title = title;
    }

    /**
     * Set a meta tag content
     * @param {string} name - The name attribute of the meta tag
     * @param {string} content - The content attribute
     */
    setMeta(name, content) {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    }

    /**
     * Update multiple tags at once
     * @param {Object} config
     * @param {string} [config.title]
     * @param {Array<{name: string, content: string}>} [config.meta]
     */
    update(config) {
        this.currentConfig = config;
        if (!config) return;
        
        if (config.title) {
            this.setTitle(this.i18nService.translate(config.title));
        }

        if (config.meta) {
            config.meta.forEach(tag => {
                this.setMeta(tag.name, this.i18nService.translate(tag.content));
            });
        }
    }
}

