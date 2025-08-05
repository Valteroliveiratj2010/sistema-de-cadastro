const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🚀 INICIANDO SETUP COMPLETO DO BANCO DE DADOS');
console.log('==============================================');

async function setupCompleteDatabase() {
    // Configurações
    const dbName = 'gestor_pro_local';
    const adminUser = '19vsilva';
    const adminPassword = 'dv201015';
    
    console.log(`📋 Configurações:`);
    console.log(`   Banco: ${dbName}`);
    console.log(`   Usuário: ${adminUser}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log('');

    // Tentar conectar como postgres (superuser)
    const postgresSequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres', // Tentar senha padrão
        database: 'postgres',
        logging: false
    });

    try {
        console.log('🔌 Conectando como postgres...');
        await postgresSequelize.authenticate();
        console.log('✅ Conectado como postgres!');
        
        // Dropar banco se existir
        console.log(`🗑️ Removendo banco '${dbName}' se existir...`);
        try {
            await postgresSequelize.query(`DROP DATABASE IF EXISTS "${dbName}"`);
            console.log(`✅ Banco '${dbName}' removido`);
        } catch (error) {
            console.log(`⚠️ Erro ao remover banco: ${error.message}`);
        }

        // Dropar usuário se existir
        console.log(`🗑️ Removendo usuário '${adminUser}' se existir...`);
        try {
            await postgresSequelize.query(`DROP USER IF EXISTS "${adminUser}"`);
            console.log(`✅ Usuário '${adminUser}' removido`);
        } catch (error) {
            console.log(`⚠️ Erro ao remover usuário: ${error.message}`);
        }

        // Criar usuário
        console.log(`👤 Criando usuário '${adminUser}'...`);
        await postgresSequelize.query(`CREATE USER "${adminUser}" WITH PASSWORD '${adminPassword}'`);
        console.log(`✅ Usuário '${adminUser}' criado`);

        // Criar banco de dados
        console.log(`🏗️ Criando banco '${dbName}'...`);
        await postgresSequelize.query(`CREATE DATABASE "${dbName}" OWNER "${adminUser}"`);
        console.log(`✅ Banco '${dbName}' criado`);

        // Dar privilégios
        console.log(`🔐 Concedendo privilégios...`);
        await postgresSequelize.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${adminUser}"`);
        await postgresSequelize.query(`ALTER USER "${adminUser}" CREATEDB`);
        console.log(`✅ Privilégios concedidos`);

        await postgresSequelize.close();

        // Testar conexão com o novo usuário
        console.log(`\n🧪 Testando conexão com novo usuário...`);
        const testSequelize = new Sequelize({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: adminUser,
            password: adminPassword,
            database: dbName,
            logging: false
        });

        await testSequelize.authenticate();
        console.log(`✅ Conexão com '${adminUser}' bem-sucedida!`);
        await testSequelize.close();

        // Atualizar arquivo .env
        console.log(`\n📝 Atualizando arquivo .env...`);
        const fs = require('fs');
        const envPath = path.join(__dirname, '.env');
        
        let envContent = `ADMIN_USERNAME=${adminUser}
ADMIN_PASSWORD=${adminPassword}
PGUSER=${adminUser}
PGPASSWORD=${adminPassword}
PGDATABASE=${dbName}
PGHOST=localhost
PGPORT=5432
NODE_ENV=development
PORT=3000
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_2024
JWT_EXPIRES_IN=24h`;

        fs.writeFileSync(envPath, envContent);
        console.log(`✅ Arquivo .env atualizado`);

        console.log('\n🎉 SETUP CONCLUÍDO COM SUCESSO!');
        console.log('================================');
        console.log(`📋 Credenciais configuradas:`);
        console.log(`   Usuário: ${adminUser}`);
        console.log(`   Senha: ${adminPassword}`);
        console.log(`   Banco: ${dbName}`);
        console.log('');
        console.log('🔄 Próximos passos:');
        console.log('1. Executar: npm run migrate');
        console.log('2. Executar: npm run seed');
        console.log('3. Limpar cache do frontend');
        console.log('4. Fazer login com as novas credenciais');

        return true;

    } catch (error) {
        console.error('❌ Erro durante o setup:', error.message);
        console.log('');
        console.log('💡 SOLUÇÕES ALTERNATIVAS:');
        console.log('1. Verificar se PostgreSQL está rodando');
        console.log('2. Tentar senha diferente do postgres');
        console.log('3. Usar pgAdmin para criar manualmente');
        
        await postgresSequelize.close();
        return false;
    }
}

setupCompleteDatabase(); 