const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo
module.exports = (sequelize) => {
    const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // NOVO: Adiciona a coluna userId ao modelo Client
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Assume que todo cliente é criado por um usuário
            references: {
                model: 'Users', // Nome da tabela que ele referencia (geralmente plural do nome do modelo)
                key: 'id'
            }
        }
    });
    return Client; // Retorna o modelo definido
};
