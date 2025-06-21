// backend/models/Sale.js
const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo
module.exports = (sequelize) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        valorTotal: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        valorPago: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'Pendente'
        },
        dataVenda: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        dataVencimento: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    });
    return Sale; // Retorna o modelo definido
};