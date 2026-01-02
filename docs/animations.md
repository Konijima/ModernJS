# Animations

ModernJS provides a built-in animation system based on the Web Animations API. It allows you to define animations for elements entering and leaving the DOM.

## Configuration

Define animations in your component configuration using the `animations` property.

```javascript
import { Component } from '@modernjs/core';

export class NotificationComponent extends Component {
    static animations = {
        'fade': {
            ':enter': {
                keyframes: [
                    { opacity: 0, transform: 'translateY(-20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                options: { duration: 300, easing: 'ease-out' }
            },
            ':leave': {
                keyframes: [
                    { opacity: 1, transform: 'translateY(0)' },
                    { opacity: 0, transform: 'translateY(-20px)' }
                ],
                options: { duration: 200, easing: 'ease-in' }
            }
        }
    };
    
    // ...
}
```

## Usage

Apply the animation to an element in your template using the `animate` attribute. The value should match the key defined in your `animations` object.

```html
@if (this.isVisible) {
    <div class="notification" animate="fade">
        {{ this.message }}
    </div>
}
```

## States

The system currently supports two states:

- `:enter`: Triggered when the element is inserted into the DOM.
- `:leave`: Triggered when the element is removed from the DOM.

The renderer automatically detects these changes (e.g., inside an `@if` block) and plays the corresponding animation. For `:leave` animations, the removal of the element is deferred until the animation completes.
