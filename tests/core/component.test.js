import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component } from '../../app/core/component/component.js';
import * as di from '../../app/core/di/di.js';
import * as renderer from '../../app/core/component/renderer.js';
import * as template from '../../app/core/component/template.js';

// Mock dependencies
vi.mock('../../app/core/di/di.js', () => ({
    resolve: vi.fn()
}));

vi.mock('../../app/core/component/renderer.js', () => ({
    render: vi.fn()
}));

vi.mock('../../app/core/component/template.js', () => ({
    compileTemplate: vi.fn((tpl) => tpl)
}));

describe('Component', () => {
    let TestComponent;
    const selector = 'test-component';

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Define a basic test component
        class BaseTestComponent extends Component {
            static selector = selector;
            render() {
                return '<div>Test</div>';
            }
        }
        TestComponent = BaseTestComponent;
        
        // Clean up registry if needed (though customElements.define throws if redefined)
        // Since we can't undefine, we'll use unique selectors for some tests
    });

    describe('Static Methods', () => {
        it('should create a component class using create()', () => {
            const config = {
                selector: 'created-component',
                template: '<div>Created</div>',
                state: { count: 0 }
            };
            
            const CreatedComponent = Component.create(config);
            
            expect(CreatedComponent.prototype).toBeInstanceOf(Component);
            expect(CreatedComponent.selector).toBe(config.selector);
            expect(CreatedComponent.state).toEqual(config.state);
        });

        it('should define a component using define()', () => {
            const defineSpy = vi.spyOn(customElements, 'define');
            const uniqueSelector = 'defined-component-' + Math.random().toString(36).substr(2, 5);
            
            class DefinedComponent extends Component {
                static selector = uniqueSelector;
            }
            
            DefinedComponent.define();
            
            expect(defineSpy).toHaveBeenCalledWith(uniqueSelector, DefinedComponent);
        });
    });

    describe('Lifecycle & Initialization', () => {
        it('should initialize state from static property', () => {
            const uniqueSelector = 'state-component-' + Math.random().toString(36).substr(2, 5);
            class StateComponent extends Component {
                static selector = uniqueSelector;
                static state = { value: 10 };
            }
            StateComponent.define();
            
            const instance = new StateComponent();
            expect(instance.state.value).toBe(10);
        });

        it('should inject services defined in static inject', () => {
            const uniqueSelector = 'inject-component-' + Math.random().toString(36).substr(2, 5);
            class MockService {}
            
            di.resolve.mockReturnValue(new MockService());
            
            class InjectComponent extends Component {
                static selector = uniqueSelector;
                static inject = { myService: MockService };
            }
            InjectComponent.define();
            
            const instance = new InjectComponent();
            expect(di.resolve).toHaveBeenCalledWith(MockService);
            expect(instance.myService).toBeInstanceOf(MockService);
        });

        it('should inject services defined in static inject array', () => {
            const uniqueSelector = 'inject-array-component-' + Math.random().toString(36).substr(2, 5);
            class MockService {}
            
            di.resolve.mockReturnValue(new MockService());
            
            class InjectArrayComponent extends Component {
                static selector = uniqueSelector;
                static inject = [MockService];
            }
            InjectArrayComponent.define();
            
            const instance = new InjectArrayComponent();
            expect(di.resolve).toHaveBeenCalledWith(MockService);
            expect(instance.mockService).toBeInstanceOf(MockService);
        });

        it('should call onInit when connected', () => {
            const uniqueSelector = 'init-component-' + Math.random().toString(36).substr(2, 5);
            const onInitSpy = vi.fn();
            
            class InitComponent extends Component {
                static selector = uniqueSelector;
                onInit = onInitSpy;
                render() { return ''; }
            }
            InitComponent.define();
            
            const instance = new InitComponent();
            instance.connectedCallback();
            
            expect(onInitSpy).toHaveBeenCalled();
        });

        it('should call static connect when connected', () => {
            const uniqueSelector = 'connect-component-' + Math.random().toString(36).substr(2, 5);
            const connectSpy = vi.fn();
            
            class ConnectComponent extends Component {
                static selector = uniqueSelector;
                static connect = connectSpy;
                render() { return ''; }
            }
            ConnectComponent.define();
            
            const instance = new ConnectComponent();
            instance.connectedCallback();
            
            expect(connectSpy).toHaveBeenCalled();
        });

        it('should cleanup on disconnectedCallback', () => {
            const uniqueSelector = 'cleanup-component-' + Math.random().toString(36).substr(2, 5);
            const onDestroySpy = vi.fn();
            const unsubscribeSpy = vi.fn();
            
            class CleanupComponent extends Component {
                static selector = uniqueSelector;
                onDestroy = onDestroySpy;
                constructor() {
                    super();
                    this._subscriptions.push(unsubscribeSpy);
                }
            }
            CleanupComponent.define();
            
            const instance = new CleanupComponent();
            instance.disconnectedCallback();
            
            expect(onDestroySpy).toHaveBeenCalled();
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });

    describe('Features', () => {
        it('should connect to service state', () => {
            const uniqueSelector = 'service-connect-component-' + Math.random().toString(36).substr(2, 5);
            const mockService = {
                subscribe: vi.fn((cb) => {
                    cb({ data: 'test' });
                    return vi.fn();
                })
            };
            
            class ServiceConnectComponent extends Component {
                static selector = uniqueSelector;
                static state = { data: '' };
            }
            ServiceConnectComponent.define();
            
            const instance = new ServiceConnectComponent();
            instance.connect(mockService, (state) => ({ data: state.data }));
            
            expect(instance.state.data).toBe('test');
            expect(instance._subscriptions.length).toBe(1);
        });

        it('should get pipe instance', () => {
            const uniqueSelector = 'pipe-component-' + Math.random().toString(36).substr(2, 5);
            class MockPipe {}
            
            class PipeComponent extends Component {
                static selector = uniqueSelector;
                static pipes = { mock: MockPipe };
            }
            PipeComponent.define();
            
            const instance = new PipeComponent();
            expect(instance.getPipe('mock')).toBeInstanceOf(MockPipe);
        });

        it('should bind values and return reference key', () => {
            const uniqueSelector = 'bind-component-' + Math.random().toString(36).substr(2, 5);
            class BindComponent extends Component {
                static selector = uniqueSelector;
            }
            BindComponent.define();
            
            const instance = new BindComponent();
            const obj = { id: 1 };
            const key = instance.bind(obj);
            
            expect(key).toMatch(/^__ref_/);
            expect(instance._refs[key]).toBe(obj);
        });

        it('should warn if no render method is present', () => {
            const uniqueSelector = 'no-render-component-' + Math.random().toString(36).substr(2, 5);
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            class NoRenderComponent extends Component {
                static selector = uniqueSelector;
                // No render method
            }
            NoRenderComponent.define();
            
            const instance = new NoRenderComponent();
            instance.update();
            
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No render method found'));
            warnSpy.mockRestore();
        });
    });

    describe('Reactivity', () => {
        it('should update when state changes', () => {
            const uniqueSelector = 'reactive-component-' + Math.random().toString(36).substr(2, 5);
            
            class ReactiveComponent extends Component {
                static selector = uniqueSelector;
                static state = { count: 0 };
                render() { return `Count: ${this.state.count}`; }
            }
            ReactiveComponent.define();
            
            const instance = new ReactiveComponent();
            // Mock update method to track calls
            const updateSpy = vi.spyOn(instance, 'update');
            
            instance.state.count = 1;
            
            expect(updateSpy).toHaveBeenCalled();
        });
    });
    
    describe('Rendering', () => {
        it('should call render and renderer.render on update', () => {
            const uniqueSelector = 'render-component-' + Math.random().toString(36).substr(2, 5);
            
            class RenderComponent extends Component {
                static selector = uniqueSelector;
                render() { return '<div>Content</div>'; }
            }
            RenderComponent.define();
            
            const instance = new RenderComponent();
            instance.update();
            
            expect(template.compileTemplate).toHaveBeenCalled();
            expect(renderer.render).toHaveBeenCalled();
        });
    });
});
