import { Directive } from '../directive/directive.js';

/**
 * Directive to bind a FormControl to a form element.
 * Usage: <input [formControl]="control">
 */
export class FormControlDirective extends Directive {
    onInit() {
        this.inputHandler = (e) => {
            if (this.control) {
                this.control.setValue(e.target.value);
            }
        };
        
        this.blurHandler = () => {
            if (this.control) {
                this.control.markAsTouched();
                // Trigger component update to show validation errors
                if (this.component.update) {
                    this.component.update();
                }
            }
        };

        this.element.addEventListener('input', this.inputHandler);
        this.element.addEventListener('blur', this.blurHandler);
    }

    onUpdate(control) {
        if (!control) return;
        
        if (this.control !== control) {
            // Clean up old subscription if control instance changes
            if (this.sub) this.sub.unsubscribe();
            
            this.control = control;
            
            // Set initial value
            this.element.value = control.value;
            
            // Subscribe to control changes
            this.sub = control.valueChanges.subscribe(value => {
                // Only update if value is different to avoid cursor jumping
                if (this.element.value !== value) {
                    this.element.value = value;
                }
            });
        }
    }

    onDestroy() {
        this.element.removeEventListener('input', this.inputHandler);
        this.element.removeEventListener('blur', this.blurHandler);
        if (this.sub) this.sub.unsubscribe();
    }
}
