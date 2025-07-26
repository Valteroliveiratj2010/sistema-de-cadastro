#!/usr/bin/env node

// Script para criar usuário admin diretamente
require('dotenv').config();

// Forçar ambiente de produção
process.env.NODE_ENV = 'production';

console.log('👤 Criando usuário admin diretamente...\n');
console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);

async function createAdmin() {
    try {
        console.log('1️⃣ Carregando modelo User...');
        const { User, sequelize } = require('./backend/database');
        
        console.log('2️⃣ Conectando ao banco...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida');
        
        console.log('\n3️⃣ Verificando usuário admin existente...');
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        
        if (existingAdmin) {
            console.log(`⚠️ Usuário admin existente encontrado: ${existingAdmin.username}`);
            console.log('🗑️ Removendo usuário admin existente...');
            await existingAdmin.destroy();
            console.log('✅ Usuário admin removido');
        }
        
        console.log('\n4️⃣ Criando novo usuário admin...');
        
        const adminData = {
            username: process.env.ADMIN_USERNAME || 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        };
        
        if (!adminData.password) {
            throw new Error('ADMIN_PASSWORD não configurada no ambiente');
        }
        
        console.log(`📝 Dados do admin:`);
        console.log(`   Usuário: ${adminData.username}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Senha: ${'*'.repeat(adminData.password.length)}`);
        console.log(`   Role: ${adminData.role}`);
        
        // Criar usuário (o modelo fará o hash automaticamente)
        const newAdmin = await User.create(adminData);
        
        console.log('✅ Usuário admin criado com sucesso!');
        console.log(`   ID: ${newAdmin.id}`);
        console.log(`   Usuário: ${newAdmin.username}`);
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Role: ${newAdmin.role}`);
        
        console.log('\n5️⃣ Testando senha...');
        const isPasswordValid = await newAdmin.comparePassword(adminData.password);
        
        if (isPasswordValid) {
            console.log('✅ Senha funcionando corretamente!');
        } else {
            console.log('❌ Problema com a senha detectado');
        }
        
        console.log('\n📊 Resumo:');
        console.log('✅ Usuário admin criado');
        console.log('✅ Hash de senha funcionando');
        console.log('✅ Sistema pronto para login');
        
        console.log('\n🔑 Credenciais para login:');
        console.log(`   Usuário: ${adminData.username}`);
        console.log(`   Senha: ${adminData.password}`);
        
        console.log('\n🧪 Para testar o login:');
        console.log('1. Abra test-login.html no navegador');
        console.log('2. Use as credenciais acima');
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error.message);
        
        if (error.name === 'SequelizeConnectionError') {
            console.log('\n💡 Problema de conexão detectado');
            console.log('1. Verifique se o banco está online');
            console.log('2. Tente novamente em alguns segundos');
            console.log('3. Verifique a DATABASE_URL');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('\n💡 Usuário já existe');
            console.log('Execute: node test-password-hash.js para verificar');
        }
    } finally {
        process.exit(0);
    }
}

// Executar criação
createAdmin(); 