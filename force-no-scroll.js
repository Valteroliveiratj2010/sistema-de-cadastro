// Script AGESSIVO para eliminar completamente o scroll
console.log('🔥 ELIMINANDO SCROLL DE FORMA AGRESSIVA...');

// Aplicar estilos ULTRA AGRESSIVOS para remover scroll
const noScrollStyle = document.createElement('style');
noScrollStyle.textContent = `
    /* ELIMINAÇÃO COMPLETA E AGRESSIVA DE SCROLL */
    
    /* 1. TODOS OS MODAIS - SEM SCROLL */
    .modal,
    .modal *,
    .modal-dialog,
    .modal-content,
    .modal-body {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
    
    /* 2. ESPECÍFICO PARA MODAIS DE COMPRA E VENDA */
    #purchaseModal,
    #purchaseModal *,
    #saleModal,
    #saleModal * {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
    
    /* 3. FORÇAR TODOS OS ELEMENTOS */
    #purchaseModal .modal-dialog,
    #purchaseModal .modal-content,
    #purchaseModal .modal-body,
    #saleModal .modal-dialog,
    #saleModal .modal-content,
    #saleModal .modal-body {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
    
    /* 4. CARDS E LISTAS */
    #purchaseModal .card,
    #purchaseModal .card-body,
    #saleModal .card,
    #saleModal .card-body,
    #purchaseProductsList,
    #saleProductsList {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
    
    /* 5. OVERRIDE BOOTSTRAP */
    .modal.show,
    .modal.show *,
    .modal.show .modal-dialog,
    .modal.show .modal-content,
    .modal.show .modal-body {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
    
    /* 6. FORÇAR EM TODAS AS RESOLUÇÕES */
    @media (max-height: 700px) {
        .modal,
        .modal *,
        .modal-dialog,
        .modal-content,
        .modal-body {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            overflow-y: visible !important;
            overflow-x: hidden !important;
        }
    }
    
    @media (max-width: 768px) {
        .modal,
        .modal *,
        .modal-dialog,
        .modal-content,
        .modal-body {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            overflow-y: visible !important;
            overflow-x: hidden !important;
        }
    }
    
    /* 7. ULTIMATE OVERRIDE */
    body .modal,
    body .modal *,
    body .modal-dialog,
    body .modal-content,
    body .modal-body {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
    }
`;

document.head.appendChild(noScrollStyle);
console.log('✅ Estilos ULTRA AGRESSIVOS aplicados');

// Função ULTRA AGRESSIVA para aplicar estilos
function forceNoScroll() {
    const modals = ['purchaseModal', 'saleModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Aplicar a TODOS os elementos do modal
            const allElements = modal.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.maxHeight = 'none';
                element.style.height = 'auto';
                element.style.overflow = 'visible';
                element.style.overflowY = 'visible';
                element.style.overflowX = 'hidden';
            });
            
            // Aplicar ao próprio modal
            modal.style.maxHeight = 'none';
            modal.style.height = 'auto';
            modal.style.overflow = 'visible';
            modal.style.overflowY = 'visible';
            modal.style.overflowX = 'hidden';
            
            // Elementos específicos
            const modalDialog = modal.querySelector('.modal-dialog');
            const modalContent = modal.querySelector('.modal-content');
            const modalBody = modal.querySelector('.modal-body');
            
            [modalDialog, modalContent, modalBody].forEach(element => {
                if (element) {
                    element.style.maxHeight = 'none';
                    element.style.height = 'auto';
                    element.style.overflow = 'visible';
                    element.style.overflowY = 'visible';
                    element.style.overflowX = 'hidden';
                }
            });
            
            // Cards e listas
            const cards = modal.querySelectorAll('.card, .card-body, #purchaseProductsList, #saleProductsList');
            cards.forEach(card => {
                card.style.maxHeight = 'none';
                card.style.height = 'auto';
                card.style.overflow = 'visible';
                card.style.overflowY = 'visible';
                card.style.overflowX = 'hidden';
            });
            
            console.log(`🔥 Scroll ELIMINADO do modal: ${modalId}`);
        }
    });
}

// Aplicar imediatamente
forceNoScroll();

// Aplicar quando modais forem abertos
document.addEventListener('shown.bs.modal', function(event) {
    setTimeout(forceNoScroll, 50);
    setTimeout(forceNoScroll, 100);
    setTimeout(forceNoScroll, 200);
});

// Aplicar quando modais forem mostrados
document.addEventListener('show.bs.modal', function(event) {
    setTimeout(forceNoScroll, 10);
    setTimeout(forceNoScroll, 50);
});

// Aplicar periodicamente para garantir
setInterval(forceNoScroll, 1000);

// Aplicar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(forceNoScroll, 100);
    setTimeout(forceNoScroll, 500);
});

// Aplicar quando a janela redimensionar
window.addEventListener('resize', function() {
    setTimeout(forceNoScroll, 100);
});

console.log('🔥 ELIMINAÇÃO AGRESSIVA DE SCROLL APLICADA!');
console.log('💥 Agora NÃO DEVE haver scroll em nenhum modal!'); 