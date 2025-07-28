const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando correções das compras...');

// Verificar se a função openPurchaseModal tem a lógica de edição
const appJsPath = path.join(__dirname, 'frontend', 'js', 'app.js');
const content = fs.readFileSync(appJsPath, 'utf8');

// Verificar se há lógica para carregar dados de compra existente
if (content.includes('if (purchaseId) {') && content.includes('const purchase = await api.getPurchaseById(purchaseId)')) {
    console.log('✅ Lógica de edição encontrada em openPurchaseModal');
} else {
    console.log('❌ Lógica de edição NÃO encontrada em openPurchaseModal');
}

// Verificar se há função renderPurchaseDetail
if (content.includes('renderPurchaseDetail:')) {
    console.log('✅ Função renderPurchaseDetail encontrada');
} else {
    console.log('❌ Função renderPurchaseDetail NÃO encontrada');
}

// Verificar se há função loadPurchaseDetail
if (content.includes('loadPurchaseDetail:')) {
    console.log('✅ Função loadPurchaseDetail encontrada');
} else {
    console.log('❌ Função loadPurchaseDetail NÃO encontrada');
}

console.log('🎯 Teste concluído!'); 