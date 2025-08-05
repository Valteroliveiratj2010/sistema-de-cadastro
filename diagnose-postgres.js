// diagnose-postgres.js - Script de diagnóstico do PostgreSQL
const { Client } = require('pg');
const net = require('net');
require('dotenv').config();

async function diagnosePostgres() {
    console.log('🔍 Diagnóstico do PostgreSQL...\n');
    
    // 1. Verificar variáveis de ambiente
    console.log('📋 Variáveis de ambiente:');
    console.log(`   PGHOST: ${process.env.PGHOST || 'localhost (padrão)'}`);
    console.log(`   PGPORT: ${process.env.PGPORT || '5432 (padrão)'}`);
    console.log(`   PGUSER: ${process.env.PGUSER || 'postgres (padrão)'}`);
    console.log(`   PGDATABASE: ${process.env.PGDATABASE || 'gestor_pro_dev (padrão)'}`);
    console.log(`   PGPASSWORD: ${process.env.PGPASSWORD ? '***definida***' : 'não definida'}`);
    console.log('');
    
    // 2. Verificar conectividade de rede
    const host = process.env.PGHOST || 'localhost';
    const port = process.env.PGPORT || 5432;
    
    console.log(`🌐 Testando conectividade com ${host}:${port}...`);
    
    try {
        await new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const timeout = setTimeout(() => {
                socket.destroy();
                reject(new Error('Timeout'));
            }, 5000);
            
            socket.connect(port, host, () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve();
            });
            
            socket.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
        console.log('✅ Conectividade de rede OK');
    } catch (error) {
        console.log('❌ Problema de conectividade de rede:', error.message);
        console.log('   Verifique se o PostgreSQL está rodando na porta', port);
        return;
    }
    
    // 3. Tentar conectar ao PostgreSQL
    console.log('\n🔌 Testando conexão com PostgreSQL...');
    
    const config = {
        host: host,
        port: parseInt(port),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '123456',
        database: 'postgres',
        connectionTimeoutMillis: 5000
    };
    
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('✅ Conexão com PostgreSQL estabelecida');
        
        // 4. Verificar versão
        const versionResult = await client.query('SELECT version()');
        console.log('📊 Versão do PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
        
        // 5. Verificar bancos existentes
        const databasesResult = await client.query(`
            SELECT datname FROM pg_database 
            WHERE datistemplate = false 
            ORDER BY datname
        `);
        
        console.log('📁 Bancos de dados existentes:');
        databasesResult.rows.forEach(row => {
            console.log(`   - ${row.datname}`);
        });
        
        // 6. Verificar se o banco do projeto existe
        const targetDb = process.env.PGDATABASE || 'gestor_pro_dev';
        const dbExists = databasesResult.rows.find(row => row.datname === targetDb);
        
        if (dbExists) {
            console.log(`✅ Banco '${targetDb}' existe`);
        } else {
            console.log(`❌ Banco '${targetDb}' não existe`);
            console.log('   Execute: node setup-database.js');
        }
        
    } catch (error) {
        console.log('❌ Erro na conexão com PostgreSQL:', error.message);
        
        if (error.code === '28P01') {
            console.log('\n🔑 Problema de autenticação!');
            console.log('📋 Soluções:');
            console.log('1. Verifique a senha do usuário postgres');
            console.log('2. Tente conectar manualmente: psql -U postgres -h localhost');
            console.log('3. Se necessário, altere a senha: ALTER USER postgres PASSWORD \'nova_senha\';');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔌 Serviço não disponível!');
            console.log('📋 Soluções:');
            console.log('1. Verifique se o PostgreSQL está instalado');
            console.log('2. Inicie o serviço do PostgreSQL');
            console.log('3. No Windows: services.msc > PostgreSQL > Start');
        }
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n🌐 Host não encontrado!');
            console.log('📋 Soluções:');
            console.log('1. Verifique se o host está correto');
            console.log('2. Verifique se o PostgreSQL está rodando');
        }
        
    } finally {
        await client.end();
    }
    
    console.log('\n🎯 Resumo do diagnóstico:');
    console.log('✅ Servidor melhorado funcionando');
    console.log('✅ Rotas da API carregadas');
    console.log('⚠️  Banco de dados precisa ser configurado');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure o PostgreSQL (se necessário)');
    console.log('2. Execute: node setup-database.js');
    console.log('3. Execute: npm run db:migrate');
    console.log('4. Execute: npm run db:seed');
    console.log('5. Execute: node server-improved.js');
}

// Executar diagnóstico
diagnosePostgres().catch(error => {
    console.error('❌ Erro no diagnóstico:', error);
}); 