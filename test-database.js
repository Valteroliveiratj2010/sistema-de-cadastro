#!/usr/bin/env node

// Script para testar a conexão com o banco de dados
require('dotenv').config();

// Forçar ambiente de produção para usar configuração SSL
process.env.NODE_ENV = 'production';

console.log('🔍 Testando conexão com o banco de dados...\n');
console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);

async function testDatabase() {
    try {
        console.log('1️⃣ Carregando configuração do banco...');
        
        const { sequelize } = require('./backend/database');
        
        console.log('2️⃣ Tentando conectar com o banco...');
        await sequelize.authenticate();
        
        console.log('✅ Conexão com o banco estabelecida com sucesso!');
        
        console.log('\n3️⃣ Verificando se as tabelas existem...');
        const tables = await sequelize.showAllSchemas();
        console.log('Tabelas encontradas:', tables.length);
        
        // Verificar tabelas específicas
        const tableNames = ['Users', 'Clients', 'Products', 'Sales', 'Payments'];
        for (const tableName of tableNames) {
            try {
                const tableExists = await sequelize.getQueryInterface().showAllTables();
                if (tableExists.includes(tableName.toLowerCase())) {
                    console.log(`✅ Tabela ${tableName} existe`);
                } else {
                    console.log(`❌ Tabela ${tableName} não encontrada`);
                }
            } catch (error) {
                console.log(`⚠️ Erro ao verificar tabela ${tableName}:`, error.message);
            }
        }
        
        console.log('\n4️⃣ Verificando se existe usuário admin...');
        const { User } = require('./backend/database');
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        
        if (adminUser) {
            console.log('✅ Usuário admin encontrado:', adminUser.username);
        } else {
            console.log('❌ Usuário admin não encontrado');
            console.log('💡 Execute o seeder: node backend/seeders/adminSeeder.js');
        }
        
        console.log('\n📊 Resumo:');
        console.log('✅ Banco de dados conectado');
        console.log('✅ Configuração correta');
        
        if (!adminUser) {
            console.log('⚠️ Usuário admin não existe - execute o seeder');
        }
        
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error.message);
        
        if (error.name === 'SequelizeConnectionError') {
            console.log('\n💡 Possíveis soluções:');
            console.log('1. Verifique se a DATABASE_URL está correta');
            console.log('2. Confirme se o banco PostgreSQL está ativo');
            console.log('3. Verifique se as credenciais estão corretas');
            console.log('4. Confirme se o banco existe');
        } else if (error.name === 'SequelizeHostNotFoundError') {
            console.log('\n💡 Erro de host não encontrado:');
            console.log('1. Verifique se a URL do banco está correta');
            console.log('2. Confirme se o serviço de banco está online');
        } else if (error.name === 'SequelizeAccessDeniedError') {
            console.log('\n💡 Erro de acesso negado:');
            console.log('1. Verifique usuário e senha');
            console.log('2. Confirme se o usuário tem permissões');
        } else if (error.message.includes('SSL/TLS')) {
            console.log('\n💡 Problema de SSL detectado:');
            console.log('1. Verifique se DATABASE_URL inclui parâmetros SSL');
            console.log('2. Confirme se o banco está configurado para SSL');
        }
        
        console.log('\n🔧 Variáveis de ambiente necessárias:');
        console.log('- DATABASE_URL (para produção)');
        console.log('- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (para desenvolvimento)');
    } finally {
        process.exit(0);
    }
}

// Executar teste
testDatabase(); 