/**
 * ULTIMATE FIX - Solução Definitiva
 * Resolve todos os problemas de uma vez por todas
 */

console.log('🚀 ULTIMATE FIX - Iniciando solução definitiva...');

class UltimateFix {
    constructor() {
        this.fixesApplied = false;
        this.init();
    }
    
    init() {
        console.log('🔧 Inicializando UltimateFix...');
        
        // Aguardar um pouco para garantir que tudo carregou
        setTimeout(() => {
            this.applyAllFixes();
        }, 1000);
        
        // Aplicar novamente quando a página mudar
        this.setupPageChangeListener();
        
        console.log('✅ UltimateFix inicializado');
    }
    
    applyAllFixes() {
        if (this.fixesApplied) return;
        
        console.log('🔧 Aplicando todas as correções...');
        
        // 1. Corrigir sidebar
        this.fixSidebar();
        
        // 2. Corrigir ícones das tabelas
        this.fixTableIcons();
        
        // 3. Corrigir responsividade
        this.fixResponsiveness();
        
        // 4. Corrigir performance
        this.fixPerformance();
        
        // 5. Aplicar CSS crítico
        this.applyCriticalCSS();
        
        this.fixesApplied = true;
        console.log('✅ Todas as correções aplicadas!');
    }
    
    fixSidebar() {
        console.log('📱 Corrigindo sidebar...');
        
        // Garantir que ResponsiveManager existe
        if (!window.responsiveManager) {
            console.log('⚠️ ResponsiveManager não encontrado, criando...');
            this.createResponsiveManager();
        }
        
        // Forçar fechamento da sidebar em mobile após navegação
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                setTimeout(() => {
                    if (window.responsiveManager && window.responsiveManager.isMobile()) {
                        window.responsiveManager.closeSidebar();
                        console.log('📱 Sidebar fechada após navegação');
                    }
                }, 100);
            });
        });
    }
    
    createResponsiveManager() {
        // Criar ResponsiveManager básico se não existir
        window.responsiveManager = {
            isMobile: () => window.innerWidth <= 768,
            isTablet: () => window.innerWidth > 768 && window.innerWidth <= 992,
            closeSidebar: () => {
                const sidebar = document.querySelector('.sidebar');
                const overlay = document.querySelector('.overlay');
                if (sidebar) {
                    sidebar.classList.remove('active');
                    sidebar.style.transform = 'translateX(-100%)';
                }
                if (overlay) {
                    overlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            },
            openSidebar: () => {
                const sidebar = document.querySelector('.sidebar');
                const overlay = document.querySelector('.overlay');
                if (sidebar) {
                    sidebar.classList.add('active');
                    sidebar.style.transform = 'translateX(0)';
                }
                if (overlay) {
                    overlay.classList.add('active');
                }
                document.body.style.overflow = 'hidden';
            },
            isSidebarOpen: () => {
                const sidebar = document.querySelector('.sidebar');
                return sidebar && sidebar.classList.contains('active');
            }
        };
    }
    
    fixTableIcons() {
        console.log('🎨 Corrigindo ícones das tabelas...');
        
        // Aplicar força máxima aos ícones
        this.forceAllIcons();
        
        // Configurar observer para novos ícones
        this.setupIconsObserver();
    }
    
    forceAllIcons() {
        // Forçar todos os botões de ação
        const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        
        actionButtons.forEach(button => {
            this.forceButton(button);
        });
        
        // Forçar todas as células de ação
        const actionCells = document.querySelectorAll('td:last-child');
        
        actionCells.forEach(cell => {
            this.forceCell(cell);
        });
        
        console.log(`🔨 Forçados: ${actionButtons.length} botões, ${actionCells.length} células`);
    }
    
    forceButton(button) {
        // Aplicar estilos críticos
        const criticalStyles = {
            'display': 'inline-flex !important',
            'align-items': 'center !important',
            'justify-content': 'center !important',
            'opacity': '1 !important',
            'visibility': 'visible !important',
            'position': 'relative !important',
            'z-index': '999 !important',
            'min-width': window.innerWidth <= 576 ? '28px !important' : '32px !important',
            'height': window.innerWidth <= 576 ? '28px !important' : '32px !important',
            'padding': window.innerWidth <= 576 ? '0.25rem !important' : '0.375rem !important',
            'margin': window.innerWidth <= 576 ? '0.0625rem !important' : '0.125rem !important',
            'border-width': '1.5px !important',
            'font-weight': '500 !important',
            'overflow': 'visible !important',
            'white-space': 'nowrap !important'
        };
        
        Object.entries(criticalStyles).forEach(([property, value]) => {
            button.style.setProperty(property, value.replace(' !important', ''), 'important');
        });
        
        // Forçar ícone
        const icon = button.querySelector('i');
        if (icon) {
            const iconStyles = {
                'display': 'inline-block !important',
                'opacity': '1 !important',
                'visibility': 'visible !important',
                'font-size': window.innerWidth <= 576 ? '0.75rem !important' : '0.875rem !important',
                'line-height': '1 !important'
            };
            
            Object.entries(iconStyles).forEach(([property, value]) => {
                icon.style.setProperty(property, value.replace(' !important', ''), 'important');
            });
        }
    }
    
    forceCell(cell) {
        const cellStyles = {
            'display': 'table-cell !important',
            'opacity': '1 !important',
            'visibility': 'visible !important',
            'min-width': window.innerWidth <= 576 ? '90px !important' : '120px !important',
            'width': window.innerWidth <= 576 ? '90px !important' : '120px !important',
            'text-align': 'center !important',
            'vertical-align': 'middle !important',
            'white-space': 'nowrap !important',
            'overflow': 'visible !important'
        };
        
        Object.entries(cellStyles).forEach(([property, value]) => {
            cell.style.setProperty(property, value.replace(' !important', ''), 'important');
        });
    }
    
    setupIconsObserver() {
        const observer = new MutationObserver((mutations) => {
            let hasNewIcons = false;
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const buttons = node.querySelectorAll ? node.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info') : [];
                        const cells = node.querySelectorAll ? node.querySelectorAll('td:last-child') : [];
                        
                        if (buttons.length > 0 || cells.length > 0) {
                            hasNewIcons = true;
                        }
                    }
                });
            });
            
            if (hasNewIcons) {
                setTimeout(() => {
                    this.forceAllIcons();
                }, 50);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    fixResponsiveness() {
        console.log('📐 Corrigindo responsividade...');
        
        // Forçar breakpoints corretos
        const forceBreakpoint = () => {
            const width = window.innerWidth;
            let breakpoint = 'desktop';
            
            if (width <= 576) breakpoint = 'mobile';
            else if (width <= 768) breakpoint = 'tablet';
            else if (width <= 992) breakpoint = 'lg';
            else if (width <= 1200) breakpoint = 'xl';
            else breakpoint = 'xxl';
            
            document.body.setAttribute('data-breakpoint', breakpoint);
            console.log(`📐 Breakpoint forçado: ${breakpoint} (${width}px)`);
        };
        
        forceBreakpoint();
        window.addEventListener('resize', forceBreakpoint);
    }
    
    fixPerformance() {
        console.log('⚡ Corrigindo performance...');
        
        // Debounce resize events
        let resizeTimeout;
        const originalResize = window.onresize;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.forceAllIcons();
            }, 250);
        });
    }
    
    applyCriticalCSS() {
        console.log('🎨 Aplicando CSS crítico...');
        
        const criticalCSS = `
            /* CSS Crítico para Ícones */
            .table .btn-outline-primary,
            .table .btn-outline-danger,
            .table .btn-outline-info {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 1 !important;
                visibility: visible !important;
                position: relative !important;
                z-index: 999 !important;
                min-width: 32px !important;
                height: 32px !important;
                padding: 0.375rem !important;
                margin: 0.125rem !important;
                border-width: 1.5px !important;
                font-weight: 500 !important;
                overflow: visible !important;
                white-space: nowrap !important;
            }
            
            .table .btn-outline-primary i,
            .table .btn-outline-danger i,
            .table .btn-outline-info i {
                display: inline-block !important;
                opacity: 1 !important;
                visibility: visible !important;
                font-size: 0.875rem !important;
                line-height: 1 !important;
            }
            
            .table td:last-child {
                display: table-cell !important;
                opacity: 1 !important;
                visibility: visible !important;
                min-width: 120px !important;
                width: 120px !important;
                text-align: center !important;
                vertical-align: middle !important;
                white-space: nowrap !important;
                overflow: visible !important;
            }
            
            /* Mobile específico */
            @media (max-width: 576px) {
                .table .btn-outline-primary,
                .table .btn-outline-danger,
                .table .btn-outline-info {
                    min-width: 28px !important;
                    height: 28px !important;
                    padding: 0.25rem !important;
                    margin: 0.0625rem !important;
                }
                
                .table .btn-outline-primary i,
                .table .btn-outline-danger i,
                .table .btn-outline-info i {
                    font-size: 0.75rem !important;
                }
                
                .table td:last-child {
                    min-width: 90px !important;
                    width: 90px !important;
                }
            }
            
            /* Sidebar mobile */
            @media (max-width: 768px) {
                .sidebar {
                    width: 100% !important;
                    max-width: 100% !important;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .sidebar.active {
                    transform: translateX(0) !important;
                }
                
                .sidebar:not(.active) {
                    transform: translateX(-100%) !important;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }
    
    setupPageChangeListener() {
        // Observar mudanças na URL ou navegação
        let currentSection = '';
        
        const checkSectionChange = () => {
            const activeSection = document.querySelector('.content-section[style*="display: block"]');
            if (activeSection && activeSection.id !== currentSection) {
                currentSection = activeSection.id;
                console.log(`🔄 Seção mudou para: ${currentSection}`);
                
                // Aplicar correções na nova seção
                setTimeout(() => {
                    this.forceAllIcons();
                }, 100);
            }
        };
        
        setInterval(checkSectionChange, 500);
    }
    
    // Métodos públicos
    forceFix() {
        this.fixesApplied = false;
        this.applyAllFixes();
    }
    
    getStatus() {
        const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        const visibleButtons = Array.from(actionButtons).filter(btn => 
            btn.style.display !== 'none' && btn.offsetWidth > 0 && btn.offsetHeight > 0
        ).length;
        
        return {
            totalButtons: actionButtons.length,
            visibleButtons: visibleButtons,
            sidebarWorking: !!window.responsiveManager,
            fixesApplied: this.fixesApplied,
            screenWidth: window.innerWidth,
            breakpoint: document.body.getAttribute('data-breakpoint') || 'unknown'
        };
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.ultimateFix = new UltimateFix();
});

// Função para forçar correção
function forceUltimateFix() {
    if (window.ultimateFix) {
        window.ultimateFix.forceFix();
        console.log('🚀 Ultimate Fix forçado!');
    } else {
        console.log('❌ UltimateFix não encontrado');
    }
}

// Função para verificar status
function checkUltimateStatus() {
    if (window.ultimateFix) {
        const status = window.ultimateFix.getStatus();
        console.log('📊 Status Ultimate:', status);
        return status;
    } else {
        console.log('❌ UltimateFix não encontrado');
        return null;
    }
}

// Exportar para uso global
window.forceUltimateFix = forceUltimateFix;
window.checkUltimateStatus = checkUltimateStatus;

console.log('✅ Ultimate Fix carregado!');
console.log('💡 Use forceUltimateFix() para forçar correção');
console.log('💡 Use checkUltimateStatus() para verificar status'); 