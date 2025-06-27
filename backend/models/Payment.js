// backend/models/Payment.js
const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo Payment
module.exports = (sequelize) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        valor: {
            // CORREÇÃO: Alterado de DataTypes.FLOAT para DataTypes.DECIMAL(10, 2)
            // DECIMAL é mais preciso para valores monetários, evitando problemas de ponto flutuante.
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false
        },
        dataPagamento: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        // NOVO: Forma de pagamento (ex: 'Dinheiro', 'Cartão de Crédito', 'Crediário', 'PIX')
        formaPagamento: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Dinheiro' // Valor padrão
        },
        // NOVO: Número de parcelas (para cartão/crediário)
        parcelas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        // NOVO: Bandeira do cartão (ex: 'Visa', 'Mastercard')
        bandeiraCartao: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // NOVO: Banco do crediário
        bancoCrediario: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Payment; // Retorna o modelo definido
};
