const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔧 Criando usuário 19vsilva com senha correta...');

async function createUserCorrect() {
    try {
        // Carregar o banco de dados
        const db = require('./database');
        const User = db.User;
        const sequelize = db.sequelize;

        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        // Remover usuário existente
        await User.destroy({ where: { username: '19vsilva' } });
        console.log('🗑️ Usuário 19vsilva removido');

        // Criar usuário usando o modelo Sequelize (que fará o hash automaticamente)
        const newUser = await User.create({
            username: '19vsilva',
            email: '19vsilva@gestorpro.com',
            password: 'dv201015', // Será hasheada automaticamente pelo hook beforeCreate
            role: 'admin'
        });

        console.log('✅ Usuário 19vsilva criado com sucesso!');
        console.log('📋 Credenciais:');
        console.log('   Usuário: 19vsilva');
        console.log('   Senha: dv201015');
        console.log('   ID:', newUser.id);

        // Verificar se foi criado
        const user = await User.findOne({ where: { username: '19vsilva' } });
        if (user) {
            console.log('✅ Usuário verificado no banco');
            console.log('🔐 Senha tem hash:', user.password !== 'dv201015');
        }

        await sequelize.close();
        console.log('🎉 Processo concluído!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

createUserCorrect(); 