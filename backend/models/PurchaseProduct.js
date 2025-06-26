// backend/models/PurchaseProduct.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PurchaseProduct = sequelize.define('PurchaseProduct', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        purchaseId: { // ID da compra à qual este produto pertence
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'purchases', // Referencia a tabela de compras
                key: 'id'
            }
        },
        productId: { // ID do produto que foi comprado
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products', // Referencia a tabela de produtos
                key: 'id'
            }
        },
        quantidade: { // Quantidade do produto comprada
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precoCustoUnitario: { // Preço de custo unitário na hora da compra (pode ser diferente do precoCusto atual do produto)
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }, {
        tableName: 'purchase_products', // Nome da tabela no banco de dados
        timestamps: false // Não precisamos de timestamps nesta tabela de junção
    });

    return PurchaseProduct;
};
