'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // A função 'up' é executada quando a migração é aplicada.
    // Aqui, criamos a tabela 'Users' no banco de dados.
    await queryInterface.createTable('Users', { // 'Users' é o nome da tabela no DB
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Garante que o username seja único
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Garante que o email seja único
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'gerente', 'vendedor'), // Define os papéis permitidos
        allowNull: false,
        defaultValue: 'vendedor',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    // A função 'down' é executada quando a migração é revertida.
    // Aqui, removemos a tabela 'Users' do banco de dados.
    await queryInterface.dropTable('Users');
  }
};
