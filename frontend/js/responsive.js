/**
 * Sistema de Responsividade Avançada
 * Gerencia a adaptação do sistema para diferentes tamanhos de tela
 */

class ResponsiveManager {
    constructor() {
        this.currentBreakpoint = null;
        this.sidebarState = 'desktop';
        this.overlay = null;
        this.sidebar = null;
        this.mainContent = null;
        this.toggleButton = null;
        
        this.breakpoints = {
            xs: 480,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        
        this.init();
    }
    
    init() {
        console.log('📱 Inicializando ResponsiveManager...');
        
        this.setupElements();
        this.setupEventListeners();
        this.updateLayout();
        this.setupResizeObserver();
        
        // Aplicar classes iniciais
        this.applyBreakpointClasses();
        
        console.log('✅ ResponsiveManager inicializado');
    }
    
    setupElements() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButton = document.querySelector('#sidebarToggle');
        this.overlay = document.querySelector('#sidebar-overlay');
        
        if (!this.overlay) {
            this.createOverlay();
        }
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'sidebar-overlay';
        this.overlay.className = 'overlay';
        document.body.appendChild(this.overlay);
    }
    
    setupEventListeners() {
        // Toggle do sidebar
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Overlay para fechar sidebar
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }
        
        // Tecla ESC para fechar sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen()) {
                this.closeSidebar();
            }
        });
        
        // Swipe para fechar sidebar (mobile)
        this.setupSwipeGestures();
        
        // Resize da janela
        window.addEventListener('resize', this.debounce(() => {
            this.updateLayout();
        }, 250));
        
        // Orientação da tela
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateLayout(), 100);
        });
    }
    
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = false;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                isSwiping = true;
                
                // Swipe da esquerda para direita (abrir sidebar)
                if (deltaX > 0 && startX < 50 && this.isMobile() && !this.isSidebarOpen()) {
                    this.openSidebar();
                }
                // Swipe da direita para esquerda (fechar sidebar)
                else if (deltaX < 0 && this.isSidebarOpen()) {
                    this.closeSidebar();
                }
            }
        });
        
        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
            isSwiping = false;
        });
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(this.debounce(() => {
                this.updateLayout();
            }, 100));
            
            if (this.sidebar) {
                resizeObserver.observe(this.sidebar);
            }
            if (this.mainContent) {
                resizeObserver.observe(this.mainContent);
            }
        }
    }
    
    updateLayout() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const newBreakpoint = this.getBreakpoint(width);
        
        console.log(`📐 Tela: ${width}x${height} - Breakpoint: ${newBreakpoint}`);
        
        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;
            this.applyBreakpointClasses();
            this.updateSidebarLayout();
            this.updateModalLayouts();
            this.updateTableLayouts();
        }
        
        this.updateSidebarState();
    }
    
    getBreakpoint(width) {
        if (width < this.breakpoints.xs) return 'xs';
        if (width < this.breakpoints.sm) return 'sm';
        if (width < this.breakpoints.md) return 'md';
        if (width < this.breakpoints.lg) return 'lg';
        if (width < this.breakpoints.xl) return 'xl';
        if (width < this.breakpoints.xxl) return 'xxl';
        return 'xxl';
    }
    
    applyBreakpointClasses() {
        // Remover classes antigas
        document.body.classList.remove('xs-screen', 'sm-screen', 'md-screen', 'lg-screen', 'xl-screen', 'xxl-screen');
        
        // Adicionar nova classe
        document.body.classList.add(`${this.currentBreakpoint}-screen`);
        
        // Aplicar classes específicas
        this.applyResponsiveClasses();
    }
    
    applyResponsiveClasses() {
        const isMobile = this.isMobile();
        const isTablet = this.isTablet();
        const isDesktop = this.isDesktop();
        
        document.body.classList.toggle('mobile', isMobile);
        document.body.classList.toggle('tablet', isTablet);
        document.body.classList.toggle('desktop', isDesktop);
        
        // Classes para orientação
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
    }
    
    updateSidebarLayout() {
        if (!this.sidebar || !this.mainContent) return;
        
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.lg) {
            // Desktop: sidebar sempre visível
            this.sidebar.style.transform = 'translateX(0)';
            this.sidebar.style.width = '280px';
            this.mainContent.style.marginLeft = '280px';
            this.sidebarState = 'desktop';
            this.hideOverlay();
        } else if (width >= this.breakpoints.md) {
            // Tablet: sidebar colapsável
            this.sidebar.style.width = '240px';
            this.mainContent.style.marginLeft = '0';
            this.sidebarState = 'tablet';
            this.closeSidebar();
        } else {
            // Mobile: sidebar fullscreen
            this.sidebar.style.width = '100%';
            this.mainContent.style.marginLeft = '0';
            this.sidebarState = 'mobile';
            this.closeSidebar();
        }
    }
    
    updateSidebarState() {
        if (!this.toggleButton) return;
        
        const width = window.innerWidth;
        
        if (width < this.breakpoints.lg) {
            this.toggleButton.style.display = 'block';
        } else {
            this.toggleButton.style.display = 'none';
        }
    }
    
    updateModalLayouts() {
        const modals = ['purchaseModal', 'saleModal', 'clientModal', 'productModal', 'userModal', 'supplierModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                const dialog = modal.querySelector('.modal-dialog');
                const body = modal.querySelector('.modal-body');
                
                if (dialog && body) {
                    this.applyModalResponsiveness(dialog, body);
                }
            }
        });
    }
    
    applyModalResponsiveness(dialog, body) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (width <= this.breakpoints.sm) {
            // Mobile pequeno: modal fullscreen
            dialog.style.maxWidth = '100%';
            dialog.style.width = '100%';
            dialog.style.height = '100vh';
            dialog.style.margin = '0';
            dialog.style.borderRadius = '0';
            body.style.maxHeight = 'calc(100vh - 120px)';
            body.style.overflowY = 'auto';
        } else if (width <= this.breakpoints.md) {
            // Mobile grande: modal quase fullscreen
            dialog.style.maxWidth = '95%';
            dialog.style.width = '95%';
            dialog.style.margin = '0.5rem auto';
            body.style.maxHeight = '70vh';
        } else if (width <= this.breakpoints.lg) {
            // Tablet: modal médio
            dialog.style.maxWidth = '90%';
            dialog.style.width = '90%';
            dialog.style.margin = '1rem auto';
            body.style.maxHeight = '80vh';
        } else {
            // Desktop: modal normal
            dialog.style.maxWidth = '800px';
            dialog.style.width = 'auto';
            dialog.style.margin = '1.75rem auto';
            body.style.maxHeight = 'none';
        }
        
        // Ajustes para altura da tela
        if (height < 600) {
            body.style.maxHeight = '50vh';
            body.style.overflowY = 'auto';
        }
    }
    
    updateTableLayouts() {
        const tables = document.querySelectorAll('.table');
        
        tables.forEach(table => {
            this.applyTableResponsiveness(table);
        });
    }
    
    applyTableResponsiveness(table) {
        const width = window.innerWidth;
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        const headers = thead.querySelectorAll('th');
        const rows = tbody.querySelectorAll('tr');
        
        if (width <= this.breakpoints.sm) {
            // Mobile: ocultar colunas menos importantes
            headers.forEach((header, index) => {
                if (index >= 3) {
                    header.style.display = 'none';
                    rows.forEach(row => {
                        const cell = row.querySelectorAll('td')[index];
                        if (cell) cell.style.display = 'none';
                    });
                }
            });
        } else if (width <= this.breakpoints.md) {
            // Tablet: mostrar mais colunas
            headers.forEach((header, index) => {
                if (index >= 4) {
                    header.style.display = 'none';
                    rows.forEach(row => {
                        const cell = row.querySelectorAll('td')[index];
                        if (cell) cell.style.display = 'none';
                    });
                } else {
                    header.style.display = '';
                    rows.forEach(row => {
                        const cell = row.querySelectorAll('td')[index];
                        if (cell) cell.style.display = '';
                    });
                }
            });
        } else {
            // Desktop: mostrar todas as colunas
            headers.forEach(header => header.style.display = '');
            rows.forEach(row => {
                row.querySelectorAll('td').forEach(cell => {
                    cell.style.display = '';
                });
            });
        }
    }
    
    toggleSidebar() {
        if (this.isSidebarOpen()) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        if (!this.sidebar) return;
        
        // Garantir que a sidebar seja aberta corretamente
        this.sidebar.style.transform = 'translateX(0)';
        this.sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.showOverlay();
        
        // Adicionar classe active
        this.sidebar.classList.add('active');
        
        // Em mobile, prevenir scroll do body
        if (this.isMobile()) {
            document.body.style.overflow = 'hidden';
        }
        
        // Animar entrada
        this.sidebar.classList.add('slide-in');
        setTimeout(() => {
            this.sidebar.classList.remove('slide-in');
        }, 300);
        
        console.log('📱 Sidebar aberta');
    }
    
    closeSidebar() {
        if (!this.sidebar) return;
        
        // Garantir que a sidebar seja fechada corretamente
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.hideOverlay();
        
        // Remover classes que possam estar interferindo
        this.sidebar.classList.remove('active');
        
        // Em mobile, garantir que o overlay seja removido
        if (this.isMobile()) {
            document.body.style.overflow = '';
        }
        
        console.log('📱 Sidebar fechada');
    }
    
    isSidebarOpen() {
        if (!this.sidebar) return false;
        
        // Verificar tanto o transform quanto a classe active
        const transform = this.sidebar.style.transform;
        const hasActiveClass = this.sidebar.classList.contains('active');
        
        return transform === 'translateX(0px)' || hasActiveClass;
    }
    
    showOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
    }
    
    hideOverlay() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }
    
    isMobile() {
        return window.innerWidth < this.breakpoints.md;
    }
    
    isTablet() {
        return window.innerWidth >= this.breakpoints.md && window.innerWidth < this.breakpoints.lg;
    }
    
    isDesktop() {
        return window.innerWidth >= this.breakpoints.lg;
    }
    
    debounce(func, wait) {
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
    
    // Métodos públicos para uso externo
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
    
    getSidebarState() {
        return this.sidebarState;
    }
    
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
    
    // Método para forçar atualização
    forceUpdate() {
        this.updateLayout();
    }
    
    // Método específico para fechar sidebar após navegação
    closeSidebarAfterNavigation() {
        if (!this.sidebar) return;
        
        // Aguardar um pouco para a transição da página
        setTimeout(() => {
            this.closeSidebar();
            console.log('📱 Sidebar fechada após navegação');
        }, 100);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveManager = new ResponsiveManager();
});

// Exportar para uso global
window.ResponsiveManager = ResponsiveManager; 