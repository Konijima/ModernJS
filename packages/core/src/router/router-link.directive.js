// ============================================================================
// Internal Dependencies
// ============================================================================
import { Directive } from '../directive/directive.js';
import { resolve } from '../di/di.js';
import { Router } from './router.js';

/**
 * RouterLink Directive
 * Provides declarative navigation for anchor elements
 * Usage: <a router-link="/path">Link</a>
 */
export class RouterLinkDirective extends Directive {
    onInit() {
        this.router = resolve(Router);
        
        this.clickHandler = (e) => {
            e.preventDefault();
            if (this.path) {
                this.router.navigate(this.path);
            }
        };

        this.element.addEventListener('click', this.clickHandler);
        this.element.classList.add('router-link');
        
        // Subscribe to route changes
        this.sub = this.router.subscribe(() => {
            this.updateActiveState();
        });
    }

    onUpdate(path) {
        this.path = path;
        this.element.href = path;
        this.updateActiveState();
    }

    updateActiveState() {
        if (!this.path) return;
        
        const currentPath = window.location.pathname;
        
        const isExact = currentPath === this.path;
        const isActive = isExact || (this.path !== '/' && currentPath.startsWith(this.path));

        if (isActive) {
            this.element.classList.add('router-link-active');
        } else {
            this.element.classList.remove('router-link-active');
        }

        if (isExact) {
            this.element.classList.add('router-link-exact-active');
            this.element.setAttribute('aria-current', 'page');
        } else {
            this.element.classList.remove('router-link-exact-active');
            this.element.removeAttribute('aria-current');
        }
    }

    onDestroy() {
        this.element.removeEventListener('click', this.clickHandler);
        if (this.sub) this.sub();
    }
}