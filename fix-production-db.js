const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração para produção (Render)
const sequelize = new Sequelize('postgresql://gestor_pro_user:KwVTK7A4clLmePRVByCptwoLU5Juv5ua@dpg-d28likggjchc73bqfnq0-a.oregon-postgres.render.com/gestor_pro', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function fixProductionDatabase() {
  try {
    console.log('🔄 Conectando ao banco de produção...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de produção');

    // Executar migração
    const migrationPath = path.join(__dirname, 'backend', 'migrations', '20250726172942-create-all-tables.js');
    console.log('📄 Executando migration:', migrationPath);
    
    const migration = require(migrationPath);
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✅ Migration executada com sucesso no banco de produção!');
    
    // Criar usuário admin
    console.log('👤 Criando usuário admin...');
    
    const [adminUser] = await sequelize.query(`
      INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt")
      VALUES ('admin', 'admin@gestorpro.com', 'admin123', 'admin', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
      RETURNING id
    `);
    
    if (adminUser && adminUser.length > 0) {
      console.log('✅ Usuário admin criado com sucesso');
    } else {
      console.log('ℹ Usuário admin já existe');
    }
    
    // Criar usuário 19vsilva também
    const [user19vsilva] = await sequelize.query(`
      INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt")
      VALUES ('19vsilva', '19vsilva@gestorpro.com', 'admin123', 'admin', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
      RETURNING id
    `);
    
    if (user19vsilva && user19vsilva.length > 0) {
      console.log('✅ Usuário 19vsilva criado com sucesso');
    } else {
      console.log('ℹ Usuário 19vsilva já existe');
    }
    
    console.log('🎉 Banco de produção corrigido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error);
  } finally {
    await sequelize.close();
  }
}

fixProductionDatabase(); 