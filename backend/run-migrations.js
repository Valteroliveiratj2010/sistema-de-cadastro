const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

console.log('🚀 Executando migrations...');

async function runMigrations() {
    // Conectar ao banco
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: '19vsilva',
        password: 'dv201015',
        database: 'gestor_pro',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco gestor_pro');

        // Ler arquivo de migration
        const migrationPath = path.join(__dirname, 'migrations', '20250726172942-create-all-tables.js');
        
        if (!fs.existsSync(migrationPath)) {
            console.log('❌ Arquivo de migration não encontrado:', migrationPath);
            return;
        }

        console.log('📄 Executando migration:', migrationPath);
        
        // Importar e executar a migration
        const migration = require(migrationPath);
        
        if (typeof migration.up === 'function') {
            await migration.up(sequelize.getQueryInterface(), Sequelize);
            console.log('✅ Migration executada com sucesso!');
        } else {
            console.log('⚠️ Migration não tem função up()');
        }

        // Verificar se as tabelas foram criadas
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('📋 Tabelas criadas:', tables);

        await sequelize.close();
        console.log('🎉 Migrations concluídas!');

    } catch (error) {
        console.error('❌ Erro durante migration:', error.message);
        await sequelize.close();
    }
}

runMigrations(); 