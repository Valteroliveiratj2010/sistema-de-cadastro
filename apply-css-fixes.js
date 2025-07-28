// Script para aplicar correções CSS imediatamente
console.log('🎨 Aplicando correções CSS...');

// Forçar recarregamento do CSS
const link = document.querySelector('link[href*="style.css"]');
if (link) {
    link.href = link.href + '?v=' + Date.now();
    console.log('✅ CSS recarregado');
}

// Aplicar estilos diretamente via JavaScript como backup
const style = document.createElement('style');
style.textContent = `
    /* CORREÇÕES IMEDIATAS */
    
    /* 1. Botão Adicionar */
    #btnAddPurchaseProduct {
        white-space: nowrap !important;
        word-break: keep-all !important;
        min-width: 120px !important;
        height: 38px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        padding: 8px 16px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }
    
    /* 2. Scroll dos modais */
    .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
        padding: 20px !important;
    }
    
    .modal {
        overflow-y: auto !important;
    }
    
    .modal-dialog {
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
        max-height: 90vh !important;
    }
    
    .modal-content {
        max-height: 85vh !important;
        overflow: visible !important;
    }
    
    /* 3. Modais específicos */
    #purchaseModal .modal-body,
    #saleModal .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
        padding: 20px !important;
    }
    
    #purchaseModal .modal-dialog,
    #saleModal .modal-dialog {
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
        max-height: 90vh !important;
    }
    
    /* 4. Botões em modais */
    .modal .btn {
        white-space: nowrap !important;
        word-break: keep-all !important;
    }
    
    /* 5. Campos de input */
    .form-control, .form-select {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }
`;

document.head.appendChild(style);
console.log('✅ Estilos aplicados via JavaScript');

// Verificar se o botão existe e aplicar estilos diretamente
setTimeout(() => {
    const addButton = document.getElementById('btnAddPurchaseProduct');
    if (addButton) {
        addButton.style.whiteSpace = 'nowrap';
        addButton.style.wordBreak = 'keep-all';
        addButton.style.minWidth = '120px';
        addButton.style.display = 'flex';
        addButton.style.alignItems = 'center';
        addButton.style.justifyContent = 'center';
        addButton.style.overflow = 'hidden';
        addButton.style.textOverflow = 'ellipsis';
        console.log('✅ Estilos aplicados diretamente ao botão');
    }
    
    // Verificar modais
    const purchaseModal = document.getElementById('purchaseModal');
    const saleModal = document.getElementById('saleModal');
    
    if (purchaseModal) {
        const modalBody = purchaseModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.maxHeight = 'none';
            modalBody.style.overflowY = 'visible';
            console.log('✅ Scroll do modal de compra corrigido');
        }
    }
    
    if (saleModal) {
        const modalBody = saleModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.maxHeight = 'none';
            modalBody.style.overflowY = 'visible';
            console.log('✅ Scroll do modal de venda corrigido');
        }
    }
}, 1000);

console.log('✅ Todas as correções aplicadas!');
console.log('🎯 Agora teste os modais de compra e venda'); 