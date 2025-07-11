const { Sequelize, DataTypes } = require('sequelize'); // Incluir DataTypes aqui
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

let sequelize;

// Prioriza as variáveis de ambiente do Railway (PGHOST, PGUSER, etc.)
// Se elas não existirem (ex: em desenvolvimento local), usa as do config.js.
sequelize = new Sequelize(
  process.env.PGDATABASE || config.database, // Usa PGDATABASE ou config.database
  process.env.PGUSER || config.username,     // Usa PGUSER ou config.username
  process.env.PGPASSWORD || config.password, // Usa PGPASSWORD ou config.password
  {
    host: process.env.PGHOST || config.host, // Usa PGHOST ou config.host
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : config.port, // Usa PGPORT ou config.port, garante que é um número
    dialect: 'postgres', // Define explicitamente o dialeto como 'postgres'
    logging: config.logging || false, // Mantém a configuração de logging
    dialectOptions: {
      ssl: {
        require: true, // Railway PostgreSQL exige SSL
        rejectUnauthorized: false // Pode ser necessário para aceitar certificados autoassinados no ambiente de nuvem
      }
    },
    // Outras opções de configuração do seu config.js podem ser adicionadas aqui se forem globais
    // e não forem sobrescritas pelas variáveis de ambiente do Railway.
    // Ex: seederStorage, migrationStorageTableName, etc.
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
