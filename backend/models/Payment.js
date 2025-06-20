const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Sale = require('./Sale.js');

const Payment = sequelize.define('Payment', {
    valor: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dataPagamento: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
});

// Relação: Um Pagamento (Payment) pertence a uma Venda (Sale)
Sale.hasMany(Payment, { as: 'payments', foreignKey: 'saleId' });
Payment.belongsTo(Sale, { as: 'sale', foreignKey: 'saleId' });

module.exports = Payment;