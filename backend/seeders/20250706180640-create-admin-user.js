'use strict';

/** @type {import('sequelize-cli').Seeder} */ // Corrigido o tipo para Seeder
module.exports = {
  async up (queryInterface, Sequelize) {
    // A função 'up' é executada quando o seeder é aplicado.
    // Aqui, inserimos o usuário 'admin' na tabela 'Users'.
    await queryInterface.bulkInsert('Users', [{
      username: '42vsilva',
      email: 'admin@example.com', // Certifique-se de usar um email válido ou que você possa acessar
      password: 'guaguas00', // Esta senha será hashed automaticamente pelo hook do modelo User
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // A função 'down' é executada quando o seeder é revertido.
    // Aqui, removemos o usuário 'admin' da tabela 'Users'.
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};
