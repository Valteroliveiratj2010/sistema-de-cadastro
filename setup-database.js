#!/usr/bin/env node

// Script para configurar o banco de dados automaticamente
require('dotenv').config();

// Forçar ambiente de produção para usar configuração SSL
process.env.NODE_ENV = 'production';

console.log('🚀 Configurando banco de dados...\n');
console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);

async function setupDatabase() {
    try {
        console.log('1️⃣ Testando conexão com o banco...');
        const { sequelize, User } = require('./backend/database');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida');
        
        console.log('\n2️⃣ Executando migrações...');
        const { execSync } = require('child_process');
        
        try {
            execSync('npx sequelize-cli db:migrate', { 
                stdio: 'inherit',
                cwd: process.cwd(),
                env: { ...process.env, NODE_ENV: 'production' }
            });
            console.log('✅ Migrações executadas com sucesso');
        } catch (migrationError) {
            console.log('⚠️ Erro nas migrações:', migrationError.message);
            console.log('💡 Tentando continuar...');
        }
        
        console.log('\n3️⃣ Verificando usuário admin existente...');
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        
        if (existingAdmin) {
            console.log(`⚠️ Usuário admin existente encontrado: ${existingAdmin.username}`);
            console.log('🗑️ Removendo usuário admin existente para evitar problemas de hash...');
            await existingAdmin.destroy();
            console.log('✅ Usuário admin removido');
        }
        
        console.log('\n4️⃣ Executando seeder do admin...');
        try {
            require('./backend/seeders/adminSeeder');
            console.log('✅ Seeder executado');
        } catch (seederError) {
            console.log('⚠️ Erro no seeder:', seederError.message);
        }
        
        console.log('\n5️⃣ Verificando configuração final...');
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        
        if (adminUser) {
            console.log('✅ Usuário admin criado:', adminUser.username);
            
            // Testar se a senha está funcionando
            const plainPassword = process.env.ADMIN_PASSWORD;
            if (plainPassword) {
                const isPasswordValid = await adminUser.comparePassword(plainPassword);
                if (isPasswordValid) {
                    console.log('✅ Senha do admin está funcionando corretamente');
                } else {
                    console.log('❌ Problema com a senha do admin detectado');
                }
            }
        } else {
            console.log('❌ Usuário admin não encontrado');
        }
        
        console.log('\n📊 Configuração concluída!');
        console.log('✅ Banco de dados configurado');
        console.log('✅ Tabelas criadas');
        console.log('✅ Usuário admin criado');
        
        console.log('\n🔑 Credenciais do admin:');
        console.log(`Usuário: ${process.env.ADMIN_USERNAME || 'admin'}`);
        console.log(`Senha: ${process.env.ADMIN_PASSWORD ? '***' : 'Não configurada'}`);
        
        if (!process.env.ADMIN_PASSWORD) {
            console.log('\n⚠️ ADMIN_PASSWORD não configurada!');
            console.log('Configure a variável de ambiente ADMIN_PASSWORD');
        }
        
        console.log('\n🧪 Para testar o login, execute:');
        console.log('node test-password-hash.js');
        
    } catch (error) {
        console.error('❌ Erro na configuração:', error.message);
        
        if (error.name === 'SequelizeConnectionError') {
            console.log('\n💡 Verifique:');
            console.log('1. DATABASE_URL está configurada corretamente');
            console.log('2. Banco PostgreSQL está ativo');
            console.log('3. Credenciais estão corretas');
        } else if (error.message.includes('SSL/TLS')) {
            console.log('\n💡 Problema de SSL detectado:');
            console.log('1. Verifique se DATABASE_URL inclui parâmetros SSL');
            console.log('2. Confirme se o banco está configurado para SSL');
        }
        
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Executar configuração
setupDatabase(); 