/**
 * Melhorias para Ícones das Tabelas
 * Garante que os ícones de editar e excluir sejam sempre visíveis
 */

console.log('🎨 Aplicando melhorias para ícones das tabelas...');

class TableIconsImprover {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando TableIconsImprover...');
        
        // Aplicar melhorias imediatamente
        this.applyTableImprovements();
        
        // Observar mudanças no DOM
        this.setupObserver();
        
        // Aplicar melhorias em mudanças de tamanho
        this.setupResizeListener();
        
        console.log('✅ TableIconsImprover inicializado');
    }
    
    applyTableImprovements() {
        const tables = document.querySelectorAll('.table');
        
        tables.forEach(table => {
            this.improveTable(table);
        });
        
        console.log(`🎨 Melhorias aplicadas em ${tables.length} tabelas`);
    }
    
    improveTable(table) {
        // Garantir que a coluna de ações seja sempre visível
        const actionHeaders = table.querySelectorAll('th:last-child');
        const actionCells = table.querySelectorAll('td:last-child');
        
        actionHeaders.forEach(header => {
            header.style.display = 'table-cell';
            header.style.minWidth = '100px';
            header.style.width = '100px';
            header.style.textAlign = 'center';
            header.style.whiteSpace = 'nowrap';
        });
        
        actionCells.forEach(cell => {
            cell.style.display = 'table-cell';
            cell.style.minWidth = '100px';
            cell.style.width = '100px';
            cell.style.textAlign = 'center';
            cell.style.whiteSpace = 'nowrap';
        });
        
        // Melhorar botões de ação
        const actionButtons = table.querySelectorAll('.btn');
        
        actionButtons.forEach(button => {
            this.improveButton(button);
        });
        
        // Aplicar responsividade baseada no tamanho da tela
        this.applyResponsiveTable(table);
    }
    
    improveButton(button) {
        // Garantir tamanho mínimo para touch
        button.style.minWidth = '32px';
        button.style.height = '32px';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.margin = '0.125rem';
        button.style.transition = 'all 0.2s ease';
        
        // Melhorar ícones
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.fontSize = '0.875rem';
            icon.style.lineHeight = '1';
        }
        
        // Adicionar hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
        
        // Melhorar visibilidade dos botões outline
        if (button.classList.contains('btn-outline-primary') ||
            button.classList.contains('btn-outline-danger') ||
            button.classList.contains('btn-outline-info')) {
            button.style.borderWidth = '1.5px';
            button.style.fontWeight = '500';
        }
    }
    
    applyResponsiveTable(table) {
        const width = window.innerWidth;
        
        if (width <= 576) {
            // Mobile pequeno
            this.applyMobileTable(table);
        } else if (width <= 768) {
            // Mobile grande
            this.applyTabletTable(table);
        } else {
            // Desktop
            this.applyDesktopTable(table);
        }
    }
    
    applyMobileTable(table) {
        console.log('📱 Aplicando estilo mobile para tabela');
        
        // Ocultar colunas menos importantes
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        
        headers.forEach((header, index) => {
            if (index === 3) { // 4ª coluna (Telefone)
                header.style.display = 'none';
                rows.forEach(row => {
                    const cell = row.querySelectorAll('td')[index];
                    if (cell) cell.style.display = 'none';
                });
            }
        });
        
        // Garantir que ações sejam sempre visíveis
        const actionHeader = table.querySelector('th:last-child');
        const actionCells = table.querySelectorAll('td:last-child');
        
        if (actionHeader) {
            actionHeader.style.display = 'table-cell';
            actionHeader.style.minWidth = '80px';
            actionHeader.style.width = '80px';
        }
        
        actionCells.forEach(cell => {
            cell.style.display = 'table-cell';
            cell.style.minWidth = '80px';
            cell.style.width = '80px';
        });
        
        // Ajustar botões para mobile
        const buttons = table.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.style.minWidth = '28px';
            button.style.height = '28px';
            button.style.fontSize = '0.75rem';
            button.style.margin = '0.0625rem';
            button.style.padding = '0.25rem';
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.fontSize = '0.75rem';
            }
        });
    }
    
    applyTabletTable(table) {
        console.log('📱 Aplicando estilo tablet para tabela');
        
        // Ocultar colunas menos importantes
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        
        headers.forEach((header, index) => {
            if (index === 3) { // 4ª coluna (Telefone)
                header.style.display = 'none';
                rows.forEach(row => {
                    const cell = row.querySelectorAll('td')[index];
                    if (cell) cell.style.display = 'none';
                });
            }
        });
        
        // Garantir que ações sejam sempre visíveis
        const actionHeader = table.querySelector('th:last-child');
        const actionCells = table.querySelectorAll('td:last-child');
        
        if (actionHeader) {
            actionHeader.style.display = 'table-cell';
            actionHeader.style.minWidth = '90px';
            actionHeader.style.width = '90px';
        }
        
        actionCells.forEach(cell => {
            cell.style.display = 'table-cell';
            cell.style.minWidth = '90px';
            cell.style.width = '90px';
        });
        
        // Ajustar botões para tablet
        const buttons = table.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.style.minWidth = '30px';
            button.style.height = '30px';
            button.style.fontSize = '0.8rem';
            button.style.margin = '0.125rem';
            button.style.padding = '0.375rem';
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.fontSize = '0.8rem';
            }
        });
    }
    
    applyDesktopTable(table) {
        console.log('💻 Aplicando estilo desktop para tabela');
        
        // Mostrar todas as colunas
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        
        headers.forEach((header, index) => {
            header.style.display = 'table-cell';
            rows.forEach(row => {
                const cell = row.querySelectorAll('td')[index];
                if (cell) cell.style.display = 'table-cell';
            });
        });
        
        // Ajustar botões para desktop
        const buttons = table.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.style.minWidth = '32px';
            button.style.height = '32px';
            button.style.fontSize = '0.875rem';
            button.style.margin = '0.125rem';
            button.style.padding = '0.5rem';
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.fontSize = '0.875rem';
            }
        });
    }
    
    setupObserver() {
        // Observar mudanças no DOM para aplicar melhorias em novas tabelas
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('table')) {
                            this.improveTable(node);
                        } else {
                            const tables = node.querySelectorAll('.table');
                            tables.forEach(table => this.improveTable(table));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const tables = document.querySelectorAll('.table');
                tables.forEach(table => {
                    this.applyResponsiveTable(table);
                });
            }, 250);
        });
    }
    
    // Métodos públicos
    forceUpdate() {
        this.applyTableImprovements();
    }
    
    getTableStats() {
        const tables = document.querySelectorAll('.table');
        const buttons = document.querySelectorAll('.table .btn');
        const actionButtons = document.querySelectorAll('.table .btn-outline-primary, .table .btn-outline-danger, .table .btn-outline-info');
        
        return {
            tables: tables.length,
            totalButtons: buttons.length,
            actionButtons: actionButtons.length,
            screenWidth: window.innerWidth,
            breakpoint: this.getBreakpoint()
        };
    }
    
    getBreakpoint() {
        const width = window.innerWidth;
        if (width <= 576) return 'mobile';
        if (width <= 768) return 'tablet';
        return 'desktop';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.tableIconsImprover = new TableIconsImprover();
});

// Função para testar melhorias
function testTableIcons() {
    console.log('🧪 Testando melhorias dos ícones das tabelas...');
    
    if (window.tableIconsImprover) {
        console.log('✅ TableIconsImprover encontrado');
        console.log('📊 Métricas:', window.tableIconsImprover.getTableStats());
        
        // Forçar atualização
        window.tableIconsImprover.forceUpdate();
        
        console.log('✅ Teste de melhorias concluído');
    } else {
        console.log('❌ TableIconsImprover não encontrado');
    }
}

// Exportar para uso global
window.testTableIcons = testTableIcons; 