export class Validators {
    static required(control) {
        return (control.value !== null && control.value !== undefined && control.value !== '') ? null : { required: true };
    }
    
    static minLength(length) {
        return (control) => {
            return control.value && control.value.length >= length ? null : { minLength: { requiredLength: length, actualLength: control.value?.length } };
        };
    }
    
    static email(control) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(control.value) ? null : { email: true };
    }

    static maxLength(length) {
        return (control) => {
            // If no value, it's valid (use required for empty check)
            if (!control.value) return null;
            return control.value.length <= length ? null : { maxLength: { requiredLength: length, actualLength: control.value.length } };
        };
    }

    static alphanumeric(control) {
        // Allow empty (use required for empty check)
        if (!control.value) return null;
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        return alphanumericRegex.test(control.value) ? null : { alphanumeric: true };
    }

    static pattern(regex) {
        return (control) => {
            if (!control.value) return null;
            return regex.test(control.value) ? null : { pattern: { requiredPattern: regex.toString(), actualValue: control.value } };
        };
    }
}
