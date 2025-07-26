#!/usr/bin/env node

// Script para diagnosticar problemas com variáveis de ambiente
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de Variáveis de Ambiente\n');

function debugEnv() {
    const envPath = path.join(process.cwd(), '.env');
    
    console.log('1️⃣ Verificando arquivo .env...');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ Arquivo .env não encontrado!');
        return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Arquivo .env encontrado');
    console.log(`📏 Tamanho: ${envContent.length} caracteres`);
    
    console.log('\n2️⃣ Conteúdo do arquivo .env:');
    console.log('--- INÍCIO DO ARQUIVO .env ---');
    console.log(envContent);
    console.log('--- FIM DO ARQUIVO .env ---');
    
    console.log('\n3️⃣ Verificando variáveis específicas...');
    
    // Verificar DATABASE_URL
    const databaseUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
    if (databaseUrlMatch) {
        const databaseUrl = databaseUrlMatch[1].trim();
        console.log(`✅ DATABASE_URL encontrada: ${databaseUrl.substring(0, 50)}...`);
        
        // Verificar se tem aspas
        if (databaseUrl.startsWith('"') || databaseUrl.startsWith("'")) {
            console.log('⚠️ DATABASE_URL tem aspas - pode causar problemas');
        }
        
        // Verificar se tem quebra de linha
        if (databaseUrl.includes('\n')) {
            console.log('⚠️ DATABASE_URL tem quebra de linha - pode causar problemas');
        }
        
        // Verificar formato
        if (databaseUrl.includes('postgresql://')) {
            console.log('✅ Formato PostgreSQL detectado');
        } else if (databaseUrl.includes('postgres://')) {
            console.log('✅ Formato PostgreSQL detectado (postgres://)');
        } else {
            console.log('⚠️ Formato pode estar incorreto');
        }
        
        // Verificar SSL
        if (databaseUrl.includes('sslmode=require')) {
            console.log('✅ SSL mode=require detectado');
        } else {
            console.log('⚠️ SSL não configurado - adicione ?sslmode=require');
        }
    } else {
        console.log('❌ DATABASE_URL não encontrada no arquivo');
    }
    
    console.log('\n4️⃣ Testando carregamento com dotenv...');
    
    // Limpar cache do dotenv
    delete require.cache[require.resolve('dotenv')];
    
    // Carregar dotenv
    require('dotenv').config();
    
    console.log('✅ dotenv carregado');
    
    console.log('\n5️⃣ Variáveis após carregamento:');
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`ADMIN_USERNAME: ${process.env.ADMIN_USERNAME ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ Presente' : '❌ Ausente'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV ? '✅ Presente' : '❌ Ausente'}`);
    
    if (process.env.DATABASE_URL) {
        console.log(`DATABASE_URL valor: ${process.env.DATABASE_URL.substring(0, 50)}...`);
    }
    
    console.log('\n6️⃣ Possíveis problemas:');
    
    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL não está sendo carregada pelo dotenv');
        console.log('💡 Possíveis causas:');
        console.log('1. Formato incorreto no arquivo .env');
        console.log('2. Caracteres especiais na URL');
        console.log('3. Quebra de linha na URL');
        console.log('4. Aspas desnecessárias');
        
        console.log('\n🔧 Soluções:');
        console.log('1. Verifique se não há espaços extras');
        console.log('2. Remova aspas se existirem');
        console.log('3. Certifique-se de que não há quebra de linha');
        console.log('4. Formato correto: DATABASE_URL=postgresql://usuario:senha@host:porta/banco?sslmode=require');
    } else {
        console.log('✅ DATABASE_URL está sendo carregada corretamente');
    }
    
    console.log('\n📋 Próximos passos:');
    if (process.env.DATABASE_URL) {
        console.log('1. Execute: node test-database.js');
        console.log('2. Execute: node test-password-hash.js');
    } else {
        console.log('1. Corrija o arquivo .env');
        console.log('2. Execute este script novamente');
    }
}

// Executar diagnóstico
debugEnv(); 