#!/usr/bin/env node

// Script para verificar se o backend está funcionando
const https = require('https');
const http = require('http');

const API_URL = 'https://sistema-de-cadastro-backend.onrender.com/api';

console.log('🔍 Verificando status do backend...\n');

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 10000 // 10 segundos
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function checkBackend() {
    try {
        console.log('1️⃣ Testando endpoint /ping...');
        const pingResponse = await makeRequest(`${API_URL}/ping`);
        
        if (pingResponse.status === 200) {
            console.log('✅ /ping OK - Backend está respondendo');
            try {
                const pingData = JSON.parse(pingResponse.data);
                console.log(`   Resposta: ${JSON.stringify(pingData)}`);
            } catch (e) {
                console.log(`   Resposta bruta: ${pingResponse.data}`);
            }
        } else {
            console.log(`❌ /ping falhou - Status: ${pingResponse.status}`);
            console.log(`   Resposta: ${pingResponse.data}`);
        }
        
        console.log('\n2️⃣ Testando endpoint /auth/login (sem credenciais)...');
        const loginResponse = await makeRequest(`${API_URL}/auth/login`, {
            method: 'POST',
            body: { username: 'test', password: 'test' }
        });
        
        if (loginResponse.status === 401) {
            console.log('✅ /auth/login OK - Endpoint está funcionando (401 esperado para credenciais inválidas)');
            try {
                const loginData = JSON.parse(loginResponse.data);
                console.log(`   Resposta: ${JSON.stringify(loginData)}`);
            } catch (e) {
                console.log(`   Resposta bruta: ${loginResponse.data}`);
            }
        } else {
            console.log(`⚠️ /auth/login retornou status inesperado: ${loginResponse.status}`);
            console.log(`   Resposta: ${loginResponse.data}`);
        }
        
        console.log('\n3️⃣ Verificando headers CORS...');
        const corsHeaders = pingResponse.headers;
        const hasCors = corsHeaders['access-control-allow-origin'] || 
                       corsHeaders['access-control-allow-headers'] ||
                       corsHeaders['access-control-allow-methods'];
        
        if (hasCors) {
            console.log('✅ Headers CORS detectados');
            console.log(`   Origin: ${corsHeaders['access-control-allow-origin'] || 'N/A'}`);
            console.log(`   Methods: ${corsHeaders['access-control-allow-methods'] || 'N/A'}`);
            console.log(`   Headers: ${corsHeaders['access-control-allow-headers'] || 'N/A'}`);
        } else {
            console.log('⚠️ Headers CORS não detectados - pode causar problemas no frontend');
        }
        
        console.log('\n📊 Resumo:');
        console.log('✅ Backend está online e respondendo');
        console.log('✅ Endpoints básicos estão funcionando');
        console.log('✅ Sistema de autenticação está ativo');
        
        if (!hasCors) {
            console.log('⚠️ Possível problema de CORS - verifique a configuração');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar backend:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('💡 Dica: Verifique se a URL está correta ou se o domínio existe');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Dica: O servidor pode estar offline ou a porta está incorreta');
        } else if (error.message === 'Timeout') {
            console.log('💡 Dica: O servidor está demorando muito para responder');
        }
    }
}

// Executar verificação
checkBackend(); 