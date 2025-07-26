const https = require('https');

async function testApiRoute(endpoint, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'sistema-de-cadastro-backend.onrender.com',
            port: 443,
            path: `/api${endpoint}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 500) + '...'
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}

async function testAllRoutes() {
    console.log('🧪 Testando rotas da API...\n');
    
    const routes = [
        { name: 'Ping (sem auth)', endpoint: '/ping' },
        { name: 'Dashboard Stats (com auth)', endpoint: '/dashboard/stats', needsAuth: true },
        { name: 'Clients (com auth)', endpoint: '/clients', needsAuth: true },
        { name: 'Sales (com auth)', endpoint: '/sales', needsAuth: true },
        { name: 'Products (com auth)', endpoint: '/products', needsAuth: true },
        { name: 'Suppliers (com auth)', endpoint: '/suppliers', needsAuth: true },
        { name: 'Purchases (com auth)', endpoint: '/purchases', needsAuth: true },
        { name: 'Users (com auth)', endpoint: '/users', needsAuth: true }
    ];
    
    // Primeiro, vamos testar o ping sem autenticação
    try {
        console.log('📡 Testando: Ping (sem autenticação)');
        const pingResult = await testApiRoute('/ping');
        console.log(`   Status: ${pingResult.statusCode}`);
        console.log(`   Response: ${pingResult.data}`);
        console.log('');
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        console.log('');
    }
    
    // Agora vamos testar as rotas que precisam de autenticação
    console.log('🔐 Testando rotas que precisam de autenticação...');
    console.log('⚠️  Estas rotas devem retornar 401 (não autorizado) sem token\n');
    
    for (const route of routes) {
        if (route.needsAuth) {
            try {
                console.log(`📡 Testando: ${route.name}`);
                const result = await testApiRoute(route.endpoint);
                console.log(`   Status: ${result.statusCode}`);
                
                if (result.statusCode === 401) {
                    console.log(`   ✅ Esperado: 401 (não autorizado)`);
                } else if (result.statusCode === 500) {
                    console.log(`   ❌ Erro 500: ${result.data}`);
                } else {
                    console.log(`   ⚠️  Status inesperado: ${result.statusCode}`);
                }
                console.log('');
            } catch (error) {
                console.log(`   ❌ Erro de conexão: ${error.message}`);
                console.log('');
            }
        }
    }
    
    console.log('🎯 Teste concluído!');
    console.log('\n📝 Interpretação:');
    console.log('- Status 401: Normal (sem token)');
    console.log('- Status 500: Problema no backend');
    console.log('- Status 200: Funcionando (se tivesse token)');
}

// Executar teste
testAllRoutes().catch(console.error); 