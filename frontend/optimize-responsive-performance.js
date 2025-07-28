/**
 * Otimização de Performance da Responsividade
 * Baseado nos logs observados para melhorar a eficiência
 */

console.log('⚡ Otimizando performance da responsividade...');

class ResponsivePerformanceOptimizer {
    constructor() {
        this.resizeTimeout = null;
        this.lastBreakpoint = null;
        this.optimizationEnabled = true;
        this.debounceDelay = 250; // Reduzido de 250ms para melhor responsividade

        this.init();
    }

    init() {
        console.log('🚀 Inicializando otimizador de performance...');

        // Otimizar detecção de breakpoints
        this.optimizeBreakpointDetection();

        // Otimizar eventos de resize
        this.optimizeResizeEvents();

        // Otimizar sidebar
        this.optimizeSidebar();

        // Otimizar modais
        this.optimizeModals();

        // Adicionar métricas de performance
        this.addPerformanceMetrics();

        console.log('✅ Otimizador de performance inicializado');
    }

    optimizeBreakpointDetection() {
        // Cache de breakpoints para evitar recálculos
        this.breakpointCache = new Map();

        // Função otimizada para detectar breakpoint
        this.getOptimizedBreakpoint = (width) => {
            if (this.breakpointCache.has(width)) {
                return this.breakpointCache.get(width);
            }

            let breakpoint;
            if (width <= 480) breakpoint = 'xs';
            else if (width <= 576) breakpoint = 'sm';
            else if (width <= 768) breakpoint = 'md';
            else if (width <= 992) breakpoint = 'lg';
            else if (width <= 1200) breakpoint = 'xl';
            else breakpoint = 'xxl';

            this.breakpointCache.set(width, breakpoint);
            return breakpoint;
        };
    }

    optimizeResizeEvents() {
        // Substituir o debounce padrão por um mais eficiente
        const originalDebounce = window.responsiveManager?.debounce;

        if (window.responsiveManager) {
            window.responsiveManager.debounce = (func, wait) => {
                return (...args) => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(() => {
                        // Só executar se o breakpoint realmente mudou
                        const currentWidth = window.innerWidth;
                        const currentBreakpoint = this.getOptimizedBreakpoint(currentWidth);

                        if (currentBreakpoint !== this.lastBreakpoint) {
                            this.lastBreakpoint = currentBreakpoint;
                            func.apply(this, args);
                        }
                    }, wait || this.debounceDelay);
                };
            };
        }

        // Otimizar listener de resize
        window.addEventListener('resize', this.debounce(() => {
            if (this.optimizationEnabled) {
                this.handleOptimizedResize();
            }
        }, this.debounceDelay));
    }

    handleOptimizedResize() {
        const startTime = performance.now();

        // Atualizar apenas se necessário
        if (window.responsiveManager) {
            window.responsiveManager.forceUpdate();
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log apenas se demorar mais que 16ms (60fps)
        if (duration > 16) {
            console.log(`⚠️ Resize demorou ${duration.toFixed(2)}ms`);
        }
    }

    optimizeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Usar transform3d para aceleração de hardware
        sidebar.style.transform = 'translate3d(0, 0, 0)';
        sidebar.style.willChange = 'transform';

        // Otimizar transições
        sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        // Adicionar observer para otimizar quando não visível
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    entry.target.style.willChange = 'auto';
                } else {
                    entry.target.style.willChange = 'transform';
                }
            });
        });

        observer.observe(sidebar);
    }

    optimizeModals() {
        const modals = document.querySelectorAll('.modal');

        modals.forEach(modal => {
            const dialog = modal.querySelector('.modal-dialog');
            if (dialog) {
                // Otimizar animações de modal
                dialog.style.transform = 'translate3d(0, 0, 0)';
                dialog.style.willChange = 'transform, opacity';

                // Usar requestAnimationFrame para animações suaves
                if (modal.show && typeof modal.show === 'function') {
                    const originalShow = modal.show;
                    modal.show = function() {
                        requestAnimationFrame(() => {
                            originalShow.call(this);
                        });
                    };
                }
            }
        });
    }

    addPerformanceMetrics() {
        // Métricas de performance
        this.metrics = {
            resizeCount: 0,
            breakpointChanges: 0,
            averageResizeTime: 0,
            totalResizeTime: 0
        };

        // Monitorar performance
        setInterval(() => {
            if (this.metrics.resizeCount > 0) {
                console.log(`📊 Métricas de performance:`);
                console.log(`  - Resizes: ${this.metrics.resizeCount}`);
                console.log(`  - Mudanças de breakpoint: ${this.metrics.breakpointChanges}`);
                console.log(`  - Tempo médio: ${this.metrics.averageResizeTime.toFixed(2)}ms`);

                // Reset métricas
                this.metrics = {
                    resizeCount: 0,
                    breakpointChanges: 0,
                    averageResizeTime: 0,
                    totalResizeTime: 0
                };
            }
        }, 30000); // A cada 30 segundos
    }

    // Métodos públicos
    enableOptimization() {
        this.optimizationEnabled = true;
        console.log('✅ Otimizações habilitadas');
    }

    disableOptimization() {
        this.optimizationEnabled = false;
        console.log('⚠️ Otimizações desabilitadas');
    }

    getMetrics() {
        return this.metrics;
    }

    // Debounce otimizado
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                const startTime = performance.now();
                func.apply(this, args);
                const endTime = performance.now();

                // Atualizar métricas
                this.metrics.resizeCount++;
                this.metrics.totalResizeTime += (endTime - startTime);
                this.metrics.averageResizeTime = this.metrics.totalResizeTime / this.metrics.resizeCount;
            }, wait);
        };
    }
}

// Inicializar otimizador
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveOptimizer = new ResponsivePerformanceOptimizer();
});

// Função para testar otimizações
function testResponsiveOptimizations() {
    console.log('🧪 Testando otimizações de responsividade...');

    if (window.responsiveOptimizer) {
        console.log('✅ Otimizador encontrado');
        console.log('📊 Métricas:', window.responsiveOptimizer.getMetrics());

        // Testar debounce otimizado
        const testFunction = () => console.log('Teste de debounce');
        const debouncedTest = window.responsiveOptimizer.debounce(testFunction, 100);

        // Simular múltiplos resizes
        for (let i = 0; i < 5; i++) {
            debouncedTest();
        }

        console.log('✅ Teste de otimizações concluído');
    } else {
        console.log('❌ Otimizador não encontrado');
    }
}

// Exportar para uso global
window.testResponsiveOptimizations = testResponsiveOptimizations; 