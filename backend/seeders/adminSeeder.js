'use strict';

// Forçar ambiente de produção para garantir SSL
process.env.NODE_ENV = 'production';

const path = require('path');
// Certifique-se de que o dotenv seja carregado no início da sua aplicação principal (server.js)
// Para um seeder standalone, você pode precisar carregá-lo aqui também se ele não for
// executado no contexto da sua aplicação principal que já carrega o dotenv.
// const dotenv = require('dotenv');
// dotenv.config();

const db = require(path.join(__dirname, '..', 'database'));
const User = db.User;
const sequelizeInstance = db.sequelize;

async function runAdminSeeder() {
  try {
    await sequelizeInstance.authenticate();
    console.log('✅ Conexão com o banco de dados para o seeder estabelecida com sucesso.');

    // --- Credenciais do Usuário Admin para o Seeder (Lendo de Variáveis de Ambiente) ---
    const newUsername = process.env.ADMIN_USERNAME || 'admin'; // Valor padrão se a variável não estiver definida
    const newEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!plainPassword) {
      throw new Error('❌ Variável de ambiente ADMIN_PASSWORD não definida. Não é possível criar o admin.');
    }
    // --- Fim das Credenciais ---

    // IMPORTANTE: NÃO fazer hash aqui! O modelo User.js fará isso automaticamente no hook beforeCreate
    // const hashedPassword = await bcrypt.hash(plainPassword, 10); // REMOVIDO - causa hash duplo!

    const [user, created] = await User.findOrCreate({
      where: { username: newUsername },
      defaults: {
        username: newUsername,
        email: newEmail,
        password: plainPassword, // Senha em texto plano - o modelo fará o hash
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    if (created) {
      console.log(`✔ Usuário admin '${newUsername}' criado com sucesso!`);
      console.log(`🔑 Senha configurada: ${plainPassword}`);
    } else {
      console.log(`ℹ Usuário admin '${newUsername}' já existe. Nenhuma ação necessária.`);
    }
  } catch (error) {
    console.error('❌ Erro ao executar o seeder de admin:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('⚠️ Detalhe do erro de unicidade:', error.errors.map(e => e.message).join(', '));
    }
    process.exit(1); // Ainda encerra para garantir que o deploy falhe se o seeder falhar criticamente
  } finally {
    // NÃO fechar a conexão aqui, pois o servidor principal ainda precisa dela
    // if (sequelizeInstance) {
    //   await sequelizeInstance.close();
    //   console.log('Conexão com o banco de dados para o seeder fechada.');
    // }
    console.log('✅ Seeder de admin concluído. Conexão mantida para o servidor.');
  }
}

runAdminSeeder();