const { Sequelize } = require('sequelize');
const path = require('path');

// Configura a conexão com o banco de dados SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database', 'dev.sqlite') // Caminho para o arquivo do banco de dados
});

// Testa a conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
        console.error('❌ Não foi possível conectar ao banco de dados:', error);
    }
}

testConnection();

module.exports = sequelize;