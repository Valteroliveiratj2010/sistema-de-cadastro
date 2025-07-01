const express = require('express');
const { Op, fn, col, where } = require('sequelize');
const bcrypt = require('bcryptjs');

// Importar os modelos
const { Client, Sale, Payment, User, Product, SaleProduct, Supplier, Purchase, PurchaseProduct } = require('../database'); 

// Importar os middlewares
const authMiddleware = require('../middleware/authMiddleware'); 
const authorizeRole = require('../middleware/authorizationMiddleware'); 

const router = express.Router();

router.use(authMiddleware); 

// --- ROTAS DO DASHBOARD ---
router.get('/dashboard/stats', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthNumber = today.getMonth(); // 0-11
        // Formato 'AAAA-MM' para MySQL: DATE_FORMAT(coluna, '%Y-%m')
        const currentMonth = `${currentYear}-${String(currentMonthNumber + 1).padStart(2, '0')}`;

        // CORRIGIDO: Definição de todayStart e todayEnd
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const baseWhereClause = (req.user.role === 'vendedor') ? { userId: req.user.id } : {};

        const totalClients = await Client.count({ where: baseWhereClause });
        
        // KPIs de Vendas
        const totalSalesAmountAll = await Sale.sum('valorTotal', { where: baseWhereClause }) || 0;
        const totalPaidAmountAll = await Sale.sum('valorPago', { where: baseWhereClause }) || 0;
        const totalReceivable = totalSalesAmountAll - totalPaidAmountAll;
        
        const salesThisMonth = await Sale.sum('valorTotal', {
            where: { 
                ...baseWhereClause,
                // CORREÇÃO AQUI: Usando DATE_FORMAT para MySQL
                [Op.and]: [
                    where(fn('DATE_FORMAT', col('dataVenda'), '%Y-%m'), currentMonth)
                ]
            }
        }) || 0;

        const overdueSales = await Sale.sum('valorTotal', {
            where: {
                ...baseWhereClause,
                status: 'Pendente',
                dataVencimento: { [Op.lt]: today }
            }
        }) || 0;

        // Vendas por Mês (últimos 12 meses do histórico completo)
        // Incluirá dados para o gráfico de histórico
        const rawSalesByMonth = await Sale.findAll({
            attributes: [
                // CORREÇÃO AQUI: Usando DATE_FORMAT para MySQL
                [fn('DATE_FORMAT', col('dataVenda'), '%Y-%m'), 'month'],
                [fn('sum', col('valorTotal')), 'total'],
                [fn('count', col('id')), 'count']
            ],
            where: {
                ...baseWhereClause,
                dataVenda: {
                    // Buscar dados de 24 meses para ter histórico suficiente para YOY para todos os meses
                    [Op.gte]: new Date(currentYear - 2, currentMonthNumber, 1) 
                }
            },
            group: ['month'],
            // CORREÇÃO AQUI: Ordenar pelo resultado da função DATE_FORMAT
            order: [[fn('DATE_FORMAT', col('dataVenda'), '%Y-%m'), 'ASC']]
        });

        // NOVO: Preencher meses sem vendas com 0 para o gráfico
        const salesByMonthMap = new Map();
        rawSalesByMonth.forEach(item => {
            salesByMonthMap.set(item.dataValues.month, {
                total: parseFloat(item.dataValues.total),
                count: parseInt(item.dataValues.count)
            });
        });

        const fullSalesByMonth = [];
        for (let i = -12; i <= 0; i++) { // Últimos 12 meses (incluindo o atual) para a visualização
            const date = new Date(currentYear, currentMonthNumber + i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const data = salesByMonthMap.get(monthKey);
            fullSalesByMonth.push({
                month: monthKey,
                total: data ? data.total : 0,
                count: data ? data.count : 0,
                averageTicket: data && data.count > 0 ? data.total / data.count : 0
            });
        }
        
        const salesToday = await Sale.sum('valorTotal', {
            where: {
                ...baseWhereClause,
                dataVenda: {
                    [Op.between]: [new Date(today.getFullYear(), today.getMonth(), today.getDate()), todayEnd] 
                }
            }
        }) || 0;

        const totalSalesCountAll = await Sale.count({ where: baseWhereClause }) || 1; // Para ticket médio geral
        const averageTicket = totalSalesAmountAll / totalSalesCountAll;

        const totalPurchasesAmount = await Purchase.sum('valorTotal', { where: { status: 'Pendente' } }) || 0; 
        const overduePurchases = await Purchase.sum('valorTotal', {
            where: {
                status: 'Pendente',
                dataCompra: { [Op.lt]: today }
            }
        }) || 0;
        
        let totalAccountsPayable = 0;
        let overdueAccountsPayable = 0;
        if (req.user.role === 'admin' || req.user.role === 'gerente') {
            totalAccountsPayable = totalPurchasesAmount;
            overdueAccountsPayable = overduePurchases;
        }

        // Vendas do mesmo mês do ano anterior (para o KPI e o gráfico YOY)
        const lastYearSameMonthDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        const lastYearSameMonthEndDate = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0, 23, 59, 59, 999); 

        const salesLastYearSameMonth = await Sale.sum('valorTotal', {
            where: {
                ...baseWhereClause,
                dataVenda: {
                    [Op.between]: [lastYearSameMonthDate, lastYearSameMonthEndDate]
                }
            }
        }) || 0;


        res.json({
            totalClients: totalClients || 0,
            totalReceivable: totalReceivable || 0, 
            overdueSales: overdueSales || 0, 
            salesThisMonth: salesThisMonth || 0,
            salesByMonth: fullSalesByMonth, // AGORA RETORNA fullSalesByMonth
            salesToday: salesToday, 
            averageTicket: averageTicket,
            totalAccountsPayable: totalAccountsPayable, 
            overdueAccountsPayable: overdueAccountsPayable, 
            salesLastYearSameMonth: salesLastYearSameMonth 
        });
    } catch (error) {
        console.error('❌ ERRO NO ENDPOINT DO DASHBOARD:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS PARA VENCIMENTOS DETALHADOS NO DASHBOARD ---
router.get('/dashboard/due-dates', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Due Dates report route accessed by ${req.user.username}.`);
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const thirtyDaysFromNow = new Date(); 
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        thirtyDaysFromNow.setHours(23, 59, 59, 999); 

        let saleWhereClause = { status: 'Pendente' };
        if (req.user.role === 'vendedor') {
            saleWhereClause.userId = req.user.id;
        }

        let purchaseWhereClause = { status: 'Pendente' };

        // Contas a Receber Vencidas (Sales)
        const overdueReceivables = await Sale.findAll({
            where: {
                ...saleWhereClause,
                dataVencimento: { [Op.lt]: today }
            },
            include: [{ model: Client, as: 'client', attributes: ['nome'] }],
            order: [['dataVencimento', 'ASC']]
        });

        // Contas a Receber Próximas (Sales - próximos 30 dias)
        const upcomingReceivables = await Sale.findAll({
            where: {
                ...saleWhereClause,
                dataVencimento: { [Op.between]: [today, thirtyDaysFromNow] }
            },
            include: [{ model: Client, as: 'client', attributes: ['nome'] }],
            order: [['dataVencimento', 'ASC']]
        });

        // Contas a Pagar Vencidas (Purchases) - Apenas para Admin/Gerente
        let overduePayables = [];
        // Contas a Pagar Próximas (Purchases - próximos 30 dias) - Apenas para Admin/Gerente
        let upcomingPayables = [];

        if (req.user.role === 'admin' || req.user.role === 'gerente') {
            overduePayables = await Purchase.findAll({
                where: {
                    ...purchaseWhereClause,
                    // CORREÇÃO AQUI: MySQL não tem dataVencimento para Purchase, usando dataCompra
                    dataCompra: { [Op.lt]: today } 
                },
                include: [{ model: Supplier, as: 'supplier', attributes: ['nome'] }],
                order: [['dataCompra', 'ASC']]
            });

            upcomingPayables = await Purchase.findAll({
                where: {
                    ...purchaseWhereClause,
                    // CORREÇÃO AQUI: MySQL não tem dataVencimento para Purchase, usando dataCompra
                    dataCompra: { [Op.between]: [today, thirtyDaysFromNow] } 
                },
                include: [{ model: Supplier, as: 'supplier', attributes: ['nome'] }],
                order: [['dataCompra', 'ASC']]
            });
        }
        
        res.json({
            overdueReceivables,
            upcomingReceivables,
            overduePayables,
            upcomingPayables
        });

    } catch (error) {
        console.error('❌ ERRO AO GERAR RELATÓRIO DE VENCIMENTOS DETALHADOS:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de vencimentos detalhados.' });
    }
});


// --- ROTAS DE CLIENTES ---
router.get('/clients/export-csv', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Export clients CSV route accessed by ${req.user.username}.`);
    try {
        const whereClause = (req.user.role === 'vendedor') ? { userId: req.user.id } : {};
        const clients = await Client.findAll({ where: whereClause, order: [['nome', 'ASC']] });
        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Data de Cadastro'];
        const csvRows = clients.map(client => {
            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            };
            return [
                escapeCsv(client.id),
                escapeCsv(client.nome),
                escapeCsv(client.email),
                escapeCsv(client.telefone),
                escapeCsv(client.createdAt ? client.createdAt.toLocaleDateString('pt-BR') : '')
            ].join(';');
        });
        const csvContent = [headers.join(';'), ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="clientes_gestor_pro_${new Date().toISOString().slice(0,10)}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR CLIENTES PARA CSV:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de clientes CSV.' });
    }
});

router.get('/clients', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (q) {
        whereClause.nome = { [Op.like]: `%${q}%` };
    }
    if (req.user.role === 'vendedor') {
        whereClause.userId = req.user.id;
    }

    try {
        const { count, rows } = await Client.findAndCountAll({ 
            where: whereClause, 
            limit: parseInt(limit), 
            offset: parseInt(offset), 
            order: [['nome', 'ASC']] 
        });
        res.json({ total: count, data: rows });
    } catch (error) { 
        console.error('❌ ERRO AO BUSCAR CLIENTES:', error);
        res.status(500).json({ message: error.message }); 
    }
});

router.get('/clients/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const client = await Client.findByPk(id, { where: whereClause });
        if (client) res.json(client);
        else res.status(404).json({ message: 'Cliente não encontrado ou você não tem permissão para vê-lo.' });
    } catch (error) { 
        console.error('❌ ERRO AO BUSCAR CLIENTE POR ID:', error);
        res.status(500).json({ message: error.message }); 
    }
});

router.post('/clients', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const clientData = { ...req.body, userId: req.user.id };
        
        const client = await Client.create(clientData);
        res.status(201).json(client);
    } catch (error) { 
        console.error('❌ ERRO AO CRIAR CLIENTE:', error);
        res.status(400).json({ message: error.message }); 
    }
});

router.put('/clients/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const [updated] = await Client.update(req.body, { where: whereClause });
        if (updated) {
            const updatedClient = await Client.findByPk(id);
            res.json(updatedClient);
        } else { res.status(404).json({ message: 'Cliente não encontrado ou você não tem permissão para editá-lo.' }); }
    } catch (error) { 
        console.error('❌ ERRO AO ATUALIZAR CLIENTE:', error);
        res.status(400).json({ message: error.message }); 
    }
});

router.delete('/clients/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const deleted = await Client.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (error) { 
        console.error('❌ ERRO AO DELETAR CLIENTE:', error);
        res.status(500).json({ message: error.message }); 
    }
});


// --- ROTAS DE VENDAS ---
router.get('/sales/export-csv', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Export sales CSV route accessed by ${req.user.username}.`);
    try {
        const whereClause = (req.user.role === 'vendedor') ? { userId: req.user.id } : {};
        const sales = await Sale.findAll({
            where: whereClause, 
            order: [['dataVenda', 'DESC']],
            include: [{ model: Client, as: 'client', attributes: ['nome'] }]
        });
        const headers = ['ID da Venda', 'Cliente', 'Data da Venda', 'Valor Total', 'Valor Pago', 'Valor Devido', 'Status'];
        const csvRows = sales.map(sale => {
            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            };
            const valorDevido = sale.valorTotal - sale.valorPago;
            return [
                escapeCsv(sale.id),
                escapeCsv(sale.client ? sale.client.nome : 'N/A'),
                escapeCsv(sale.dataVenda ? new Date(sale.dataVenda).toLocaleDateString('pt-BR') : 'N/A'),
                escapeCsv(sale.valorTotal),
                escapeCsv(sale.valorPago),
                escapeCsv(valorDevido),
                escapeCsv(sale.status)
            ].join(';');
        });
        const csvContent = [headers.join(';'), ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="vendas_gestor_pro_${new Date().toISOString().slice(0,10)}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR VENDAS PARA CSV:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de vendas CSV.' });
    }
});

router.get('/sales/report-by-period', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales report by period route accessed by ${req.user.username}.`);
    try {
        let { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Parâmetros startDate e endDate são obrigatórios.' });
        }
        startDate = new Date(startDate + 'T00:00:00.000Z');
        endDate = new Date(endDate + 'T23:59:59.999Z');
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        let whereClause = {
            dataVenda: {
                [Op.between]: [startDate, endDate]
            }
        };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const sales = await Sale.findAll({
            where: whereClause, 
            order: [['dataVenda', 'ASC']],
            include: [{ model: Client, as: 'client', attributes: ['nome'] }]
        });
        const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.valorTotal, 0);
        const totalPaidAmount = sales.reduce((sum, sale) => sum + sale.valorPago, 0);
        const totalDueAmount = totalSalesAmount - totalPaidAmount;
        res.json({
            sales,
            summary: {
                totalSalesAmount,
                totalPaidAmount,
                totalDueAmount,
                numberOfSales: sales.length
            }
        });
    } catch (error) {
        console.error('❌ ERRO AO GERAR RELATÓRIO DE VENDAS POR PERÍODO:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de vendas por período.' });
    }
});

router.get('/sales', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    const { page = 1, limit = 5, q = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (q) {
        whereClause['$client.nome$'] = { [Op.like]: `%${q}%` };
    }
    if (req.user.role === 'vendedor') {
        whereClause.userId = req.user.id;
    }

    try {
        const { count, rows } = await Sale.findAndCountAll({
            where: whereClause, 
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['dataVenda', 'DESC']],
            include: [{ model: Client, as: 'client', attributes: ['nome'] }]
        });
        res.json({ total: count, data: rows });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR VENDAS:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/sales/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const sale = await Sale.findByPk(id, {
            where: whereClause,
            include: [
                { model: Client, as: 'client' },
                { 
                    model: Payment, 
                    as: 'payments', 
                    order: [['dataPagamento', 'DESC']],
                    attributes: ['valor', 'dataPagamento', 'formaPagamento', 'parcelas', 'bandeiraCartao', 'bancoCrediario'] 
                },
                { 
                    model: Product, 
                    as: 'products', 
                    through: {
                        attributes: ['quantidade', 'precoUnitario'] 
                    }
                }
            ]
        });
        if (sale) res.json(sale);
        else res.status(404).json({ message: 'Venda não encontrada ou você não tem permissão para vê-la.' });
    } catch (error) {
        console.error('❌ ERRO AO OBTER DETALHES DA VENDA:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/sales', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log('[API Route Log] POST /sales - Request Body:', JSON.stringify(req.body, null, 2));
    const { clientId, dataVenda, dataVencimento, products: saleProductsData, initialPayment } = req.body;

    const userId = req.user.id; 

    if (!clientId || !saleProductsData || saleProductsData.length === 0) {
        return res.status(400).json({ message: 'Cliente e produtos da venda são obrigatórios.' });
    }
    let transaction;
    try {
        transaction = await Sale.sequelize.transaction();
        let valorTotalCalculado = 0;
        for (const item of saleProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) { throw new Error(`Produto com ID ${item.productId} não encontrado.`); }
            if (product.estoque < item.quantidade) { throw new Error(`Estoque insuficiente para o produto: ${product.nome}. Disponível: ${product.estoque}, Solicitado: ${item.quantidade}`); }
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.precoVenda;
            valorTotalCalculado += precoUnitario * item.quantidade;
        }
        const sale = await Sale.create({
            clientId,
            userId,
            dataVenda: dataVenda || new Date(),
            dataVencimento: dataVencimento || null,
            valorTotal: valorTotalCalculado,
            valorPago: (initialPayment && initialPayment.valor) ? parseFloat(initialPayment.valor) : 0, 
            status: (initialPayment && parseFloat(initialPayment.valor) >= valorTotalCalculado) ? 'Paga' : 'Pendente'
        }, { transaction });
        if (initialPayment && parseFloat(initialPayment.valor) > 0) {
            await Payment.create({
                valor: parseFloat(initialPayment.valor),
                dataPagamento: new Date(),
                saleId: sale.id,
                formaPagamento: initialPayment.formaPagamento || 'Dinheiro',
                parcelas: initialPayment.parcelas || 1,
                bandeiraCartao: initialPayment.bandeiraCartao || null,
                bancoCrediario: initialPayment.bancoCrediario || null
            }, { transaction });
        }
        for (const item of saleProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.precoVenda;
            await SaleProduct.create({
                saleId: sale.id,
                productId: item.productId,
                quantidade: item.quantidade,
                precoUnitario: precoUnitario
            }, { transaction });
            product.estoque -= item.quantidade;
            await product.save({ transaction });
        }
        await transaction.commit();
        res.status(201).json(sale);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('❌ ERRO AO CRIAR VENDA COM PRODUTOS:', error);
        res.status(400).json({ message: error.message || 'Erro ao criar venda.' });
    }
});

router.put('/sales/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const [updated] = await Sale.update(req.body, { where: whereClause });
        if (updated) {
            const updatedSale = await Sale.findByPk(id);
            res.json(updatedSale);
        } else { res.status(404).json({ message: 'Venda não encontrada ou você não tem permissão para editá-la.' }); }
    } catch (error) { 
        console.error('❌ ERRO AO ATUALIZAR VENDA:', error);
        res.status(400).json({ message: error.message }); 
    }
});

router.delete('/sales/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleProduct, as: 'saleProducts' }]
        });
        
        if (!sale) { return res.status(404).json({ message: 'Venda não encontrada' }); }

        if (req.user.role === 'gerente' && sale.userId !== req.user.id) {
            return res.status(403).json({ message: 'Acesso proibido: Você não pode deletar esta venda.' });
        }

        let transaction;
        try {
            transaction = await Sale.sequelize.transaction();
            for (const item of sale.saleProducts) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    product.estoque -= item.quantidade; 
                    await product.save({ transaction });
                }
            }
            await Payment.destroy({ where: { saleId: sale.id }, transaction });
            await SaleProduct.destroy({ where: { saleId: sale.id }, transaction });
            const deleted = await Sale.destroy({ where: { id: req.params.id }, transaction });
            await transaction.commit();
            if (deleted) res.status(204).send();
            else res.status(404).json({ message: 'Venda não encontrada' });
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('❌ ERRO AO DELETAR VENDA COM PRODUTOS:', error);
            res.status(500).json({ message: error.message || 'Erro ao deletar venda.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/sales/:saleId/payments', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log('[API Route Log] POST /sales/:saleId/payments - Request Body:', JSON.stringify(req.body, null, 2));
    const { saleId } = req.params;
    const { valor, formaPagamento, parcelas, bandeiraCartao, bancoCrediario } = req.body;
    
    if (req.user.role === 'vendedor') {
        const sale = await Sale.findByPk(saleId);
        if (!sale || sale.userId !== req.user.id) {
            return res.status(403).json({ message: 'Acesso proibido: Você não pode registrar pagamentos para esta venda.' });
        }
    }

    if (!valor || parseFloat(valor) <= 0) { return res.status(400).json({ message: 'Valor do pagamento inválido.' }); }
    if (!formaPagamento) { return res.status(400).json({ message: 'Forma de pagamento é obrigatória.' }); }
    if (['Cartão de Crédito', 'Crediário'].includes(formaPagamento) && (!parcelas || parcelas < 1)) { return res.status(400).json({ message: `Número de parcelas inválido para ${formaPagamento}.` }); }
    
    let transaction;
    try {
        transaction = await Sale.sequelize.transaction();
        const sale = await Sale.findByPk(saleId, { transaction });
        if (!sale) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Venda não encontrada' });
        }
        await Payment.create({
            valor: parseFloat(valor),
            dataPagamento: new Date(),
            saleId: sale.id,
            formaPagamento: formaPagamento,
            parcelas: parcelas || 1,
            bandeiraCartao: bandeiraCartao || null,
            bancoCrediario: bancoCrediario || null
        }, { transaction });
        const totalPaid = await Payment.sum('valor', { where: { saleId: sale.id }, transaction });
        sale.valorPago = totalPaid;
        if (sale.valorPago >= sale.valorTotal) {
            sale.status = 'Paga';
        } else {
            sale.status = 'Pendente';
        }
        await sale.save({ transaction });
        await transaction.commit();
        res.status(201).json(sale);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('❌ ERRO AO REGISTRAR PAGAMENTO:', error);
        res.status(400).json({ message: error.message || 'Erro ao registrar pagamento.' });
    }
});

// --- ROTAS DE PRODUTOS ---
router.get('/products/low-stock', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    const LOW_STOCK_THRESHOLD = 10; 
    try {
        const products = await Product.findAll({
            where: {
                estoque: {
                    [Op.lte]: LOW_STOCK_THRESHOLD
                }
            },
            order: [['estoque', 'ASC']]
        });
        res.json(products);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR PRODUTOS COM ESTOQUE BAIXO:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos com estoque baixo.' });
    }
});

router.get('/rankings/produtos', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const topProducts = await SaleProduct.findAll({
            attributes: [
                'productId',
                [fn('sum', col('quantidade')), 'totalQuantidadeVendida']
            ],
            group: ['productId'],
            order: [[fn('sum', col('quantidade')), 'DESC']],
            limit: 5,
            include: [{
                model: Product, 
                as: 'Product', 
                attributes: ['nome', 'precoVenda'] 
            }]
        });
        const formattedRanking = topProducts.map(item => ({
            id: item.productId,
            nome: item.Product ? item.Product.nome : 'Produto Desconhecido',
            totalQuantidadeVendida: item.dataValues.totalQuantidadeVendida,
            precoVenda: item.Product ? item.Product.precoVenda : null
        }));
        res.json(formattedRanking);
    } catch (error) {
        console.error('❌ ERRO AO OBTTER RANKING DE PRODUTOS:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking de produtos.' });
    }
});

router.get('/rankings/clientes', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const topClients = await Sale.findAll({
            attributes: [
                'clientId',
                [fn('count', col('Sale.id')), 'totalVendas'],
                [fn('sum', col('valorTotal')), 'valorTotalVendido'] 
            ],
            group: ['clientId'],
            order: [[fn('count', col('Sale.id')), 'DESC']],
            limit: 5, 
            include: [{
                model: Client, 
                as: 'client', 
                attributes: ['nome', 'email', 'telefone'] 
            }]
        });
        const formattedRanking = topClients.map(item => ({
            id: item.clientId,
            nome: item.client ? item.client.nome : 'Cliente Desconhecido',
            totalVendas: item.dataValues.totalVendas,
            valorTotalVendido: item.dataValues.valorTotalVendido
        }));
        res.json(formattedRanking);
    } catch (error) {
        console.error('❌ ERRO AO OBTER RANKING DE CLIENTES:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking de clientes.' });
    }
});

router.get('/rankings/vendedores', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const topSellers = await Sale.findAll({
            attributes: [
                'userId',
                [fn('count', col('Sale.id')), 'totalVendasFeitas'], 
                [fn('sum', col('valorTotal')), 'valorTotalVendido'] 
            ],
            group: ['userId'],
            order: [[fn('sum', col('valorTotal')), 'DESC']], 
            limit: 5, 
            include: [{
                model: User,
                as: 'user', 
                attributes: ['username'] 
            }]
        });

        const formattedRanking = topSellers.map(item => ({
            userId: item.userId,
            username: item.user ? item.user.username : 'Vendedor Desconhecido',
            totalVendasFeitas: item.dataValues.totalVendasFeitas,
            valorTotalVendido: item.dataValues.valorTotalVendido
        }));

        res.json(formattedRanking);
    } catch (error) {
        console.error('❌ ERRO AO OBTTER RANKING DE VENDEDORES:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking de vendedores.' });
    }
});


router.get('/products', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = q ? { nome: { [Op.like]: `%${q}%` } } : {};
    try {
        const { count, rows } = await Product.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['nome', 'ASC']] });
        res.json({ total: count, data: rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/products/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) res.json(product);
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/products', authorizeRole(['admin', 'gerente']), async (req, res) => { 
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/products/:id', authorizeRole(['admin', 'gerente']), async (req, res) => { 
    try {
        const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.json(updatedProduct);
        } else { res.status(404).json({ message: 'Produto não encontrado' }); }
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/products/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { // CORRIGIDO: 'Catch' para 'catch'
        console.error('❌ ERRO AO DELETAR PRODUTO:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE GESTÃO DE UTILIZADORES (APENAS PARA ADMIN) ---
router.get('/users', authorizeRole(['admin']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (q) {
        whereClause = {
            [Op.or]: [
                { username: { [Op.like]: `%${q}%` } },
                { email: { [Op.like]: `%${q}%` } }
            ]
        };
    }

    try {
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['username', 'ASC']]
        });
        res.json({ total: count, data: rows });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR UTILIZADORES:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/users/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
        });
        if (user) res.json(user);
        else res.status(404).json({ message: 'Utilizador não encontrado' });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR UTILIZADOR POR ID:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/users', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para criar um novo utilizador.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword, role });
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO CRIAR UTILIZADOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao criar utilizador.' });
    }
});

router.put('/users/:id', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO ATUALIZAR UTILIZADOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao atualizar utilizador.' });
    }
});

router.delete('/users/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
        }

        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Utilizador não encontrado' });
    } catch (error) {
        console.error('❌ ERRO AO DELETAR UTILIZADOR:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE FORNECEDORES (APENAS ADMIN E GERENTE) ---
router.get('/suppliers', authorizeRole(['admin', 'gerente']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (q) {
        whereClause = {
            [Op.or]: [
                { nome: { [Op.like]: `%${q}%` } },
                { contato: { [Op.like]: `%${q}%` } },
                { email: { [Op.like]: `%${q}%` } },
                { cnpj: { [Op.like]: `%${q}%` } }
            ]
        };
    }

    try {
        const { count, rows } = await Supplier.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nome', 'ASC']]
        });
        res.json({ total: count, data: rows });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR FORNECEDORES:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/suppliers/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (supplier) res.json(supplier);
        else res.status(404).json({ message: 'Fornecedor não encontrado' });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR FORNECEDOR POR ID:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/suppliers', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        console.error('❌ ERRO AO CRIAR FORNECEDOR:', error);
        res.status(400).json({ message: error.message });
    }
});

router.put('/suppliers/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const [updated] = await Supplier.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedSupplier = await Supplier.findByPk(req.params.id);
            res.json(updatedSupplier);
        } else { res.status(404).json({ message: 'Fornecedor não encontrado' }); }
    } catch (error) {
        console.error('❌ ERRO AO ATUALIZAR FORNECEDOR:', error);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/suppliers/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const deleted = await Supplier.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Fornecedor não encontrado' });
    } catch (error) { 
        console.error('❌ ERRO AO DELETAR FORNECEDOR:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE COMPRAS (APENAS ADMIN E GERENTE) ---
router.get('/purchases', authorizeRole(['admin', 'gerente']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (q) {
        whereClause['$supplier.nome$'] = { [Op.like]: `%${q}%` };
    }

    try {
        const { count, rows } = await Purchase.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['dataCompra', 'DESC']],
            include: [{ model: Supplier, as: 'supplier', attributes: ['nome'] }]
        });
        res.json({ total: count, data: rows });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR COMPRAS:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/purchases/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { 
                    model: Product, 
                    as: 'products', 
                    through: {
                        attributes: ['quantidade', 'precoCustoUnitario'] 
                    }
                }
            ]
        });
        if (purchase) res.json(purchase);
        else res.status(404).json({ message: 'Compra não encontrada' });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR COMPRA POR ID:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/purchases', authorizeRole(['admin', 'gerente']), async (req, res) => {
    console.log('[API Route Log] POST /purchases - Request Body:', JSON.stringify(req.body, null, 2));
    const { supplierId, dataCompra, valorTotal, status, observacoes, products: purchaseProductsData } = req.body;
    const userId = req.user.id; // Usuário logado registrando a compra

    if (!supplierId || !purchaseProductsData || purchaseProductsData.length === 0) {
        return res.status(400).json({ message: 'Fornecedor e produtos da compra são obrigatórios.' });
    }

    let transaction;
    try {
        transaction = await Purchase.sequelize.transaction();
        
        let calculatedTotalValue = 0;
        for (const item of purchaseProductsData) {
            calculatedTotalValue += item.precoCustoUnitario * item.quantidade;
        }

        const purchase = await Purchase.create({
            supplierId,
            userId,
            dataCompra: dataCompra || new Date(),
            valorTotal: calculatedTotalValue, 
            status: status || 'Concluída',
            observacoes: observacoes || null
        }, { transaction });

        for (const item of purchaseProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) { throw new Error(`Produto com ID ${item.productId} não encontrado.`); }
            
            await PurchaseProduct.create({
                purchaseId: purchase.id,
                productId: item.productId,
                quantidade: item.quantidade,
                precoCustoUnitario: item.precoCustoUnitario
            }, { transaction });

            product.estoque += item.quantidade;
            await product.save({ transaction });
        }

        await transaction.commit();
        res.status(201).json(purchase);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('❌ ERRO AO CRIAR COMPRA COM PRODUTOS:', error);
        res.status(400).json({ message: error.message || 'Erro ao criar compra.' });
    }
});

router.put('/purchases/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    console.log('[API Route Log] PUT /purchases/:id - Request Body:', JSON.stringify(req.body, null, 2));
    const { supplierId, dataCompra, valorTotal, status, observacoes, products: purchaseProductsData } = req.body;
    const purchaseId = req.params.id;

    let transaction;
    try {
        transaction = await Purchase.sequelize.transaction();
        const purchase = await Purchase.findByPk(purchaseId, { include: [{ model: PurchaseProduct, as: 'purchaseProducts' }], transaction });

        if (!purchase) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Compra não encontrada' });
        }

        for (const oldItem of purchase.purchaseProducts) {
            const product = await Product.findByPk(oldItem.productId, { transaction });
            if (product) {
                product.estoque -= oldItem.quantidade; 
                await product.save({ transaction });
            }
        }
        
        await PurchaseProduct.destroy({ where: { purchaseId: purchase.id }, transaction });

        let newCalculatedTotalValue = 0;
        for (const newItem of purchaseProductsData) {
            newCalculatedTotalValue += newItem.precoCustoUnitario * newItem.quantidade;
        }

        await purchase.update({
            supplierId,
            dataCompra: dataCompra || new Date(),
            valorTotal: newCalculatedTotalValue,
            status: status || 'Concluída',
            observacoes: observacoes || null
        }, { transaction });

        for (const item of purchaseProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) { throw new Error(`Produto com ID ${item.productId} não encontrado.`); }

            await PurchaseProduct.create({
                purchaseId: purchase.id,
                productId: item.productId,
                quantidade: item.quantidade,
                precoCustoUnitario: item.precoCustoUnitario
            }, { transaction });

            product.estoque += item.quantidade;
            await product.save({ transaction });
        }

        await transaction.commit();
        const updatedPurchase = await Purchase.findByPk(purchaseId, {
            include: [{ model: Supplier, as: 'supplier' }, { model: Product, as: 'products', through: { attributes: ['quantidade', 'precoCustoUnitario'] } }]
        });
        res.json(updatedPurchase);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('❌ ERRO AO ATUALIZAR COMPRA:', error);
        res.status(400).json({ message: error.message || 'Erro ao atualizar compra.' });
    }
});

router.delete('/purchases/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [{ model: PurchaseProduct, as: 'purchaseProducts' }]
        });
        
        if (!purchase) { return res.status(404).json({ message: 'Compra não encontrada' }); }

        let transaction;
        try {
            transaction = await Purchase.sequelize.transaction();
            for (const item of purchase.purchaseProducts) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    product.estoque -= item.quantidade; 
                    await product.save({ transaction });
                }
            }
            await PurchaseProduct.destroy({ where: { purchaseId: purchase.id }, transaction });
            const deleted = await Purchase.destroy({ where: { id: req.params.id }, transaction });
            await transaction.commit();
            if (deleted) res.status(204).send();
            else res.status(404).json({ message: 'Compra não encontrada' });
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('❌ ERRO AO DELETAR COMPRA COM PRODUTOS:', error);
            res.status(500).json({ message: 'Erro ao deletar compra.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE RELATÓRIOS FINANCEIROS ---
router.get('/finance/cash-flow', authorizeRole(['admin', 'gerente']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Cash Flow report route accessed by ${req.user.username}.`);
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Parâmetros startDate e endDate são obrigatórios.' });
        }

        // Ajustar as datas para cobrir o dia inteiro
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        // Calcular Entradas (Recebimentos de Vendas)
        // Somar o valor dos pagamentos de vendas dentro do período
        const totalReceipts = await Payment.sum('valor', {
            where: {
                dataPagamento: {
                    [Op.between]: [start, end]
                }
            }
        }) || 0;

        // Calcular Saídas (Pagamentos de Compras)
        // Somar o valor total das compras 'Concluídas' dentro do período
        const totalPayments = await Purchase.sum('valorTotal', {
            where: {
                dataCompra: {
                    [Op.between]: [start, end]
                },
                status: 'Concluída' // Considera apenas compras que foram concluídas (pagas)
            }
        }) || 0;

        const netCashFlow = totalReceipts - totalPayments;

        res.json({
            startDate: startDate,
            endDate: endDate,
            totalReceipts: totalReceipts,
            totalPayments: totalPayments,
            netCashFlow: netCashFlow
        });

    } catch (error) {
        console.error('❌ ERRO AO GERAR RELATÓRIO DE FLUXO DE CAIXA:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de fluxo de caixa.' });
    }
});

// Endpoint para exportar CSV Contábil Consolidado
router.get('/finance/accounting-csv', authorizeRole(['admin', 'gerente']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Accounting CSV export route accessed by ${req.user.username}.`);
    try {
        let { startDate, endDate } = req.query;

        // Se datas não forem fornecidas, define um período padrão (ex: último mês ou todo o histórico)
        if (!startDate || !endDate) {
            // Exemplo: Últimos 30 dias se não especificado
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
        }

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        // Buscar todos os pagamentos de vendas (entradas)
        const payments = await Payment.findAll({
            where: {
                dataPagamento: { [Op.between]: [start, end] }
            },
            include: [{ model: Sale, as: 'sale', include: [{ model: Client, as: 'client', attributes: ['nome'] }] }]
        });

        // Buscar todas as compras (saídas) que estão 'Concluídas'
        const purchases = await Purchase.findAll({
            where: {
                dataCompra: { [Op.between]: [start, end] },
                status: 'Concluída' 
            },
            include: [{ model: Supplier, as: 'supplier', attributes: ['nome'] }]
        });

        let transactions = [];

        // Adicionar pagamentos (entradas)
        payments.forEach(p => {
            transactions.push({
                date: p.dataPagamento,
                type: 'ENTRADA',
                description: `Pagamento de Venda #${p.saleId}`,
                amount: parseFloat(p.valor),
                entity: p.sale && p.sale.client ? p.sale.client.nome : 'N/A',
                payment_method: p.formaPagamento,
                ref_id: p.saleId
            });
        });

        // Adicionar compras (saídas)
        purchases.forEach(pr => {
            transactions.push({
                date: pr.dataCompra,
                type: 'SAÍDA',
                description: `Pagamento de Compra #${pr.id}`,
                amount: parseFloat(pr.valorTotal),
                entity: pr.supplier ? pr.supplier.nome : 'N/A',
                payment_method: 'N/A', // O modelo Purchase não tem forma de pagamento detalhada
                ref_id: pr.id
            });
        });

        // Ordenar transações por data cronologicamente
        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Cabeçalhos do CSV
        const headers = [
            'Data', 
            'Tipo de Movimento', 
            'Descricao', 
            'Valor', 
            'Origem/Destino', 
            'Forma de Pagamento/Recebimento', 
            'ID de Referencia'
        ];

        // Linhas do CSV
        const csvRows = transactions.map(t => {
            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes(';')) { // Inclui ; para CSV separado por ;
                    return `"${stringValue}"`;
                }
                return stringValue;
            };

            return [
                escapeCsv(new Date(t.date).toLocaleDateString('pt-BR')),
                escapeCsv(t.type),
                escapeCsv(t.description),
                escapeCsv(t.amount.toFixed(2).replace('.', ',')), // Formato monetário com vírgula para decimal
                escapeCsv(t.entity),
                escapeCsv(t.payment_method),
                escapeCsv(t.ref_id)
            ].join(';'); // Separador por ponto e vírgula
        });

        const csvContent = [headers.join(';'), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_contabil_${startDate}_${endDate}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('❌ ERRO AO GERAR CSV CONTÁBIL:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório CSV contábil.' });
    }
});


// ROTAS PARA ANÁLISE PREDITIVA SIMPLES
router.get('/finance/sales-prediction', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales Prediction report route accessed by ${req.user.username}.`);
    try {
        const { months = 12 } = req.query; // Pega o número de meses do histórico (default 12)

        // Calcula a data de início para buscar o histórico de vendas
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - parseInt(months));
        startDate.setDate(1); // Começa no primeiro dia do mês

        let whereClause = {
            dataVenda: {
                [Op.between]: [startDate, endDate]
            }
        };
        // Se o usuário for vendedor, filtra pelas vendas dele
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        // Agrupa as vendas por mês para obter o histórico, incluindo contagem de vendas e ticket médio
        const monthlySales = await Sale.findAll({
            attributes: [
                // CORREÇÃO AQUI: Usando DATE_FORMAT para MySQL
                [fn('DATE_FORMAT', col('dataVenda'), '%Y-%m'), 'month'], // Formata para 'AAAA-MM'
                [fn('sum', col('valorTotal')), 'totalSales'], // Soma o valor total
                [fn('count', col('id')), 'salesCount'] // Adiciona a contagem de vendas
            ],
            where: whereClause,
            group: ['month'],
            // CORREÇÃO AQUI: Ordenar pelo resultado da função DATE_FORMAT
            order: [[fn('DATE_FORMAT', col('dataVenda'), '%Y-%m'), 'ASC']] // Ordena cronologicamente
        });

        // Formata os dados para o frontend, calculando ticket médio por mês
        const formattedData = monthlySales.map(item => {
            const totalSales = parseFloat(item.dataValues.totalSales);
            const salesCount = parseInt(item.dataValues.salesCount);
            const averageTicket = salesCount > 0 ? totalSales / salesCount : 0;

            return {
                month: item.dataValues.month,
                totalSales: totalSales,
                salesCount: salesCount,
                averageTicket: averageTicket
            };
        });

        res.json({
            historicalData: formattedData,
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                months: parseInt(months)
            }
        });

    } catch (error) {
        console.error('❌ ERRO AO GERAR DADOS PARA PREDIÇÃO DE VENDAS:', error);
        res.status(500).json({ message: 'Erro ao gerar dados para análise preditiva de vendas.' });
    }
});


module.exports = router