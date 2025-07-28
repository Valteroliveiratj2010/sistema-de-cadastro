// Script para remover scroll vertical dos modais
console.log('🔧 Removendo scroll vertical dos modais...');

// Aplicar estilos para remover scroll
const scrollStyle = document.createElement('style');
scrollStyle.textContent = `
    /* REMOÇÃO COMPLETA DE SCROLL VERTICAL */
    
    /* 1. Modal body */
    .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
        padding: 20px !important;
    }
    
    /* 2. Modal dialog */
    .modal-dialog {
        max-height: none !important;
        overflow: visible !important;
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
    }
    
    /* 3. Modal content */
    .modal-content {
        max-height: none !important;
        overflow: visible !important;
    }
    
    /* 4. Específico para modais de compra e venda */
    #purchaseModal .modal-body,
    #saleModal .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
        padding: 20px !important;
    }
    
    #purchaseModal .modal-dialog,
    #saleModal .modal-dialog {
        max-height: none !important;
        overflow: visible !important;
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
    }
    
    #purchaseModal .modal-content,
    #saleModal .modal-content {
        max-height: none !important;
        overflow: visible !important;
    }
    
    /* 5. Cards dentro dos modais */
    #purchaseModal .card,
    #saleModal .card {
        overflow: visible !important;
        max-height: none !important;
    }
    
    #purchaseModal .card-body,
    #saleModal .card-body {
        overflow: visible !important;
        max-height: none !important;
    }
    
    /* 6. Listas de produtos */
    #purchaseProductsList,
    #saleProductsList {
        max-height: none !important;
        overflow: visible !important;
    }
    
    /* 7. Forçar todos os elementos dos modais */
    #purchaseModal *,
    #saleModal * {
        max-height: none !important;
    }
    
    /* 8. Responsividade */
    @media (max-height: 800px) {
        .modal-dialog {
            max-height: 98vh !important;
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
        }
    }
`;

document.head.appendChild(scrollStyle);
console.log('✅ Estilos de remoção de scroll aplicados');

// Função para aplicar estilos diretamente aos elementos
function removeScrollFromModals() {
    const modals = ['purchaseModal', 'saleModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Modal body
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.maxHeight = 'none';
                modalBody.style.overflowY = 'visible';
                modalBody.style.overflowX = 'hidden';
            }
            
            // Modal dialog
            const modalDialog = modal.querySelector('.modal-dialog');
            if (modalDialog) {
                modalDialog.style.maxHeight = 'none';
                modalDialog.style.overflow = 'visible';
            }
            
            // Modal content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.maxHeight = 'none';
                modalContent.style.overflow = 'visible';
            }
            
            // Cards
            const cards = modal.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.overflow = 'visible';
                card.style.maxHeight = 'none';
            });
            
            // Card bodies
            const cardBodies = modal.querySelectorAll('.card-body');
            cardBodies.forEach(cardBody => {
                cardBody.style.overflow = 'visible';
                cardBody.style.maxHeight = 'none';
            });
            
            // Listas de produtos
            const productLists = modal.querySelectorAll('#purchaseProductsList, #saleProductsList');
            productLists.forEach(list => {
                list.style.maxHeight = 'none';
                list.style.overflow = 'visible';
            });
            
            console.log(`✅ Scroll removido do modal: ${modalId}`);
        }
    });
}

// Aplicar imediatamente
removeScrollFromModals();

// Aplicar quando modais forem abertos
document.addEventListener('shown.bs.modal', function(event) {
    setTimeout(removeScrollFromModals, 100);
});

// Aplicar periodicamente para garantir
setInterval(removeScrollFromModals, 2000);

console.log('✅ Correções de scroll aplicadas!');
console.log('🎯 Agora os modais não devem ter scroll vertical'); 