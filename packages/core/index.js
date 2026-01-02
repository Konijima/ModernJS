export { Component } from './src/component/component.js';
export { Directive } from './src/directive/directive.js';
export { Router } from './src/router/router.js';
// Components (Side-effects: they register themselves)
import './src/router/router-outlet.component.js';
import './src/modal/modal.component.js';
export { RouterOutlet } from './src/router/router-outlet.component.js';
export { ModalComponent } from './src/modal/modal.component.js';

export { Service } from './src/services/service.js';
export { HttpClient } from './src/http/http.client.js';
export { Pipe } from './src/pipes/pipe.js';
export { Validators } from './src/forms/validators.js';
export { FormControl } from './src/forms/form-control.js';
export { FormGroup } from './src/forms/form-group.js';
export { Observable } from './src/reactivity/observable.js';

// Services
export { I18nService } from './src/services/i18n.service.js';
export { StorageService } from './src/services/storage.service.js';
export { MetaService } from './src/services/meta.service.js';
export { DeviceService } from './src/services/device.service.js';
export { ModalService } from './src/modal/modal.service.js';

// Pipes
export { AsyncPipe } from './src/pipes/async.pipe.js';
export { TranslatePipe } from './src/pipes/translate.pipe.js';
export { DatePipe, UpperCasePipe, LowerCasePipe, CurrencyPipe } from './src/pipes/common.pipes.js';

// Animations
export { Animation } from './src/animations/animation.js';
export { FadeAnimation } from './src/animations/fade.animation.js';

// DI
export { inject } from './src/di/di.js';
