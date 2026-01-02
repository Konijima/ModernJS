# Core Services

ModernJS provides a set of core services to handle common application requirements like storage, device detection, and metadata management.

## StorageService

The `StorageService` provides a wrapper around IndexedDB, allowing for persistent data storage in the browser. It supports multiple database connections and provides a promise-based API.

**Location:** `packages/core/src/services/storage.service.js`

### Usage

1. **Inject the service** into your component or service.
2. **Initialize a database** with a name, version, and store configuration.
3. **Perform operations** (getAll, add, put, delete, clear).

```javascript
import { StorageService } from '@modernjs/core';

export class MyService {
    static inject = [StorageService];

    constructor(storageService) {
        this.storage = storageService.init('my-db', 1, {
            items: 'id' // Store 'items' with keyPath 'id'
        });
    }

    async getItems() {
        return await this.storage.getAll('items');
    }

    async addItem(item) {
        await this.storage.add('items', item);
    }
}
```

### API

- `init(name, version, stores)`: Initializes a database connection.
- `getAll(storeName)`: Retrieves all items from a store.
- `add(storeName, item)`: Adds an item to a store.
- `put(storeName, item)`: Updates or adds an item in a store.
- `delete(storeName, key)`: Deletes an item by key.
- `clear(storeName)`: Clears all items from a store.

## DeviceService

The `DeviceService` detects the current device capabilities, such as whether the user is on a mobile device or using a touch interface. It uses `ResizeObserver` and `matchMedia` to react to changes.

**Location:** `packages/core/src/services/device.service.js`

### Usage

The service exposes a reactive state that you can subscribe to.

```javascript
import { DeviceService } from '@modernjs/core';

export const MyComponent = Component.create({
    inject: { device: DeviceService },
    onInit() {
        this.connect(this.device, state => ({ isMobile: state.isMobile }));
    },
    template: `
        <div class="{{ state.isMobile ? 'mobile-view' : 'desktop-view' }}">
            Content
        </div>
    `
});
```

### State Properties

- `isMobile`: Boolean. `true` if the device has a coarse pointer (touch) or screen width <= 768px.

## MetaService

The `MetaService` manages the document's title and meta tags. It integrates with the `I18nService` to automatically update metadata when the language changes.

**Location:** `packages/core/src/services/meta.service.js`

### Usage

```javascript
import { MetaService } from '@modernjs/core';

export const MyPage = Component.create({
    inject: { meta: MetaService },
    onInit() {
        this.meta.update({
            title: 'My Page Title',
            meta: [
                { name: 'description', content: 'This is my page description' },
                { name: 'keywords', content: 'modernjs, framework, web components' }
            ]
        });
    }
});
```

### API

- `setTitle(title)`: Sets the document title.
- `setMeta(name, content)`: Sets a meta tag's content. Creates the tag if it doesn't exist.
- `update(config)`: Updates title and multiple meta tags at once. `config` object structure:
    ```javascript
    {
        title: 'Page Title',
        meta: [
            { name: 'description', content: '...' },
            // ...
        ]
    }
    ```
