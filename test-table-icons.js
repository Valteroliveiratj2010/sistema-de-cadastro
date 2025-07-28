/**
 * Teste Específico dos Ícones das Tabelas
 * Verifica se os ícones de editar e excluir estão sempre visíveis
 */

console.log('🧪 Testando visibilidade dos ícones das tabelas...');

function testTableIconsVisibility() {
    console.log('📊 Iniciando teste de visibilidade dos ícones...');
    
    // Verificar se estamos em mobile
    const isMobile = window.innerWidth <= 768;
    console.log(`📐 Tela atual: ${window.innerWidth}x${window.innerHeight} - Mobile: ${isMobile}`);
    
    // Encontrar todas as tabelas
    const tables = document.querySelectorAll('.table');
    console.log(`📋 Encontradas ${tables.length} tabelas`);
    
    if (tables.length === 0) {
        console.log('❌ Nenhuma tabela encontrada');
        return;
    }
    
    tables.forEach((table, index) => {
        console.log(`\n📋 Testando tabela ${index + 1}:`);
        
        // Verificar colunas
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');
        
        console.log(`  - Cabeçalhos: ${headers.length}`);
        console.log(`  - Linhas: ${rows.length}`);
        
        // Verificar se a coluna de ações existe
        const actionHeader = table.querySelector('th:last-child');
        if (actionHeader) {
            console.log(`  - Coluna de ações: ${actionHeader.textContent.trim()}`);
            console.log(`  - Visível: ${actionHeader.style.display !== 'none'}`);
        } else {
            console.log('  ❌ Coluna de ações não encontrada');
        }
        
        // Verificar botões de ação
        const actionButtons = table.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        console.log(`  - Botões de ação: ${actionButtons.length}`);
        
        actionButtons.forEach((button, btnIndex) => {
            const icon = button.querySelector('i');
            const buttonType = button.classList.contains('btn-outline-primary') ? 'editar' :
                             button.classList.contains('btn-outline-danger') ? 'excluir' :
                             button.classList.contains('btn-outline-info') ? 'visualizar' : 'outro';
            
            console.log(`    ${btnIndex + 1}. Botão ${buttonType}:`);
            console.log(`       - Visível: ${button.style.display !== 'none'}`);
            console.log(`       - Ícone: ${icon ? icon.className : 'não encontrado'}`);
            console.log(`       - Tamanho: ${button.style.minWidth || 'não definido'}`);
        });
        
        // Verificar se os ícones estão sendo ocultados por CSS
        const computedStyles = getComputedStyle(actionHeader);
        console.log(`  - Estilos computados da coluna de ações:`);
        console.log(`    - Display: ${computedStyles.display}`);
        console.log(`    - Width: ${computedStyles.width}`);
        console.log(`    - Min-width: ${computedStyles.minWidth}`);
    });
}

function testTableResponsiveness() {
    console.log('\n📱 Testando responsividade das tabelas...');
    
    const sizes = [
        { width: 1200, name: 'Desktop' },
        { width: 768, name: 'Tablet' },
        { width: 375, name: 'Mobile' }
    ];
    
    sizes.forEach((size, index) => {
        setTimeout(() => {
            console.log(`\n📱 Testando em ${size.name} (${size.width}px)...`);
            
            // Simular resize
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: size.width
            });
            
            // Disparar evento resize
            window.dispatchEvent(new Event('resize'));
            
            // Aguardar um pouco e verificar
            setTimeout(() => {
                const tables = document.querySelectorAll('.table');
                tables.forEach((table, tableIndex) => {
                    const actionHeader = table.querySelector('th:last-child');
                    const actionButtons = table.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
                    
                    console.log(`  Tabela ${tableIndex + 1}:`);
                    console.log(`    - Coluna ações visível: ${actionHeader && actionHeader.style.display !== 'none'}`);
                    console.log(`    - Botões visíveis: ${actionButtons.length}`);
                    
                    actionButtons.forEach(button => {
                        const isVisible = button.style.display !== 'none' && 
                                        button.offsetWidth > 0 && 
                                        button.offsetHeight > 0;
                        console.log(`    - Botão ${button.className}: ${isVisible ? '✅ visível' : '❌ oculto'}`);
                    });
                });
            }, 100);
        }, index * 1000);
    });
}

function testTableIconsImprover() {
    console.log('\n🎨 Testando TableIconsImprover...');
    
    if (window.tableIconsImprover) {
        console.log('✅ TableIconsImprover encontrado');
        
        const stats = window.tableIconsImprover.getTableStats();
        console.log('📊 Estatísticas:', stats);
        
        // Forçar atualização
        window.tableIconsImprover.forceUpdate();
        
        console.log('✅ TableIconsImprover testado');
    } else {
        console.log('❌ TableIconsImprover não encontrado');
    }
}

function testSpecificTable(tableSelector = '.table') {
    console.log(`\n🎯 Testando tabela específica: ${tableSelector}`);
    
    const table = document.querySelector(tableSelector);
    if (!table) {
        console.log('❌ Tabela não encontrada');
        return;
    }
    
    // Verificar estrutura da tabela
    const headers = table.querySelectorAll('th');
    const rows = table.querySelectorAll('tbody tr');
    
    console.log('📋 Estrutura da tabela:');
    headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header.textContent.trim()}`);
    });
    
    // Verificar botões de ação
    const actionButtons = table.querySelectorAll('.btn');
    console.log(`\n🔘 Botões encontrados: ${actionButtons.length}`);
    
    actionButtons.forEach((button, index) => {
        const icon = button.querySelector('i');
        const buttonText = button.getAttribute('title') || button.textContent.trim();
        
        console.log(`  ${index + 1}. ${buttonText}:`);
        console.log(`     - Classe: ${button.className}`);
        console.log(`     - Ícone: ${icon ? icon.className : 'não encontrado'}`);
        console.log(`     - Visível: ${button.offsetWidth > 0 && button.offsetHeight > 0}`);
        console.log(`     - Display: ${getComputedStyle(button).display}`);
        console.log(`     - Width: ${button.offsetWidth}px`);
        console.log(`     - Height: ${button.offsetHeight}px`);
    });
}

function fixTableIcons() {
    console.log('\n🔧 Aplicando correções para ícones das tabelas...');
    
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
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
        
        // Melhorar botões
        const buttons = table.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.style.minWidth = '32px';
            button.style.height = '32px';
            button.style.display = 'inline-flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.margin = '0.125rem';
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.fontSize = '0.875rem';
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
        testTableIconsImprover();
    }, 1000);
    
    setTimeout(() => {
        testSpecificTable();
    }, 2000);
    
    setTimeout(() => {
        testTableResponsiveness();
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