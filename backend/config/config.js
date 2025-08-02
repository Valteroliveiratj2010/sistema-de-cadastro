// backend/config/config.js padrão Sequelize CLI + Railway integration
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '123456',
    database: process.env.PGDATABASE || 'gestor_pro_dev',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    logging: process.env.ENABLE_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '123456',
    database: process.env.PGDATABASE || 'gestor_pro_test',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
};
