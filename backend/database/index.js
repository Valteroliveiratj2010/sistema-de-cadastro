const { Sequelize, DataTypes } = require('sequelize'); // Incluir DataTypes aqui
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

let sequelize;

// Lógica de inicialização do Sequelize:
// 1. Se 'use_env_variable' estiver configurado no config.js para o ambiente atual (produção),
//    usa a URL completa da variável de ambiente (DATABASE_URL).
// 2. Caso contrário (para desenvolvimento ou se 'use_env_variable' não for usado),
//    constrói a conexão a partir das variáveis individuais (priorizando Railway PG* ou config.js).
if (config.use_env_variable) {
  // Em produção, o config.js define 'use_env_variable' como 'DATABASE_URL'.
  // O Sequelize vai usar process.env.DATABASE_URL.
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: config.dialect,
    logging: config.logging || false,
    dialectOptions: config.dialectOptions || {},
    seederStorage: config.seederStorage,
    migrationStorageTableName: config.migrationStorageTableName,
    seederStorageTableName: config.seederStorageTableName
  });
} else {
  // Para desenvolvimento, ou se 'use_env_variable' não for definido,
  // usa as variáveis individuais (priorizando as do Railway se existirem).
  sequelize = new Sequelize(
    process.env.PGDATABASE || config.database,
    process.env.PGUSER || config.username,
    process.env.PGPASSWORD || config.password,
    {
      host: process.env.PGHOST || config.host,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : config.port,
      dialect: 'postgres', // Definir explicitamente o dialeto
      logging: config.logging || false,
      dialectOptions: config.dialectOptions || {}, // Garante que dialectOptions exista
      seederStorage: config.seederStorage,
      migrationStorageTableName: config.migrationStorageTableName,
      seederStorageTableName: config.seederStorageTableName
    }
  );
}

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
