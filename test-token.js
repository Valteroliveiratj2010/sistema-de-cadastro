const https = require('https');

async function testToken() {
    console.log('🧪 Testando token de autenticação...\n');
    
    // Simular um token (você deve substituir pelo token real)
    const token = 'SEU_TOKEN_AQUI'; // Substitua pelo token real do localStorage
    
    if (token === 'SEU_TOKEN_AQUI') {
        console.log('❌ Por favor, substitua SEU_TOKEN_AQUI pelo token real do localStorage');
        console.log('📝 Para obter o token:');
        console.log('   1. Abra o navegador');
        console.log('   2. Faça login no sistema');
        console.log('   3. Abra o DevTools (F12)');
        console.log('   4. Vá para Console e digite: localStorage.getItem("token")');
        console.log('   5. Copie o token e substitua no script');
        return;
    }
    
    const options = {
        hostname: 'sistema-de-cadastro-backend.onrender.com',
        port: 443,
        path: '/api/dashboard/stats',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📡 Status: ${res.statusCode}`);
                console.log(`📄 Headers:`, res.headers);
                console.log(`📝 Response:`, data.substring(0, 200) + '...');
                
                if (res.statusCode === 200) {
                    console.log('✅ Token válido! API funcionando.');
                } else if (res.statusCode === 401) {
                    console.log('❌ Token inválido ou expirado.');
                } else if (res.statusCode === 403) {
                    console.log('❌ Token válido mas sem permissão.');
                } else {
                    console.log('❌ Erro na API.');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Executar teste
testToken().catch(console.error); 