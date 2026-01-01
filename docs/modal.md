# Modal System

The ModernJS Modal System provides a flexible way to display dialogs, alerts, confirms, and prompts. It is built on top of the `ModalService` and `ModalComponent`.

## Setup

Ensure the `ModalComponent` (`<app-modal>`) is included in your root component template (usually `app.component.js`).

```javascript
// app.component.js
import './core/modal/modal.component.js';

export const App = Component.create({
    template() {
        return `
            <div class="app-container">
                <!-- ... other content ... -->
                <app-modal></app-modal>
            </div>
        `;
    }
});
```

## Usage

Inject `ModalService` into your component to use it.

```javascript
import { ModalService } from '../core/modal/modal.service.js';

export class MyComponent extends Component {
    static inject = { modalService: ModalService };

    async showAlert() {
        await this.modalService.alert('Operation completed successfully!', 'Success');
        console.log('Alert closed');
    }

    async showConfirm() {
        const confirmed = await this.modalService.confirm('Are you sure you want to delete this item?');
        if (confirmed) {
            this.deleteItem();
        }
    }

    async showPrompt() {
        const name = await this.modalService.prompt('Please enter your name:', 'Guest');
        if (name !== null) {
            console.log(`Hello, ${name}!`);
        }
    }
}
```

## API

### `alert(message, title?, options?)`
Displays an alert dialog with an OK button.
- Returns: `Promise<boolean>` (resolves to `true` when closed)

### `confirm(message, title?, options?)`
Displays a confirmation dialog with OK and Cancel buttons.
- Returns: `Promise<boolean>` (resolves to `true` if OK is clicked, `false` otherwise)

### `prompt(message, defaultValue?, title?, options?)`
Displays a prompt dialog with an input field.
- Returns: `Promise<string | null>` (resolves to the input value if OK is clicked, `null` if Cancel is clicked)

### `open(config)`
Opens a custom modal.
- `config`: Object containing:
    - `title`: String
    - `content`: String
    - `actions`: Array of objects `{ label, type, onClick }`
    - `options`: Object containing `size` ('sm', 'lg', 'full'), `backdrop` ('static'), `customClass`
- Returns: `Promise<any>`

## Customization

You can customize the modal size and behavior using the `options` parameter.

```javascript
this.modalService.confirm('Delete?', 'Warning', {
    size: 'sm',
    backdrop: 'static' // Prevent closing by clicking backdrop
});
```
