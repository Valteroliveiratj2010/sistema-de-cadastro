/**
 * Teste Específico da Sidebar em Mobile
 * Verifica se a sidebar se fecha automaticamente após cliques nos links
 */

console.log('🧪 Testando comportamento da sidebar em mobile...');

function testSidebarMobileBehavior() {
    console.log('📱 Iniciando testes da sidebar em mobile...');
    
    // Verificar se estamos em mobile
    const isMobile = window.innerWidth <= 768;
    console.log(`📐 Tela atual: ${window.innerWidth}x${window.innerHeight} - Mobile: ${isMobile}`);
    
    if (!isMobile) {
        console.log('⚠️ Este teste é específico para mobile. Redimensione a janela para <768px');
        return;
    }
    
    // Verificar se ResponsiveManager está disponível
    if (!window.responsiveManager) {
        console.log('❌ ResponsiveManager não encontrado');
        return;
    }
    
    console.log('✅ ResponsiveManager encontrado');
    
    // Testar métodos do ResponsiveManager
    console.log('📊 Status atual:');
    console.log(`  - Breakpoint: ${window.responsiveManager.getCurrentBreakpoint()}`);
    console.log(`  - É mobile: ${window.responsiveManager.isMobile()}`);
    console.log(`  - É tablet: ${window.responsiveManager.isTablet()}`);
    console.log(`  - Sidebar aberta: ${window.responsiveManager.isSidebarOpen()}`);
    
    // Simular abertura da sidebar
    console.log('\n🔄 Testando abertura da sidebar...');
    window.responsiveManager.openSidebar();
    
    setTimeout(() => {
        console.log(`  - Sidebar aberta após 100ms: ${window.responsiveManager.isSidebarOpen()}`);
        
        // Simular clique em um link da sidebar
        console.log('\n🖱️ Simulando clique em link da sidebar...');
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        
        if (navLinks.length > 0) {
            const firstLink = navLinks[0];
            console.log(`  - Link encontrado: ${firstLink.textContent.trim()}`);
            
            // Simular clique
            firstLink.click();
            
            setTimeout(() => {
                console.log(`  - Sidebar fechada após clique: ${!window.responsiveManager.isSidebarOpen()}`);
                
                if (!window.responsiveManager.isSidebarOpen()) {
                    console.log('✅ Teste PASSOU: Sidebar fechou automaticamente após clique');
                } else {
                    console.log('❌ Teste FALHOU: Sidebar não fechou automaticamente');
                }
            }, 200);
        } else {
            console.log('❌ Nenhum link da sidebar encontrado');
        }
    }, 100);
}

function testSidebarNavigation() {
    console.log('\n🧭 Testando navegação da sidebar...');
    
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    console.log(`📋 Encontrados ${navLinks.length} links na sidebar`);
    
    navLinks.forEach((link, index) => {
        const sectionId = link.dataset.section;
        const linkText = link.textContent.trim();
        console.log(`  ${index + 1}. ${linkText} -> ${sectionId}`);
    });
    
    // Testar se os event listeners estão funcionando
    console.log('\n🎯 Verificando event listeners...');
    
    const testLink = navLinks.find(link => link.dataset.section === 'dashboardSection');
    if (testLink) {
        console.log('✅ Link do dashboard encontrado');
        
        // Verificar se tem event listener
        const hasClickListener = testLink.onclick || 
                                testLink._listeners || 
                                testLink.getAttribute('data-has-listener');
        
        console.log(`  - Tem event listener: ${!!hasClickListener}`);
    } else {
        console.log('❌ Link do dashboard não encontrado');
    }
}

function testSidebarResponsiveness() {
    console.log('\n📱 Testando responsividade da sidebar...');
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.log('❌ Sidebar não encontrada');
        return;
    }
    
    const styles = getComputedStyle(sidebar);
    console.log('📊 Estilos da sidebar:');
    console.log(`  - Width: ${styles.width}`);
    console.log(`  - Transform: ${styles.transform}`);
    console.log(`  - Z-index: ${styles.zIndex}`);
    console.log(`  - Position: ${styles.position}`);
    
    // Verificar se está em mobile
    if (window.innerWidth <= 768) {
        console.log('📱 Modo mobile detectado');
        
        if (styles.width === '100%' || styles.width === '100vw') {
            console.log('✅ Sidebar com largura correta para mobile');
        } else {
            console.log('❌ Sidebar não está com largura correta para mobile');
        }
        
        if (styles.transform === 'translateX(-100%)' || styles.transform === 'matrix(1, 0, 0, 1, -100, 0)') {
            console.log('✅ Sidebar fechada corretamente');
        } else {
            console.log('❌ Sidebar não está fechada corretamente');
        }
    }
}

function testSidebarToggle() {
    console.log('\n🔄 Testando toggle da sidebar...');
    
    if (!window.responsiveManager) {
        console.log('❌ ResponsiveManager não disponível');
        return;
    }
    
    // Testar toggle
    console.log('🔄 Testando toggle...');
    window.responsiveManager.toggleSidebar();
    
    setTimeout(() => {
        const isOpen = window.responsiveManager.isSidebarOpen();
        console.log(`  - Sidebar aberta após toggle: ${isOpen}`);
        
        // Fechar novamente
        setTimeout(() => {
            window.responsiveManager.toggleSidebar();
            
            setTimeout(() => {
                const isClosed = !window.responsiveManager.isSidebarOpen();
                console.log(`  - Sidebar fechada após segundo toggle: ${isClosed}`);
                
                if (isClosed) {
                    console.log('✅ Toggle funcionando corretamente');
                } else {
                    console.log('❌ Toggle não funcionando corretamente');
                }
            }, 100);
        }, 500);
    }, 100);
}

// Função principal para executar todos os testes
function runAllSidebarTests() {
    console.log('🚀 Executando todos os testes da sidebar...\n');
    
    testSidebarMobileBehavior();
    
    setTimeout(() => {
        testSidebarNavigation();
    }, 1000);
    
    setTimeout(() => {
        testSidebarResponsiveness();
    }, 2000);
    
    setTimeout(() => {
        testSidebarToggle();
    }, 3000);
}

// Função para simular resize e testar comportamento
function testSidebarOnResize() {
    console.log('\n📐 Testando comportamento da sidebar em diferentes tamanhos...');
    
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
            
            // Verificar comportamento
            setTimeout(() => {
                if (window.responsiveManager) {
                    console.log(`  - Breakpoint: ${window.responsiveManager.getCurrentBreakpoint()}`);
                    console.log(`  - É mobile: ${window.responsiveManager.isMobile()}`);
                    console.log(`  - Sidebar aberta: ${window.responsiveManager.isSidebarOpen()}`);
                }
            }, 100);
        }, index * 1000);
    });
}

// Exportar funções para uso global
window.testSidebarMobileBehavior = testSidebarMobileBehavior;
window.testSidebarNavigation = testSidebarNavigation;
window.testSidebarResponsiveness = testSidebarResponsiveness;
window.testSidebarToggle = testSidebarToggle;
window.runAllSidebarTests = runAllSidebarTests;
window.testSidebarOnResize = testSidebarOnResize;

// Executar teste automático se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=sidebar')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllSidebarTests, 1000);
    });
}

console.log('✅ Script de teste da sidebar carregado!');
console.log('💡 Use runAllSidebarTests() para executar todos os testes'); 