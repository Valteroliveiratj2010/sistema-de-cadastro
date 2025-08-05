// backend/config/config.js padrão Sequelize CLI + Railway integration
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Função para extrair configurações da DATABASE_URL
function parseDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      host: url.hostname,
      port: url.port || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    };
  }
  return null;
}

// Configuração base
const baseConfig = {
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
};

// Configuração de produção com suporte a DATABASE_URL
const productionConfig = parseDatabaseUrl() || {
  username: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '123456',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'gestor_pro_prod',
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: process.env.PGPORT || process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

module.exports = {
  development: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '123456',
    database: process.env.PGDATABASE || 'gestor_pro_dev',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    ...baseConfig
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
    ...productionConfig,
    ...baseConfig,
    logging: false
  }
};
