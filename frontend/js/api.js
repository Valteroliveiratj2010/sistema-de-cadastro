/**
 * API Configuration and Utilities
 * Centralized API management for the application
 */

class ApiService {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.token = this.getStoredToken();
        this.setupInterceptors();
    }

    /**
     * Get the appropriate base URL based on environment
     */
    getBaseURL() {
        if (window.API_BASE_URL) {
            return window.API_BASE_URL;
        }

        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname === '';
        
        if (isLocalhost) {
            return 'http://localhost:3000/api';
        } else {
            return 'https://sistema-de-cadastro-production.up.railway.app/api';
        }
    }

    /**
     * Get stored authentication token
     */
    getStoredToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    /**
     * Setup request/response interceptors
     */
    setupInterceptors() {
        // Add request interceptor for authentication
        this.addRequestInterceptor();
        
        // Add response interceptor for error handling
        this.addResponseInterceptor();
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor() {
        // This will be called before each request
        this.beforeRequest = (config) => {
            if (this.token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        };
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor() {
        // This will be called after each response
        this.afterResponse = (response) => {
            return response;
        };

        this.handleError = (error) => {
            if (error.status === 401) {
                this.clearToken();
                window.location.href = '/login.html';
            }
            return Promise.reject(error);
        };
    }

    /**
     * Make HTTP request with authentication and error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Default headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authentication token if available
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        // Prepare request config
        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        // Apply request interceptor
        const interceptedConfig = this.beforeRequest ? this.beforeRequest(config) : config;

        try {
            const response = await fetch(url, interceptedConfig);
            
            // Apply response interceptor
            const interceptedResponse = this.afterResponse ? this.afterResponse(response) : response;

            if (!interceptedResponse.ok) {
                if (interceptedResponse.status === 401) {
                    this.clearToken();
                    window.location.href = '/login.html';
                    throw new Error('Unauthorized access');
                }
                throw new Error(`HTTP error! status: ${interceptedResponse.status}`);
            }

            // Verificar se a resposta tem conteúdo
            const contentType = interceptedResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await interceptedResponse.text();
                if (!text || text.trim() === '') {
                    // Resposta vazia - retornar objeto de sucesso
                    return { success: true, message: 'Operação realizada com sucesso' };
                }
                try {
                    const data = JSON.parse(text);
                    return data;
                } catch (parseError) {
                    console.error('Erro ao fazer parse da resposta JSON:', parseError);
                    throw new Error('Resposta inválida do servidor');
                }
            } else {
                // Resposta não é JSON - retornar texto ou objeto de sucesso
                const text = await interceptedResponse.text();
                if (text && text.trim() !== '') {
                    return { success: true, message: text };
                } else {
                    return { success: true, message: 'Operação realizada com sucesso' };
                }
            }
        } catch (error) {
            console.error('Request error:', error);
            return this.handleError ? this.handleError(error) : Promise.reject(error);
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Upload file
     */
    async upload(endpoint, formData) {
        const headers = {};
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return this.request(endpoint, {
            method: 'POST',
            headers,
            body: formData
        });
    }
}

// Create and export API instance
const api = new ApiService();

// Export for use in other modules
window.api = api; 