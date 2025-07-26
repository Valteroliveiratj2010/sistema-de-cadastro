require('dotenv').config({ path: '../.env' });
const { Sequelize } = require('sequelize');

console.log('🔍 Verificando configuração do banco de dados...\n');

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está definida!');
    process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');
console.log(`📊 URL: ${process.env.DATABASE_URL.substring(0, 50)}...`);

// Conectar ao banco
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function checkDatabase() {
    try {
        console.log('\n🔌 Testando conexão com o banco...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');
        
        // Verificar tabelas existentes
        console.log('\n📋 Verificando tabelas existentes...');
        const tables = await sequelize.showAllSchemas();
        console.log('Schemas disponíveis:', tables.map(t => t.name));
        
        // Verificar tabelas no schema public
        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n📊 Tabelas no schema public:');
        if (results.length === 0) {
            console.log('❌ Nenhuma tabela encontrada!');
        } else {
            results.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }
        
        // Verificar migrações executadas
        console.log('\n📝 Verificando migrações executadas...');
        const [migrations] = await sequelize.query(`
            SELECT name 
            FROM "sequelize_migrations" 
            ORDER BY name
        `);
        
        if (migrations.length === 0) {
            console.log('❌ Nenhuma migração executada!');
        } else {
            console.log('✅ Migrações executadas:');
            migrations.forEach(migration => {
                console.log(`   - ${migration.name} (${migration.createdAt})`);
            });
        }
        
        // Verificar estrutura de algumas tabelas importantes
        console.log('\n🔍 Verificando estrutura das tabelas principais...');
        
        const tablesToCheck = ['Clients', 'Products', 'Sales', 'Suppliers', 'Purchases'];
        
        for (const tableName of tablesToCheck) {
            try {
                const [tableColumns] = await sequelize.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName}'
                    ORDER BY ordinal_position
                `);
                
                console.log(`\n📋 Tabela ${tableName}:`);
                tableColumns.forEach(col => {
                    console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
                });
            } catch (error) {
                console.log(`❌ Erro ao verificar ${tableName}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkDatabase(); 