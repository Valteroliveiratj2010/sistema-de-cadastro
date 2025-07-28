/**
 * Teste Final - Verificação Completa das Correções
 * Testa sidebar mobile, ícones das tabelas e responsividade geral
 */

console.log('🎯 Iniciando teste final das correções...');

function testFinalFixes() {
    console.log('🚀 Executando teste final completo...\n');
    
    // 1. Testar sidebar mobile
    testSidebarMobileFinal();
    
    // 2. Testar ícones das tabelas
    setTimeout(() => {
        testTableIconsFinal();
    }, 1000);
    
    // 3. Testar responsividade geral
    setTimeout(() => {
        testResponsivenessFinal();
    }, 2000);
    
    // 4. Testar telas específicas
    setTimeout(() => {
        testSpecificScreens();
    }, 3000);
}

function testSidebarMobileFinal() {
    console.log('📱 Testando sidebar mobile...');
    
    const isMobile = window.innerWidth <= 768;
    console.log(`  - Tela atual: ${window.innerWidth}px (Mobile: ${isMobile})`);
    
    if (!window.responsiveManager) {
        console.log('  ❌ ResponsiveManager não encontrado');
        return;
    }
    
    console.log('  ✅ ResponsiveManager encontrado');
    console.log(`  - Sidebar aberta: ${window.responsiveManager.isSidebarOpen()}`);
    console.log(`  - Breakpoint: ${window.responsiveManager.getCurrentBreakpoint()}`);
    
    // Testar se a sidebar fecha após clique em link
    if (isMobile) {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        if (navLinks.length > 0) {
            console.log(`  - Links encontrados: ${navLinks.length}`);
            
            // Simular abertura
            window.responsiveManager.openSidebar();
            
            setTimeout(() => {
                console.log(`    - Sidebar aberta após comando: ${window.responsiveManager.isSidebarOpen()}`);
                
                // Simular clique
                navLinks[0].click();
                
                setTimeout(() => {
                    const isClosed = !window.responsiveManager.isSidebarOpen();
                    console.log(`    - Sidebar fechada após clique: ${isClosed}`);
                    
                    if (isClosed) {
                        console.log('  ✅ Teste da sidebar PASSOU');
                    } else {
                        console.log('  ❌ Teste da sidebar FALHOU');
                    }
                }, 200);
            }, 100);
        }
    }
}

function testTableIconsFinal() {
    console.log('\n🎨 Testando ícones das tabelas...');
    
    const tables = document.querySelectorAll('.table');
    console.log(`  - Tabelas encontradas: ${tables.length}`);
    
    let totalButtons = 0;
    let visibleButtons = 0;
    let hiddenButtons = 0;
    
    tables.forEach((table, tableIndex) => {
        const buttons = table.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
        console.log(`  - Tabela ${tableIndex + 1}: ${buttons.length} botões de ação`);
        
        buttons.forEach((button, btnIndex) => {
            totalButtons++;
            
            const buttonType = button.classList.contains('btn-outline-primary') ? 'Editar' :
                              button.classList.contains('btn-outline-danger') ? 'Excluir' :
                              button.classList.contains('btn-outline-info') ? 'Visualizar' : 'Desconhecido';
            
            const isVisible = button.style.display !== 'none' && 
                             button.offsetWidth > 0 && 
                             button.offsetHeight > 0 &&
                             button.style.opacity !== '0' &&
                             button.style.visibility !== 'hidden';
            
            if (isVisible) {
                visibleButtons++;
            } else {
                hiddenButtons++;
                console.log(`    ❌ Botão ${buttonType} invisível na tabela ${tableIndex + 1}`);
            }
            
            // Verificar ícone
            const icon = button.querySelector('i');
            if (!icon) {
                console.log(`    ⚠️ Botão ${buttonType} sem ícone na tabela ${tableIndex + 1}`);
            }
        });
    });
    
    console.log(`  📊 Resumo:`);
    console.log(`    - Total de botões: ${totalButtons}`);
    console.log(`    - Botões visíveis: ${visibleButtons}`);
    console.log(`    - Botões ocultos: ${hiddenButtons}`);
    
    if (hiddenButtons === 0) {
        console.log('  ✅ Teste dos ícones PASSOU');
    } else {
        console.log('  ❌ Teste dos ícones FALHOU');
    }
}

function testResponsivenessFinal() {
    console.log('\n📐 Testando responsividade geral...');
    
    const currentWidth = window.innerWidth;
    console.log(`  - Largura atual: ${currentWidth}px`);
    
    // Verificar breakpoint
    let expectedBreakpoint;
    if (currentWidth <= 576) expectedBreakpoint = 'mobile';
    else if (currentWidth <= 768) expectedBreakpoint = 'tablet';
    else expectedBreakpoint = 'desktop';
    
    console.log(`  - Breakpoint esperado: ${expectedBreakpoint}`);
    
    // Verificar se os estilos estão sendo aplicados corretamente
    const tables = document.querySelectorAll('.table');
    tables.forEach((table, index) => {
        const actionButtons = table.querySelectorAll('.btn');
        const actionCells = table.querySelectorAll('td:last-child');
        
        console.log(`  - Tabela ${index + 1}:`);
        console.log(`    - Botões de ação: ${actionButtons.length}`);
        console.log(`    - Células de ação: ${actionCells.length}`);
        
        // Verificar se a coluna de ações está visível
        actionCells.forEach(cell => {
            const isVisible = cell.style.display !== 'none' && cell.offsetWidth > 0;
            console.log(`    - Célula de ação visível: ${isVisible} (width: ${cell.offsetWidth}px)`);
        });
    });
    
    console.log('  ✅ Teste de responsividade concluído');
}

function testSpecificScreens() {
    console.log('\n🎭 Testando telas específicas...');
    
    // Testar se as regras específicas para vendas e compras estão funcionando
    const salesSection = document.getElementById('salesSection');
    const purchasesSection = document.getElementById('purchasesSection');
    
    if (salesSection) {
        console.log('  📊 Seção de vendas encontrada');
        const salesButtons = salesSection.querySelectorAll('.table .btn');
        console.log(`    - Botões na seção de vendas: ${salesButtons.length}`);
        
        salesButtons.forEach((button, index) => {
            const isVisible = button.style.display !== 'none' && button.offsetWidth > 0;
            console.log(`    - Botão ${index + 1} visível: ${isVisible}`);
        });
    }
    
    if (purchasesSection) {
        console.log('  📦 Seção de compras encontrada');
        const purchaseButtons = purchasesSection.querySelectorAll('.table .btn');
        console.log(`    - Botões na seção de compras: ${purchaseButtons.length}`);
        
        purchaseButtons.forEach((button, index) => {
            const isVisible = button.style.display !== 'none' && button.offsetWidth > 0;
            console.log(`    - Botão ${index + 1} visível: ${isVisible}`);
        });
    }
    
    console.log('  ✅ Teste de telas específicas concluído');
}

function generateReport() {
    console.log('\n📋 Gerando relatório final...');
    
    const report = {
        timestamp: new Date().toISOString(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        responsiveManager: !!window.responsiveManager,
        tableIconsImprover: !!window.tableIconsImprover,
        tables: document.querySelectorAll('.table').length,
        actionButtons: document.querySelectorAll('.table .btn-outline-primary, .table .btn-outline-danger, .table .btn-outline-info').length,
        sidebar: !!document.querySelector('.sidebar'),
        salesSection: !!document.getElementById('salesSection'),
        purchasesSection: !!document.getElementById('purchasesSection')
    };
    
    console.log('📊 Relatório:', report);
    
    // Salvar relatório no localStorage para referência
    localStorage.setItem('responsiveTestReport', JSON.stringify(report));
    
    console.log('✅ Relatório salvo no localStorage');
}

// Função para simular diferentes tamanhos de tela
function testDifferentScreenSizes() {
    console.log('\n🖥️ Testando diferentes tamanhos de tela...');
    
    const sizes = [
        { width: 375, name: 'Mobile Pequeno' },
        { width: 576, name: 'Mobile Grande' },
        { width: 768, name: 'Tablet' },
        { width: 1024, name: 'Desktop Pequeno' },
        { width: 1200, name: 'Desktop Grande' }
    ];
    
    sizes.forEach((size, index) => {
        setTimeout(() => {
            console.log(`\n📱 Testando ${size.name} (${size.width}px)...`);
            
            // Simular resize
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: size.width
            });
            
            // Disparar evento resize
            window.dispatchEvent(new Event('resize'));
            
            // Verificar comportamento após resize
            setTimeout(() => {
                if (window.responsiveManager) {
                    console.log(`  - Breakpoint: ${window.responsiveManager.getCurrentBreakpoint()}`);
                    console.log(`  - É mobile: ${window.responsiveManager.isMobile()}`);
                }
                
                // Verificar botões
                const buttons = document.querySelectorAll('.table .btn');
                const visibleButtons = Array.from(buttons).filter(btn => 
                    btn.style.display !== 'none' && btn.offsetWidth > 0
                ).length;
                
                console.log(`  - Botões visíveis: ${visibleButtons}/${buttons.length}`);
            }, 100);
        }, index * 2000);
    });
}

// Exportar funções para uso global
window.testFinalFixes = testFinalFixes;
window.generateReport = generateReport;
window.testDifferentScreenSizes = testDifferentScreenSizes;

// Executar teste automático se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=final')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testFinalFixes, 1000);
    });
}

console.log('✅ Script de teste final carregado!');
console.log('💡 Use testFinalFixes() para executar todos os testes');
console.log('💡 Use generateReport() para gerar relatório');
console.log('💡 Use testDifferentScreenSizes() para testar diferentes tamanhos'); 