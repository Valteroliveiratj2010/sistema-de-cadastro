const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const { Sequelize } = require('sequelize');

async function resetDatabase() {
    console.log('🔄 Iniciando reset completo do banco de dados...');
    
    // Configuração para conectar ao PostgreSQL
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        username: 'postgres', // Usar postgres como superuser
        password: 'postgres', // Senha padrão do postgres
        database: 'postgres', // Conectar ao banco padrão
        logging: false
    });

    try {
        // Testar conexão
        await sequelize.authenticate();
        console.log('✅ Conectado ao PostgreSQL como superuser');

        // Dropar o banco se existir
        const dbName = process.env.PGDATABASE || 'gestor_pro_dev';
        console.log(`🗑️ Droppando banco '${dbName}' se existir...`);
        
        try {
            await sequelize.query(`DROP DATABASE IF EXISTS "${dbName}"`);
            console.log(`✅ Banco '${dbName}' removido`);
        } catch (error) {
            console.log(`⚠️ Erro ao dropar banco: ${error.message}`);
        }

        // Criar o banco novamente
        console.log(`🏗️ Criando banco '${dbName}'...`);
        await sequelize.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Banco '${dbName}' criado`);

        // Fechar conexão com postgres
        await sequelize.close();

        // Conectar ao banco criado
        const newSequelize = new Sequelize({
            dialect: 'postgres',
            host: process.env.PGHOST || 'localhost',
            port: process.env.PGPORT || 5432,
            username: 'postgres',
            password: 'postgres',
            database: dbName,
            logging: false
        });

        await newSequelize.authenticate();
        console.log(`✅ Conectado ao banco '${dbName}'`);

        // Criar usuário 19vsilva
        const adminUser = process.env.ADMIN_USERNAME || '19vsilva';
        const adminPassword = process.env.ADMIN_PASSWORD || 'dv201015';
        
        console.log(`👤 Criando usuário '${adminUser}'...`);
        await newSequelize.query(`CREATE USER "${adminUser}" WITH PASSWORD '${adminPassword}'`);
        console.log(`✅ Usuário '${adminUser}' criado`);

        // Dar privilégios ao usuário
        console.log(`🔐 Concedendo privilégios ao usuário '${adminUser}'...`);
        await newSequelize.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${adminUser}"`);
        await newSequelize.query(`ALTER USER "${adminUser}" CREATEDB`);
        console.log(`✅ Privilégios concedidos`);

        await newSequelize.close();
        console.log('🎉 Reset do banco concluído com sucesso!');
        console.log('');
        console.log('📋 Credenciais configuradas:');
        console.log(`   Usuário: ${adminUser}`);
        console.log(`   Senha: ${adminPassword}`);
        console.log(`   Banco: ${dbName}`);
        console.log('');
        console.log('🔄 Agora execute: npm run migrate && npm run seed');

    } catch (error) {
        console.error('❌ Erro durante o reset:', error.message);
        console.log('');
        console.log('💡 Se a senha do postgres for diferente, edite este script');
        console.log('   e altere a linha: password: "postgres" para a senha correta');
    }
}

resetDatabase(); 