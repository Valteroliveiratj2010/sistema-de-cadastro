const { Sequelize } = require('sequelize');

console.log('🚀 Criando usuário 19vsilva e banco gestor_pro...');

async function createUserAndDatabase() {
    // Conectar como postgres (superuser)
    const postgresSequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'guaguas00', // Senha que você forneceu
        database: 'postgres',
        logging: false
    });

    try {
        console.log('🔌 Conectando como postgres...');
        await postgresSequelize.authenticate();
        console.log('✅ Conectado como postgres!');
        
        // Dropar usuário e banco se existirem
        console.log('🗑️ Removendo usuário e banco se existirem...');
        try {
            await postgresSequelize.query(`DROP DATABASE IF EXISTS "gestor_pro"`);
            console.log('✅ Banco gestor_pro removido');
        } catch (error) {
            console.log(`⚠️ Erro ao remover banco: ${error.message}`);
        }

        try {
            await postgresSequelize.query(`DROP USER IF EXISTS "19vsilva"`);
            console.log('✅ Usuário 19vsilva removido');
        } catch (error) {
            console.log(`⚠️ Erro ao remover usuário: ${error.message}`);
        }

        // Criar usuário
        console.log('👤 Criando usuário 19vsilva...');
        await postgresSequelize.query(`CREATE USER "19vsilva" WITH PASSWORD 'dv201015'`);
        console.log('✅ Usuário 19vsilva criado!');

        // Criar banco de dados
        console.log('🏗️ Criando banco gestor_pro...');
        await postgresSequelize.query(`CREATE DATABASE "gestor_pro" OWNER "19vsilva"`);
        console.log('✅ Banco gestor_pro criado!');

        // Dar privilégios
        console.log('🔐 Concedendo privilégios...');
        await postgresSequelize.query(`GRANT ALL PRIVILEGES ON DATABASE "gestor_pro" TO "19vsilva"`);
        await postgresSequelize.query(`ALTER USER "19vsilva" CREATEDB`);
        console.log('✅ Privilégios concedidos!');

        await postgresSequelize.close();

        // Testar conexão com o novo usuário
        console.log('\n🧪 Testando conexão com novo usuário...');
        const testSequelize = new Sequelize({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: '19vsilva',
            password: 'dv201015',
            database: 'gestor_pro',
            logging: false
        });

        await testSequelize.authenticate();
        console.log('✅ Conexão com 19vsilva bem-sucedida!');
        await testSequelize.close();

        console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('========================================');
        console.log('📋 Credenciais configuradas:');
        console.log('   Usuário: 19vsilva');
        console.log('   Senha: dv201015');
        console.log('   Banco: gestor_pro');
        console.log('');
        console.log('🔄 Próximos passos:');
        console.log('1. Executar: npm run migrate');
        console.log('2. Executar: npm run seed');
        console.log('3. Limpar cache do frontend');
        console.log('4. Fazer login com: 19vsilva / dv201015');

        return true;

    } catch (error) {
        console.error('❌ Erro durante a criação:', error.message);
        await postgresSequelize.close();
        return false;
    }
}

createUserAndDatabase(); 