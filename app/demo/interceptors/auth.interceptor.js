export class AuthInterceptor {
    request(req) {
        // Simulate adding an Authorization header
        // In a real app, this would come from AuthService
        const token = sessionStorage.getItem('auth_token') || 'demo-token-123';
        
        // Clone headers to avoid mutation issues if shared
        const headers = { ...req.headers };
        headers['Authorization'] = `Bearer ${token}`;
        
        return { ...req, headers };
    }
}
