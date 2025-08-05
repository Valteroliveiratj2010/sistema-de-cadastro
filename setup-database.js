// setup-database.js - Script para configurar o banco de dados
const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configurando banco de dados...');
    
    // Configurações do banco
    const config = {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '123456',
        database: 'postgres' // Conectar ao banco padrão primeiro
    };
    
    console.log('📊 Configurações:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
    });
    
    const client = new Client(config);
    
    try {
        // Conectar ao banco
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL');
        
        // Verificar se o banco existe
        const dbName = process.env.PGDATABASE || 'gestor_pro_dev';
        const checkDbQuery = `
            SELECT 1 FROM pg_database WHERE datname = $1
        `;
        
        const dbExists = await client.query(checkDbQuery, [dbName]);
        
        if (dbExists.rows.length === 0) {
            console.log(`📝 Criando banco de dados: ${dbName}`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Banco de dados ${dbName} criado com sucesso`);
        } else {
            console.log(`✅ Banco de dados ${dbName} já existe`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error.message);
        
        if (error.code === '28P01') {
            console.log('\n🔑 Problema de autenticação detectado!');
            console.log('📋 Possíveis soluções:');
            console.log('1. Verifique se o PostgreSQL está rodando');
            console.log('2. Verifique as credenciais no arquivo .env');
            console.log('3. Tente conectar com: psql -U postgres -h localhost');
            console.log('4. Se necessário, altere a senha do usuário postgres');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔌 Problema de conexão detectado!');
            console.log('📋 Possíveis soluções:');
            console.log('1. Verifique se o PostgreSQL está instalado e rodando');
            console.log('2. Verifique se a porta 5432 está disponível');
            console.log('3. Tente iniciar o serviço do PostgreSQL');
        }
        
    } finally {
        await client.end();
    }
}

// Executar setup
setupDatabase().then(() => {
    console.log('\n🎉 Setup do banco de dados concluído!');
    console.log('📝 Próximos passos:');
    console.log('1. Execute: npm run db:migrate');
    console.log('2. Execute: npm run db:seed');
    console.log('3. Execute: node server-improved.js');
}).catch(error => {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
}); 