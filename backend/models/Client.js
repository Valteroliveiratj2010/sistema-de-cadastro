// backend/models/Client.js
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
        }
    });
    return Client; // Retorna o modelo definido
};