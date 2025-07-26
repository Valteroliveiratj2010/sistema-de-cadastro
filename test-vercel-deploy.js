const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://sistema-de-cadastro-fyfzsrrot-valteroliveiratj2010s-projects.vercel.app';

async function testUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 200) + '...' // Primeiros 200 caracteres
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testDeploy() {
    console.log('🧪 Testando deploy no Vercel...\n');
    
    const tests = [
        { name: 'Página Principal', url: `${BASE_URL}/` },
        { name: 'Login', url: `${BASE_URL}/login` },
        { name: 'App.js', url: `${BASE_URL}/js/app.js` },
        { name: 'Style.css', url: `${BASE_URL}/style.css` },
        { name: 'Test App.js', url: `${BASE_URL}/test-app-js` },
        { name: 'Test Logout', url: `${BASE_URL}/test-logout-simple` },
        { name: 'Sair', url: `${BASE_URL}/sair` }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📡 Testando: ${test.name}`);
            console.log(`   URL: ${test.url}`);
            
            const result = await testUrl(test.url);
            
            if (result.statusCode === 200) {
                console.log(`   ✅ Status: ${result.statusCode} - OK`);
                console.log(`   📄 Content-Type: ${result.headers['content-type'] || 'N/A'}`);
            } else {
                console.log(`   ❌ Status: ${result.statusCode} - ERRO`);
            }
            
            console.log('');
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            console.log('');
        }
    }
    
    console.log('🎯 Teste concluído!');
}

// Executar teste
testDeploy().catch(console.error); 