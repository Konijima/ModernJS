# Directives

Directives are classes that add behavior to existing DOM elements. They allow you to extend the functionality of HTML elements without creating a full component.

## Creating a Directive

To create a directive, extend the `Directive` class and implement the lifecycle hooks.

```javascript
import { Directive } from '../core/directive/directive.js';

export class HighlightDirective extends Directive {
    onInit() {
        this.element.style.backgroundColor = 'yellow';
    }

    onUpdate(color) {
        this.element.style.backgroundColor = color || 'yellow';
    }
    
    onDestroy() {
        // Cleanup if necessary
    }
}
```

## Registering Directives

Directives must be registered in the component that uses them, similar to pipes and services.

```javascript
import { Component } from '../core/component/component.js';
import { HighlightDirective } from './highlight.directive.js';

export const MyComponent = Component.create({
    selector: 'my-component',
    directives: { highlight: HighlightDirective },
    template: `
        <p [highlight]="'red'">This text is highlighted!</p>
    `
});
```

## Built-in Directives

### FormControlDirective

The `FormControlDirective` simplifies binding `FormControl` instances to input elements.

**Selector:** `formControl`

**Usage:**

```html
<input type="text" [formControl]="{{ this.bind(this.form.get('username')) }}">
```

This directive handles:
- Writing the control's value to the input element.
- Listening to `input` events to update the control.
- Listening to `blur` events to mark the control as touched.

## Lifecycle Hooks

- **onInit()**: Called when the directive is first applied to the element.
- **onUpdate(value)**: Called when the bound value changes.
- **onDestroy()**: Called when the element is removed from the DOM or the directive is destroyed.
