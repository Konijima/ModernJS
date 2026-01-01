# Pipes

Pipes are a powerful feature in ModernJS used to transform data in templates. They can be used to format dates, currency, text, or handle asynchronous data streams.

## Built-in Pipes

ModernJS comes with a set of common pipes available in `app/core/pipes/common.pipes.js`.

### Text Transformation

#### UpperCasePipe
Transforms text to uppercase.

```html
<!-- Output: HELLO WORLD -->
<div>{{ 'hello world' | upperCase }}</div>
```

#### LowerCasePipe
Transforms text to lowercase.

```html
<!-- Output: hello world -->
<div>{{ 'HELLO WORLD' | lowerCase }}</div>
```

### Formatting

#### DatePipe
Formats a date value according to locale rules.

**Parameters:**
- `format`: The format to use. Can be `'short'`, `'full'`, `'time'`, or a specific format string supported by `Intl.DateTimeFormat`. Default is `'en-US'`.

```html
<!-- Usage -->
<div>{{ dateValue | date:'short' }}</div>
```

#### CurrencyPipe
Formats a number as currency.

**Parameters:**
- `currency`: The currency code (e.g., 'USD', 'EUR'). Default is 'USD'.
- `locale`: The locale to use for formatting. Default is 'en-US'.

```html
<!-- Output: $1,234.56 -->
<div>{{ 1234.56 | currency:'USD' }}</div>
```

### Async Handling

#### AsyncPipe
The `AsyncPipe` subscribes to an `Observable` or `Promise` and returns the latest value it has emitted. When a new value is emitted, the `AsyncPipe` marks the component to be checked for changes.

**Features:**
- Automatically subscribes to the observable/promise.
- Automatically unsubscribes when the component is destroyed to prevent memory leaks.
- Triggers change detection on new values.

```javascript
// In your component
this.data$ = this.myService.getData(); // Returns an Observable
```

```html
<!-- In your template -->
<div>{{ data$ | async }}</div>
```

## Creating Custom Pipes

You can create your own pipes by extending the `Pipe` class.

```javascript
import { Pipe } from '../../core/pipes/pipe.js';

export class MyCustomPipe extends Pipe {
    transform(value, ...args) {
        // Transform the value
        return modifiedValue;
    }
}
```

To use a pipe in a component, you must register it in the component's configuration:

```javascript
import { MyCustomPipe } from './my-custom.pipe.js';

export const MyComponent = Component.create({
    // ...
    pipes: {
        myCustom: MyCustomPipe
    },
    template: `<div>{{ value | myCustom }}</div>`
});
```
