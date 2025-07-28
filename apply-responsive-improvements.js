/**
 * Aplicar Melhorias de Responsividade
 * Script para otimizar a responsividade dos componentes existentes
 */

console.log('🚀 Aplicando melhorias de responsividade...');

function applyResponsiveImprovements() {
    // 1. Melhorar responsividade dos modais
    improveModalResponsiveness();
    
    // 2. Otimizar tabelas para mobile
    improveTableResponsiveness();
    
    // 3. Melhorar formulários
    improveFormResponsiveness();
    
    // 4. Otimizar cards e KPIs
    improveCardResponsiveness();
    
    // 5. Melhorar navegação
    improveNavigationResponsiveness();
    
    // 6. Adicionar funcionalidades touch
    addTouchSupport();
    
    console.log('✅ Melhorias de responsividade aplicadas!');
}

function improveModalResponsiveness() {
    console.log('📱 Melhorando responsividade dos modais...');
    
    const modals = ['purchaseModal', 'saleModal', 'clientModal', 'productModal', 'userModal', 'supplierModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const dialog = modal.querySelector('.modal-dialog');
            const body = modal.querySelector('.modal-body');
            const header = modal.querySelector('.modal-header');
            const footer = modal.querySelector('.modal-footer');
            
            if (dialog) {
                // Adicionar classes responsivas
                dialog.classList.add('modal-dialog-responsive');
                
                // Ajustar para mobile
                if (window.innerWidth <= 576) {
                    dialog.style.maxWidth = '100%';
                    dialog.style.width = '100%';
                    dialog.style.height = '100vh';
                    dialog.style.margin = '0';
                    dialog.style.borderRadius = '0';
                    
                    if (body) {
                        body.style.maxHeight = 'calc(100vh - 120px)';
                        body.style.overflowY = 'auto';
                        body.style.padding = '1rem';
                    }
                    
                    if (header) {
                        header.style.padding = '0.75rem 1rem';
                    }
                    
                    if (footer) {
                        footer.style.padding = '0.75rem 1rem';
                    }
                }
            }
        }
    });
}

function improveTableResponsiveness() {
    console.log('📊 Melhorando responsividade das tabelas...');
    
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (thead && tbody) {
            const headers = thead.querySelectorAll('th');
            const rows = tbody.querySelectorAll('tr');
            
            // Adicionar classes responsivas
            table.classList.add('table-responsive-custom');
            
            // Ocultar colunas menos importantes em mobile
            if (window.innerWidth <= 576) {
                headers.forEach((header, index) => {
                    if (index >= 3) { // Manter apenas ID, Nome e Ações
                        header.style.display = 'none';
                        rows.forEach(row => {
                            const cell = row.querySelectorAll('td')[index];
                            if (cell) cell.style.display = 'none';
                        });
                    }
                });
            } else if (window.innerWidth <= 768) {
                headers.forEach((header, index) => {
                    if (index >= 4) { // Manter ID, Nome, Status e Ações
                        header.style.display = 'none';
                        rows.forEach(row => {
                            const cell = row.querySelectorAll('td')[index];
                            if (cell) cell.style.display = 'none';
                        });
                    }
                });
            }
            
            // Melhorar espaçamento em mobile
            if (window.innerWidth <= 576) {
                headers.forEach(header => {
                    header.style.padding = '0.5rem 0.25rem';
                    header.style.fontSize = '0.8rem';
                });
                
                rows.forEach(row => {
                    row.querySelectorAll('td').forEach(cell => {
                        cell.style.padding = '0.5rem 0.25rem';
                        cell.style.fontSize = '0.8rem';
                    });
                });
            }
        }
    });
}

function improveFormResponsiveness() {
    console.log('📝 Melhorando responsividade dos formulários...');
    
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        const buttons = form.querySelectorAll('button[type="submit"], button[type="button"]');
        
        // Melhorar inputs em mobile
        inputs.forEach(input => {
            if (window.innerWidth <= 576) {
                input.style.fontSize = '16px'; // Evitar zoom no iOS
                input.style.padding = '0.75rem';
                input.style.marginBottom = '0.75rem';
            }
        });
        
        // Melhorar botões em mobile
        if (window.innerWidth <= 576) {
            buttons.forEach(button => {
                button.style.width = '100%';
                button.style.marginBottom = '0.5rem';
                button.style.padding = '0.875rem';
                button.style.fontSize = '1rem';
            });
        }
        
        // Adicionar classes responsivas
        form.classList.add('form-responsive');
    });
}

function improveCardResponsiveness() {
    console.log('🎨 Melhorando responsividade dos cards...');
    
    const cards = document.querySelectorAll('.card');
    const kpiCards = document.querySelectorAll('.kpi-card');
    
    cards.forEach(card => {
        if (window.innerWidth <= 576) {
            card.style.marginBottom = '1rem';
            
            const header = card.querySelector('.card-header');
            const body = card.querySelector('.card-body');
            
            if (header) {
                header.style.padding = '0.75rem';
                header.style.flexDirection = 'column';
                header.style.alignItems = 'flex-start';
                header.style.gap = '0.5rem';
            }
            
            if (body) {
                body.style.padding = '0.75rem';
            }
        }
    });
    
    kpiCards.forEach(kpiCard => {
        if (window.innerWidth <= 576) {
            kpiCard.style.padding = '1rem';
            
            const title = kpiCard.querySelector('h6');
            const value = kpiCard.querySelector('.fs-2');
            
            if (title) {
                title.style.fontSize = '0.875rem';
                title.style.marginBottom = '0.5rem';
            }
            
            if (value) {
                value.style.fontSize = '1.75rem !important';
            }
        }
    });
}

function improveNavigationResponsiveness() {
    console.log('🧭 Melhorando responsividade da navegação...');
    
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const toggleButton = document.querySelector('#sidebarToggle');
    
    if (sidebar) {
        if (window.innerWidth <= 576) {
            sidebar.style.padding = '1rem';
            
            navLinks.forEach(link => {
                link.style.padding = '0.75rem 0.875rem';
                link.style.fontSize = '0.95rem';
                link.style.marginBottom = '0.25rem';
                
                const icon = link.querySelector('i');
                if (icon) {
                    icon.style.fontSize = '1rem';
                    icon.style.marginRight = '0.625rem';
                }
            });
        }
    }
    
    if (toggleButton) {
        if (window.innerWidth <= 576) {
            toggleButton.style.top = '0.75rem';
            toggleButton.style.left = '0.75rem';
            toggleButton.style.padding = '0.375rem';
            toggleButton.style.fontSize = '1rem';
        }
    }
}

function addTouchSupport() {
    console.log('👆 Adicionando suporte touch...');
    
    // Melhorar scroll em mobile
    const scrollableElements = document.querySelectorAll('.modal-body, .table-responsive, .content-wrapper');
    
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowScrolling = 'touch';
    });
    
    // Adicionar suporte a swipe para fechar modais
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        let startY = 0;
        let currentY = 0;
        
        modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        modal.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Swipe para baixo para fechar modal
            if (deltaY > 100 && startY < 100) {
                const closeButton = modal.querySelector('[data-bs-dismiss="modal"]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        });
    });
    
    // Melhorar botões touch
    const buttons = document.querySelectorAll('button, .btn');
    
    buttons.forEach(button => {
        button.style.minHeight = '44px'; // Tamanho mínimo para touch
        button.style.minWidth = '44px';
        
        // Adicionar feedback visual
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = 'scale(1)';
        });
    });
}

// Aplicar melhorias quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    applyResponsiveImprovements();
    
    // Reaplicar em mudanças de tamanho
    window.addEventListener('resize', () => {
        setTimeout(applyResponsiveImprovements, 100);
    });
    
    // Reaplicar em mudanças de orientação
    window.addEventListener('orientationchange', () => {
        setTimeout(applyResponsiveImprovements, 200);
    });
});

// Função para testar responsividade
function testResponsiveness() {
    console.log('🧪 Testando responsividade...');
    
    const tests = [
        {
            name: 'Sidebar',
            test: () => {
                const sidebar = document.querySelector('.sidebar');
                return sidebar && sidebar.style.display !== 'none';
            }
        },
        {
            name: 'Modais',
            test: () => {
                const modals = document.querySelectorAll('.modal');
                return modals.length > 0;
            }
        },
        {
            name: 'Tabelas',
            test: () => {
                const tables = document.querySelectorAll('.table');
                return tables.length > 0;
            }
        },
        {
            name: 'Formulários',
            test: () => {
                const forms = document.querySelectorAll('form');
                return forms.length > 0;
            }
        },
        {
            name: 'Cards',
            test: () => {
                const cards = document.querySelectorAll('.card');
                return cards.length > 0;
            }
        }
    ];
    
    tests.forEach(test => {
        const result = test.test();
        console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'OK' : 'FALHOU'}`);
    });
    
    console.log('🎯 Teste de responsividade concluído!');
}

// Exportar funções para uso global
window.applyResponsiveImprovements = applyResponsiveImprovements;
window.testResponsiveness = testResponsiveness; 