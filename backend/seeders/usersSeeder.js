'use strict';

// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

const db = require(path.join(__dirname, '..', 'database'));
const User = db.User;
const sequelizeInstance = db.sequelize;

async function runUsersSeeder() {
    try {
        await sequelizeInstance.authenticate();
        console.log('✅ Conexão com o banco de dados para o seeder estabelecida com sucesso.');

        const usersToCreate = [
            { username: 'gerente1', email: 'gerente1@empresa.com', password: 'gerente123', role: 'gerente' },
            { username: 'gerente2', email: 'gerente2@empresa.com', password: 'gerente123', role: 'gerente' },
            { username: 'vendedor1', email: 'vendedor1@empresa.com', password: 'vendedor123', role: 'vendedor' },
            { username: 'vendedor2', email: 'vendedor2@empresa.com', password: 'vendedor123', role: 'vendedor' },
            { username: 'vendedor3', email: 'vendedor3@empresa.com', password: 'vendedor123', role: 'vendedor' }
        ];

        console.log('🔍 Iniciando criação de usuários gerentes e vendedores...');

        for (const userData of usersToCreate) {
            try {
                const [user, created] = await User.findOrCreate({
                    where: { username: userData.username },
                    defaults: {
                        username: userData.username,
                        email: userData.email,
                        password: userData.password,
                        role: userData.role,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                if (created) {
                    console.log(`✅ Usuário ${userData.role} '${userData.username}' criado com sucesso!`);
                    console.log(`   📧 Email: ${userData.email}`);
                    console.log(`   🔑 Senha: ${userData.password}`);
                } else {
                    console.log(`ℹ Usuário ${userData.role} '${userData.username}' já existe.`);
                }
            } catch (error) {
                console.error(`❌ Erro ao criar usuário ${userData.username}:`, error.message);
            }
        }

        console.log('✅ Seeder de usuários concluído com sucesso!');
        console.log('\n📋 Resumo dos usuários criados:');
        console.log('Gerentes:');
        console.log('  - Username: gerente1, Email: gerente1@empresa.com, Senha: gerente123');
        console.log('  - Username: gerente2, Email: gerente2@empresa.com, Senha: gerente123');
        console.log('Vendedores:');
        console.log('  - Username: vendedor1, Email: vendedor1@empresa.com, Senha: vendedor123');
        console.log('  - Username: vendedor2, Email: vendedor2@empresa.com, Senha: vendedor123');
        console.log('  - Username: vendedor3, Email: vendedor3@empresa.com, Senha: vendedor123');

    } catch (error) {
        console.error('❌ Erro ao executar o seeder de usuários:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('⚠️ Detalhe do erro de unicidade:', error.errors.map(e => e.message).join(', '));
        }
        process.exit(1);
    } finally {
        console.log('✅ Seeder de usuários concluído. Conexão mantida para o servidor.');
    }
}

runUsersSeeder(); 