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
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        custo: {
            type: DataTypes.DECIMAL(10, 2),
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
    }, {
        tableName: 'Products', // Nome da tabela no banco de dados
        timestamps: true // Adiciona createdAt e updatedAt
    });

    // Definindo associações
    Product.associate = (models) => {
        Product.hasMany(models.SaleProduct, { foreignKey: 'productId', as: 'saleProducts' });
        Product.belongsToMany(models.Sale, { 
            through: models.SaleProduct, 
            foreignKey: 'productId',
            otherKey: 'saleId',
            as: 'sales'
        });
        
        // Associações para PurchaseProduct
        Product.hasMany(models.PurchaseProduct, { foreignKey: 'productId', as: 'purchaseProducts' });
        Product.belongsToMany(models.Purchase, { 
            through: models.PurchaseProduct, 
            foreignKey: 'productId',
            otherKey: 'purchaseId',
            as: 'purchases'
        });
    };

    return Product; // Retorna o modelo definido
};