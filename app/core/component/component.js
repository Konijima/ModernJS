import { resolve } from '../di/di.js';
import { render } from './renderer.js';
import { compileTemplate } from './template.js';
import { FRAMEWORK_VERSION } from '../version.js';

// Cache for the global stylesheet to prevent FOUC
let globalStyleSheet = null;

const getGlobalStyleSheet = () => {
    if (globalStyleSheet) return globalStyleSheet;

    // Try to find main.css in loaded stylesheets
    const styleSheet = Array.from(document.styleSheets)
        .find(s => s.href && s.href.includes('main.css'));

    if (styleSheet) {
        try {
            const cssText = Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n');
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);
            globalStyleSheet = sheet;
        } catch (e) {
            console.warn('[Framework] Could not create Constructable Stylesheet from main.css', e);
        }
    }
    return globalStyleSheet;
};

const log = (category, message, ...args) => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG) {
        console.log(
            `%c[Framework] %c${category}%c ${message}`,
            'background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
            'color: #2563eb; font-weight: bold; margin-left: 4px;',
            'color: inherit;',
            ...args
        );
    }
};

// Log framework version on load
if (import.meta.env.DEV) {
    console.log(
        `%c ModernJS %c v${FRAMEWORK_VERSION} `,
        'background: #2563eb; color: white; padding: 2px 4px; border-radius: 4px 0 0 4px; font-weight: bold;',
        'background: #1e40af; color: white; padding: 2px 4px; border-radius: 0 4px 4px 0;'
    );
}

/**
 * Base Component class using Web Components and Proxy for reactivity.
 * Provides a lightweight framework for building reactive UI components.
 * @extends HTMLElement
 */
export class Component extends HTMLElement {
    /**
     * Get the current framework version
     */
    static get version() {
        return FRAMEWORK_VERSION;
    }

    /**
     * Create and register a component with a simple configuration object.
     * This is a factory method that generates a class extending Component.
     * 
     * @param {object} config - The component configuration
     * @param {string} config.selector - The HTML tag name for the component
     * @param {string} [config.styles] - CSS styles for the component
     * @param {object|Array} [config.inject] - Services to inject
     * @param {object} [config.state] - Initial state object
     * @param {Function} [config.connect] - Lifecycle hook for connecting to services
     * @param {Function|string} [config.template] - Template function or string
     * @returns {typeof Component} The generated component class
     */
    static create(config) {
        const Base = this;
        log('Class', `Created ${config.selector}`);
        
        class GeneratedComponent extends Base {
            static selector = config.selector;
            static styles = config.styles;
            static inject = config.inject;
            static state = config.state;
            static connect = config.connect;
            static animations = config.animations;
            static pipes = config.pipes;
            
            static template = typeof config.template === 'string' 
                ? () => config.template 
                : config.template;
        }

        const reserved = ['selector', 'styles', 'inject', 'state', 'connect', 'template', 'animations', 'pipes'];
        
        const descriptors = Object.getOwnPropertyDescriptors(config);
        Object.keys(descriptors).forEach(key => {
            if (!reserved.includes(key)) {
                Object.defineProperty(GeneratedComponent.prototype, key, descriptors[key]);
            }
        });

        GeneratedComponent.define();
        return GeneratedComponent;
    }

    /**
     * Define and register the component with the Custom Elements Registry.
     * 
     * @param {string|object} [config] - Selector string or config object. If omitted, uses static properties.
     */
    static define(config) {
        const selector = this.selector || (config && config.selector);
        log('Registry', `Defined ${selector}`);
        
        if (!config) {
            if (this.template) {
                this.prototype.render = this.template;
            } else if (!this.noTemplate) {
                // Only warn if noTemplate is not explicitly set to true
                if (import.meta.env.DEV && import.meta.env.VITE_DEBUG) {
                    console.warn(`[Framework] ⚠️ No template found for ${selector}`);
                }
            }
            if (this.selector) customElements.define(this.selector, this);
            return;
        }

        if (typeof config === 'string') {
            customElements.define(config, this);
        } else {
            if (config.styles) this.styles = config.styles;
            if (config.inject) this.inject = config.inject;
            if (config.animations) this.animations = config.animations;
            if (config.pipes) this.pipes = config.pipes;
            if (config.template) this.prototype.render = config.template;
            
            if (config.selector) {
                this.selector = config.selector;
                customElements.define(config.selector, this);
            }
        }
    }

    /**
     * Initialize the component.
     * Sets up Shadow DOM, dependency injection, and reactive state.
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Apply global styles using Constructable Stylesheets if available
        // This is much faster than injecting <link> tags and prevents FOUC
        const globalSheet = getGlobalStyleSheet();
        if (globalSheet) {
            this.shadowRoot.adoptedStyleSheets = [globalSheet];
        }

        this._subscriptions = [];
        this._refs = {}; // Registry for object references in templates
        
        // Dependency Injection (Support both static inject and manual inject)
        const injections = this.constructor.inject || {};
        
        if (Array.isArray(injections)) {
            injections.forEach(ServiceClass => {
                const name = ServiceClass.name.charAt(0).toLowerCase() + ServiceClass.name.slice(1);
                this[name] = resolve(ServiceClass);
            });
        } else {
            Object.entries(injections).forEach(([propName, ServiceClass]) => {
                this[propName] = resolve(ServiceClass);
            });
        }

        // Initialize reactive state
        let initialState = this.constructor.state || this.initialState || {};
        
        // Ensure state is a unique copy for this instance
        if (initialState && typeof initialState === 'object') {
            try {
                initialState = JSON.parse(JSON.stringify(initialState));
            } catch (e) {
                initialState = { ...initialState };
            }
        }

        this.state = new Proxy(initialState, {
            set: (target, prop, value) => {
                if (target[prop] !== value) {
                    log('State', `Changed ${this.tagName}.${String(prop)}`, value);
                    target[prop] = value;
                    this.update();
                }
                return true;
            }
        });

        // Initialize pipes
        this._pipes = {};
        const pipes = this.constructor.pipes || {};
        Object.entries(pipes).forEach(([name, PipeClass]) => {
            this._pipes[name] = new PipeClass(this);
        });
    }

    /**
     * Lifecycle hook called when the component is added to the DOM.
     * Triggers initial render and calls onInit hook.
     */
    connectedCallback() {
        log('Lifecycle', `Connected ${this.tagName}`);
        
        // Call onInit hook if defined
        if (this.onInit) {
            this.onInit();
        }
        
        // Call static connect if defined (for create() syntax)
        if (this.constructor.connect) {
            this.constructor.connect.call(this);
        }

        this.update();
    }

    /**
     * Lifecycle hook called when the component is removed from the DOM.
     * Cleans up subscriptions and calls onDestroy hook.
     */
    disconnectedCallback() {
        this._subscriptions.forEach(unsubscribe => unsubscribe());
        
        // Clean up pipes
        if (this._pipes) {
            Object.values(this._pipes).forEach(pipe => {
                if (pipe.destroy) pipe.destroy();
            });
        }

        if (this.onDestroy) {
            this.onDestroy();
        }
    }

    /**
     * Connect a service state to the component state.
     * 
     * @param {Service} service - The service to subscribe to
     * @param {Function} mapFn - Function to map service state to component state
     */
    connect(service, mapFn) {
        const unsubscribe = service.subscribe(state => {
            const newState = mapFn(state);
            Object.assign(this.state, newState);
        });
        this._subscriptions.push(unsubscribe);
    }

    /**
     * Retrieve a registered pipe instance programmatically.
     * @param {string} name - The name of the pipe (e.g., 'date')
     * @returns {Pipe} The pipe instance
     */
    getPipe(name) {
        return this._pipes && this._pipes[name];
    }

    /**
     * Store a value reference for use in templates.
     * Useful for passing objects to child components via attributes.
     * 
     * @param {any} value - The value to store
     * @returns {string} A reference key string
     */
    bind(value) {
        const key = `__ref_${Math.random().toString(36).substr(2, 9)}`;
        this._refs[key] = value;
        return key;
    }

    /**
     * Re-render the component.
     * Uses DOM diffing to update the Shadow DOM efficiently.
     */
    update() {
        if (!this.render) {
            if (!this.constructor.noTemplate && import.meta.env.DEV && import.meta.env.VITE_DEBUG) {
                console.warn(`[Framework] ⚠️ No render method found for ${this.tagName}`);
            }
            return;
        }

        log('Render', `Updated ${this.tagName}`);
        const templateResult = this.render();
        let newDom;

        if (typeof templateResult === 'string') {
            // Handle string template with directives
            const html = compileTemplate(templateResult, this);
            const temp = document.createElement('div');
            temp.innerHTML = html;
            newDom = temp;
        } else {
            // Handle direct DOM nodes (from h())
            newDom = document.createElement('div');
            newDom.appendChild(templateResult);
        }
        
        if (this.constructor.styles) {
            const style = document.createElement('style');
            style.textContent = this.constructor.styles;
            newDom.insertBefore(style, newDom.firstChild);
        }

        // Inject global styles from document head (excluding styles.css if already adopted)
        Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'))
            .filter(node => {
                // Skip styles.css if we successfully adopted it
                if (globalStyleSheet && node.tagName === 'LINK' && node.getAttribute('href') && node.getAttribute('href').includes('styles.css')) {
                    return false;
                }
                return true;
            })
            .reverse()
            .forEach(node => {
                newDom.insertBefore(node.cloneNode(true), newDom.firstChild);
            });

        render(this.shadowRoot, newDom, this);

        if (this.onUpdate) {
            this.onUpdate();
        }
    }
}
