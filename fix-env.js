#!/usr/bin/env node

// Script para corrigir automaticamente o arquivo .env
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo arquivo .env...\n');

function fixEnv() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ Arquivo .env não encontrado!');
        return;
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('1️⃣ Verificando configuração atual...');
    
    // Extrair informações das variáveis individuais
    const dbHost = envContent.match(/DB_HOST\s*=\s*(.+)/)?.[1]?.trim();
    const dbPort = envContent.match(/DB_PORT\s*=\s*(.+)/)?.[1]?.trim();
    const dbName = envContent.match(/DB_NAME\s*=\s*(.+)/)?.[1]?.trim();
    const dbUser = envContent.match(/DB_USER\s*=\s*(.+)/)?.[1]?.trim();
    const dbPassword = envContent.match(/DB_PASSWORD\s*=\s*(.+)/)?.[1]?.trim();
    
    if (dbHost && dbPort && dbName && dbUser && dbPassword) {
        console.log('✅ Variáveis individuais encontradas');
        
        // Construir DATABASE_URL
        const databaseUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=require`;
        
        console.log('2️⃣ Construindo DATABASE_URL...');
        console.log(`URL: ${databaseUrl.substring(0, 50)}...`);
        
        // Verificar se DATABASE_URL já existe (comentada ou não)
        const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
        
        if (hasDatabaseUrl) {
            console.log('3️⃣ Substituindo DATABASE_URL existente...');
            // Substituir linha comentada ou existente
            envContent = envContent.replace(
                /#?\s*DATABASE_URL\s*=\s*.+/g,
                `DATABASE_URL=${databaseUrl}`
            );
        } else {
            console.log('3️⃣ Adicionando DATABASE_URL...');
            // Adicionar após as variáveis do banco
            const insertAfter = 'DB_PASSWORD=' + dbPassword;
            envContent = envContent.replace(
                insertAfter,
                `${insertAfter}\n\n# URL completa do banco de dados\nDATABASE_URL=${databaseUrl}`
            );
        }
        
        // Garantir que NODE_ENV seja production
        envContent = envContent.replace(
            /NODE_ENV\s*=\s*.+/g,
            'NODE_ENV=production'
        );
        
        console.log('4️⃣ Salvando arquivo .env corrigido...');
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Arquivo .env corrigido!');
        
        console.log('\n5️⃣ Verificando correção...');
        
        // Recarregar dotenv
        delete require.cache[require.resolve('dotenv')];
        require('dotenv').config();
        
        if (process.env.DATABASE_URL) {
            console.log('✅ DATABASE_URL carregada corretamente');
            console.log(`URL: ${process.env.DATABASE_URL.substring(0, 50)}...`);
        } else {
            console.log('❌ DATABASE_URL ainda não está sendo carregada');
        }
        
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        
        console.log('\n📋 Próximos passos:');
        console.log('1. Execute: node check-env.js');
        console.log('2. Execute: node test-database.js');
        console.log('3. Execute: node test-password-hash.js');
        
    } else {
        console.log('❌ Variáveis individuais do banco não encontradas');
        console.log('💡 Verifique se DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD estão configuradas');
    }
}

// Executar correção
fixEnv(); 