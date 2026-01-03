# Templates

ModernJS uses a string-based template system with a syntax similar to modern JavaScript frameworks. It supports interpolation, control flow, and pipes.

## Interpolation

Use double curly braces `{{ }}` to embed expressions in your template. The expression is evaluated in the context of your component instance.

```html
<h1>Hello, {{ name }}!</h1>
<p>The sum is {{ 1 + 2 }}</p>
```

## Control Flow

The template engine supports control flow blocks prefixed with `@`.

### Conditional Rendering (@if)

```html
@if (isLoggedIn) {
    <button (click)="logout()">Logout</button>
} @else {
    <button (click)="login()">Login</button>
}
```

You can also use `@else if`:

```html
@if (status === 'loading') {
    <p>Loading...</p>
} @else if (status === 'error') {
    <p>Error occurred.</p>
} @else {
    <p>Data loaded.</p>
}
```

### List Rendering (@for)

Use standard JavaScript `for...of` syntax to iterate over arrays.

```html
<ul>
    @for (const item of items) {
        <li>{{ item.name }} - ${{ item.price }}</li>
    }
</ul>
```

## Pipes

Pipes allow you to transform data directly in your templates. They are applied using the `|` character.

```html
<p>Birthday: {{ birthday | date }}</p>
<p>Total: {{ amount | currency : 'EUR' }}</p>
```

### Built-in Pipes

ModernJS comes with a few common pipes (ensure you register them if they are not globally available, though typically they are provided by the framework).

- `uppercase`: Converts text to uppercase.
- `lowercase`: Converts text to lowercase.
- `date`: Formats a date object. Supports arguments: `'short'`, `'full'`, `'time'`, or a locale string.
- `currency`: Formats a number as currency.
- `json`: Formats an object as a JSON string.

### Custom Pipes

You can create custom pipes by extending the `Pipe` class.

```javascript
import { Pipe } from '@modernjs/core';

export class ReversePipe extends Pipe {
    static name = 'reverse';

    transform(value) {
        if (typeof value !== 'string') return value;
        return value.split('').reverse().join('');
    }
}
```

To use a custom pipe, register it in your component:

```javascript
import { ReversePipe } from '../pipes/reverse.pipe.js';

export class MyComponent extends Component {
    static pipes = [ReversePipe];
    // ...
}
```

## Event Binding

Bind to DOM events using parentheses `(event)`.

```html
<button (click)="handleClick($event)">Click Me</button>
<input (input)="handleInput($event)" />
```

## Property Binding

Bind to DOM properties using square brackets `[property]`.

```html
<img [src]="this.imageUrl" [alt]="this.imageDescription" />
<button [disabled]="this.isValid">Submit</button>
```
