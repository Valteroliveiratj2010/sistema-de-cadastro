/**
 * Authentication Module
 * Handles user authentication, login, logout, and session management
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * Initialize authentication service
     */
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    /**
     * Check if user is authenticated
     */
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                api.setToken(token);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }

    /**
     * Setup authentication event listeners
     */
    setupEventListeners() {
        // Logout button event
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]') || 
                e.target.closest('[data-action="logout"]')) {
                e.preventDefault();
                this.logout();
            }
        });

        // Check authentication on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthStatus();
        });
    }

    /**
     * Login user
     */
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            
            if (response.success && response.token) {
                this.setSession(response.token, response.user);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error or server unavailable' };
        }
    }

    /**
     * Set user session
     */
    setSession(token, user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        api.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        
        // Update UI to reflect authenticated state
        this.updateUI();
    }

    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        api.clearToken();
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        // Update UI to reflect logged out state
        this.updateUI();
        
        // Redirect to login page
        window.location.href = '/login.html';
    }

    /**
     * Force clear all cached data and redirect to login
     */
    forceClearCache() {
        console.log('🧹 Limpando cache e forçando novo login...');
        this.currentUser = null;
        this.isAuthenticated = false;
        api.clearToken();
        localStorage.clear();
        sessionStorage.clear();
        
        // Update UI to reflect logged out state
        this.updateUI();
        
        // Redirect to login page
        window.location.href = '/login.html';
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    /**
     * Update UI based on authentication status
     */
    updateUI() {
        if (this.isAuthenticated && this.currentUser) {
            // Show user info in sidebar
            const userInfoElement = document.getElementById('userInfo');
            if (userInfoElement) {
                userInfoElement.innerHTML = `
                    <div class="user-info">
                        <div class="user-name">${this.currentUser.username}</div>
                        <div class="user-role">${this.getRoleDisplayName(this.currentUser.role)}</div>
                    </div>
                `;
            }

            // Show/hide elements based on user role
            this.updateRoleBasedUI();
        }
    }

    /**
     * Update UI elements based on user role
     */
    updateRoleBasedUI() {
        const role = this.currentUser?.role;

        // Admin can see everything
        if (role === 'admin') {
            this.showAllElements();
            return;
        }

        // Manager can see most things except user management
        if (role === 'gerente') {
            this.hideElement('[data-role="admin"]');
            this.showElement('[data-role="gerente"], [data-role="vendedor"]');
            return;
        }

        // Seller has limited access
        if (role === 'vendedor') {
            this.hideElement('[data-role="admin"], [data-role="gerente"]');
            this.showElement('[data-role="vendedor"]');
            return;
        }
    }

    /**
     * Show all elements
     */
    showAllElements() {
        document.querySelectorAll('[data-role]').forEach(el => {
            el.style.display = '';
        });
    }

    /**
     * Show elements with specific role
     */
    showElement(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = '';
        });
    }

    /**
     * Hide elements with specific role
     */
    hideElement(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Get display name for role
     */
    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'gerente': 'Gerente',
            'vendedor': 'Vendedor'
        };
        return roleNames[role] || role;
    }

    /**
     * Validate token on server
     */
    async validateToken() {
        try {
            const response = await api.get('/auth/validate');
            return response.valid;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    /**
     * Refresh user data
     */
    async refreshUserData() {
        try {
            const response = await api.get('/auth/profile');
            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem('user', JSON.stringify(response.user));
                this.updateUI();
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('Error changing password:', error);
            return { success: false, message: 'Error changing password' };
        }
    }

    /**
     * Check if user can access specific feature
     */
    canAccess(feature) {
        const permissions = {
            'dashboard': ['admin', 'gerente', 'vendedor'],
            'clients': ['admin', 'gerente', 'vendedor'],
            'sales': ['admin', 'gerente', 'vendedor'],
            'products': ['admin', 'gerente'],
            'purchases': ['admin', 'gerente'],
            'suppliers': ['admin', 'gerente'],
            'users': ['admin'],
            'reports': ['admin', 'gerente'],
            'settings': ['admin']
        };

        const allowedRoles = permissions[feature] || [];
        return this.hasAnyRole(allowedRoles);
    }
}

// Create and export auth instance
const auth = new AuthService();

// Export for use in other modules
window.auth = auth; 