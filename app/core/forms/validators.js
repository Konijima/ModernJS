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
}
