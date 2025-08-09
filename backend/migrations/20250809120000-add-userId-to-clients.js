'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona coluna userId em Clients
    await queryInterface.addColumn('Clients', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    // Índice para performance em filtros por vendedor
    await queryInterface.addIndex('Clients', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Clients', ['userId']);
    await queryInterface.removeColumn('Clients', 'userId');
  }
}; 