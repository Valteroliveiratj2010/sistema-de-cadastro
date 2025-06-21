// backend/models/Payment.js
const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo
module.exports = (sequelize) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        valor: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        dataPagamento: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        }
    });
    return Payment; // Retorna o modelo definido
};