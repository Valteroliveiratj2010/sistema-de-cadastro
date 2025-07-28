// Script para testar a API getPurchaseById
console.log('🧪 Testando API getPurchaseById...');

// Verificar se a API está disponível
console.log('1. Verificando se api está disponível:', typeof api);
console.log('2. Verificando se api.getPurchaseById está disponível:', typeof api?.getPurchaseById);

// Testar a chamada da API
async function testPurchaseAPI() {
    try {
        console.log('3. Fazendo chamada para API...');
        const result = await api.getPurchaseById(12);
        console.log('4. ✅ Sucesso! Resultado:', result);
        
        // Testar renderização
        console.log('5. Testando renderização...');
        if (typeof ui?.renderPurchaseDetail === 'function') {
            ui.renderPurchaseDetail(result);
            console.log('6. ✅ Renderização concluída');
        } else {
            console.log('6. ❌ ui.renderPurchaseDetail não está disponível');
        }
        
    } catch (error) {
        console.log('4. ❌ Erro na API:', error);
        console.log('   - Mensagem:', error.message);
        console.log('   - Stack:', error.stack);
    }
}

// Executar teste
testPurchaseAPI(); 