// Script para corrigir problemas visuais do modal de compra
console.log('🎨 Corrigindo problemas visuais do modal de compra...');

// 1. Corrigir CSS do botão "Adicionar" para evitar quebra de texto
console.log('1. Corrigindo botão Adicionar...');

const buttonStyle = document.createElement('style');
buttonStyle.textContent = `
    /* Corrigir botão Adicionar */
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
    }
    
    /* Remover scroll vertical desnecessário */
    .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
        padding: 20px !important;
    }
    
    /* Ajustar modal para não ter scroll interno */
    .modal {
        overflow-y: auto !important;
    }
    
    .modal-dialog {
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
        max-height: 90vh !important;
    }
    
    /* Garantir que o conteúdo do modal não force scroll */
    .modal-content {
        max-height: 85vh !important;
        overflow: visible !important;
    }
    
    /* Ajustar seção de produtos para não ter scroll */
    .purchase-products-section {
        max-height: none !important;
        overflow: visible !important;
    }
    
    /* Garantir que os campos de input não quebrem */
    .form-control, .form-select {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }
`;

document.head.appendChild(buttonStyle);
console.log('✅ CSS aplicado');

// 2. Verificar e corrigir o botão se existir
const addButton = document.getElementById('btnAddPurchaseProduct');
if (addButton) {
    console.log('✅ Botão Adicionar encontrado');
    addButton.style.whiteSpace = 'nowrap';
    addButton.style.wordBreak = 'keep-all';
    addButton.style.minWidth = '120px';
    addButton.style.display = 'flex';
    addButton.style.alignItems = 'center';
    addButton.style.justifyContent = 'center';
    console.log('✅ Estilos aplicados ao botão');
} else {
    console.log('⚠️ Botão não encontrado, mas CSS foi aplicado');
}

// 3. Verificar modal de compra
const purchaseModal = document.getElementById('purchaseModal');
if (purchaseModal) {
    console.log('✅ Modal de compra encontrado');
    
    // Remover scroll desnecessário
    const modalBody = purchaseModal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.style.maxHeight = 'none';
        modalBody.style.overflowY = 'visible';
        console.log('✅ Scroll do modal-body removido');
    }
    
    // Ajustar modal-dialog
    const modalDialog = purchaseModal.querySelector('.modal-dialog');
    if (modalDialog) {
        modalDialog.style.maxHeight = '90vh';
        console.log('✅ Altura do modal-dialog ajustada');
    }
} else {
    console.log('⚠️ Modal não encontrado');
}

console.log('✅ Todas as correções visuais aplicadas!');
console.log('🎯 Agora o botão "Adicionar" não deve quebrar e o scroll deve estar melhor'); 