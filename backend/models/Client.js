// backend/models/Client.js
const { DataTypes } = require('sequelize');

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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // OU: model: sequelize.models.User (em associações)
                key: 'id'
            }
        }
    }, {
        tableName: 'Clients', // Garante o nome exato da tabela no DB
        timestamps: true // Se quiser createdAt e updatedAt
    });

    // Associações (declaradas fora do define)
    Client.associate = (models) => {
        Client.belongsTo(models.User, { foreignKey: 'userId', as: 'usuario' });
    };

    return Client;
};