import { Pipe } from './pipe.js';

export class UpperCasePipe extends Pipe {
    transform(value) {
        if (typeof value !== 'string') return value;
        return value.toUpperCase();
    }
}

export class LowerCasePipe extends Pipe {
    transform(value) {
        if (typeof value !== 'string') return value;
        return value.toLowerCase();
    }
}

export class DatePipe extends Pipe {
    transform(value, format = 'en-US') {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        
        // Simple implementation using Intl.DateTimeFormat
        // In a real app, we might parse 'format' string manually
        if (format === 'short') {
            return date.toLocaleDateString();
        } else if (format === 'full') {
            return date.toLocaleString();
        }
        
        return date.toLocaleDateString(format);
    }
}

export class CurrencyPipe extends Pipe {
    transform(value, currency = 'USD', locale = 'en-US') {
        if (isNaN(value)) return value;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    }
}
