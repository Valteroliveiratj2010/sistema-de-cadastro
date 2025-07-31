/**
 * UI Management Module
 * Handles UI components, modals, sidebar, and responsive behavior
 */

class UIManager {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.navbarToggler = null;
        this.currentSection = null;
        this.modals = new Map();
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupResponsive();
        this.initializeModals();
    }

    /**
     * Setup UI elements
     */
    setupElements() {
        this.sidebar = document.querySelector('.sidebar');
        this.overlay = document.querySelector('.overlay');
        this.navbarToggler = document.querySelector('.navbar-toggler');
        
        // Create overlay if it doesn't exist
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'overlay';
            document.body.appendChild(this.overlay);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        if (this.navbarToggler) {
            this.navbarToggler.addEventListener('click', () => this.toggleSidebar());
        }

        // Overlay click to close sidebar
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sidebar .nav-link')) {
                this.handleNavigation(e.target);
            }
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Setup responsive behavior
     */
    setupResponsive() {
        this.handleResize();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const isMobile = window.innerWidth <= 991.98;
        
        if (isMobile) {
            this.closeSidebar();
        } else {
            this.showSidebar();
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        if (this.sidebar.classList.contains('active')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    /**
     * Open sidebar
     */
    openSidebar() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close sidebar
     */
    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Show sidebar (desktop)
     */
    showSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Handle navigation
     */
    handleNavigation(link) {
        const section = link.getAttribute('data-section');
        if (section) {
            this.showSection(section);
            this.closeSidebar();
        }
    }

    /**
     * Show section
     */
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
            
            // Update active nav link
            this.updateActiveNavLink(sectionName);
            
            // Trigger section load event
            this.triggerSectionLoad(sectionName);
        }
    }

    /**
     * Update active navigation link
     */
    updateActiveNavLink(sectionName) {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Trigger section load event
     */
    triggerSectionLoad(sectionName) {
        const event = new CustomEvent('sectionLoad', {
            detail: { section: sectionName }
        });
        document.dispatchEvent(event);
    }

    /**
     * Initialize modals
     */
    initializeModals() {
        // Initialize Bootstrap modals
        if (typeof bootstrap !== 'undefined') {
            document.querySelectorAll('.modal').forEach(modalElement => {
                const modal = new bootstrap.Modal(modalElement);
                this.modals.set(modalElement.id, modal);
            });
        }
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.show();
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.hide();
        }
    }

    /**
     * Create modal
     */
    createModal(options = {}) {
        const {
            id = 'dynamicModal',
            title = 'Modal',
            content = '',
            size = 'modal-lg',
            buttons = []
        } = options;

        const modalHTML = `
            <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true">
                <div class="modal-dialog ${size}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${id}Label">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        ${buttons.length > 0 ? `
                            <div class="modal-footer">
                                ${buttons.map(btn => `
                                    <button type="button" class="btn ${btn.class || 'btn-secondary'}" 
                                            ${btn.dismiss ? 'data-bs-dismiss="modal"' : ''}
                                            ${btn.onclick ? `onclick="${btn.onclick}"` : ''}>
                                        ${btn.text}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if it exists
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize Bootstrap modal
        if (typeof bootstrap !== 'undefined') {
            const modalElement = document.getElementById(id);
            const modal = new bootstrap.Modal(modalElement);
            this.modals.set(id, modal);
            return modal;
        }

        return null;
    }

    /**
     * Show confirmation dialog
     */
    showConfirm(options = {}) {
        const {
            title = 'Confirmar',
            message = 'Tem certeza que deseja continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            confirmClass = 'btn-danger'
        } = options;

        return new Promise((resolve) => {
            const modal = this.createModal({
                id: 'confirmModal',
                title,
                content: `<p>${message}</p>`,
                size: 'modal-sm',
                buttons: [
                    {
                        text: cancelText,
                        class: 'btn-secondary',
                        dismiss: true,
                        onclick: 'window.ui.resolveConfirm(false)'
                    },
                    {
                        text: confirmText,
                        class: confirmClass,
                        dismiss: true,
                        onclick: 'window.ui.resolveConfirm(true)'
                    }
                ]
            });

            // Store resolve function
            this.confirmResolve = resolve;

            if (modal) {
                modal.show();
            }
        });
    }

    /**
     * Resolve confirmation dialog
     */
    resolveConfirm(result) {
        if (this.confirmResolve) {
            this.confirmResolve(result);
            this.confirmResolve = null;
        }
        this.hideModal('confirmModal');
    }

    /**
     * Show alert dialog
     */
    showAlert(options = {}) {
        const {
            title = 'Alerta',
            message = '',
            type = 'info',
            buttonText = 'OK'
        } = options;

        const alertClass = {
            success: 'text-success',
            error: 'text-danger',
            warning: 'text-warning',
            info: 'text-info'
        }[type] || 'text-info';

        const modal = this.createModal({
            id: 'alertModal',
            title,
            content: `<p class="${alertClass}">${message}</p>`,
            size: 'modal-sm',
            buttons: [
                {
                    text: buttonText,
                    class: 'btn-primary',
                    dismiss: true
                }
            ]
        });

        if (modal) {
            modal.show();
        }
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay(message = 'Carregando...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">${message}</span>
                </div>
                <p class="mt-2">${message}</p>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Update table icons visibility
     */
    updateTableIcons() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            const buttons = table.querySelectorAll('.btn');
            buttons.forEach(btn => {
                btn.style.display = 'inline-flex';
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            });
        });
    }

    /**
     * Setup table responsiveness
     */
    setupTableResponsiveness() {
        const tables = document.querySelectorAll('.table-responsive');
        tables.forEach(table => {
            const lastColumn = table.querySelector('th:last-child, td:last-child');
            if (lastColumn) {
                lastColumn.style.position = 'sticky';
                lastColumn.style.right = '0';
                lastColumn.style.background = 'var(--white-color)';
                lastColumn.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.1)';
                lastColumn.style.zIndex = '10';
            }
        });
    }

    /**
     * Animate element
     */
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Highlight element
     */
    highlightElement(element, duration = 2000) {
        const originalBackground = element.style.backgroundColor;
        element.style.backgroundColor = '#fff3cd';
        element.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
        }, duration);
    }

    /**
     * Update breadcrumb
     */
    updateBreadcrumb(items) {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = items.map((item, index) => {
                if (index === items.length - 1) {
                    return `<li class="breadcrumb-item active" aria-current="page">${item.text}</li>`;
                } else {
                    return `<li class="breadcrumb-item"><a href="${item.href || '#'}">${item.text}</a></li>`;
                }
            }).join('');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Use Toastify if available, otherwise fallback to alert
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: duration,
                gravity: "top",
                position: "right",
                style: {
                    background: this.getNotificationColor(type)
                },
                stopOnFocus: true
            }).showToast();
        } else {
            // Fallback to alert
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Show toast notification (alias for showNotification)
     */
    showToast(message, type = 'info', duration = 5000) {
        this.showNotification(message, type, duration);
    }

    /**
     * Get notification color based on type
     */
    getNotificationColor(type) {
        switch (type) {
            case 'success':
                return '#4CAF50'; // Green
            case 'error':
                return '#F44336'; // Red
            case 'warning':
                return '#FFC107'; // Amber
            case 'info':
            default:
                return '#2196F3'; // Blue
        }
    }
}

// Create and export UI instance
const ui = new UIManager();

// Export for use in other modules
window.ui = ui; 