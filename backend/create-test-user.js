const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

console.log('🧪 Criando usuário de teste...');

async function createTestUser() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: '19vsilva',
        password: 'dv201015',
        database: 'gestor_pro',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco');

        // Hash da senha
        const hashedPassword = await bcrypt.hash('teste123', 10);
        
        // Criar usuário de teste
        await sequelize.query(`
            INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt")
            VALUES ('teste', 'teste@teste.com', '${hashedPassword}', 'admin', NOW(), NOW())
            ON CONFLICT (username) DO NOTHING
        `);
        
        console.log('✅ Usuário de teste criado!');
        console.log('📋 Credenciais de teste:');
        console.log('   Usuário: teste');
        console.log('   Senha: teste123');

        await sequelize.close();

    } catch (error) {
        console.error('❌ Erro:', error.message);
        await sequelize.close();
    }
}

createTestUser(); 