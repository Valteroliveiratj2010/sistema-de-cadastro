/**
 * Correção dos Títulos Truncados nos Modais de Detalhes
 * Força a exibição completa dos títulos dos card-headers
 */

console.log('🔧 Carregando correção dos títulos truncados...');

class DetailHeadersFixer {
    constructor() {
        this.observer = null;
        this.interval = null;
        this.init();
    }

    init() {
        console.log('🚀 Iniciando DetailHeadersFixer...');
        
        // Aplicar correções imediatamente
        this.fixHeaders();
        
        // Configurar observer para novos elementos
        this.setupObserver();
        
        // Configurar intervalo para verificação contínua
        this.setupInterval();
        
        // Aplicar correções quando a página carregar
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.fixHeaders(), 100);
        });
        
        // Aplicar correções quando a URL mudar (SPA)
        window.addEventListener('popstate', () => {
            setTimeout(() => this.fixHeaders(), 100);
        });
    }

    fixHeaders() {
        console.log('🔧 Aplicando correções nos títulos...');
        
        // Corrigir títulos em seções de detalhes
        this.fixDetailSectionHeaders();
        
        // Corrigir títulos em card-headers gerais
        this.fixGeneralCardHeaders();
        
        // Forçar reflow para garantir que as mudanças sejam aplicadas
        this.forceReflow();
    }

    fixDetailSectionHeaders() {
        const detailSections = [
            'saleDetailSection',
            'purchaseDetailSection'
        ];

        detailSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                console.log(`📋 Corrigindo títulos na seção: ${sectionId}`);
                
                const cardHeaders = section.querySelectorAll('.card-header');
                cardHeaders.forEach((header, index) => {
                    this.fixCardHeader(header, `Seção ${sectionId} - Card ${index + 1}`);
                });
            }
        });
    }

    fixGeneralCardHeaders() {
        const cardHeaders = document.querySelectorAll('.card-header');
        console.log(`📋 Encontrados ${cardHeaders.length} card-headers para corrigir`);
        
        cardHeaders.forEach((header, index) => {
            this.fixCardHeader(header, `Card ${index + 1}`);
        });
    }

    fixCardHeader(header, context) {
        // Aplicar estilos para evitar truncamento
        const styles = {
            'white-space': 'normal',
            'overflow': 'visible',
            'text-overflow': 'clip',
            'word-wrap': 'break-word',
            'word-break': 'normal',
            'min-width': '0',
            'flex': '1',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'flex-start'
        };

        Object.entries(styles).forEach(([property, value]) => {
            header.style.setProperty(property, value, 'important');
        });

        // Corrigir títulos dentro do header
        const titles = header.querySelectorAll('h1, h2, h3, h4, h5, h6');
        titles.forEach((title, titleIndex) => {
            this.fixTitle(title, `${context} - Título ${titleIndex + 1}`);
        });

        console.log(`✅ Corrigido: ${context}`);
    }

    fixTitle(title, context) {
        // Aplicar estilos específicos para títulos
        const titleStyles = {
            'white-space': 'normal',
            'overflow': 'visible',
            'text-overflow': 'clip',
            'word-wrap': 'break-word',
            'word-break': 'normal',
            'min-width': '0',
            'flex': '1',
            'color': 'var(--white-color)',
            'font-size': '1rem',
            'line-height': '1.2',
            'margin': '0',
            'padding': '0'
        };

        Object.entries(titleStyles).forEach(([property, value]) => {
            title.style.setProperty(property, value, 'important');
        });

        console.log(`✅ Título corrigido: ${context} - "${title.textContent}"`);
    }

    setupObserver() {
        // Observer para detectar novos elementos adicionados ao DOM
        this.observer = new MutationObserver((mutations) => {
            let shouldFix = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('card-header')) {
                                shouldFix = true;
                            } else if (node.querySelector && node.querySelector('.card-header')) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldFix) {
                setTimeout(() => this.fixHeaders(), 50);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👁️ Observer configurado para novos card-headers');
    }

    setupInterval() {
        // Verificar periodicamente para garantir que as correções permaneçam
        this.interval = setInterval(() => {
            this.fixHeaders();
        }, 2000); // A cada 2 segundos

        console.log('⏰ Intervalo configurado para verificação contínua');
    }

    forceReflow() {
        // Forçar reflow para garantir que as mudanças sejam aplicadas
        const cardHeaders = document.querySelectorAll('.card-header');
        cardHeaders.forEach(header => {
            header.offsetHeight; // Força reflow
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            console.log('👁️ Observer desconectado');
        }
        
        if (this.interval) {
            clearInterval(this.interval);
            console.log('⏰ Intervalo limpo');
        }
    }
}

// Função para testar as correções
function testDetailHeadersFix() {
    console.log('🧪 Testando correção dos títulos...');
    
    const detailSections = ['saleDetailSection', 'purchaseDetailSection'];
    let foundSections = 0;
    
    detailSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            foundSections++;
            console.log(`✅ Seção encontrada: ${sectionId}`);
            
            const cardHeaders = section.querySelectorAll('.card-header');
            console.log(`  - Card-headers encontrados: ${cardHeaders.length}`);
            
            cardHeaders.forEach((header, index) => {
                const titles = header.querySelectorAll('h1, h2, h3, h4, h5, h6');
                console.log(`  - Card ${index + 1}: ${titles.length} títulos`);
                
                titles.forEach((title, titleIndex) => {
                    const isTruncated = title.scrollWidth > title.clientWidth;
                    console.log(`    - Título ${titleIndex + 1}: "${title.textContent}" - Truncado: ${isTruncated}`);
                });
            });
        } else {
            console.log(`❌ Seção não encontrada: ${sectionId}`);
        }
    });
    
    if (foundSections === 0) {
        console.log('💡 Nenhuma seção de detalhes encontrada. Navegue para uma seção de detalhes para testar.');
    }
}

// Função para forçar correção manual
function forceFixHeaders() {
    console.log('🔧 Forçando correção manual dos títulos...');
    if (window.detailHeadersFixer) {
        window.detailHeadersFixer.fixHeaders();
    } else {
        console.log('❌ DetailHeadersFixer não encontrado');
    }
}

// Inicializar quando o script carregar
let detailHeadersFixer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        detailHeadersFixer = new DetailHeadersFixer();
    });
} else {
    detailHeadersFixer = new DetailHeadersFixer();
}

// Exportar para uso global
window.detailHeadersFixer = detailHeadersFixer;
window.testDetailHeadersFix = testDetailHeadersFix;
window.forceFixHeaders = forceFixHeaders;

console.log('✅ Script de correção dos títulos carregado!');
console.log('💡 Use testDetailHeadersFix() para testar');
console.log('💡 Use forceFixHeaders() para forçar correção manual'); 