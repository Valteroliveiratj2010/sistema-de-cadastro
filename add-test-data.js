const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'guaguas00',
  database: 'gestor_pro',
  logging: false
});

async function addTestData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Adicionar vendas com datas de vencimento para teste
    console.log('\n📊 Adicionando vendas de teste...');
    
    // Venda vencida (ontem)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await sequelize.query(`
      INSERT INTO "Sales" ("clientId", "userId", "dataVenda", "dataVencimento", "valorTotal", "valorPago", "status", "createdAt", "updatedAt")
      VALUES (4, 4, NOW(), $1, 1000.00, 0.00, 'Pendente', NOW(), NOW())
    `, { bind: [yesterday] });
    
    // Venda próxima (daqui 15 dias)
    const next15Days = new Date();
    next15Days.setDate(next15Days.getDate() + 15);
    
    await sequelize.query(`
      INSERT INTO "Sales" ("clientId", "userId", "dataVenda", "dataVencimento", "valorTotal", "valorPago", "status", "createdAt", "updatedAt")
      VALUES (6, 4, NOW(), $1, 750.00, 0.00, 'Pendente', NOW(), NOW())
    `, { bind: [next15Days] });
    
    // Venda próxima (daqui 25 dias)
    const next25Days = new Date();
    next25Days.setDate(next25Days.getDate() + 25);
    
    await sequelize.query(`
      INSERT INTO "Sales" ("clientId", "userId", "dataVenda", "dataVencimento", "valorTotal", "valorPago", "status", "createdAt", "updatedAt")
      VALUES (4, 4, NOW(), $1, 1200.00, 300.00, 'Pendente', NOW(), NOW())
    `, { bind: [next25Days] });

    // Adicionar compras com datas de vencimento para teste
    console.log('📊 Adicionando compras de teste...');
    
    // Compra vencida (ontem)
    await sequelize.query(`
      INSERT INTO "Purchases" ("supplierId", "dataCompra", "dataVencimento", "valorTotal", "status", "createdAt", "updatedAt")
      VALUES (1, NOW(), $1, 500.00, 'Pendente', NOW(), NOW())
    `, { bind: [yesterday] });
    
    // Compra próxima (daqui 10 dias)
    const next10Days = new Date();
    next10Days.setDate(next10Days.getDate() + 10);
    
    await sequelize.query(`
      INSERT INTO "Purchases" ("supplierId", "dataCompra", "dataVencimento", "valorTotal", "status", "createdAt", "updatedAt")
      VALUES (1, NOW(), $1, 800.00, 'Pendente', NOW(), NOW())
    `, { bind: [next10Days] });

    console.log('✅ Dados de teste adicionados com sucesso!');
    
    // Verificar dados adicionados
    console.log('\n📋 Verificando vendas adicionadas:');
    const sales = await sequelize.query(`
      SELECT id, "clientId", "dataVenda", "dataVencimento", "valorTotal", "valorPago", status
      FROM "Sales"
      ORDER BY id DESC
      LIMIT 5
    `, { type: Sequelize.QueryTypes.SELECT });

    sales.forEach(sale => {
      console.log(`  - ID: ${sale.id}, Cliente: ${sale.clientId}, Vencimento: ${sale.dataVencimento}, Valor: ${sale.valorTotal}, Pago: ${sale.valorPago}, Status: ${sale.status}`);
    });

    console.log('\n📋 Verificando compras adicionadas:');
    const purchases = await sequelize.query(`
      SELECT id, "supplierId", "dataCompra", "dataVencimento", "valorTotal", status
      FROM "Purchases"
      ORDER BY id DESC
      LIMIT 5
    `, { type: Sequelize.QueryTypes.SELECT });

    purchases.forEach(purchase => {
      console.log(`  - ID: ${purchase.id}, Fornecedor: ${purchase.supplierId}, Vencimento: ${purchase.dataVencimento}, Valor: ${purchase.valorTotal}, Status: ${purchase.status}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await sequelize.close();
  }
}

addTestData(); 