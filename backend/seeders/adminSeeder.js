'use strict';

const bcrypt = require('bcryptjs');
const path = require('path');

// --- AJUSTE CRÍTICO DO CAMINHO CONFIRMADO ---
// Importamos agora o arquivo central de configuração do banco de dados.
// Caminho de 'backend/seeders/adminSeeder.js' para 'backend/database/index.js' é '../database'.
const db = require(path.join(__dirname, '..', 'database'));

// Desestruturamos os modelos e a instância do Sequelize do objeto 'db' exportado
const User = db.User;
const sequelizeInstance = db.sequelize;

// --- Lógica do Seeder (dentro de uma função assíncrona) ---
async function runAdminSeeder() {
  try {
    // 1. Verificar a conexão com o banco de dados (boa prática para depuração)
    await sequelizeInstance.authenticate();
    console.log('✅ Conexão com o banco de dados para o seeder estabelecida com sucesso.');

    // 2. Verificar se o usuário admin já existe pelo username
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });

    if (!existingAdmin) {
      // 3. Se o usuário admin não existir, crie-o
      const hashedPassword = await bcrypt.hash('guaguas00-42', 10); // Hash da senha '123456'

      await User.create({
        username: 'dv2010',
        email: 'valteroliveiratj32@gmail.com', // Campo 'email' é obrigatório no seu modelo User
        password: hashedPassword,
        role: 'admin', // Campo 'role' é obrigatório no seu modelo User
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✔ Usuário admin criado com sucesso!');
    } else {
      console.log('ℹ Usuário admin já existe. Nenhuma ação necessária.');
    }
  } catch (error) {
    console.error('❌ Erro ao executar o seeder de admin:', error);
    // Em caso de erro, encerra o processo com código de erro para que o deploy falhe visivelmente
    process.exit(1);
  } finally {
    // 4. IMPORTANTE: Fechar a conexão do banco de dados quando o seeder terminar
    if (sequelizeInstance) {
      await sequelizeInstance.close();
      console.log('Conexão com o banco de dados para o seeder fechada.');
    }
  }
}

// Executa a função do seeder
runAdminSeeder();