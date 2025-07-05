// backend/models/Product.js
const { DataTypes } = require('sequelize');

// Exporta uma função que define o modelo Produto
module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true // Descrição pode ser opcional
        },
        precoVenda: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.00
        },
        precoCusto: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.00
        },
        estoque: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        sku: { // Stock Keeping Unit (código único do produto)
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        }
    });

    return Product; // Retorna o modelo definido
};