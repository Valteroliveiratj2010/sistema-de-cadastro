#!/usr/bin/env node

// Script para testar o problema do hash duplo de senha
require('dotenv').config();

// Forçar ambiente de produção para usar configuração SSL
process.env.NODE_ENV = 'production';

console.log('🔍 Testando problema do hash duplo de senha...\n');
console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);

async function testPasswordHash() {
    try {
        console.log('1️⃣ Carregando modelo User...');
        const { User, sequelize } = require('./backend/database');
        
        console.log('2️⃣ Conectando ao banco...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida');
        
        console.log('\n3️⃣ Verificando usuário admin existente...');
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminUser) {
            console.log('❌ Usuário admin não encontrado');
            console.log('💡 Execute o seeder: node backend/seeders/adminSeeder.js');
            return;
        }
        
        console.log(`✅ Usuário admin encontrado: ${adminUser.username}`);
        console.log(`📧 Email: ${adminUser.email}`);
        console.log(`🔐 Senha hashada: ${adminUser.password.substring(0, 20)}...`);
        
        console.log('\n4️⃣ Testando senha do ambiente...');
        const plainPassword = process.env.ADMIN_PASSWORD;
        
        if (!plainPassword) {
            console.log('❌ ADMIN_PASSWORD não configurada no ambiente');
            return;
        }
        
        console.log(`🔑 Senha do ambiente: ${plainPassword}`);
        
        console.log('\n5️⃣ Testando comparação de senha...');
        const isPasswordValid = await adminUser.comparePassword(plainPassword);
        
        if (isPasswordValid) {
            console.log('✅ Senha válida! Hash está correto');
        } else {
            console.log('❌ Senha inválida! Problema de hash detectado');
            
            console.log('\n🔧 Diagnóstico do problema:');
            console.log('1. Verifique se o seeder foi executado após a correção');
            console.log('2. O seeder agora NÃO faz hash da senha');
            console.log('3. O modelo User.js faz o hash automaticamente');
            
            console.log('\n💡 Soluções:');
            console.log('1. Delete o usuário admin existente');
            console.log('2. Execute o seeder novamente: node backend/seeders/adminSeeder.js');
            console.log('3. Ou use o script de setup: node setup-database.js');
        }
        
        console.log('\n6️⃣ Testando criação de novo usuário (simulação)...');
        
        // Simular criação de usuário para verificar se o hash está funcionando
        const testPassword = 'test123';
        const testUser = User.build({
            username: 'test_user',
            email: 'test@example.com',
            password: testPassword,
            role: 'vendedor'
        });
        
        // O hook beforeCreate será executado automaticamente
        await testUser.save();
        
        console.log(`✅ Usuário de teste criado: ${testUser.username}`);
        console.log(`🔐 Hash da senha de teste: ${testUser.password.substring(0, 20)}...`);
        
        // Testar comparação
        const testPasswordValid = await testUser.comparePassword(testPassword);
        console.log(`🔍 Senha de teste válida: ${testPasswordValid ? '✅ Sim' : '❌ Não'}`);
        
        // Limpar usuário de teste
        await testUser.destroy();
        console.log('🧹 Usuário de teste removido');
        
        console.log('\n📊 Resumo:');
        if (isPasswordValid) {
            console.log('✅ Sistema de hash funcionando corretamente');
            console.log('✅ Senha do admin está válida');
        } else {
            console.log('❌ Problema de hash detectado');
            console.log('💡 Execute o seeder novamente');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        
        if (error.name === 'SequelizeConnectionError') {
            console.log('\n💡 Verifique a conexão com o banco de dados');
            console.log('1. DATABASE_URL está configurada corretamente?');
            console.log('2. Banco PostgreSQL está ativo no Render?');
            console.log('3. Credenciais estão corretas?');
        } else if (error.message.includes('SSL/TLS')) {
            console.log('\n💡 Problema de SSL detectado');
            console.log('1. Verifique se DATABASE_URL inclui parâmetros SSL');
            console.log('2. Confirme se o banco está configurado para SSL');
        }
    } finally {
        process.exit(0);
    }
}

// Executar teste
testPasswordHash(); 