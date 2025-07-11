'use strict';

const bcrypt = require('bcryptjs');
const path = require('path');

// Importa a instância do banco de dados e os modelos
const db = require(path.join(__dirname, '..', 'database'));
const User = db.User;
const sequelizeInstance = db.sequelize;

async function runAdminSeeder() {
  try {
    // 1. Testar conexão com o banco de dados
    await sequelizeInstance.authenticate();
    console.log('✅ Conexão com o banco de dados para o seeder estabelecida com sucesso.');

    // --- Credenciais do Usuário Admin para o Seeder ---
    // Mude 'temedv' e 'admin@gestorpro.com' para o username e email que você deseja
    // e 'SuaNovaSenhaForteAqui!' para a senha forte que você vai usar.
    const newUsername = '19vsilva'; // O username que o seeder vai tentar criar/encontrar
    const newEmail = 'gestorpro42@gmail.com'; // O email que o seeder vai tentar criar
    const plainPassword = 'dv201015'; // A senha em texto puro para o hash
    // --- Fim das Credenciais ---

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 2. Usar findOrCreate para idempotência robusta
    // Ele tenta encontrar o usuário pelo 'username'. Se não encontrar, cria-o com os 'defaults'.
    const [user, created] = await User.findOrCreate({
      where: { username: newUsername }, // Condição para encontrar o usuário
      defaults: { // Dados a serem usados se o usuário for criado (não encontrado)
        username: newUsername,
        email: newEmail,
        password: hashedPassword,
        role: 'admin', // Ou a role padrão para o admin
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    if (created) {
      console.log(`✔ Usuário admin '${newUsername}' criado com sucesso!`);
    } else {
      console.log(`ℹ Usuário admin '${newUsername}' já existe. Nenhuma ação necessária.`);
      // Opcional: Se você quiser garantir que a senha/email estejam atualizados mesmo se o usuário já existir
      // (caso você mude a senha no seeder e queira que ela seja aplicada)
      // if (user.email !== newEmail || !(await bcrypt.compare(plainPassword, user.password))) {
      //   user.email = newEmail;
      //   user.password = hashedPassword; // A senha já está hasheada aqui
      //   await user.save();
      //   console.log(`✔ Usuário admin '${newUsername}' atualizado com sucesso!`);
      // }
    }
  } catch (error) {
    console.error('❌ Erro ao executar o seeder de admin:', error);
    // Captura especificamente erros de violação de unicidade.
    // Não encerra o processo se for apenas uma violação de unicidade,
    // pois o usuário pode já existir e o findOrCreate pode ter falhado na detecção.
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('⚠️ Detalhe do erro de unicidade:', error.errors.map(e => e.message).join(', '));
      // Permite que o build continue, pois o usuário já existe no DB.
    } else {
      process.exit(1); // Encerra para outros erros críticos
    }
  } finally {
    // 3. Fechar a conexão com o banco de dados
    if (sequelizeInstance) {
      await sequelizeInstance.close();
      console.log('Conexão com o banco de dados para o seeder fechada.');
    }
  }
}

// Executa a função do seeder
runAdminSeeder();
