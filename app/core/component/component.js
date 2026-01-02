import { resolve } from '../di/di.js';
import { render } from './renderer.js';
import { compileTemplate } from './template.js';
import { compileToVNode } from './compiler.js';
import { h, createTextVNode } from './vdom.js';
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
            static directives = config.directives;
            
            static template = typeof config.template === 'string' 
                ? () => config.template 
                : config.template;
        }

        const reserved = ['selector', 'styles', 'inject', 'state', 'connect', 'template', 'animations', 'pipes', 'directives'];
        
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
            if (config.directives) this.directives = config.directives;
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
        this._rafId = null;
        this._updatePending = false;
        
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
        
        // Schedule initial render
        this.update();

        // Call onInit hook if defined
        if (this.onInit) {
            this.onInit();
        }
        
        // Call static connect if defined (for create() syntax)
        if (this.constructor.connect) {
            this.constructor.connect.call(this);
        }
    }

    /**
     * Lifecycle hook called when the component is removed from the DOM.
     * Cleans up subscriptions and calls onDestroy hook.
     */
    disconnectedCallback() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
            this._updatePending = false;
        }

        this._subscriptions.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            } else if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
                unsubscribe.unsubscribe();
            }
        });
        
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
     * Retrieve a registered directive class.
     * @param {string} name - The selector of the directive
     * @returns {typeof Directive} The directive class
     */
    getDirective(name) {
        if (!this.constructor.directives) return null;
        // Direct match
        if (this.constructor.directives[name]) return this.constructor.directives[name];
        
        // Case-insensitive match (since HTML attributes are lowercase)
        const lowerName = name.toLowerCase();
        const key = Object.keys(this.constructor.directives).find(k => k.toLowerCase() === lowerName);
        return key ? this.constructor.directives[key] : null;
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
     * Schedule a re-render of the component.
     * Batches updates using requestAnimationFrame to avoid unnecessary DOM diffs.
     */
    update() {
        // Prevent updates if not connected to DOM (e.g. during construction)
        if (!this.isConnected) {
            return;
        }

        if (this._updatePending) return;
        this._updatePending = true;

        this._rafId = requestAnimationFrame(() => {
            this._performUpdate();
            this._updatePending = false;
            this._rafId = null;
        });
    }

    /**
     * Force a synchronous re-render of the component.
     * Useful for testing or when immediate DOM updates are required.
     */
    detectChanges() {
        if (!this.isConnected) return;

        if (this._updatePending && this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._updatePending = false;
            this._rafId = null;
        }

        this._performUpdate();
    }

    /**
     * Internal method to perform the actual rendering.
     * Uses DOM diffing to update the Shadow DOM efficiently.
     * @private
     */
    _performUpdate() {
        if (!this.isConnected) return;

        if (!this.render) {
            if (!this.constructor.noTemplate && import.meta.env.DEV && import.meta.env.VITE_DEBUG) {
                console.warn(`[Framework] ⚠️ No render method found for ${this.tagName}`);
            }
            return;
        }

        log('Render', `Updated ${this.tagName}`);
        
        // Clear references from previous render to avoid memory leaks
        this._refs = {};
        
        const templateResult = this.render();
        let newDom;

        if (typeof templateResult === 'string') {
            // Handle string template with directives
            if (!this._renderFn) {
                this._renderFn = compileToVNode(templateResult);
            }
            // Returns array of VNodes
            newDom = this._renderFn(h, createTextVNode, this);
        } else {
            // Handle direct DOM nodes (legacy or manual)
            newDom = templateResult;
        }
        
        // Ensure newDom is an array for consistent handling
        if (!Array.isArray(newDom)) {
            newDom = [newDom];
        }

        // Inject styles into VNode tree
        if (this.constructor.styles) {
            const styleVNode = h('style', {}, [createTextVNode(this.constructor.styles)]);
            newDom.unshift(styleVNode);
        }

        // Inject global styles (This is tricky with VNodes as we need to clone DOM nodes)
        // For VNodes, we can't easily mix real DOM nodes unless we wrap them.
        // But our renderer supports VNodes.
        // We can create a special VNode type for "Real DOM Node" or just convert them?
        // Or we can just append them to the shadowRoot manually?
        // The renderer clears/diffs everything.
        
        // Let's skip global style injection for VNodes for now to keep it simple, 
        // or implement a "Wrapper" VNode.
        // Actually, we can just create VNodes for the styles if they are simple.
        // But <link> tags are simple.
        
        const globalStyles = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'))
            .filter(node => {
                if (globalStyleSheet && node.tagName === 'LINK' && node.getAttribute('href') && node.getAttribute('href').includes('styles.css')) {
                    return false;
                }
                return true;
            })
            .reverse();
            
        globalStyles.forEach(node => {
            if (node.tagName === 'STYLE') {
                newDom.unshift(h('style', {}, [createTextVNode(node.textContent)]));
            } else if (node.tagName === 'LINK') {
                const props = {};
                Array.from(node.attributes).forEach(attr => props[attr.name] = attr.value);
                newDom.unshift(h('link', props, []));
            }
        });

        // Capture current refs for this render cycle
        const currentRefs = { ...this._refs };
        render(this.shadowRoot, newDom, this, currentRefs);

        if (this.onUpdate) {
            this.onUpdate();
        }
    }
}
