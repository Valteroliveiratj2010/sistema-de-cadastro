const { Sequelize, DataTypes } = require('sequelize'); // Incluir DataTypes aqui
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
console.log(`[DATABASE_DEBUG] Ambiente detectado: ${env}`);
console.log(`[DATABASE_DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);

const config = require('../config/config')[env];
console.log(`[DATABASE_DEBUG] Configuração carregada:`, {
  dialect: config.dialect,
  use_env_variable: config.use_env_variable,
  database: config.database
});

let sequelize;

// Lógica de inicialização do Sequelize simplificada
// Usa a configuração do config.js diretamente
sequelize = new Sequelize(
  config.database || config.storage,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    storage: config.storage, // Para SQLite
    logging: config.logging || false,
    dialectOptions: config.dialectOptions || {},
    seederStorage: config.seederStorage,
    migrationStorageTableName: config.migrationStorageTableName,
    seederStorageTableName: config.seederStorageTableName
  }
);

const db = { sequelize, Sequelize };

// Carrega os modelos dinamicamente da pasta '../models'
fs.readdirSync(path.join(__dirname, '../models'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    // Passa 'sequelize' e 'DataTypes' para a função do modelo
    const model = require(path.join(__dirname, '../models', file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Configura as associações entre os modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
