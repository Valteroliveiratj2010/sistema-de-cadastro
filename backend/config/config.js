const path = require('path');

// Esta é a maneira padrão de exportar um objeto de configuração em um arquivo .js
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    seederStorage: "sequelize",
    logging: false,
    ssl: false,
    dialectOptions: {
      ssl: false
    },
    // --- CAMINHOS PARA O SEQUELIZE CLI (AJUSTADO) ---
    // Caminhos são relativos à raiz do projeto ou ao arquivo de configuração do CLI.
    // Como config.js está em backend/config, '..' volta para backend/.
    // As pastas migrations e seeders estão diretamente em backend/.
    // A pasta models está em backend/models.
    migrationStorageTableName: 'sequelize_migrations', // Nome da tabela para registrar as migrações
    seederStorageTableName: 'sequelize_seeders',     // Nome da tabela para registrar os seeders
    migrationsPath: path.join(__dirname, '..', 'migrations'), // Caminho para as migrações
    seedersPath: path.join(__dirname, '..', 'seeders'),       // Caminho para os seeders
    modelsPath: path.join(__dirname, '..', 'models') // <-- CORRIGIDO: Caminho para os modelos
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || "gestorpro_test",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    seederStorage: "sequelize",
    logging: false,
    // --- CAMINHOS PARA O SEQUELIZE CLI (AJUSTADO) ---
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    migrationsPath: path.join(__dirname, '..', 'migrations'),
    seedersPath: path.join(__dirname, '..', 'seeders'),
    modelsPath: path.join(__dirname, '..', 'models') // <-- CORRIGIDO
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    seederStorage: "sequelize",
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    // --- CAMINHOS PARA O SEQUELIZE CLI (AJUSTADO) ---
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
    migrationsPath: path.join(__dirname, '..', 'migrations'),
    seedersPath: path.join(__dirname, '..', 'seeders'),
    modelsPath: path.join(__dirname, '..', 'models') // <-- CORRIGIDO
  }
};
