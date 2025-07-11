const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const db = { sequelize, Sequelize };

fs.readdirSync(path.join(__dirname, '../models'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, '../models', file))(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
