const https = require('https');

async function testWithToken() {
    console.log('🧪 Testando API com token real...\n');
    
    // COLE O TOKEN REAL AQUI (substitua SEU_TOKEN_AQUI pelo token real)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywidXNlcm5hbWUiOiIxOXZzaWx2YSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzU1MjI4MiwiZXhwIjoxNzUzNTU1ODgyfQ.VrYftDYRVfinZQNLHnRU8q_4DXICbuIqSH-zuU6l3bM'; // Token real do localStorage
    
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
    
    // Decodificar o token para debug
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('🔍 Token decodificado:');
            console.log(`   ID: ${payload.id}`);
            console.log(`   Username: ${payload.username}`);
            console.log(`   Role: ${payload.role}`);
            console.log(`   Exp: ${new Date(payload.exp * 1000).toLocaleString()}`);
            console.log('');
        }
    } catch (error) {
        console.log('❌ Erro ao decodificar token:', error.message);
        console.log('');
    }
    
    const endpoints = [
        '/dashboard/stats',
        '/clients',
        '/sales',
        '/products',
        '/suppliers',
        '/purchases',
        '/users'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Testando: ${endpoint}`);
            
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
                            headers: res.headers,
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
                console.log(`   ✅ Sucesso!`);
                console.log(`   📄 Response: ${result.data.substring(0, 200)}...`);
            } else if (result.statusCode === 401) {
                console.log(`   ❌ Token inválido ou expirado`);
                console.log(`   📄 Response: ${result.data}`);
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
}

testWithToken().catch(console.error); 