import { Service } from '@modernjs/core';

export class AuthService extends Service {
    constructor() {
        super({
            isAuthenticated: !!sessionStorage.getItem('auth_token'),
            user: sessionStorage.getItem('auth_user') ? JSON.parse(sessionStorage.getItem('auth_user')) : null
        });
    }

    login(username) {
        const token = 'fake-jwt-token-' + Math.random().toString(36).substr(2);
        const user = { name: username || 'User' };
        
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('auth_user', JSON.stringify(user));
        
        this.setState({
            isAuthenticated: true,
            user: user
        });
        
        return true;
    }

    logout() {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        
        this.setState({
            isAuthenticated: false,
            user: null
        });
    }

    get isAuthenticated() {
        return this.state.isAuthenticated;
    }
}
