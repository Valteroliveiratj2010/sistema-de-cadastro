console.log('🔍 Testando correções finais das compras...');

// Verificar se a função showSection limpa a seção de detalhes da compra
const appJsContent = fs.readFileSync('frontend/js/app.js', 'utf8');

if (appJsContent.includes('purchaseDetailSection && sectionId !== \'purchaseDetailSection\'')) {
    console.log('✅ Função showSection limpa seção de detalhes da compra');
} else {
    console.log('❌ Função showSection NÃO limpa seção de detalhes da compra');
}

// Verificar se a função renderPurchaseDetail usa a seção existente
if (appJsContent.includes('const section = document.getElementById(\'purchaseDetailSection\')')) {
    console.log('✅ Função renderPurchaseDetail usa seção existente');
} else {
    console.log('❌ Função renderPurchaseDetail NÃO usa seção existente');
}

// Verificar se a função openPurchaseModal carrega dados existentes
if (appJsContent.includes('if (purchaseId) {') && appJsContent.includes('const purchase = await api.getPurchaseById(purchaseId)')) {
    console.log('✅ Função openPurchaseModal carrega dados existentes');
} else {
    console.log('❌ Função openPurchaseModal NÃO carrega dados existentes');
}

console.log('🎯 Teste concluído!'); 