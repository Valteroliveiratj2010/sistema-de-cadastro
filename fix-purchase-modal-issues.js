// Script para corrigir problemas do modal de compra
console.log('🔧 Corrigindo problemas do modal de compra...');

// 1. Corrigir função handleAddPurchaseProduct
console.log('1. Corrigindo função handleAddPurchaseProduct...');

// Substituir a função problemática
if (window.app && window.app.handlers) {
    const originalHandleAddPurchaseProduct = window.app.handlers.handleAddPurchaseProduct;
    
    window.app.handlers.handleAddPurchaseProduct = function() {
        if (!window.app.utils.hasPermission(['admin', 'gerente'])) {
            window.app.utils.showToast('Você não tem permissão para adicionar produtos a compras.', 'error');
            return;
        }

        // Usar .value em vez de .val()
        const productId = window.app.dom.purchaseProductSelect.value;
        const quantity = parseInt(window.app.dom.purchaseProductQuantityInput.value);
        const unitCost = parseFloat(window.app.dom.purchaseProductCostInput.value);

        if (!productId) {
            window.app.utils.showToast('Selecione um produto.', 'error');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            window.app.utils.showToast('Quantidade inválida.', 'error');
            return;
        }
        if (isNaN(unitCost) || unitCost < 0) {
            window.app.utils.showToast('Preço de custo unitário inválido.', 'error');
            return;
        }

        const product = window.app.state.availableProductsForPurchase.find(p => String(p.id) === productId);
        if (!product) {
            window.app.utils.showToast('Produto não encontrado.', 'error');
            return;
        }

        const existingItem = window.app.state.selectedPurchaseProducts.find(item => String(item.id) === productId);
        if (existingItem) {
            existingItem.quantidade += quantity;
            existingItem.precoCustoUnitario = unitCost;
        } else {
            window.app.state.selectedPurchaseProducts.push({
                id: product.id,
                nome: product.nome,
                precoCustoUnitario: unitCost,
                quantidade: quantity,
            });
        }
        
        window.app.utils.renderSelectedPurchaseProductsList();
        
        // Usar .value em vez de .val()
        window.app.dom.purchaseProductSelect.value = '';
        window.app.dom.purchaseProductQuantityInput.value = '1';
        window.app.dom.purchaseProductCostInput.value = '';
        window.app.dom.purchaseProductDetailsDisplay.innerHTML = '';
        window.app.state.currentSelectedProductForPurchase = null;
        
        console.log('✅ Produto adicionado com sucesso!');
    };
    
    console.log('✅ Função handleAddPurchaseProduct corrigida');
}

// 2. Corrigir CSS do botão "Adicionar"
console.log('2. Corrigindo CSS do botão Adicionar...');

const style = document.createElement('style');
style.textContent = `
    #btnAddPurchaseProduct {
        white-space: nowrap !important;
        word-break: keep-all !important;
        min-width: 100px !important;
        height: 38px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    
    .modal-body {
        max-height: none !important;
        overflow-y: visible !important;
    }
    
    .modal {
        overflow-y: auto !important;
    }
    
    .modal-dialog {
        margin-top: 2rem !important;
        margin-bottom: 2rem !important;
    }
`;
document.head.appendChild(style);

console.log('✅ CSS corrigido');

// 3. Verificar se o botão existe e adicionar event listener
console.log('3. Verificando botão Adicionar...');

const addButton = document.getElementById('btnAddPurchaseProduct');
if (addButton) {
    console.log('✅ Botão encontrado:', addButton);
    
    // Remover event listeners antigos
    const newButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newButton, addButton);
    
    // Adicionar novo event listener
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖱️ Botão Adicionar clicado');
        if (window.app && window.app.handlers) {
            window.app.handlers.handleAddPurchaseProduct();
        }
    });
    
    console.log('✅ Event listener adicionado ao botão');
} else {
    console.log('❌ Botão não encontrado');
}

console.log('✅ Todas as correções aplicadas!');
console.log('🎯 Agora teste clicando no botão "Adicionar"'); 