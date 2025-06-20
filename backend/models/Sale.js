const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Client = require('./Client.js');

const Sale = sequelize.define('Sale', {
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
        defaultValue: 'Pendente' // Pendente, Paga, Atrasada
    },
    dataVenda: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    // NOVO CAMPO
    dataVencimento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
});

// A relação continua a mesma
Client.hasMany(Sale, { as: 'sales', foreignKey: 'clientId' });
Sale.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

module.exports = Sale;