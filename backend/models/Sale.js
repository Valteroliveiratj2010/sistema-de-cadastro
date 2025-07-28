// backend/models/Sale.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Clients', // Nome da tabela no banco de dados
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT', // Restringe a exclusão de cliente se houver vendas
        },
        // NOVO: Adiciona o campo userId para associar a venda a um utilizador
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Pode ser null se a venda não for associada a um utilizador específico (ex: importação)
            references: {
                model: 'Users', // Nome da tabela no banco de dados
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL', // Se o utilizador for excluído, define userId como NULL
        },
        dataVenda: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dataVencimento: {
            type: DataTypes.DATE,
            allowNull: true, // Vendas podem não ter data de vencimento (ex: pagas à vista)
        },
        valorTotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        valorPago: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.ENUM('Pendente', 'Pago', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Pendente',
        },
    });

    // Definindo associações (serão chamadas no database/index.js)
    Sale.associate = (models) => {
        Sale.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
        Sale.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Sale.hasMany(models.SaleProduct, { foreignKey: 'saleId', as: 'saleProducts' });
        Sale.hasMany(models.Payment, { foreignKey: 'saleId', as: 'payments' });
        Sale.belongsToMany(models.Product, { 
            through: models.SaleProduct, 
            foreignKey: 'saleId',
            otherKey: 'productId',
            as: 'products'
        });
    };

    return Sale;
};