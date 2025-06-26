// backend/models/Supplier.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Supplier = sequelize.define('Supplier', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Garante que não haja fornecedores com o mesmo nome
        },
        contato: {
            type: DataTypes.STRING,
            allowNull: true // Telefone ou pessoa de contato
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true, // Garante que não haja emails duplicados para fornecedores
            validate: {
                isEmail: true // Valida se o formato é de email
            }
        },
        cnpj: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true // CNPJ deve ser único
        },
        endereco: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'suppliers', // Nome da tabela no banco de dados
        timestamps: true // Adiciona createdAt e updatedAt
    });

    return Supplier;
};
