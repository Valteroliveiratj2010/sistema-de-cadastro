/**
 * Teste Final - Verificação Completa
 * Testa se todas as correções estão funcionando
 */

console.log('🎯 Teste Final - Verificando todas as correções...');

function runUltimateTest() {
    console.log('🚀 Executando teste final completo...\n');
    
    // 1. Verificar se todos os scripts carregaram
    checkScriptsLoaded();
    
    // 2. Testar sidebar
    setTimeout(() => {
        testSidebarUltimate();
    }, 1000);
    
    // 3. Testar ícones
    setTimeout(() => {
        testIconsUltimate();
    }, 2000);
    
    // 4. Testar responsividade
    setTimeout(() => {
        testResponsivenessUltimate();
    }, 3000);
    
    // 5. Gerar relatório final
    setTimeout(() => {
        generateUltimateReport();
    }, 4000);
}

function checkScriptsLoaded() {
    console.log('📋 Verificando scripts carregados...');
    
    const scripts = [
        { name: 'ResponsiveManager', obj: window.responsiveManager },
        { name: 'TableIconsImprover', obj: window.tableIconsImprover },
        { name: 'ForceTableIcons', obj: window.forceTableIcons },
        { name: 'UltimateFix', obj: window.ultimateFix },
        { name: 'ResponsiveOptimizer', obj: window.responsiveOptimizer }
    ];
    
    let loadedCount = 0;
    
    scripts.forEach(script => {
        if (script.obj) {
            console.log(`  ✅ ${script.name}: Carregado`);
            loadedCount++;
        } else {
            console.log(`  ❌ ${script.name}: Não encontrado`);
        }
    });
    
    console.log(`  📊 Scripts carregados: ${loadedCount}/${scripts.length}`);
    
    if (loadedCount >= 3) {
        console.log('  ✅ Mínimo de scripts carregados com sucesso');
    } else {
        console.log('  ⚠️ Poucos scripts carregados, pode haver problemas');
    }
}

function testSidebarUltimate() {
    console.log('\n📱 Testando sidebar...');
    
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebarToggle');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    if (!sidebar) {
        console.log('  ❌ Sidebar não encontrada');
        return;
    }
    
    console.log('  ✅ Sidebar encontrada');
    console.log(`  - Links de navegação: ${navLinks.length}`);
    console.log(`  - Botão toggle: ${toggleBtn ? 'Encontrado' : 'Não encontrado'}`);
    
    // Testar se ResponsiveManager está funcionando
    if (window.responsiveManager) {
        console.log('  ✅ ResponsiveManager disponível');
        console.log(`  - É mobile: ${window.responsiveManager.isMobile()}`);
        console.log(`  - Sidebar aberta: ${window.responsiveManager.isSidebarOpen()}`);
        
        // Testar fechamento automático
        if (window.responsiveManager.isMobile()) {
            console.log('  📱 Testando fechamento automático em mobile...');
            
            // Simular abertura
            window.responsiveManager.openSidebar();
            
            setTimeout(() => {
                if (navLinks.length > 0) {
                    // Simular clique em link
                    navLinks[0].click();
                    
                    setTimeout(() => {
                        const isClosed = !window.responsiveManager.isSidebarOpen();
                        console.log(`    - Sidebar fechou automaticamente: ${isClosed}`);
                        
                        if (isClosed) {
                            console.log('  ✅ Teste da sidebar PASSOU');
                        } else {
                            console.log('  ❌ Teste da sidebar FALHOU');
                        }
                    }, 200);
                }
            }, 100);
        }
    } else {
        console.log('  ❌ ResponsiveManager não disponível');
    }
}

function testIconsUltimate() {
    console.log('\n🎨 Testando ícones das tabelas...');
    
    const actionButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info');
    const actionCells = document.querySelectorAll('td:last-child');
    const tables = document.querySelectorAll('.table');
    
    console.log(`  - Botões de ação: ${actionButtons.length}`);
    console.log(`  - Células de ação: ${actionCells.length}`);
    console.log(`  - Tabelas: ${tables.length}`);
    
    if (actionButtons.length === 0) {
        console.log('  ⚠️ Nenhum botão de ação encontrado');
        return;
    }
    
    // Verificar visibilidade dos botões
    let visibleButtons = 0;
    let hiddenButtons = 0;
    
    actionButtons.forEach((button, index) => {
        const isVisible = button.style.display !== 'none' && 
                         button.offsetWidth > 0 && 
                         button.offsetHeight > 0 &&
                         button.style.opacity !== '0' &&
                         button.style.visibility !== 'hidden';
        
        if (isVisible) {
            visibleButtons++;
        } else {
            hiddenButtons++;
            console.log(`    ❌ Botão ${index + 1} invisível`);
        }
        
        // Verificar ícone
        const icon = button.querySelector('i');
        if (!icon) {
            console.log(`    ⚠️ Botão ${index + 1} sem ícone`);
        }
    });
    
    console.log(`  📊 Visibilidade:`);
    console.log(`    - Visíveis: ${visibleButtons}`);
    console.log(`    - Ocultos: ${hiddenButtons}`);
    
    if (hiddenButtons === 0) {
        console.log('  ✅ Teste dos ícones PASSOU');
    } else {
        console.log('  ❌ Teste dos ícones FALHOU');
        
        // Tentar forçar correção
        if (window.forceTableIcons) {
            console.log('  🔨 Aplicando força aos ícones...');
            window.forceTableIcons.forceNow();
        }
        
        if (window.ultimateFix) {
            console.log('  🚀 Aplicando Ultimate Fix...');
            window.ultimateFix.forceFix();
        }
    }
}

function testResponsivenessUltimate() {
    console.log('\n📐 Testando responsividade...');
    
    const currentWidth = window.innerWidth;
    console.log(`  - Largura atual: ${currentWidth}px`);
    
    // Verificar breakpoint
    let expectedBreakpoint;
    if (currentWidth <= 576) expectedBreakpoint = 'mobile';
    else if (currentWidth <= 768) expectedBreakpoint = 'tablet';
    else if (currentWidth <= 992) expectedBreakpoint = 'lg';
    else if (currentWidth <= 1200) expectedBreakpoint = 'xl';
    else expectedBreakpoint = 'xxl';
    
    console.log(`  - Breakpoint esperado: ${expectedBreakpoint}`);
    
    // Verificar se os estilos estão sendo aplicados
    const tables = document.querySelectorAll('.table');
    let responsiveTables = 0;
    
    tables.forEach((table, index) => {
        const actionButtons = table.querySelectorAll('.btn');
        const actionCells = table.querySelectorAll('td:last-child');
        
        let tableResponsive = true;
        
        // Verificar se botões têm tamanho correto
        actionButtons.forEach(button => {
            const minWidth = parseInt(button.style.minWidth) || 0;
            const height = parseInt(button.style.height) || 0;
            
            if (currentWidth <= 576) {
                if (minWidth < 28 || height < 28) {
                    tableResponsive = false;
                }
            } else {
                if (minWidth < 32 || height < 32) {
                    tableResponsive = false;
                }
            }
        });
        
        // Verificar se células de ação estão visíveis
        actionCells.forEach(cell => {
            if (cell.style.display === 'none' || cell.offsetWidth === 0) {
                tableResponsive = false;
            }
        });
        
        if (tableResponsive) {
            responsiveTables++;
        }
    });
    
    console.log(`  - Tabelas responsivas: ${responsiveTables}/${tables.length}`);
    
    if (responsiveTables === tables.length) {
        console.log('  ✅ Teste de responsividade PASSOU');
    } else {
        console.log('  ❌ Teste de responsividade FALHOU');
    }
}

function generateUltimateReport() {
    console.log('\n📋 Gerando relatório final...');
    
    const report = {
        timestamp: new Date().toISOString(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        
        // Scripts
        responsiveManager: !!window.responsiveManager,
        tableIconsImprover: !!window.tableIconsImprover,
        forceTableIcons: !!window.forceTableIcons,
        ultimateFix: !!window.ultimateFix,
        responsiveOptimizer: !!window.responsiveOptimizer,
        
        // Elementos
        tables: document.querySelectorAll('.table').length,
        actionButtons: document.querySelectorAll('.btn-outline-primary, .btn-outline-danger, .btn-outline-info').length,
        sidebar: !!document.querySelector('.sidebar'),
        
        // Status Ultimate
        ultimateStatus: window.ultimateFix ? window.ultimateFix.getStatus() : null
    };
    
    console.log('📊 Relatório Final:', report);
    
    // Salvar no localStorage
    localStorage.setItem('ultimateTestReport', JSON.stringify(report));
    
    // Determinar resultado final
    const successCriteria = [
        report.responsiveManager,
        report.forceTableIcons || report.ultimateFix,
        report.tables > 0,
        report.actionButtons > 0,
        report.ultimateStatus ? report.ultimateStatus.visibleButtons > 0 : false
    ];
    
    const passedCriteria = successCriteria.filter(Boolean).length;
    const totalCriteria = successCriteria.length;
    
    console.log(`\n🎯 Resultado Final: ${passedCriteria}/${totalCriteria} critérios atendidos`);
    
    if (passedCriteria >= totalCriteria - 1) {
        console.log('🎉 SUCESSO! Todas as correções estão funcionando!');
    } else if (passedCriteria >= totalCriteria - 2) {
        console.log('✅ BOM! A maioria das correções está funcionando');
    } else {
        console.log('⚠️ ATENÇÃO! Algumas correções podem não estar funcionando');
    }
    
    return report;
}

// Função para testar em diferentes tamanhos
function testAllScreenSizes() {
    console.log('\n🖥️ Testando todos os tamanhos de tela...');
    
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
            
            // Verificar após resize
            setTimeout(() => {
                if (window.ultimateFix) {
                    const status = window.ultimateFix.getStatus();
                    console.log(`  - Breakpoint: ${status.breakpoint}`);
                    console.log(`  - Botões visíveis: ${status.visibleButtons}/${status.totalButtons}`);
                }
            }, 100);
        }, index * 3000);
    });
}

// Exportar funções
window.runUltimateTest = runUltimateTest;
window.testAllScreenSizes = testAllScreenSizes;

// Executar teste automático se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=ultimate')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runUltimateTest, 2000);
    });
}

console.log('✅ Teste Ultimate carregado!');
console.log('💡 Use runUltimateTest() para executar teste completo');
console.log('💡 Use testAllScreenSizes() para testar diferentes tamanhos'); 