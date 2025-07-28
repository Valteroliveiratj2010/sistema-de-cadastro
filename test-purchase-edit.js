// Script para testar a funcionalidade de edição de compra
console.log('🧪 Testando funcionalidade de edição de compra...');

// 1. Verificar se o modal existe
const purchaseModal = document.getElementById('purchaseModal');
console.log('1. Modal de compra encontrado:', !!purchaseModal);

// 2. Verificar se o modal está inicializado
console.log('2. Modal inicializado:', !!window.app?.state?.bootstrapPurchaseModal);

// 3. Verificar se a função openPurchaseModal existe
console.log('3. Função openPurchaseModal existe:', typeof window.app?.handlers?.openPurchaseModal);

// 4. Simular clique no botão de editar
console.log('4. Simulando clique no botão de editar...');
const editButton = document.querySelector('button[data-type="purchase"][data-id="12"]');
if (editButton) {
    console.log('   - Botão encontrado:', editButton);
    console.log('   - Type:', editButton.dataset.type);
    console.log('   - ID:', editButton.dataset.id);
    
    // Simular clique
    editButton.click();
} else {
    console.log('   - Botão não encontrado');
}

// 5. Verificar se o modal foi aberto
setTimeout(() => {
    console.log('5. Modal visível:', purchaseModal?.classList.contains('show'));
    console.log('6. Título do modal:', document.getElementById('purchaseModalLabel')?.textContent);
}, 1000);

console.log('✅ Teste concluído!'); 