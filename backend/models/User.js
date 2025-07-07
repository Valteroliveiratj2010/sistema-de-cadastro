// backend/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs para hashing de senhas

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Garante que cada username seja único
        },
        email: { 
            type: DataTypes.STRING,
            allowNull: false, // O email é obrigatório
            unique: true      // Garante que não haja emails duplicados
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false // A senha é obrigatória
        },
        role: {
            type: DataTypes.ENUM('admin', 'gerente', 'vendedor'), // Define os papéis permitidos
            allowNull: false,
            defaultValue: 'vendedor' // Papel padrão para novos usuários
        }
    }, {
        // Hooks do Sequelize para manipular dados antes de criar ou atualizar
        hooks: {
            // Antes de criar um novo usuário no banco de dados
            beforeCreate: async (user) => {
                // Gera um "salt" (string aleatória) para adicionar à senha antes do hash
                const salt = await bcrypt.genSalt(10);
                // Gera o hash da senha combinando a senha original com o salt
                user.password = await bcrypt.hash(user.password, salt);
            },
            // Antes de atualizar um usuário existente no banco de dados
            beforeUpdate: async (user) => {
                // Verifica se o campo 'password' foi alterado
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // Adiciona um método de instância ao modelo User para comparar senhas
    // Isso permite chamar user.comparePassword(senhaDigitada) para verificar
    User.prototype.comparePassword = async function(candidatePassword) {
        // Compara a senha fornecida (candidatePassword) com a senha hashed armazenada no banco de dados (this.password)
        return await bcrypt.compare(candidatePassword, this.password);
    };

    return User;
};
