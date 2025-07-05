// backend/models/SaleProduct.js
const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo SaleProduct (Item de Venda)
module.exports = (sequelize) => {
    const SaleProduct = sequelize.define('SaleProduct', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantidade: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        // Preço unitário do produto NO MOMENTO DA VENDA
        // Isso é crucial porque o preço do produto pode mudar no futuro,
        // mas o preço da venda específica deve ser o daquele momento.
        precoUnitario: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    return SaleProduct; // Retorna o modelo definido
};