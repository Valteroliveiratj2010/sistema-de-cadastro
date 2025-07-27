// Teste dos endpoints da API
console.log('🧪 Testando endpoints da API...');

// Função para testar endpoint
async function testEndpoint(endpoint, name) {
    try {
        console.log(`📡 Testando ${name}...`);
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log(`❌ Token não encontrado para ${name}`);
            return;
        }
        
        const response = await fetch(`https://sistema-de-cadastro-backend.onrender.com/api/${endpoint}?page=1&q=&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📊 Status ${name}:`, response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${name} carregado com sucesso:`, data);
            console.log(`📈 Número de ${name}:`, data.data ? data.data.length : 0);
            
            if (data.data && data.data.length > 0) {
                console.log(`📋 Primeiro ${name}:`, data.data[0]);
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ Erro ao carregar ${name}:`, errorText);
        }
        
    } catch (error) {
        console.error(`❌ Erro no teste de ${name}:`, error);
    }
}

// Executar testes
async function runTests() {
    console.log('🚀 Iniciando testes da API...');
    
    await testEndpoint('clients', 'Clientes');
    await testEndpoint('products', 'Produtos');
    
    console.log('✅ Testes concluídos!');
}

// Executar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
} 