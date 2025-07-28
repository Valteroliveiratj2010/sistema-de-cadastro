// Script para debugar elementos DOM do modal de compra
console.log('🔍 Verificando elementos DOM do modal de compra...');

const elements = [
    'purchaseId',
    'purchaseSupplier', 
    'purchaseDate',
    'purchaseProductsList',
    'purchaseProductSelect',
    'purchaseProductQuantity',
    'purchaseProductCost',
    'btnAddPurchaseProduct',
    'purchaseProductDetailsDisplay',
    'purchaseTotalValueDisplay',
    'purchaseTotalValue',
    'purchaseStatus',
    'purchaseObservations'
];

elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`✅ ${id}: encontrado`);
    } else {
        console.log(`❌ ${id}: NÃO encontrado`);
    }
});

console.log('🎯 Verificação concluída!'); 