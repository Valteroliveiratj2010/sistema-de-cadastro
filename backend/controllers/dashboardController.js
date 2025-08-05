// backend/controllers/dashboardController.js

const { Op, fn, col, literal } = require('sequelize');
const { Sale, SaleProduct, Product, Client, Payment, sequelize } = require('../database');

module.exports = {
  /**
   * Retorna as estatísticas para o dashboard:
   * totalClients, salesThisMonth, totalReceivable, overdueSales, salesByMonth, salesToday, averageTicket, etc.
   * Ajuste essa função conforme sua lógica existente.
   */
  async getDashboardStats(req, res) {
    try {
      // Exemplo genérico: adapte conforme sua modelagem e campos
      // 1) Total de clientes
      const totalClients = await Client.count();

      // 2) Vendas deste mês: somar valorTotal de vendas cujas dataVenda esteja no mês atual
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const salesThisMonthRows = await Sale.findAll({
        attributes: [[fn('SUM', col('valorTotal')), 'total']],
        where: {
          dataVenda: { [Op.gte]: monthStart, [Op.lt]: nextMonthStart }
        },
        raw: true
      });
      const salesThisMonth = parseFloat(salesThisMonthRows[0].total) || 0;

      // 3) Total a receber: somar (valorTotal - valorPago) de vendas pendentes ou parcialmente pagas
      const receivableRows = await Sale.findAll({
        attributes: [[fn('SUM', literal('valorTotal - valorPago')), 'totalReceivable']],
        where: {
          // considerar vendas com valorTotal > valorPago
          valorTotal: { [Op.gt]: col('valorPago') }
        },
        raw: true
      });
      const totalReceivable = parseFloat(receivableRows[0].totalReceivable) || 0;

      // 4) Overdue sales (vendas vencidas e ainda com saldo a receber): 
      const today = new Date();
      const overdueRows = await Sale.findAll({
        attributes: [[fn('SUM', literal('valorTotal - valorPago')), 'totalOverdue']],
        where: {
          dataVencimento: { [Op.lt]: today },
          valorTotal: { [Op.gt]: col('valorPago') }
        },
        raw: true
      });
      const overdueSales = parseFloat(overdueRows[0].totalOverdue) || 0;

      // 5) Vendas hoje: somar valorTotal de vendas com dataVenda igual a hoje
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const salesTodayRows = await Sale.findAll({
        attributes: [[fn('SUM', col('valorTotal')), 'totalHoy']],
        where: {
          dataVenda: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart }
        },
        raw: true
      });
      const salesToday = parseFloat(salesTodayRows[0].totalHoy) || 0;

      // 6) Ticket médio: se quiser calcular como (soma valorTotal de vendas do mês) / (quantidade de vendas no mês)
      const countThisMonthRows = await Sale.findAll({
        attributes: [[fn('COUNT', col('id')), 'count']],
        where: {
          dataVenda: { [Op.gte]: monthStart, [Op.lt]: nextMonthStart }
        },
        raw: true
      });
      const countThisMonth = parseInt(countThisMonthRows[0].count, 10) || 0;
      const averageTicket = countThisMonth > 0 ? salesThisMonth / countThisMonth : 0;

      // 7) Vendas por mês (últimos N meses ou ano corrente): ex. agrupamento por mês no ano corrente
      // Aqui um exemplo para os 12 meses do ano corrente:
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
      // Nota: SQLite não tem funções de agrupamento por mês diretas; podemos fazer raw query ou processar em JS.
      // Aqui vamos fazer raw: extrair strftime('%m', dataVenda) e somar. Ajuste conforme dialect se não for SQLite.
      const salesByMonthRaw = await sequelize.query(
        `
        SELECT 
          strftime('%m', dataVenda) AS monthNumber,
          SUM(valorTotal) AS total
        FROM Sales 
        WHERE dataVenda >= :yearStart AND dataVenda < :yearEnd
        GROUP BY monthNumber
        ORDER BY monthNumber
        `,
        {
          replacements: { yearStart, yearEnd },
          type: sequelize.QueryTypes.SELECT
        }
      );
      // Transformar em array para Chart.js, convertendo monthNumber '01','02' etc para rótulos
      const salesByMonth = salesByMonthRaw.map(row => ({
        month: row.monthNumber, 
        total: parseFloat(row.total) || 0
      }));

      return res.json({
        totalClients,
        salesThisMonth,
        totalReceivable,
        overdueSales,
        salesByMonth,
        salesToday,
        averageTicket
      });
    } catch (error) {
      console.error('Erro em getDashboardStats:', error);
      return res.status(500).json({ message: 'Erro ao obter estatísticas do dashboard.', error: error.message });
    }
  },

  /**
   * Top 5 Produtos Mais Vendidos no mês corrente.
   * Retorna JSON: [ { nome_produto, total_vendido }, ... ]
   */
  async getProdutosMaisVendidos(req, res) {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // A tabela SaleProduct costuma ter createdAt igual à data de associação; supondo que dataVenda é em Sale,
      // mas para contagem de quantidade vendida, consideramos todas as SaleProducts pertencentes a Sales cuja dataVenda
      // esteja no mês corrente. Então precisamos unir SaleProduct com Sale para filtrar pela dataVenda de Sale.
      // Podemos fazer raw query ou subquery. Vamos usar raw para garantir compatibilidade:

      // Descobrir nomes reais de tabelas no DB
      const saleProductTable = 'SaleProducts';
      const saleTable = 'Sales';
      const productTable = 'Products';

      // A query: 
      // SELECT p.nome AS nome_produto, SUM(sp.quantidade) AS total_vendido
      // FROM SaleProducts sp
      // JOIN Sales s ON sp.saleId = s.id
      // JOIN Products p ON sp.productId = p.id
      // WHERE s.dataVenda >= :monthStart AND s.dataVenda < :nextMonthStart
      // GROUP BY p.id, p.nome
      // ORDER BY total_vendido DESC
      // LIMIT 5

      const query = `
        SELECT p.nome AS nome_produto, 
               COALESCE(SUM(sp.quantidade), 0) AS total_vendido,
               COALESCE(SUM(sp.quantidade * sp."precoUnitario"), 0) AS total_valor
        FROM "Products" p
        LEFT JOIN "SaleProducts" sp ON p.id = sp."productId"
        LEFT JOIN "Sales" s ON sp."saleId" = s.id 
        WHERE (s."dataVenda" >= :monthStart AND s."dataVenda" < :nextMonthStart) OR s.id IS NULL
        GROUP BY p.id, p.nome
        ORDER BY total_vendido DESC
        LIMIT 5
      `;

      const rows = await sequelize.query(query, {
        replacements: { monthStart, nextMonthStart },
        type: sequelize.QueryTypes.SELECT
      });

      // Converter total_vendido para número
      const data = rows.map(r => ({
        nome_produto: r.nome_produto,
        total_vendido: parseInt(r.total_vendido, 10) || 0,
        total_valor: parseFloat(r.total_valor) || 0
      }));

      return res.json(data);
    } catch (error) {
      console.error('Erro ao obter produtos mais vendidos:', error);
      return res.status(500).json({ message: 'Erro ao obter produtos mais vendidos.', error: error.message });
    }
  },

  /**
   * Top 5 Clientes com Mais Compras no mês corrente.
   * Retorna JSON: [ { nome_cliente, valor_gasto }, ... ]
   * Aqui consideramos soma de pagamentos (ou soma de valorTotal) para vendas pagas no mês.
   * Exemplo: somar Payment.valor para pagamentos cuja dataPagamento esteja no mês.
   */
  async getClientesMaisCompraram(req, res) {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const paymentTable = 'Payments';
      const saleTable = 'Sales';
      const clientTable = 'Clients';

      // Query: 
      // SELECT c.nome AS nome_cliente, SUM(p.valor) AS valor_gasto
      // FROM Payments p
      // JOIN Sales s ON p.saleId = s.id
      // JOIN Clients c ON s.clientId = c.id
      // WHERE p.dataPagamento >= :monthStart AND p.dataPagamento < :nextMonthStart
      // GROUP BY c.id, c.nome
      // ORDER BY valor_gasto DESC
      // LIMIT 5
      const query = `
        SELECT c.nome AS nome_cliente, COALESCE(SUM(s."valorTotal"), 0) AS valor_gasto
        FROM "Clients" c
        INNER JOIN "Sales" s ON c.id = s."clientId"
        WHERE s."dataVenda" >= :monthStart AND s."dataVenda" < :nextMonthStart
        GROUP BY c.id, c.nome
        ORDER BY valor_gasto DESC
        LIMIT 5
      `;

      const rows = await sequelize.query(query, {
        replacements: { monthStart, nextMonthStart },
        type: sequelize.QueryTypes.SELECT
      });

      // Converter valor_gasto para número
      const data = rows.map(r => ({
        nome_cliente: r.nome_cliente,
        valor_gasto: parseFloat(r.valor_gasto) || 0
      }));

      return res.json(data);
    } catch (error) {
      console.error('Erro ao obter clientes que mais compraram:', error);
      return res.status(500).json({ message: 'Erro ao obter clientes que mais compraram.', error: error.message });
    }
  }
};
