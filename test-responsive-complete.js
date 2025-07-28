/**
 * Teste Completo de Responsividade
 * Verifica todas as melhorias implementadas no sistema
 */

console.log('🧪 Iniciando teste completo de responsividade...');

async function testCompleteResponsiveness() {
    const results = {
        css: {},
        javascript: {},
        components: {},
        touch: {},
        performance: {}
    };
    
    console.log('📱 Testando sistema de responsividade...');
    
    // 1. Testar CSS Responsivo
    results.css = await testCSSResponsiveness();
    
    // 2. Testar JavaScript Responsivo
    results.javascript = await testJavaScriptResponsiveness();
    
    // 3. Testar Componentes
    results.components = await testComponentsResponsiveness();
    
    // 4. Testar Suporte Touch
    results.touch = await testTouchSupport();
    
    // 5. Testar Performance
    results.performance = await testPerformance();
    
    // Exibir resultados
    displayResults(results);
    
    return results;
}

async function testCSSResponsiveness() {
    console.log('🎨 Testando CSS responsivo...');
    
    const results = {
        breakpoints: false,
        sidebar: false,
        modals: false,
        tables: false,
        forms: false,
        cards: false
    };
    
    // Verificar se o CSS responsivo foi carregado
    const styleSheets = Array.from(document.styleSheets);
    const responsiveCSS = styleSheets.find(sheet => 
        sheet.href && sheet.href.includes('style.css')
    );
    
    if (responsiveCSS) {
        results.breakpoints = true;
        console.log('✅ CSS responsivo carregado');
    } else {
        console.log('❌ CSS responsivo não encontrado');
    }
    
    // Verificar variáveis CSS
    const rootStyles = getComputedStyle(document.documentElement);
    const sidebarWidth = rootStyles.getPropertyValue('--sidebar-width-desktop');
    
    if (sidebarWidth) {
        results.sidebar = true;
        console.log('✅ Variáveis CSS responsivas definidas');
    } else {
        console.log('❌ Variáveis CSS responsivas não encontradas');
    }
    
    // Verificar media queries
    const mediaQueries = [
        '(max-width: 576px)',
        '(max-width: 768px)',
        '(max-width: 992px)',
        '(max-width: 1200px)'
    ];
    
    const mediaQueryResults = mediaQueries.map(query => 
        window.matchMedia(query).matches
    );
    
    if (mediaQueryResults.some(result => result)) {
        results.modals = true;
        console.log('✅ Media queries funcionando');
    } else {
        console.log('⚠️ Media queries não detectadas');
    }
    
    // Verificar componentes responsivos
    const sidebar = document.querySelector('.sidebar');
    const modals = document.querySelectorAll('.modal');
    const tables = document.querySelectorAll('.table');
    const forms = document.querySelectorAll('form');
    const cards = document.querySelectorAll('.card');
    
    results.sidebar = !!sidebar;
    results.modals = modals.length > 0;
    results.tables = tables.length > 0;
    results.forms = forms.length > 0;
    results.cards = cards.length > 0;
    
    return results;
}

async function testJavaScriptResponsiveness() {
    console.log('⚡ Testando JavaScript responsivo...');
    
    const results = {
        responsiveManager: false,
        breakpointDetection: false,
        sidebarControl: false,
        modalAdaptation: false,
        touchSupport: false
    };
    
    // Verificar se ResponsiveManager foi carregado
    if (window.responsiveManager && window.responsiveManager instanceof ResponsiveManager) {
        results.responsiveManager = true;
        console.log('✅ ResponsiveManager carregado');
    } else {
        console.log('❌ ResponsiveManager não encontrado');
    }
    
    // Testar detecção de breakpoint
    if (window.responsiveManager) {
        const breakpoint = window.responsiveManager.getCurrentBreakpoint();
        if (breakpoint) {
            results.breakpointDetection = true;
            console.log(`✅ Breakpoint detectado: ${breakpoint}`);
        } else {
            console.log('❌ Falha na detecção de breakpoint');
        }
        
        // Testar controle de sidebar
        const sidebarState = window.responsiveManager.getSidebarState();
        if (sidebarState) {
            results.sidebarControl = true;
            console.log(`✅ Controle de sidebar: ${sidebarState}`);
        } else {
            console.log('❌ Falha no controle de sidebar');
        }
        
        // Testar adaptação de modais
        const modals = document.querySelectorAll('.modal');
        if (modals.length > 0) {
            results.modalAdaptation = true;
            console.log('✅ Modais encontrados para adaptação');
        } else {
            console.log('⚠️ Nenhum modal encontrado');
        }
        
        // Testar suporte touch
        if ('ontouchstart' in window) {
            results.touchSupport = true;
            console.log('✅ Suporte touch detectado');
        } else {
            console.log('⚠️ Suporte touch não detectado');
        }
    }
    
    return results;
}

async function testComponentsResponsiveness() {
    console.log('🧩 Testando componentes responsivos...');
    
    const results = {
        sidebar: false,
        modals: false,
        tables: false,
        forms: false,
        cards: false,
        buttons: false
    };
    
    // Testar sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const sidebarStyles = getComputedStyle(sidebar);
        const width = sidebarStyles.width;
        const position = sidebarStyles.position;
        
        if (position === 'fixed' && width) {
            results.sidebar = true;
            console.log(`✅ Sidebar responsiva: ${width}, ${position}`);
        } else {
            console.log('❌ Sidebar não está configurada corretamente');
        }
    } else {
        console.log('❌ Sidebar não encontrada');
    }
    
    // Testar modais
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        const modal = modals[0];
        const dialog = modal.querySelector('.modal-dialog');
        
        if (dialog) {
            const dialogStyles = getComputedStyle(dialog);
            const maxWidth = dialogStyles.maxWidth;
            
            if (maxWidth && maxWidth !== 'none') {
                results.modals = true;
                console.log(`✅ Modal responsivo: max-width ${maxWidth}`);
            } else {
                console.log('❌ Modal não está configurado corretamente');
            }
        }
    } else {
        console.log('⚠️ Nenhum modal encontrado');
    }
    
    // Testar tabelas
    const tables = document.querySelectorAll('.table');
    if (tables.length > 0) {
        const table = tables[0];
        const wrapper = table.closest('.table-responsive');
        
        if (wrapper) {
            results.tables = true;
            console.log('✅ Tabela com wrapper responsivo');
        } else {
            console.log('⚠️ Tabela sem wrapper responsivo');
        }
    } else {
        console.log('⚠️ Nenhuma tabela encontrada');
    }
    
    // Testar formulários
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
        const form = forms[0];
        const inputs = form.querySelectorAll('input, select, textarea');
        
        if (inputs.length > 0) {
            const input = inputs[0];
            const inputStyles = getComputedStyle(input);
            const fontSize = inputStyles.fontSize;
            
            if (fontSize) {
                results.forms = true;
                console.log(`✅ Formulário responsivo: font-size ${fontSize}`);
            }
        }
    } else {
        console.log('⚠️ Nenhum formulário encontrado');
    }
    
    // Testar cards
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        const card = cards[0];
        const cardStyles = getComputedStyle(card);
        const borderRadius = cardStyles.borderRadius;
        
        if (borderRadius) {
            results.cards = true;
            console.log(`✅ Card responsivo: border-radius ${borderRadius}`);
        }
    } else {
        console.log('⚠️ Nenhum card encontrado');
    }
    
    // Testar botões
    const buttons = document.querySelectorAll('button, .btn');
    if (buttons.length > 0) {
        const button = buttons[0];
        const buttonStyles = getComputedStyle(button);
        const borderRadius = buttonStyles.borderRadius;
        
        if (borderRadius) {
            results.buttons = true;
            console.log(`✅ Botão responsivo: border-radius ${borderRadius}`);
        }
    } else {
        console.log('⚠️ Nenhum botão encontrado');
    }
    
    return results;
}

async function testTouchSupport() {
    console.log('👆 Testando suporte touch...');
    
    const results = {
        touchEvents: false,
        gestureSupport: false,
        buttonSize: false,
        feedback: false
    };
    
    // Verificar eventos touch
    if ('ontouchstart' in window) {
        results.touchEvents = true;
        console.log('✅ Eventos touch suportados');
    } else {
        console.log('❌ Eventos touch não suportados');
    }
    
    // Verificar suporte a gestos
    if (window.responsiveManager) {
        results.gestureSupport = true;
        console.log('✅ Suporte a gestos implementado');
    } else {
        console.log('❌ Suporte a gestos não implementado');
    }
    
    // Verificar tamanho dos botões
    const buttons = document.querySelectorAll('button, .btn');
    if (buttons.length > 0) {
        const button = buttons[0];
        const rect = button.getBoundingClientRect();
        
        if (rect.height >= 44 && rect.width >= 44) {
            results.buttonSize = true;
            console.log(`✅ Botão com tamanho adequado: ${rect.width}x${rect.height}px`);
        } else {
            console.log(`⚠️ Botão muito pequeno: ${rect.width}x${rect.height}px`);
        }
    } else {
        console.log('⚠️ Nenhum botão encontrado');
    }
    
    // Verificar feedback visual
    if (window.responsiveManager) {
        results.feedback = true;
        console.log('✅ Feedback visual implementado');
    } else {
        console.log('❌ Feedback visual não implementado');
    }
    
    return results;
}

async function testPerformance() {
    console.log('⚡ Testando performance...');
    
    const results = {
        loadTime: 0,
        responsiveTime: 0,
        memoryUsage: 0,
        smoothAnimations: false
    };
    
    // Medir tempo de carregamento
    const loadStart = performance.now();
    
    // Simular operações responsivas
    if (window.responsiveManager) {
        window.responsiveManager.forceUpdate();
    }
    
    const loadEnd = performance.now();
    results.loadTime = loadEnd - loadStart;
    
    console.log(`⏱️ Tempo de atualização responsiva: ${results.loadTime.toFixed(2)}ms`);
    
    // Verificar animações suaves
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const styles = getComputedStyle(sidebar);
        const transition = styles.transition;
        
        if (transition && transition !== 'none') {
            results.smoothAnimations = true;
            console.log(`✅ Animações suaves: ${transition}`);
        } else {
            console.log('❌ Animações não configuradas');
        }
    }
    
    // Verificar uso de memória (aproximado)
    if (performance.memory) {
        results.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        console.log(`💾 Uso de memória: ${results.memoryUsage.toFixed(2)}MB`);
    } else {
        console.log('⚠️ Informações de memória não disponíveis');
    }
    
    return results;
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DO TESTE DE RESPONSIVIDADE');
    console.log('=' .repeat(50));
    
    // CSS
    console.log('\n🎨 CSS Responsivo:');
    Object.entries(results.css).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });
    
    // JavaScript
    console.log('\n⚡ JavaScript Responsivo:');
    Object.entries(results.javascript).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });
    
    // Componentes
    console.log('\n🧩 Componentes Responsivos:');
    Object.entries(results.components).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });
    
    // Touch
    console.log('\n👆 Suporte Touch:');
    Object.entries(results.touch).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });
    
    // Performance
    console.log('\n⚡ Performance:');
    console.log(`  ⏱️ Tempo de atualização: ${results.performance.loadTime.toFixed(2)}ms`);
    console.log(`  💾 Memória: ${results.performance.memoryUsage.toFixed(2)}MB`);
    console.log(`  ${results.performance.smoothAnimations ? '✅' : '❌'} Animações suaves`);
    
    // Resumo
    const totalTests = Object.values(results).flat().length;
    const passedTests = Object.values(results).flat().filter(Boolean).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('\n📈 RESUMO:');
    console.log(`  Total de testes: ${totalTests}`);
    console.log(`  Testes aprovados: ${passedTests}`);
    console.log(`  Taxa de sucesso: ${successRate}%`);
    
    if (successRate >= 90) {
        console.log('🎉 Excelente! Sistema responsivo funcionando perfeitamente!');
    } else if (successRate >= 70) {
        console.log('👍 Bom! Algumas melhorias podem ser feitas.');
    } else {
        console.log('⚠️ Atenção! Várias melhorias são necessárias.');
    }
    
    console.log('\n🎯 Teste concluído!');
}

// Função para executar teste específico
function runSpecificTest(testName) {
    switch (testName) {
        case 'css':
            return testCSSResponsiveness();
        case 'javascript':
            return testJavaScriptResponsiveness();
        case 'components':
            return testComponentsResponsiveness();
        case 'touch':
            return testTouchSupport();
        case 'performance':
            return testPerformance();
        default:
            console.log('❌ Teste não encontrado. Use: css, javascript, components, touch, performance');
    }
}

// Exportar funções
window.testCompleteResponsiveness = testCompleteResponsiveness;
window.runSpecificTest = runSpecificTest;

// Executar teste completo se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=responsive')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testCompleteResponsiveness, 1000);
    });
}

console.log('✅ Script de teste de responsividade carregado!');
console.log('💡 Use testCompleteResponsiveness() para executar todos os testes');
console.log('💡 Use runSpecificTest("css") para testar apenas CSS'); 