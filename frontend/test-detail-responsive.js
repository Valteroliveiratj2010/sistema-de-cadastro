/**
 * Teste de Responsividade dos Modais de Detalhes
 * Verifica se os modais estão se adaptando corretamente a diferentes tamanhos de tela
 */

console.log('📱 Testando responsividade dos modais de detalhes...');

class DetailResponsiveTester {
    constructor() {
        this.breakpoints = {
            mobile: 576,
            tablet: 768,
            desktop: 992,
            large: 1200
        };
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }

    init() {
        console.log('🚀 Iniciando teste de responsividade...');
        this.setupResizeListener();
        this.testCurrentViewport();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < this.breakpoints.mobile) return 'mobile';
        if (width < this.breakpoints.tablet) return 'tablet';
        if (width < this.breakpoints.desktop) return 'desktop';
        return 'large';
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            const newBreakpoint = this.getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                console.log(`📱 Breakpoint mudou: ${this.currentBreakpoint} → ${newBreakpoint}`);
                this.currentBreakpoint = newBreakpoint;
                this.testCurrentViewport();
            }
        });
    }

    testCurrentViewport() {
        console.log(`\n📱 Testando viewport: ${this.currentBreakpoint} (${window.innerWidth}x${window.innerHeight})`);
        
        this.testDetailSections();
        this.testCardLayouts();
        this.testTypography();
        this.testSpacing();
        this.testNavigation();
    }

    testDetailSections() {
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                console.log(`✅ Seção ${sectionId} encontrada`);
                
                // Testar posicionamento
                const styles = window.getComputedStyle(section);
                const position = styles.position;
                const left = styles.left;
                const top = styles.top;
                
                console.log(`  - Position: ${position}`);
                console.log(`  - Left: ${left}`);
                console.log(`  - Top: ${top}`);
                
                // Verificar se está responsivo
                if (this.currentBreakpoint === 'mobile' || this.currentBreakpoint === 'tablet') {
                    if (left === '0px') {
                        console.log(`  ✅ Posicionamento correto para ${this.currentBreakpoint}`);
                    } else {
                        console.log(`  ❌ Posicionamento incorreto para ${this.currentBreakpoint}`);
                    }
                }
            } else {
                console.log(`❌ Seção ${sectionId} não encontrada`);
            }
        });
    }

    testCardLayouts() {
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const cards = section.querySelectorAll('.card');
                console.log(`📋 ${cards.length} cards encontrados em ${sectionId}`);
                
                cards.forEach((card, index) => {
                    const cardStyles = window.getComputedStyle(card);
                    const borderRadius = cardStyles.borderRadius;
                    const boxShadow = cardStyles.boxShadow;
                    
                    console.log(`  Card ${index + 1}:`);
                    console.log(`    - Border radius: ${borderRadius}`);
                    console.log(`    - Box shadow: ${boxShadow !== 'none' ? 'Presente' : 'Ausente'}`);
                    
                    // Testar headers
                    const header = card.querySelector('.card-header');
                    if (header) {
                        const headerStyles = window.getComputedStyle(header);
                        const background = headerStyles.background;
                        const color = headerStyles.color;
                        
                        console.log(`    - Header background: ${background.includes('gradient') ? 'Gradiente' : 'Sólido'}`);
                        console.log(`    - Header color: ${color}`);
                        
                        // Verificar se tem gradiente (estilo profissional)
                        if (background.includes('gradient')) {
                            console.log(`    ✅ Header com gradiente profissional`);
                        } else {
                            console.log(`    ⚠️ Header sem gradiente`);
                        }
                    }
                });
            }
        });
    }

    testTypography() {
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const titles = section.querySelectorAll('h3, h4, h5');
                console.log(`📝 ${titles.length} títulos encontrados em ${sectionId}`);
                
                titles.forEach((title, index) => {
                    const styles = window.getComputedStyle(title);
                    const fontSize = styles.fontSize;
                    const fontWeight = styles.fontWeight;
                    const color = styles.color;
                    
                    console.log(`  Título ${index + 1} (${title.tagName}):`);
                    console.log(`    - Tamanho: ${fontSize}`);
                    console.log(`    - Peso: ${fontWeight}`);
                    console.log(`    - Cor: ${color}`);
                    
                    // Verificar se o tamanho é apropriado para o breakpoint
                    const fontSizeNum = parseFloat(fontSize);
                    if (this.currentBreakpoint === 'mobile' && fontSizeNum > 20) {
                        console.log(`    ⚠️ Tamanho muito grande para mobile`);
                    } else if (this.currentBreakpoint === 'large' && fontSizeNum < 24) {
                        console.log(`    ⚠️ Tamanho muito pequeno para desktop`);
                    } else {
                        console.log(`    ✅ Tamanho apropriado para ${this.currentBreakpoint}`);
                    }
                });
            }
        });
    }

    testSpacing() {
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const container = section.querySelector('.container-fluid');
                if (container) {
                    const styles = window.getComputedStyle(container);
                    const padding = styles.padding;
                    
                    console.log(`📏 Padding do container em ${sectionId}: ${padding}`);
                    
                    // Verificar se o padding é apropriado para o breakpoint
                    const paddingNum = parseFloat(padding);
                    if (this.currentBreakpoint === 'mobile' && paddingNum > 20) {
                        console.log(`  ⚠️ Padding muito grande para mobile`);
                    } else if (this.currentBreakpoint === 'large' && paddingNum < 30) {
                        console.log(`  ⚠️ Padding muito pequeno para desktop`);
                    } else {
                        console.log(`  ✅ Padding apropriado para ${this.currentBreakpoint}`);
                    }
                }
            }
        });
    }

    testNavigation() {
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const backButton = section.querySelector('.btn-outline-secondary');
                if (backButton) {
                    const styles = window.getComputedStyle(backButton);
                    const width = styles.width;
                    const display = styles.display;
                    
                    console.log(`🔙 Botão voltar em ${sectionId}:`);
                    console.log(`  - Largura: ${width}`);
                    console.log(`  - Display: ${display}`);
                    
                    // Verificar se o botão está responsivo
                    if (this.currentBreakpoint === 'mobile' && width === '100%') {
                        console.log(`  ✅ Botão responsivo para mobile`);
                    } else if (this.currentBreakpoint === 'large' && width !== '100%') {
                        console.log(`  ✅ Botão apropriado para desktop`);
                    } else {
                        console.log(`  ⚠️ Botão pode não estar otimizado para ${this.currentBreakpoint}`);
                    }
                }
            }
        });
    }

    simulateResponsiveTest() {
        console.log('\n🧪 Simulando teste de responsividade...');
        
        const testSizes = [
            { width: 375, height: 667, name: 'Mobile' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1024, height: 768, name: 'Desktop' },
            { width: 1440, height: 900, name: 'Large Desktop' }
        ];
        
        testSizes.forEach(size => {
            console.log(`\n📱 Testando ${size.name} (${size.width}x${size.height})`);
            
            // Simular redimensionamento
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: size.width
            });
            
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: size.height
            });
            
            // Disparar evento de resize
            window.dispatchEvent(new Event('resize'));
            
            // Aguardar um pouco para as mudanças serem aplicadas
            setTimeout(() => {
                this.testCurrentViewport();
            }, 100);
        });
    }

    generateResponsiveReport() {
        console.log('\n📊 Relatório de Responsividade dos Modais de Detalhes');
        console.log('=' .repeat(60));
        
        const sections = ['saleDetailSection', 'purchaseDetailSection'];
        let totalIssues = 0;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                console.log(`\n✅ ${sectionId}:`);
                
                // Verificar se está visível
                const display = window.getComputedStyle(section).display;
                if (display !== 'none') {
                    console.log(`  - Status: Visível`);
                    
                    // Verificar cards
                    const cards = section.querySelectorAll('.card');
                    console.log(`  - Cards: ${cards.length} encontrados`);
                    
                    // Verificar headers com gradiente
                    const headers = section.querySelectorAll('.card-header');
                    const gradientHeaders = Array.from(headers).filter(header => 
                        window.getComputedStyle(header).background.includes('gradient')
                    );
                    console.log(`  - Headers com gradiente: ${gradientHeaders.length}/${headers.length}`);
                    
                    if (gradientHeaders.length < headers.length) {
                        totalIssues++;
                        console.log(`  ❌ Alguns headers não têm gradiente`);
                    }
                    
                    // Verificar responsividade
                    const container = section.querySelector('.container-fluid');
                    if (container) {
                        const padding = window.getComputedStyle(container).padding;
                        const paddingNum = parseFloat(padding);
                        
                        if (this.currentBreakpoint === 'mobile' && paddingNum > 20) {
                            totalIssues++;
                            console.log(`  ❌ Padding muito grande para mobile`);
                        } else {
                            console.log(`  ✅ Padding apropriado para ${this.currentBreakpoint}`);
                        }
                    }
                } else {
                    console.log(`  - Status: Oculto`);
                }
            } else {
                console.log(`\n❌ ${sectionId}: Não encontrada`);
                totalIssues++;
            }
        });
        
        console.log('\n' + '=' .repeat(60));
        console.log(`📈 Resumo: ${totalIssues} problema(s) encontrado(s)`);
        
        if (totalIssues === 0) {
            console.log('🎉 Todos os modais estão responsivos e profissionais!');
        } else {
            console.log('🔧 Alguns ajustes podem ser necessários');
        }
    }
}

// Funções globais para teste
function testDetailResponsive() {
    if (!window.detailResponsiveTester) {
        window.detailResponsiveTester = new DetailResponsiveTester();
    }
    window.detailResponsiveTester.testCurrentViewport();
}

function simulateResponsiveTest() {
    if (!window.detailResponsiveTester) {
        window.detailResponsiveTester = new DetailResponsiveTester();
    }
    window.detailResponsiveTester.simulateResponsiveTest();
}

function generateResponsiveReport() {
    if (!window.detailResponsiveTester) {
        window.detailResponsiveTester = new DetailResponsiveTester();
    }
    window.detailResponsiveTester.generateResponsiveReport();
}

// Inicializar quando o script carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.detailResponsiveTester = new DetailResponsiveTester();
    });
} else {
    window.detailResponsiveTester = new DetailResponsiveTester();
}

console.log('✅ Script de teste de responsividade carregado!');
console.log('💡 Use testDetailResponsive() para testar viewport atual');
console.log('💡 Use simulateResponsiveTest() para simular diferentes tamanhos');
console.log('💡 Use generateResponsiveReport() para relatório completo'); 