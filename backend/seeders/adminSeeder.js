'use strict';

const bcrypt = require('bcryptjs');
const path = require('path');

// Ajuste para o caminho correto do seu arquivo models/index.js que exporta os modelos Sequelize
// O Sequelize CLI executa os seeders a partir da raiz do projeto, então o caminho deve ser absoluto ou relativo à raiz.
// Se `adminSeeder.js` está em `backend/seeders/`, e `models/index.js` está em `backend/models/`, então:
const { User } = require(path.join(__dirname, '..', 'models')); // Caminho ajustado para o contexto do seeder CLI

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Verifique se o usuário admin já existe pelo username ou email (username é mais comum para admin)
      const existingAdmin = await User.findOne({ where: { username: 'admin' } });

      if (!existingAdmin) {
        // 2. Se o usuário admin não existir, crie-o
        const hashedPassword = await bcrypt.hash('guaguas00', 10); // Hash da senha '123456'

        await queryInterface.bulkInsert('Users', [{ // 'Users' deve ser o nome real da sua tabela
          username: 'dv2010',
          email: 'admin@example.com', // Boa prática adicionar um email também, se seu modelo tiver
          password: hashedPassword,
          role: 'admin', // Adicione qualquer outro campo obrigatório, como 'role'
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});

        console.log('✔ Usuário admin criado com sucesso!');
      } else {
        console.log('ℹ Usuário admin já existe. Nenhuma ação necessária.');
      }
    } catch (error) {
      console.error('❌ Erro ao executar o seeder de admin:', error);
      // Opcional: Rejeitar a promise para indicar falha ao Sequelize CLI
      // throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Ação para reverter o seeder (geralmente usada em ambiente de desenvolvimento/teste)
    try {
      await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
      console.log('✔ Usuário admin removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao reverter o seeder de admin:', error);
      // throw error;
    }
  }
};