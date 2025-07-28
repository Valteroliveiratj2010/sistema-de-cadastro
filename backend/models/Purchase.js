// backend/models/Purchase.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Purchase = sequelize.define('Purchase', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        supplierId: { // ID do fornecedor
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'suppliers', // Referencia a tabela de fornecedores
                key: 'id'
            }
        },
        dataCompra: { // Data em que a compra foi realizada
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        valorTotal: { // Valor total da compra
            // CORREÇÃO: Alterado de DataTypes.FLOAT para DataTypes.DECIMAL(10, 2)
            // DECIMAL é mais preciso para valores monetários, evitando problemas de ponto flutuante.
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false
        },
        status: { // Status da compra (Ex: 'Pendente', 'Concluída', 'Cancelada')
            type: DataTypes.ENUM('Pendente', 'Concluída', 'Cancelada'),
            allowNull: false,
            defaultValue: 'Concluída' // Assumimos que a compra é concluída ao ser registrada
        },
        observacoes: { // Campo para observações adicionais sobre a compra
            type: DataTypes.TEXT,
            allowNull: true
        },
        // userId removido - não existe na tabela real
    }, {
        tableName: 'Purchases', // Nome da tabela no banco de dados (com P maiúsculo)
        timestamps: true // Adiciona createdAt e updatedAt
    });

    // Definindo associações
    Purchase.associate = (models) => {
        Purchase.belongsTo(models.Supplier, { foreignKey: 'supplierId', as: 'supplier' });
        // Associação com User removida - userId não existe na tabela
        
        // Associações para PurchaseProduct
        Purchase.hasMany(models.PurchaseProduct, { foreignKey: 'purchaseId', as: 'purchaseProducts' });
        Purchase.belongsToMany(models.Product, { 
            through: models.PurchaseProduct, 
            foreignKey: 'purchaseId',
            otherKey: 'productId',
            as: 'products'
        });
    };

    return Purchase;
};