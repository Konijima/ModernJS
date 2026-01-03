// ============================================================================
// Core Components & Architecture
// ============================================================================
export { Component } from './src/component/component.js';
export { Directive } from './src/directive/directive.js';
export { Service } from './src/services/service.js';
export { Pipe } from './src/pipes/pipe.js';

// ============================================================================
// Dependency Injection
// ============================================================================
export { inject } from './src/di/di.js';

// ============================================================================
// Routing
// ============================================================================
export { Router } from './src/router/router.js';
export { RouterOutlet } from './src/router/router-outlet.component.js';
export { RouterLinkDirective } from './src/router/router-link.directive.js';

// ============================================================================
// Reactive Programming
// ============================================================================
export { Observable, Subject, BehaviorSubject } from './src/reactivity/observable.js';

// ============================================================================
// Forms
// ============================================================================
export { FormControl } from './src/forms/form-control.js';
export { FormGroup } from './src/forms/form-group.js';
export { FormControlDirective } from './src/forms/form-control.directive.js';
export { Validators } from './src/forms/validators.js';

// ============================================================================
// HTTP
// ============================================================================
export { HttpClient } from './src/http/http.client.js';

// ============================================================================
// Services
// ============================================================================
export { I18nService } from './src/services/i18n.service.js';
export { StorageService } from './src/services/storage.service.js';
export { MetaService } from './src/services/meta.service.js';
export { DeviceService } from './src/services/device.service.js';
export { ModalService } from './src/modal/modal.service.js';

// ============================================================================
// Pipes
// ============================================================================
export { AsyncPipe } from './src/pipes/async.pipe.js';
export { TranslatePipe } from './src/pipes/translate.pipe.js';
export { DatePipe, UpperCasePipe, LowerCasePipe, CurrencyPipe } from './src/pipes/common.pipes.js';

// ============================================================================
// Components
// ============================================================================
export { ModalComponent } from './src/modal/modal.component.js';

// ============================================================================
// Animations
// ============================================================================
export { AnimationManager } from './src/animations/animation.js';
export { fadeAnimation } from './src/animations/fade.animation.js';

// ============================================================================
// Side Effects - Components that self-register
// ============================================================================
import './src/router/router-outlet.component.js';
import './src/modal/modal.component.js';
