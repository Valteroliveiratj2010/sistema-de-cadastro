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
            type: DataTypes.FLOAT,
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
        // O userId aqui representaria quem REGISTROU a compra no sistema
        userId: { 
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Referencia a tabela de usuários
                key: 'id'
            }
        }
    }, {
        tableName: 'purchases', // Nome da tabela no banco de dados
        timestamps: true // Adiciona createdAt e updatedAt
    });

    return Purchase;
};
