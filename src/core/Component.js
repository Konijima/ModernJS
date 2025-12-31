import { resolve } from './di.js';
import { createElement } from './dom.js';
import { render } from './renderer.js';

/**
 * Base Component class using Web Components and Proxy for reactivity
 */
export class Component extends HTMLElement {
    /**
     * Create and register a component with a simple configuration object
     * @param {object} config 
     */
    static create(config) {
        const Base = this;
        
        class GeneratedComponent extends Base {
            static selector = config.selector;
            static styles = config.styles;
            static inject = config.inject;
            static state = config.state;
            static connect = config.connect;
            
            static template = typeof config.template === 'string' 
                ? () => config.template 
                : config.template;
        }

        const reserved = ['selector', 'styles', 'inject', 'state', 'connect', 'template'];
        
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
     * Define and register the component
     * @param {string|object} config - Selector string or config object
     */
    static define(config) {
        if (!config) {
            if (this.selector) customElements.define(this.selector, this);
            if (this.template) this.prototype.render = this.template;
            return;
        }

        if (typeof config === 'string') {
            customElements.define(config, this);
        } else {
            if (config.selector) {
                this.selector = config.selector;
                customElements.define(config.selector, this);
            }
            if (config.styles) this.styles = config.styles;
            if (config.inject) this.inject = config.inject;
            if (config.template) this.prototype.render = config.template;
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._subscriptions = [];
        
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
                    target[prop] = value;
                    this.update();
                }
                return true;
            }
        });
    }

    /**
     * Lifecycle hook called when component is connected
     */
    onInit() {}

    /**
     * Lifecycle hook called when component is disconnected
     */
    onDestroy() {}

    connectedCallback() {
        // Auto-subscribe to injected services
        const injections = this.constructor.inject || {};
        const services = Array.isArray(injections) 
            ? injections.map(s => s.name.charAt(0).toLowerCase() + s.name.slice(1))
            : Object.keys(injections);

        services.forEach(propName => {
            const service = this[propName];
            if (service && typeof service.subscribe === 'function') {
                // Auto-update when service changes
                const unsub = service.subscribe(() => this.update());
                this._subscriptions.push(unsub);
            }
        });

        // Handle declarative connections
        if (this.constructor.connect) {
            Object.entries(this.constructor.connect).forEach(([serviceName, mapFn]) => {
                if (this[serviceName]) {
                    this.connect(this[serviceName], mapFn);
                }
            });
        }

        this.onInit();
        this.update();
    }

    disconnectedCallback() {
        this._subscriptions.forEach(unsub => unsub());
        this.onDestroy();
    }

    /**
     * Connect a service to the component state
     * @param {Service} service 
     * @param {Function} mapFn (data) => partialState
     */
    connect(service, mapFn) {
        const unsub = service.subscribe(data => {
            const updates = mapFn(data);
            Object.assign(this.state, updates);
        });
        this._subscriptions.push(unsub);
    }

    /**
     * Helper to create elements (alias for createElement)
     */
    h(tag, props, ...children) {
        return createElement(tag, props, ...children);
    }

    get initialState() {
        return {};
    }

    update() {
        if (this._updatePending) return;
        this._updatePending = true;
        
        // Debounce updates to next microtask
        queueMicrotask(() => {
            this._performUpdate();
            this._updatePending = false;
        });
    }

    _performUpdate() {
        const styles = this.styles || this.constructor.styles || '';
        const style = document.createElement('style');
        style.textContent = `
            :host { display: block; font-family: 'Roboto', sans-serif; }
            ${styles}
        `;

        const content = this.render();
        const fragment = document.createDocumentFragment();
        fragment.appendChild(style);

        if (content) {
            if (typeof content === 'string') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                Array.from(doc.body.childNodes).forEach(node => fragment.appendChild(node));
            } else if (Array.isArray(content)) {
                content.forEach(c => fragment.appendChild(c));
            } else if (content instanceof Node) {
                fragment.appendChild(content);
            }
        }

        // Use the robust renderer
        render(fragment, this.shadowRoot, this);
    }

    render() {
        return null;
    }
}
