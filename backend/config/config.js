// backend/config/config.js padrão Sequelize CLI + Railway integration
require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'gestorpro_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    migrationsPath: path.join(__dirname, '..', 'migrations'),
    seedersPath: path.join(__dirname, '..', 'seeders'),
    modelsPath: path.join(__dirname, '..', 'models')
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    migrationsPath: path.join(__dirname, '..', 'migrations'),
    seedersPath: path.join(__dirname, '..', 'seeders'),
    modelsPath: path.join(__dirname, '..', 'models')
  }
};
