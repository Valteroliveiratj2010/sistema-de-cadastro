/**
 * Utilities Module
 * Common utility functions used throughout the application
 */

class Utils {
    /**
     * Get current date in YYYY-MM-DD format (timezone-safe)
     * This function solves the persistent date issue by using multiple fallback methods
     */
    static getCurrentDate() {
        const now = new Date();
        
        // Method 1: Use Intl.DateTimeFormat (most reliable for timezone)
        try {
            const formatter = new Intl.DateTimeFormat('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            const formatted = formatter.format(now);
            if (formatted && formatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
                console.log('📅 Data obtida via Intl.DateTimeFormat:', formatted);
                return formatted;
            }
        } catch (error) {
            console.warn('⚠️ Erro no Intl.DateTimeFormat, tentando método alternativo');
        }
        
        // Method 2: Manual calculation with timezone offset
        try {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const manualDate = `${year}-${month}-${day}`;
            console.log('📅 Data obtida via cálculo manual:', manualDate);
            return manualDate;
        } catch (error) {
            console.warn('⚠️ Erro no cálculo manual, tentando método UTC');
        }
        
        // Method 3: UTC with timezone offset correction
        try {
            const offset = now.getTimezoneOffset();
            const utcDate = new Date(now.getTime() - (offset * 60000));
            const utcFormatted = utcDate.toISOString().split('T')[0];
            console.log('📅 Data obtida via UTC com offset:', utcFormatted);
            return utcFormatted;
        } catch (error) {
            console.warn('⚠️ Erro no método UTC, usando fallback');
        }
        
        // Method 4: Fallback - use today's date as string
        const today = new Date();
        const fallbackDate = today.toISOString().split('T')[0];
        console.log('📅 Data obtida via fallback:', fallbackDate);
        return fallbackDate;
    }

    /**
     * Format currency
     */
    static formatCurrency(value, currency = 'BRL') {
        if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
        
        try {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: currency
            }).format(parseFloat(value));
        } catch (error) {
            console.error('❌ Erro ao formatar moeda:', value, error);
            return 'R$ 0,00';
        }
    }

    /**
     * Format date
     */
    static formatDate(date, options = {}) {
        if (!date || date === 'null' || date === 'undefined') return '';
        
        try {
            let dateObj;
            
            // Se a data já está no formato YYYY-MM-DD, vamos garantir que seja interpretada corretamente
            if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Garantir que seja interpretada como YYYY-MM-DD
                const [year, month, day] = date.split('-');
                dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
                dateObj = new Date(date);
            }
            
            // Verificar se a data é válida
            if (isNaN(dateObj.getTime())) {
                console.warn('⚠️ Data inválida recebida:', date);
                return '';
            }
            
            const defaultOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            };
            
            const mergedOptions = { ...defaultOptions, ...options };
            
            return new Intl.DateTimeFormat('pt-BR', mergedOptions).format(dateObj);
        } catch (error) {
            console.error('❌ Erro ao formatar data:', date, error);
            return '';
        }
    }

    /**
     * Format datetime
     */
    static formatDateTime(date) {
        if (!date) return '';
        
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    /**
     * Format phone number
     */
    static formatPhone(phone) {
        if (!phone) return '';
        
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Format based on length
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
        }
        
        return phone;
    }

    /**
     * Format CPF/CNPJ
     */
    static formatDocument(document) {
        if (!document) return '';
        
        const cleaned = document.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (cleaned.length === 14) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        return document;
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    /**
     * Show toast notification
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Check if Toastify is available
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: duration,
                gravity: "top",
                position: "right",
                backgroundColor: this.getToastColor(type),
                stopOnFocus: true
            }).showToast();
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    /**
     * Get toast color based on type
     */
    static getToastColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    /**
     * Show loading spinner
     */
    static showLoading(element = document.body) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        `;
        spinner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        element.appendChild(spinner);
        return spinner;
    }

    /**
     * Hide loading spinner
     */
    static hideLoading(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }

    /**
     * Validate email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate CPF
     */
    static isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Check for known invalid CPFs
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validate first digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        // Validate second digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    /**
     * Validate CNPJ
     */
    static isValidCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        
        if (cnpj.length !== 14) return false;
        
        // Check for known invalid CNPJs
        if (/^(\d)\1{13}$/.test(cnpj)) return false;
        
        // Validate first digit
        let sum = 0;
        let weight = 2;
        for (let i = 11; i >= 0; i--) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (digit1 !== parseInt(cnpj.charAt(12))) return false;
        
        // Validate second digit
        sum = 0;
        weight = 2;
        for (let i = 12; i >= 0; i--) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;
        if (digit2 !== parseInt(cnpj.charAt(13))) return false;
        
        return true;
    }

    /**
     * Sanitize HTML
     */
    static sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Escape HTML
     */
    static escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.error('Erro ao copiar para clipboard:', error);
            return false;
        }
    }

    /**
     * Download file
     */
    static downloadFile(data, filename, type = 'text/csv') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Get file extension
     */
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Sleep function
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry function with exponential backoff
     */
    static async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await this.sleep(delay);
            return this.retry(fn, retries - 1, delay * 2);
        }
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Merge objects
     */
    static merge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.merge(target, ...sources);
    }

    /**
     * Check if item is object
     */
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Get query parameters
     */
    static getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Set query parameters
     */
    static setQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        window.history.pushState({}, '', url);
    }

    /**
     * Remove query parameters
     */
    static removeQueryParams(keys) {
        const url = new URL(window.location);
        keys.forEach(key => {
            url.searchParams.delete(key);
        });
        window.history.pushState({}, '', url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
} 