const { Sequelize } = require('sequelize');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔧 Corrigindo usuário 19vsilva...');

async function fixUserPassword() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        username: process.env.PGUSER || '19vsilva',
        password: process.env.PGPASSWORD || 'dv201015',
        database: process.env.PGDATABASE || 'gestor_pro',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        // Remover usuário existente
        await sequelize.query('DELETE FROM "Users" WHERE username = \'19vsilva\'');
        console.log('🗑️ Usuário 19vsilva removido');

        // Criar usuário com senha simples para teste
        await sequelize.query(`
            INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt")
            VALUES ('19vsilva', '19vsilva@gestorpro.com', 'dv201015', 'admin', NOW(), NOW())
        `);

        console.log('✅ Usuário 19vsilva recriado com senha simples');
        console.log('📋 Credenciais:');
        console.log('   Usuário: 19vsilva');
        console.log('   Senha: dv201015');

        // Verificar se foi criado
        const [results] = await sequelize.query('SELECT * FROM "Users" WHERE username = \'19vsilva\'');
        if (results.length > 0) {
            console.log('✅ Usuário verificado no banco');
        }

        await sequelize.close();
        console.log('🎉 Processo concluído!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        await sequelize.close();
    }
}

fixUserPassword(); 