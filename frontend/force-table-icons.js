/**
 * Força a Visibilidade dos Ícones das Tabelas
 * Script agressivo para garantir que os ícones sejam sempre visíveis
 */

console.log('🔨 Forçando visibilidade dos ícones das tabelas...');

class ForceTableIcons {
    constructor() {
        this.forceInterval = null;
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando ForceTableIcons...');
        
        // Aplicar força imediatamente
        this.forceIconsVisibility();
        
        // Aplicar força continuamente
        this.startForceInterval();
        
        // Observar mudanças no DOM
        this.setupObserver();
        
        console.log('✅ ForceTableIcons inicializado');
    }
    
    forceIconsVisibility() {
        console.log('🔨 Forçando visibilidade dos ícones...');
        
        // 1. Forçar todos os botões de ação
        const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        
        actionButtons.forEach((button, index) => {
            this.forceButtonVisibility(button, index);
        });
        
        // 2. Forçar todas as células de ação
        const actionCells = document.querySelectorAll('td:last-child');
        
        actionCells.forEach((cell, index) => {
            this.forceCellVisibility(cell, index);
        });
        
        // 3. Forçar todas as tabelas
        const tables = document.querySelectorAll('.table');
        
        tables.forEach((table, index) => {
            this.forceTableVisibility(table, index);
        });
        
        console.log(`🔨 Força aplicada: ${actionButtons.length} botões, ${actionCells.length} células, ${tables.length} tabelas`);
    }
    
    forceButtonVisibility(button, index) {
        // Forçar display
        button.style.setProperty('display', 'inline-flex', 'important');
        button.style.setProperty('align-items', 'center', 'important');
        button.style.setProperty('justify-content', 'center', 'important');
        button.style.setProperty('opacity', '1', 'important');
        button.style.setProperty('visibility', 'visible', 'important');
        button.style.setProperty('position', 'relative', 'important');
        button.style.setProperty('z-index', '10', 'important');
        
        // Forçar tamanho mínimo
        const isMobile = window.innerWidth <= 576;
        const minWidth = isMobile ? '28px' : '32px';
        const height = isMobile ? '28px' : '32px';
        
        button.style.setProperty('min-width', minWidth, 'important');
        button.style.setProperty('height', height, 'important');
        button.style.setProperty('width', 'auto', 'important');
        
        // Forçar padding e margin
        button.style.setProperty('padding', isMobile ? '0.25rem' : '0.375rem', 'important');
        button.style.setProperty('margin', isMobile ? '0.0625rem' : '0.125rem', 'important');
        
        // Forçar ícone
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('font-size', isMobile ? '0.75rem' : '0.875rem', 'important');
            icon.style.setProperty('line-height', '1', 'important');
        }
        
        // Forçar bordas
        button.style.setProperty('border-width', '1.5px', 'important');
        button.style.setProperty('font-weight', '500', 'important');
        
        // Remover qualquer overflow hidden
        button.style.setProperty('overflow', 'visible', 'important');
        button.style.setProperty('text-overflow', 'clip', 'important');
        button.style.setProperty('white-space', 'nowrap', 'important');
    }
    
    forceCellVisibility(cell, index) {
        // Forçar display
        cell.style.setProperty('display', 'table-cell', 'important');
        cell.style.setProperty('opacity', '1', 'important');
        cell.style.setProperty('visibility', 'visible', 'important');
        cell.style.setProperty('position', 'relative', 'important');
        
        // Forçar tamanho
        const isMobile = window.innerWidth <= 576;
        const minWidth = isMobile ? '90px' : '120px';
        
        cell.style.setProperty('min-width', minWidth, 'important');
        cell.style.setProperty('width', minWidth, 'important');
        cell.style.setProperty('max-width', 'none', 'important');
        
        // Forçar alinhamento
        cell.style.setProperty('text-align', 'center', 'important');
        cell.style.setProperty('vertical-align', 'middle', 'important');
        cell.style.setProperty('white-space', 'nowrap', 'important');
        
        // Remover qualquer overflow
        cell.style.setProperty('overflow', 'visible', 'important');
        cell.style.setProperty('text-overflow', 'clip', 'important');
    }
    
    forceTableVisibility(table, index) {
        // Forçar que a tabela seja responsiva
        table.style.setProperty('table-layout', 'auto', 'important');
        table.style.setProperty('width', '100%', 'important');
        
        // Forçar que todas as colunas sejam visíveis
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        
        headers.forEach((header, headerIndex) => {
            // Ocultar apenas a 4ª coluna em mobile (Telefone)
            if (window.innerWidth <= 576 && headerIndex === 3) {
                header.style.setProperty('display', 'none', 'important');
                rows.forEach(row => {
                    const cell = row.querySelectorAll('td')[headerIndex];
                    if (cell) {
                        cell.style.setProperty('display', 'none', 'important');
                    }
                });
            } else {
                header.style.setProperty('display', 'table-cell', 'important');
                rows.forEach(row => {
                    const cell = row.querySelectorAll('td')[headerIndex];
                    if (cell) {
                        cell.style.setProperty('display', 'table-cell', 'important');
                    }
                });
            }
        });
        
        // Garantir que a última coluna (ações) seja sempre visível
        const lastHeader = table.querySelector('th:last-child');
        const lastCells = table.querySelectorAll('td:last-child');
        
        if (lastHeader) {
            lastHeader.style.setProperty('display', 'table-cell', 'important');
            lastHeader.style.setProperty('min-width', '100px', 'important');
            lastHeader.style.setProperty('width', '100px', 'important');
        }
        
        lastCells.forEach(cell => {
            cell.style.setProperty('display', 'table-cell', 'important');
            cell.style.setProperty('min-width', '100px', 'important');
            cell.style.setProperty('width', '100px', 'important');
        });
    }
    
    startForceInterval() {
        // Aplicar força a cada 2 segundos
        this.forceInterval = setInterval(() => {
            this.forceIconsVisibility();
        }, 2000);
    }
    
    setupObserver() {
        // Observar mudanças no DOM
        const observer = new MutationObserver((mutations) => {
            let shouldForce = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && (
                                node.classList.contains('table') ||
                                node.classList.contains('btn') ||
                                node.querySelector('.table') ||
                                node.querySelector('.btn')
                            )) {
                                shouldForce = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldForce) {
                setTimeout(() => {
                    this.forceIconsVisibility();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Métodos públicos
    forceNow() {
        this.forceIconsVisibility();
    }
    
    stopForce() {
        if (this.forceInterval) {
            clearInterval(this.forceInterval);
            this.forceInterval = null;
        }
    }
    
    getStats() {
        const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        const actionCells = document.querySelectorAll('td:last-child');
        const tables = document.querySelectorAll('.table');
        
        return {
            actionButtons: actionButtons.length,
            actionCells: actionCells.length,
            tables: tables.length,
            screenWidth: window.innerWidth,
            isMobile: window.innerWidth <= 576
        };
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.forceTableIcons = new ForceTableIcons();
});

// Função para forçar imediatamente
function forceIconsNow() {
    if (window.forceTableIcons) {
        window.forceTableIcons.forceNow();
        console.log('🔨 Força aplicada imediatamente!');
    } else {
        console.log('❌ ForceTableIcons não encontrado');
    }
}

// Função para verificar status
function checkIconsStatus() {
    if (window.forceTableIcons) {
        const stats = window.forceTableIcons.getStats();
        console.log('📊 Status dos ícones:', stats);
        
        // Verificar botões visíveis
        const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        let visibleButtons = 0;
        
        actionButtons.forEach(button => {
            const isVisible = button.style.display !== 'none' && 
                             button.offsetWidth > 0 && 
                             button.offsetHeight > 0;
            if (isVisible) visibleButtons++;
        });
        
        console.log(`  - Botões visíveis: ${visibleButtons}/${actionButtons.length}`);
        
        return stats;
    } else {
        console.log('❌ ForceTableIcons não encontrado');
        return null;
    }
}

// Exportar para uso global
window.forceIconsNow = forceIconsNow;
window.checkIconsStatus = checkIconsStatus;

console.log('✅ Script de força dos ícones carregado!');
console.log('💡 Use forceIconsNow() para forçar imediatamente');
console.log('💡 Use checkIconsStatus() para verificar status'); 