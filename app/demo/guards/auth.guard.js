import { AuthService } from '../services/auth.service.js';
import { Router } from '../../core/router/router.js';

export class AuthGuard {
    static inject = [AuthService, Router];

    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
    }

    canActivate() {
        if (this.authService.isAuthenticated) {
            return true;
        }
        
        // Redirect to login if not authenticated
        this.router.navigate('/features/login');
        return false;
    }
}
