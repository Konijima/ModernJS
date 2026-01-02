# API Reference

Complete API documentation for ModernJS framework.

## Contents

- [Services](./services.md) - Built-in services (Storage, Device, Meta)
- [Pipes](./pipes.md) - Data transformation pipes
- [Directives](./directives.md) - Custom directives for DOM manipulation

## Built-in Services

### Storage Service
Reactive localStorage/sessionStorage wrapper with automatic serialization.

### Device Service
Device detection and responsive utilities.

### Meta Service
Dynamic meta tag and title management.

## Pipes

Transform data in templates:
- **AsyncPipe** - Unwrap Observables and Promises
- **DatePipe** - Format dates
- **CurrencyPipe** - Format currency values
- **JsonPipe** - Debug objects in templates

## Directives

Extend DOM behavior:
- **[formControl]** - Bind form controls
- **[disabled]** - Conditional disable
- **[href]** - Dynamic links
- Custom directive creation

## Usage Examples

### Services
```javascript
import { StorageService } from '@modernjs/core';

class MyComponent extends Component {
    static inject = { storage: StorageService };

    onInit() {
        this.storage.setItem('key', { data: 'value' });
    }
}
```

### Pipes
```javascript
template: `
    <div>{{ user.createdAt | date:'short' }}</div>
    <div>{{ price | currency:'USD' }}</div>
`
```

### Directives
```javascript
template: `
    <input [formControl]="nameControl" />
    <button [disabled]="!form.valid">Submit</button>
`
```

See individual documentation for complete API details.