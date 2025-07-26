const https = require('https');

async function testProductRanking() {
    console.log('🧪 Testando ranking de produtos...\n');
    
    // COLE O NOVO TOKEN AQUI (substitua SEU_TOKEN_AQUI pelo token real)
    const token = 'SEU_TOKEN_AQUI'; // Substitua pelo novo token do localStorage
    
    if (token === 'SEU_TOKEN_AQUI') {
        console.log('❌ Por favor, substitua SEU_TOKEN_AQUI pelo token real');
        console.log('📝 Para obter o token:');
        console.log('   1. Abra o navegador');
        console.log('   2. Acesse: https://sistema-de-cadastro-gr66n0gy6-valteroliveiratj2010s-projects.vercel.app');
        console.log('   3. Faça login com: 19vsilva / dv201015');
        console.log('   4. Abra DevTools (F12)');
        console.log('   5. No Console, digite: localStorage.getItem("token")');
        console.log('   6. Copie o token e substitua no script');
        return;
    }
    
    const endpoints = [
        { name: 'Ranking de Produtos', endpoint: '/rankings/produtos' },
        { name: 'Ranking de Clientes', endpoint: '/rankings/clientes' },
        { name: 'Ranking de Vendedores', endpoint: '/rankings/vendedores' }
    ];
    
    for (const { name, endpoint } of endpoints) {
        try {
            console.log(`📡 Testando: ${name}`);
            
            const result = await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'sistema-de-cadastro-backend.onrender.com',
                    port: 443,
                    path: `/api${endpoint}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };
                
                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            data: data
                        });
                    });
                });
                
                req.on('error', (error) => {
                    reject(error);
                });
                
                req.end();
            });
            
            console.log(`   Status: ${result.statusCode}`);
            
            if (result.statusCode === 200) {
                console.log(`   ✅ ${name} funcionando!`);
                try {
                    const jsonData = JSON.parse(result.data);
                    console.log(`   📊 Dados: ${JSON.stringify(jsonData, null, 2)}`);
                } catch (e) {
                    console.log(`   📄 Response: ${result.data.substring(0, 200)}...`);
                }
            } else if (result.statusCode === 500) {
                console.log(`   ❌ Erro 500: ${result.data}`);
            } else {
                console.log(`   ⚠️  Status inesperado: ${result.statusCode}`);
                console.log(`   📄 Response: ${result.data}`);
            }
            console.log('');
            
        } catch (error) {
            console.log(`   ❌ Erro de conexão: ${error.message}`);
            console.log('');
        }
    }
    
    console.log('🎯 Teste concluído!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Aguardar deploy no Render (2-3 minutos)');
    console.log('2. Executar este script novamente');
    console.log('3. Testar no frontend');
}

testProductRanking().catch(console.error); 