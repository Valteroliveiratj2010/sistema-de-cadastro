// Script de Debug para Problema dos Modais
console.log('🔍 Iniciando debug dos modais...');

// Função para verificar informações dos modais
function debugModals() {
    console.log('=== DEBUG DOS MODAIS ===');
    
    const modals = ['clientModal', 'saleModal', 'purchaseModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalDialog = modal.querySelector('.modal-dialog');
            const modalContent = modal.querySelector('.modal-content');
            
            console.log(`\n📋 Modal: ${modalId}`);
            console.log('  • Existe:', !!modal);
            console.log('  • Modal-dialog existe:', !!modalDialog);
            console.log('  • Modal-content existe:', !!modalContent);
            
            if (modalDialog) {
                const computedStyle = window.getComputedStyle(modalDialog);
                console.log('  • max-width:', computedStyle.maxWidth);
                console.log('  • width:', computedStyle.width);
                console.log('  • margin:', computedStyle.margin);
                console.log('  • offsetWidth:', modalDialog.offsetWidth);
                console.log('  • offsetHeight:', modalDialog.offsetHeight);
            }
            
            if (modal) {
                const modalStyle = window.getComputedStyle(modal);
                console.log('  • z-index:', modalStyle.zIndex);
                console.log('  • display:', modalStyle.display);
            }
        } else {
            console.log(`\n❌ Modal ${modalId} não encontrado!`);
        }
    });
    
    // Verificar sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const sidebarStyle = window.getComputedStyle(sidebar);
        console.log('\n📋 Sidebar:');
        console.log('  • z-index:', sidebarStyle.zIndex);
        console.log('  • width:', sidebarStyle.width);
        console.log('  • position:', sidebarStyle.position);
    }
    
    // Verificar CSS aplicado
    console.log('\n🎨 CSS Aplicado:');
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach((sheet, index) => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            const modalRules = rules.filter(rule => 
                rule.selectorText && 
                (rule.selectorText.includes('modal') || rule.selectorText.includes('saleModal') || rule.selectorText.includes('purchaseModal'))
            );
            
            if (modalRules.length > 0) {
                console.log(`  • Stylesheet ${index}:`, sheet.href || 'inline');
                modalRules.forEach(rule => {
                    console.log(`    - ${rule.selectorText}: ${rule.style.cssText}`);
                });
            }
        } catch (e) {
            // Ignorar erros de CORS
        }
    });
}

// Função para testar abertura dos modais
function testModalOpening() {
    console.log('\n🧪 Testando abertura dos modais...');
    
    const modals = ['clientModal', 'saleModal', 'purchaseModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log(`\n📋 Testando ${modalId}:`);
            
            // Simular abertura
            const event = new Event('show.bs.modal');
            modal.dispatchEvent(event);
            
            // Verificar se o modal tem Bootstrap
            if (typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                console.log('  • Bootstrap Modal criado:', !!bsModal);
            }
            
            // Verificar classes
            console.log('  • Classes:', modal.className);
            console.log('  • Data attributes:', modal.dataset);
        }
    });
}

// Função para verificar conflitos de CSS
function checkCSSConflicts() {
    console.log('\n🎨 Verificando conflitos de CSS...');
    
    const saleModal = document.getElementById('saleModal');
    const purchaseModal = document.getElementById('purchaseModal');
    
    if (saleModal) {
        const modalDialog = saleModal.querySelector('.modal-dialog');
        if (modalDialog) {
            const computedStyle = window.getComputedStyle(modalDialog);
            console.log('\n📋 Sale Modal CSS:');
            console.log('  • max-width:', computedStyle.maxWidth);
            console.log('  • width:', computedStyle.width);
            console.log('  • margin:', computedStyle.margin);
            console.log('  • position:', computedStyle.position);
            console.log('  • transform:', computedStyle.transform);
        }
    }
    
    if (purchaseModal) {
        const modalDialog = purchaseModal.querySelector('.modal-dialog');
        if (modalDialog) {
            const computedStyle = window.getComputedStyle(modalDialog);
            console.log('\n📋 Purchase Modal CSS:');
            console.log('  • max-width:', computedStyle.maxWidth);
            console.log('  • width:', computedStyle.width);
            console.log('  • margin:', computedStyle.margin);
            console.log('  • position:', computedStyle.position);
            console.log('  • transform:', computedStyle.transform);
        }
    }
}

// Executar debug quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM carregado, executando debug...');
        setTimeout(() => {
            debugModals();
            testModalOpening();
            checkCSSConflicts();
        }, 1000);
    });
} else {
    console.log('🚀 DOM já carregado, executando debug imediatamente...');
    setTimeout(() => {
        debugModals();
        testModalOpening();
        checkCSSConflicts();
    }, 1000);
}

// Monitorar mudanças de tamanho da janela
window.addEventListener('resize', function() {
    console.log('📏 Janela redimensionada:', window.innerWidth, 'x', window.innerHeight);
    setTimeout(debugModals, 100);
});

console.log('✅ Script de debug carregado. Abra o console para ver os resultados.'); 