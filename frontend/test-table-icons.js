/**
 * Teste Específico dos Ícones das Tabelas
 * Verifica se os ícones de editar e excluir estão sempre visíveis
 */

console.log('🧪 Testando visibilidade dos ícones das tabelas...');

function testTableIconsVisibility() {
    console.log('📊 Iniciando teste de visibilidade dos ícones...');
    
    const tables = document.querySelectorAll('.table');
    console.log(`📋 Encontradas ${tables.length} tabelas`);
    
    tables.forEach((table, tableIndex) => {
        console.log(`\n📋 Tabela ${tableIndex + 1}:`);
        
        const actionButtons = table.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        console.log(`  - Botões de ação encontrados: ${actionButtons.length}`);
        
        actionButtons.forEach((button, btnIndex) => {
            const buttonType = button.classList.contains('btn-outline-primary') ? 'Editar' :
                              button.classList.contains('btn-outline-danger') ? 'Excluir' :
                              button.classList.contains('btn-outline-info') ? 'Visualizar' : 'Desconhecido';
            
            const icon = button.querySelector('i');
            const isVisible = button.style.display !== 'none' && 
                             button.offsetWidth > 0 && 
                             button.offsetHeight > 0;
            
            console.log(`    ${btnIndex + 1}. Botão ${buttonType}:`);
            console.log(`       - Visível: ${isVisible}`);
            console.log(`       - Display: ${button.style.display || 'padrão'}`);
            console.log(`       - Ícone: ${icon ? icon.className : 'não encontrado'}`);
            console.log(`       - Tamanho: ${button.offsetWidth}x${button.offsetHeight}`);
            console.log(`       - Min-width: ${button.style.minWidth || 'não definido'}`);
            console.log(`       - Z-index: ${button.style.zIndex || 'padrão'}`);
            
            // Verificar se o botão está sendo cortado
            const rect = button.getBoundingClientRect();
            const isClipped = rect.width < 20 || rect.height < 20;
            console.log(`       - Cortado: ${isClipped}`);
        });
        
        // Verificar coluna de ações
        const actionHeader = table.querySelector('th:last-child');
        const actionCells = table.querySelectorAll('td:last-child');
        
        if (actionHeader) {
            console.log(`  - Cabeçalho de ações:`);
            console.log(`    - Display: ${actionHeader.style.display || 'padrão'}`);
            console.log(`    - Width: ${actionHeader.style.width || 'padrão'}`);
            console.log(`    - Min-width: ${actionHeader.style.minWidth || 'não definido'}`);
        }
        
        console.log(`  - Células de ações: ${actionCells.length}`);
        actionCells.forEach((cell, cellIndex) => {
            const isVisible = cell.style.display !== 'none' && 
                             cell.offsetWidth > 0;
            console.log(`    ${cellIndex + 1}. Célula: visível=${isVisible}, width=${cell.offsetWidth}px`);
        });
    });
}

function testTableResponsiveness() {
    console.log('\n📱 Testando responsividade das tabelas...');
    
    const currentWidth = window.innerWidth;
    console.log(`📐 Largura atual: ${currentWidth}px`);
    
    const tables = document.querySelectorAll('.table');
    
    tables.forEach((table, index) => {
        console.log(`\n📋 Tabela ${index + 1} - Responsividade:`);
        
        // Verificar se está aplicando estilos corretos para o breakpoint
        const actionButtons = table.querySelectorAll('.btn');
        const actionCells = table.querySelectorAll('td:last-child');
        
        if (currentWidth <= 576) {
            console.log('  📱 Breakpoint: Mobile pequeno (≤576px)');
            
            // Verificar se botões estão com tamanho correto
            actionButtons.forEach(button => {
                const minWidth = parseInt(button.style.minWidth) || 0;
                const height = parseInt(button.style.height) || 0;
                
                console.log(`    - Botão: min-width=${minWidth}px, height=${height}px`);
                
                if (minWidth >= 28 && height >= 28) {
                    console.log('      ✅ Tamanho correto para mobile');
                } else {
                    console.log('      ❌ Tamanho incorreto para mobile');
                }
            });
            
            // Verificar se coluna de ações está visível
            actionCells.forEach(cell => {
                const isVisible = cell.style.display !== 'none';
                const width = cell.offsetWidth;
                
                console.log(`    - Célula de ação: visível=${isVisible}, width=${width}px`);
                
                if (isVisible && width >= 80) {
                    console.log('      ✅ Coluna de ações visível e com largura adequada');
                } else {
                    console.log('      ❌ Coluna de ações com problema');
                }
            });
            
        } else if (currentWidth <= 768) {
            console.log('  📱 Breakpoint: Mobile grande (≤768px)');
            
            actionButtons.forEach(button => {
                const minWidth = parseInt(button.style.minWidth) || 0;
                const height = parseInt(button.style.height) || 0;
                
                console.log(`    - Botão: min-width=${minWidth}px, height=${height}px`);
                
                if (minWidth >= 30 && height >= 30) {
                    console.log('      ✅ Tamanho correto para tablet');
                } else {
                    console.log('      ❌ Tamanho incorreto para tablet');
                }
            });
            
        } else {
            console.log('  💻 Breakpoint: Desktop (>768px)');
            
            actionButtons.forEach(button => {
                const minWidth = parseInt(button.style.minWidth) || 0;
                const height = parseInt(button.style.height) || 0;
                
                console.log(`    - Botão: min-width=${minWidth}px, height=${height}px`);
                
                if (minWidth >= 32 && height >= 32) {
                    console.log('      ✅ Tamanho correto para desktop');
                } else {
                    console.log('      ❌ Tamanho incorreto para desktop');
                }
            });
        }
    });
}

function testTableIconsImprover() {
    console.log('\n🔧 Testando TableIconsImprover...');
    
    if (window.tableIconsImprover) {
        console.log('✅ TableIconsImprover encontrado');
        
        const stats = window.tableIconsImprover.getTableStats();
        console.log('📊 Estatísticas:', stats);
        
        // Forçar atualização
        window.tableIconsImprover.forceUpdate();
        console.log('✅ Atualização forçada aplicada');
        
        // Verificar novamente após atualização
        setTimeout(() => {
            testTableIconsVisibility();
        }, 100);
        
    } else {
        console.log('❌ TableIconsImprover não encontrado');
        console.log('💡 Verifique se o arquivo improve-table-icons.js foi carregado');
    }
}

function testSpecificTable(tableSelector = '.table') {
    console.log(`\n🎯 Testando tabela específica: ${tableSelector}`);
    
    const table = document.querySelector(tableSelector);
    if (!table) {
        console.log('❌ Tabela não encontrada');
        return;
    }
    
    console.log('✅ Tabela encontrada');
    
    // Verificar estrutura da tabela
    const headers = table.querySelectorAll('th');
    const rows = table.querySelectorAll('tr');
    const actionButtons = table.querySelectorAll('.btn');
    
    console.log(`📊 Estrutura:`);
    console.log(`  - Cabeçalhos: ${headers.length}`);
    console.log(`  - Linhas: ${rows.length}`);
    console.log(`  - Botões: ${actionButtons.length}`);
    
    // Verificar cada cabeçalho
    headers.forEach((header, index) => {
        const text = header.textContent.trim();
        const isVisible = header.style.display !== 'none';
        console.log(`  ${index + 1}. "${text}": visível=${isVisible}`);
    });
    
    // Verificar botões de ação
    actionButtons.forEach((button, index) => {
        const buttonType = button.classList.contains('btn-outline-primary') ? 'Editar' :
                          button.classList.contains('btn-outline-danger') ? 'Excluir' :
                          button.classList.contains('btn-outline-info') ? 'Visualizar' : 'Desconhecido';
        
        const icon = button.querySelector('i');
        const isVisible = button.style.display !== 'none' && 
                         button.offsetWidth > 0 && 
                         button.offsetHeight > 0;
        
        console.log(`  ${index + 1}. ${buttonType}: visível=${isVisible}, ícone=${icon ? icon.className : 'não encontrado'}`);
    });
}

function fixTableIcons() {
    console.log('\n🔧 Aplicando correções para ícones das tabelas...');
    
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        // Garantir que a coluna de ações seja sempre visível
        const actionHeader = table.querySelector('th:last-child');
        const actionCells = table.querySelectorAll('td:last-child');
        
        if (actionHeader) {
            actionHeader.style.display = 'table-cell';
            actionHeader.style.minWidth = '100px';
            actionHeader.style.width = '100px';
            actionHeader.style.textAlign = 'center';
            actionHeader.style.whiteSpace = 'nowrap';
        }
        
        actionCells.forEach(cell => {
            cell.style.display = 'table-cell';
            cell.style.minWidth = '100px';
            cell.style.width = '100px';
            cell.style.textAlign = 'center';
            cell.style.whiteSpace = 'nowrap';
        });
        
        // Melhorar botões
        const buttons = table.querySelectorAll('.btn');
        buttons.forEach(button => {
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
            
            // Melhorar visibilidade dos botões outline
            if (button.classList.contains('btn-outline-primary') ||
                button.classList.contains('btn-outline-danger') ||
                button.classList.contains('btn-outline-info')) {
                button.style.borderWidth = '1.5px';
                button.style.fontWeight = '500';
            }
        });
    });
    
    console.log(`✅ Correções aplicadas em ${tables.length} tabelas`);
}

// Função principal para executar todos os testes
function runAllTableIconTests() {
    console.log('🚀 Executando todos os testes dos ícones das tabelas...\n');
    
    testTableIconsVisibility();
    
    setTimeout(() => {
        testTableResponsiveness();
    }, 1000);
    
    setTimeout(() => {
        testTableIconsImprover();
    }, 2000);
    
    setTimeout(() => {
        fixTableIcons();
    }, 3000);
}

// Exportar funções para uso global
window.testTableIconsVisibility = testTableIconsVisibility;
window.testTableResponsiveness = testTableResponsiveness;
window.testTableIconsImprover = testTableIconsImprover;
window.testSpecificTable = testSpecificTable;
window.fixTableIcons = fixTableIcons;
window.runAllTableIconTests = runAllTableIconTests;

// Executar teste automático se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=table-icons')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTableIconTests, 1000);
    });
}

console.log('✅ Script de teste dos ícones das tabelas carregado!');
console.log('💡 Use runAllTableIconTests() para executar todos os testes'); 