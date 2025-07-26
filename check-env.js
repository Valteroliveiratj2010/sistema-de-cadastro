#!/usr/bin/env node

// Script para verificar variáveis de ambiente
require('dotenv').config();

console.log('🔍 Verificando variáveis de ambiente...\n');

function checkEnv() {
    console.log('1️⃣ Variáveis de ambiente essenciais:');
    
    const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD'
    ];
    
    let allPresent = true;
    
    for (const varName of requiredVars) {
        const value = process.env[varName];
        if (value) {
            if (varName === 'DATABASE_URL') {
                // Mostrar apenas parte da URL para segurança
                const urlParts = value.split('@');
                if (urlParts.length > 1) {
                    const hostPart = urlParts[1];
                    console.log(`✅ ${varName}: postgresql://***@${hostPart}`);
                } else {
                    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
                }
            } else if (varName === 'JWT_SECRET') {
                console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
            } else if (varName === 'ADMIN_PASSWORD') {
                console.log(`✅ ${varName}: ${'*'.repeat(value.length)}`);
            } else {
                console.log(`✅ ${varName}: ${value}`);
            }
        } else {
            console.log(`❌ ${varName}: NÃO CONFIGURADA`);
            allPresent = false;
        }
    }
    
    console.log('\n2️⃣ Configuração do ambiente:');
    const nodeEnv = process.env.NODE_ENV || 'development';
    console.log(`🌍 NODE_ENV: ${nodeEnv}`);
    
    if (nodeEnv === 'production') {
        console.log('✅ Ambiente de produção - SSL será usado');
    } else {
        console.log('⚠️ Ambiente de desenvolvimento - SSL pode não ser usado');
    }
    
    console.log('\n3️⃣ Verificação da DATABASE_URL:');
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
        if (databaseUrl.includes('postgresql://')) {
            console.log('✅ Formato PostgreSQL detectado');
        } else if (databaseUrl.includes('postgres://')) {
            console.log('✅ Formato PostgreSQL detectado (postgres://)');
        } else {
            console.log('⚠️ Formato de URL pode estar incorreto');
        }
        
        if (databaseUrl.includes('sslmode=require')) {
            console.log('✅ SSL mode=require detectado');
        } else if (databaseUrl.includes('ssl=true')) {
            console.log('✅ SSL=true detectado');
        } else {
            console.log('⚠️ Parâmetros SSL não detectados na URL');
            console.log('💡 Adicione ?sslmode=require ao final da DATABASE_URL');
        }
    }
    
    console.log('\n📊 Resumo:');
    if (allPresent) {
        console.log('✅ Todas as variáveis essenciais estão configuradas');
    } else {
        console.log('❌ Algumas variáveis estão faltando');
        console.log('\n💡 Configure as variáveis de ambiente:');
        console.log('DATABASE_URL=sua_url_do_banco');
        console.log('JWT_SECRET=sua_chave_secreta');
        console.log('ADMIN_USERNAME=admin');
        console.log('ADMIN_PASSWORD=sua_senha');
    }
    
    console.log('\n🔧 Para testar a conexão:');
    console.log('node test-database.js');
}

// Executar verificação
checkEnv(); 