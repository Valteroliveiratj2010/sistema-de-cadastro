// Teste detalhado da API
console.log('🧪 Iniciando teste detalhado da API...');

// 1. Verificar token
const token = localStorage.getItem('token');
console.log('1. Token encontrado:', !!token);
if (token) {
    console.log('   - Primeiros 20 caracteres:', token.substring(0, 20) + '...');
}

// 2. Verificar se o backend está rodando
console.log('2. Testando conexão com backend...');
fetch('http://localhost:8080/api/dashboard/stats', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('   - Status dashboard:', response.status);
    return response.json();
})
.then(data => {
    console.log('   - Dashboard funcionando:', !!data);
})
.catch(error => {
    console.log('   - Erro dashboard:', error.message);
});

// 3. Testar API de compras
console.log('3. Testando API de compras...');
fetch('http://localhost:8080/api/purchases/12', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('   - Status compra:', response.status);
    console.log('   - Headers:', response.headers);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
})
.then(data => {
    console.log('   - Dados da compra:', data);
    console.log('   - ID da compra:', data?.id);
    console.log('   - Fornecedor:', data?.supplier?.nome);
    console.log('   - Produtos:', data?.purchaseProducts?.length || 0);
})
.catch(error => {
    console.log('   - Erro na API de compras:', error.message);
});

// 4. Testar lista de compras
console.log('4. Testando lista de compras...');
fetch('http://localhost:8080/api/purchases?page=1&limit=10', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('   - Status lista:', response.status);
    return response.json();
})
.then(data => {
    console.log('   - Total de compras:', data?.total || 0);
    console.log('   - Primeira compra:', data?.data?.[0]?.id);
})
.catch(error => {
    console.log('   - Erro na lista:', error.message);
});

console.log('✅ Teste iniciado! Aguarde os resultados...'); 