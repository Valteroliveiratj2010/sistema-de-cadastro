// backend/routes/api.js
const express = require('express');
const { Op, fn, col, where } = require('sequelize');
const { TextEncoder } = require('util'); // Para encodeUTF8

// Helper functions para Scrypt (precisam estar disponíveis onde o hash é gerado)
const encodeUTF8 = (str) => Buffer.from(str, 'utf8');
const toHex = (bytes) => Buffer.from(bytes).toString('hex');


// Importar os modelos
const { Client, Sale, Payment, User, Product, SaleProduct, Supplier, Purchase, PurchaseProduct, ActivityLog, sequelize } = require('../database'); 

// Importar os middlewares
const authMiddleware = require('../middleware/authMiddleware'); 
const authorizeRole = require('../middleware/authorizationMiddleware');

// Importar o controller do dashboard
const dashboardController = require('../controllers/dashboardController'); 

// Importar o middleware de logging
const { activityLogger, logManualActivity } = require('../middleware/activityLogger');

const router = express.Router();

router.get('/ping', (req, res) => {
    res.json({ message: 'Pong!' });
  });
  

// ====================================================================
// !!! IMPORTANTE: ROTAS DE AUTENTICAÇÃO DEVEM VIR AQUI PRIMEIRO !!!
// Este é o ajuste crucial para permitir o login sem um token.
// ====================================================================
const authRoutes = require('./auth'); // Importa o seu arquivo auth.js
router.use('/auth', authRoutes); // Aplica as rotas de autenticação sob o prefixo /api/auth

// ====================================================================
// APÓS AS ROTAS DE AUTENTICAÇÃO, APLIQUE O MIDDLEWARE PARA AS ROTAS PROTEGIDAS
// Todas as rotas definidas ABAIXO desta linha exigirão um token JWT válido.
// ====================================================================
router.use(authMiddleware); 
console.log('--- ROUTER API ATIVADO (TESTE DE LOG) ---'); 

// --- ROTAS DO DASHBOARD ---
// Exemplo de rota protegida pelo authMiddleware e authorizeRole
router.get('/dashboard/stats', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthNumber = today.getMonth(); // 0-11
        const currentMonth = `${currentYear}-${String(currentMonthNumber + 1).padStart(2, '0')}`;

        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const baseWhereClause = (req.user.role === 'vendedor') ? { userId: req.user.id } : {};

        const totalClients = await Client.count({ where: baseWhereClause });
        
        const totalSalesAmountAll = await Sale.sum('valorTotal', { where: baseWhereClause }) || 0;
        const totalPaidAmountAll = await Sale.sum('valorPago', { where: baseWhereClause }) || 0;
        const totalReceivable = totalSalesAmountAll - totalPaidAmountAll;
        
        const salesThisMonth = await Sale.sum('valorTotal', {
            where: { 
                ...baseWhereClause,
                [Op.and]: [
                    where(fn('TO_CHAR', col('dataVenda'), 'YYYY-MM'), currentMonth)
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

        const rawSalesByMonth = await Sale.findAll({
            attributes: [
                [fn('TO_CHAR', col('dataVenda'), 'YYYY-MM'), 'month'], 
                [fn('sum', col('valorTotal')), 'total'],
                [fn('count', col('id')), 'count']
            ],
            where: {
                ...baseWhereClause,
                dataVenda: {
                    [Op.gte]: new Date(currentYear - 2, currentMonthNumber, 1) 
                }
            },
            group: ['month'],
            order: [[fn('TO_CHAR', col('dataVenda'), 'YYYY-MM'), 'ASC']]
        });

        const salesByMonthMap = new Map();
        rawSalesByMonth.forEach(item => {
            salesByMonthMap.set(item.dataValues.month, {
                total: parseFloat(item.dataValues.total),
                count: parseInt(item.dataValues.count)
            });
        });

        const fullSalesByMonth = [];
        for (let i = -12; i <= 0; i++) { 
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

        const totalSalesCountAll = await Sale.count({ where: baseWhereClause }) || 1; 
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
            salesByMonth: fullSalesByMonth, 
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

// ROTA PARA BUSCAR CLIENTES (COM LOGGING)
router.get('/clients', authorizeRole(['admin', 'gerente', 'vendedor']), activityLogger('view_clients', 'client'), async (req, res) => {
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
        
        // Para vendedores, verificar se o cliente pertence a eles
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const client = await Client.findOne({ where: whereClause });
        if (client) {
            res.json({ success: true, data: client });
        } else {
            res.status(404).json({ success: false, message: 'Cliente não encontrado ou você não tem permissão para vê-lo.' });
        }
    } catch (error) { 
        console.error('❌ ERRO AO BUSCAR CLIENTE POR ID:', error);
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// CRIAR CLIENTE (COM LOGGING)
router.post('/clients', authorizeRole(['admin', 'gerente', 'vendedor']), activityLogger('create_client', 'client'), async (req, res) => {
    try {
        const { userId: requestedUserId, ...rest } = req.body;

        // Por padrão, o dono é quem cria
        let ownerUserId = req.user.id;

        // Admin/Gerente podem atribuir explicitamente um responsável
        if ((req.user.role === 'admin' || req.user.role === 'gerente') && requestedUserId) {
            const owner = await User.findByPk(requestedUserId, { attributes: ['id', 'username', 'role'] });
            if (!owner) {
                return res.status(400).json({ success: false, message: 'Usuário responsável (userId) não encontrado.' });
            }
            ownerUserId = owner.id;
        }

        const clientData = { ...rest, userId: ownerUserId };
        const client = await Client.create(clientData);
        res.status(201).json({ success: true, data: client, message: 'Cliente criado com sucesso!' });
    } catch (error) { 
        console.error('❌ ERRO AO CRIAR CLIENTE:', error);
        res.status(400).json({ success: false, message: error.message }); 
    }
});

// ATUALIZAR CLIENTE (COM LOGGING)
router.put('/clients/:id', authorizeRole(['admin', 'gerente', 'vendedor']), activityLogger('update_client', 'client'), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        
        // Para vendedores, verificar se o cliente pertence a eles
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const [updated] = await Client.update(req.body, { where: whereClause });
        if (updated) {
            const updatedClient = await Client.findByPk(id);
            res.json({ success: true, data: updatedClient, message: 'Cliente atualizado com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Cliente não encontrado ou você não tem permissão para editá-lo.' });
        }
    } catch (error) { 
        console.error('❌ ERRO AO ATUALIZAR CLIENTE:', error);
        res.status(400).json({ success: false, message: error.message }); 
    }
});

// DELETAR CLIENTE (COM LOGGING)
router.delete('/clients/:id', authorizeRole(['admin', 'gerente']), activityLogger('delete_client', 'client'), async (req, res) => {
    try {
        const deleted = await Client.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true, message: 'Cliente excluído com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Cliente não encontrado' });
        }
    } catch (error) { 
        console.error('❌ ERRO AO DELETAR CLIENTE:', error);
        res.status(500).json({ success: false, message: error.message }); 
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
        
        console.log('📊 Vendas encontradas:', sales.length);
        console.log('💰 Valores das vendas:', sales.map(s => ({ id: s.id, valorTotal: s.valorTotal, valorPago: s.valorPago })));
        
        const totalSalesAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.valorTotal || 0), 0);
        const totalPaidAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.valorPago || 0), 0);
        const totalDueAmount = totalSalesAmount - totalPaidAmount;
        
        console.log('📈 Resumo calculado:', {
            totalSalesAmount,
            totalPaidAmount,
            totalDueAmount,
            numberOfSales: sales.length
        });
        
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
    const { page = 1, limit = 5, q = '', clientId, updateStatus } = req.query;
    const offset = (page - 1) * limit;
    
    // Se solicitado, atualizar status de todas as vendas
    let updatedCount = 0;
    if (updateStatus === 'true' && (req.user.role === 'admin' || req.user.role === 'gerente')) {
        try {
            const { updateSalesStatus } = require('../utils/statusUpdater');
            updatedCount = await updateSalesStatus();
            console.log(`✅ ${updatedCount} vendas atualizadas automaticamente`);
        } catch (updateError) {
            console.warn('⚠️ Erro ao atualizar status:', updateError.message);
        }
    }
    
    let whereClause = {};
    if (q) {
        whereClause['$client.nome$'] = { [Op.like]: `%${q}%` };
    }
    if (req.user.role === 'vendedor') {
        whereClause.userId = req.user.id;
    }

    try {
        let rows, count;
        if (clientId) {
            // Filtro explícito por clientId
            const result = await Sale.findAndCountAll({
                where: { ...whereClause, clientId: parseInt(clientId) },
                include: [{ model: Client, as: 'client', attributes: ['nome'] }],
                order: [['dataVenda', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            rows = result.rows;
            count = result.count;
        } else {
            const result = await Sale.findAndCountAll({
                where: whereClause,
                include: [{ model: Client, as: 'client', attributes: ['nome'] }],
                order: [['dataVenda', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            rows = result.rows;
            count = result.count;
        }
        res.json({ total: count, data: rows, updatedCount });
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
                    model: SaleProduct, 
                    as: 'saleProducts',
                    include: [
                        { model: Product, as: 'Product' }
                    ]
                }
            ]
        });
        
        if (sale) {
            // Verificar e atualizar status automaticamente
            try {
                const { checkAndUpdateSaleStatus } = require('../utils/statusUpdater');
                const wasUpdated = await checkAndUpdateSaleStatus(id);
                if (wasUpdated) {
                    // Recarregar a venda para obter o status atualizado
                    await sale.reload();
                }
            } catch (updateError) {
                console.warn('⚠️ Erro ao verificar status automático:', updateError.message);
            }
            
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Venda não encontrada ou você não tem permissão para vê-la.' });
        }
    } catch (error) {
        console.error('❌ ERRO AO OBTER DETALHES DA VENDA:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/sales', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log('[API Route Log] POST /sales - Request Body:', JSON.stringify(req.body, null, 2));
    console.log('[API Route Log] Status recebido:', req.body.status);
    console.log('[API Route Log] InitialPayment recebido:', req.body.initialPayment);
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
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.preco;
            valorTotalCalculado += precoUnitario * item.quantidade;
        }
        // Determinar status da venda
        let saleStatus = 'Pendente';
        console.log('[API Route Log] Determinando status da venda:');
        console.log('[API Route Log] - Status recebido:', req.body.status);
        console.log('[API Route Log] - InitialPayment:', initialPayment);
        console.log('[API Route Log] - Valor total calculado:', valorTotalCalculado);
        
        if (req.body.status) {
            saleStatus = req.body.status;
            console.log('[API Route Log] - Usando status do frontend:', saleStatus);
        } else if (initialPayment && parseFloat(initialPayment.valor) >= valorTotalCalculado) {
            saleStatus = 'Pago';
            console.log('[API Route Log] - Status determinado automaticamente como Pago');
        } else {
            console.log('[API Route Log] - Status mantido como Pendente');
        }
        
        const sale = await Sale.create({
            clientId,
            userId,
            dataVenda: dataVenda || new Date(),
            dataVencimento: dataVencimento || null,
            valorTotal: valorTotalCalculado,
            valorPago: (initialPayment && initialPayment.valor) ? parseFloat(initialPayment.valor) : 0, 
            status: saleStatus
        }, { transaction });
        console.log('✅ Venda criada com ID:', sale.id);
        
        if (initialPayment && parseFloat(initialPayment.valor) > 0) {
            console.log('🔄 Criando pagamento inicial para venda ID:', sale.id);
            await Payment.create({
                valor: parseFloat(initialPayment.valor),
                dataPagamento: new Date(),
                saleId: sale.id,
                formaPagamento: initialPayment.formaPagamento || 'Dinheiro',
                parcelas: initialPayment.parcelas || 1,
                bandeiraCartao: initialPayment.bandeiraCartao || null,
                bancoCrediario: initialPayment.bancoCrediario || null
            }, { transaction });
            console.log('✅ Pagamento inicial criado com sucesso');
        }
        for (const item of saleProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.preco;
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
            sale.status = 'Pago';
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
    const LOW_STOCK_THRESHOLD = 20; // Aumentado para 20 conforme solicitado
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
        // Usar raw query para evitar problemas com GROUP BY e includes
        const query = `
            SELECT 
                sp."productId",
                p.nome,
                p.preco,
                SUM(sp.quantidade) as "totalQuantidadeVendida"
            FROM "SaleProducts" sp
            JOIN "Products" p ON sp."productId" = p.id
            GROUP BY sp."productId", p.nome, p.preco
            ORDER BY "totalQuantidadeVendida" DESC
            LIMIT 5
        `;
        
        const topProducts = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });
        
        const formattedRanking = topProducts.map(item => ({
            id: item.productId,
            nome: item.nome || 'Produto Desconhecido',
            totalQuantidadeVendida: parseInt(item.totalQuantidadeVendida),
            precoVenda: parseFloat(item.preco) || 0
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
            group: [
                'clientId', 
                'client.id', 
                'client.nome', 
                'client.email', 
                'client.telefone' 
            ], 
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
            group: [
                'userId', 
                'user.id', 
                'user.username' 
            ], 
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
        const { count, rows } = await Product.findAndCountAll({ 
            where: whereClause, 
            limit: parseInt(limit), 
            offset: parseInt(offset), 
            order: [['nome', 'ASC']] 
        });
        res.json({ 
            success: true, 
            total: count, 
            products: rows 
        });
    } catch (error) { 
        console.error('❌ ERRO AO BUSCAR PRODUTOS:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        }); 
    }
});

router.get('/products/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.json({ 
                success: true, 
                data: product 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }
    } catch (error) { 
        console.error('❌ ERRO AO BUSCAR PRODUTO:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        }); 
    }
});

router.post('/products', authorizeRole(['admin', 'gerente']), async (req, res) => { 
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Produto criado com sucesso!',
            data: product 
        });
    } catch (error) { 
        console.error('❌ ERRO AO CRIAR PRODUTO:', error);
        
        // Tratamento específico para SKU duplicado
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields && error.fields.sku) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'SKU já existe. Por favor, use um SKU único.' 
                });
            }
        }
        
        res.status(400).json({ 
            success: false, 
            message: error.message || 'Erro ao criar produto' 
        }); 
    }
});

router.put('/products/:id', authorizeRole(['admin', 'gerente']), async (req, res) => { 
    try {
        const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.json({ 
                success: true, 
                message: 'Produto atualizado com sucesso!',
                data: updatedProduct 
            });
        } else { 
            res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            }); 
        }
    } catch (error) { 
        console.error('❌ ERRO AO ATUALIZAR PRODUTO:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        }); 
    }
});

router.delete('/products/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ 
                success: true, 
                message: 'Produto excluído com sucesso!' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }
    } catch (error) { 
        console.error('❌ ERRO AO DELETAR PRODUTO:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// --- ROTAS DE GESTÃO DE UTILIZADORES (APENAS PARA ADMIN) ---

// LISTAR USUÁRIOS
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

// OBTER UM USUÁRIO POR ID
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

// CRIAR USUÁRIO (bcrypt será aplicado automaticamente pelo hook do modelo)
router.post('/users', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para criar um novo utilizador.' });
        }
        const user = await User.create({ username, email, password, role }); // bcrypt hook no model!
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO CRIAR UTILIZADOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao criar utilizador.' });
    }
});

// ATUALIZAR USUÁRIO (bcrypt será aplicado automaticamente pelo hook do modelo)
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
        if (password) user.password = password; // bcrypt hook no model!

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

// DELETAR USUÁRIO
router.delete('/users/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        if (String(req.params.id) === String(req.user.id)) {
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

// --- ROTAS DEDICADAS: GERENTES E VENDEDORES (APENAS ADMIN) ---

// LISTAR GERENTES
router.get('/users/gerentes', authorizeRole(['admin']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { role: 'gerente' };
    if (q) {
        whereClause = {
            role: 'gerente',
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
        console.error('❌ ERRO AO BUSCAR GERENTES:', error);
        res.status(500).json({ message: error.message });
    }
});

// LISTAR VENDEDORES
router.get('/users/vendedores', authorizeRole(['admin']), async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { role: 'vendedor' };
    if (q) {
        whereClause = {
            role: 'vendedor',
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
        console.error('❌ ERRO AO BUSCAR VENDEDORES:', error);
        res.status(500).json({ message: error.message });
    }
});

// CRIAR GERENTE
router.post('/users/gerentes', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para criar um novo utilizador.' });
        }
        const user = await User.create({ username, email, password, role: 'gerente' });
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO CRIAR GERENTE:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao criar gerente.' });
    }
});

// CRIAR VENDEDOR
router.post('/users/vendedores', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para criar um novo utilizador.' });
        }
        const user = await User.create({ username, email, password, role: 'vendedor' });
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO CRIAR VENDEDOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao criar vendedor.' });
    }
});

// OBTÉM UM GERENTE POR ID
router.get('/users/gerentes/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
        });
        if (!user || user.role !== 'gerente') {
            return res.status(404).json({ message: 'Gerente não encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR GERENTE:', error);
        res.status(500).json({ message: error.message });
    }
});

// ATUALIZA UM GERENTE
router.put('/users/gerentes/:id', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'gerente') {
            return res.status(404).json({ message: 'Gerente não encontrado' });
        }
        if (role && role !== 'gerente') {
            return res.status(400).json({ message: 'Role inválida para esta rota. Use o CRUD geral para alterar a role.' });
        }
        if (username) user.username = username;
        if (email) user.email = email;
        user.role = 'gerente';
        if (password) user.password = password; // hook fará o hash

        await user.save();
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO ATUALIZAR GERENTE:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao atualizar gerente.' });
    }
});

// REMOVE UM GERENTE
router.delete('/users/gerentes/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        if (String(req.params.id) === String(req.user.id)) {
            return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
        }
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'gerente') {
            return res.status(404).json({ message: 'Gerente não encontrado' });
        }
        await User.destroy({ where: { id: req.params.id, role: 'gerente' } });
        res.status(204).send();
    } catch (error) {
        console.error('❌ ERRO AO DELETAR GERENTE:', error);
        res.status(500).json({ message: error.message });
    }
});

// OBTÉM UM VENDEDOR POR ID
router.get('/users/vendedores/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
        });
        if (!user || user.role !== 'vendedor') {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR VENDEDOR:', error);
        res.status(500).json({ message: error.message });
    }
});

// ATUALIZA UM VENDEDOR
router.put('/users/vendedores/:id', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'vendedor') {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }
        if (role && role !== 'vendedor') {
            return res.status(400).json({ message: 'Role inválida para esta rota. Use o CRUD geral para alterar a role.' });
        }
        if (username) user.username = username;
        if (email) user.email = email;
        user.role = 'vendedor';
        if (password) user.password = password; // hook fará o hash

        await user.save();
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO ATUALIZAR VENDEDOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao atualizar vendedor.' });
    }
});

// REMOVE UM VENDEDOR
router.delete('/users/vendedores/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        if (String(req.params.id) === String(req.user.id)) {
            return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
        }
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'vendedor') {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }
        await User.destroy({ where: { id: req.params.id, role: 'vendedor' } });
        res.status(204).send();
    } catch (error) {
        console.error('❌ ERRO AO DELETAR VENDEDOR:', error);
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
                    model: PurchaseProduct, 
                    as: 'purchaseProducts',
                    include: [
                        { model: Product, as: 'product' }
                    ]
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
    const userId = req.user.id; 

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

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        // Buscar pagamentos (receitas)
        const payments = await Payment.findAll({
            where: {
                dataPagamento: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                { 
                    model: Sale, 
                    as: 'sale', 
                    include: [{ model: Client, as: 'client', attributes: ['nome'] }] 
                }
            ],
            order: [['dataPagamento', 'ASC']]
        });

        // Buscar compras (despesas)
        const purchases = await Purchase.findAll({
            where: {
                dataCompra: {
                    [Op.between]: [start, end]
                },
                status: 'Concluída' 
            },
            include: [
                { model: Supplier, as: 'supplier', attributes: ['nome'] }
            ],
            order: [['dataCompra', 'ASC']]
        });

        // Calcular totais
        const totalReceipts = payments.reduce((sum, payment) => sum + parseFloat(payment.valor || 0), 0);
        const totalPayments = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.valorTotal || 0), 0);
        const netCashFlow = totalReceipts - totalPayments;

        // Criar array de dados detalhados
        const cashFlowData = [];

        // Adicionar receitas (pagamentos)
        payments.forEach(payment => {
            const clientName = payment.sale?.client?.nome || payment.sale?.client?.name || 'Cliente';
            cashFlowData.push({
                date: payment.dataPagamento,
                description: `Recebimento - ${clientName}`,
                income: parseFloat(payment.valor || 0),
                expense: 0,
                type: 'receita',
                paymentMethod: payment.formaPagamento || 'Dinheiro'
            });
        });

        // Adicionar despesas (compras)
        purchases.forEach(purchase => {
            const supplierName = purchase.supplier?.nome || purchase.supplier?.name || 'Fornecedor';
            cashFlowData.push({
                date: purchase.dataCompra,
                description: `Compra - ${supplierName}`,
                income: 0,
                expense: parseFloat(purchase.valorTotal || 0),
                type: 'despesa',
                supplier: supplierName
            });
        });

        // Ordenar por data
        cashFlowData.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            startDate: startDate,
            endDate: endDate,
            totalReceipts: totalReceipts,
            totalPayments: totalPayments,
            netCashFlow: netCashFlow,
            cashFlow: cashFlowData,
            data: cashFlowData // Para compatibilidade com o frontend
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

        if (!startDate || !endDate) {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
        }

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        let payments = [];
        try {
            payments = await Payment.findAll({
                where: {
                    dataPagamento: { [Op.between]: [start, end] }
                },
                include: [{ model: Sale, as: 'sale', include: [{ model: Client, as: 'client', attributes: ['nome'] }] }]
            });
        } catch (paymentError) {
            console.error('❌ Erro ao buscar pagamentos para CSV:', paymentError);
            // Fallback sem associações
            try {
                payments = await Payment.findAll({
                    where: {
                        dataPagamento: { [Op.between]: [start, end] }
                    }
                });
            } catch (fallbackError) {
                console.error('❌ Erro no fallback de pagamentos para CSV:', fallbackError);
                payments = [];
            }
        }

        const purchases = await Purchase.findAll({
            where: {
                dataCompra: { [Op.between]: [start, end] },
                status: 'Concluída' 
            },
            include: [{ model: Supplier, as: 'supplier', attributes: ['nome'] }]
        });

        let transactions = [];

        payments.forEach(p => {
            let entityName = 'N/A';
            try {
                if (p.sale && p.sale.client) {
                    entityName = p.sale.client.nome;
                }
            } catch (error) {
                console.log('⚠️ Erro ao acessar dados da venda/cliente no CSV:', error.message);
            }
            
            transactions.push({
                date: p.dataPagamento,
                type: 'ENTRADA',
                description: `Pagamento de Venda #${p.saleId}`,
                amount: parseFloat(p.valor),
                entity: entityName,
                payment_method: p.formaPagamento || 'N/A',
                ref_id: p.saleId
            });
        });

        purchases.forEach(pr => {
            transactions.push({
                date: pr.dataCompra,
                type: 'SAÍDA',
                description: `Pagamento de Compra #${pr.id}`,
                amount: parseFloat(pr.valorTotal),
                entity: pr.supplier ? pr.supplier.nome : 'N/A',
                payment_method: 'N/A', 
                ref_id: pr.id
            });
        });

        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const headers = [
            'Data', 
            'Tipo de Movimento', 
            'Descricao', 
            'Valor', 
            'Origem/Destino', 
            'Forma de Pagamento/Recebimento', 
            'ID de Referencia'
        ];

        const csvRows = transactions.map(t => {
            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes(';')) { 
                    return `"${stringValue}"`;
                }
                return stringValue;
            };

            return [
                escapeCsv(new Date(t.date).toLocaleDateString('pt-BR')),
                escapeCsv(t.type),
                escapeCsv(t.description),
                escapeCsv(t.amount.toFixed(2).replace('.', ',')), 
                escapeCsv(t.entity),
                escapeCsv(t.payment_method),
                escapeCsv(t.ref_id)
            ].join(';'); 
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

// ROTA PARA RELATÓRIO DE VENDAS POR PERÍODO
router.get('/reports/sales', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales report route accessed by ${req.user.username}.`);
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Data inicial e final são obrigatórias.' });
        }

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        let whereClause = {
            dataVenda: { [Op.between]: [start, end] }
        };

        // Filtrar por vendedor se não for admin/gerente
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                { model: Client, as: 'client', attributes: ['nome'] },
                { model: User, as: 'user', attributes: ['username'] },
                { model: Payment, as: 'payments', attributes: ['valor'] }
            ],
            order: [['dataVenda', 'DESC']]
        });

        // Calcular totais
        const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.valorTotal), 0);
        const totalPaid = sales.reduce((sum, sale) => {
            const paidAmount = sale.pagamentos ? sale.pagamentos.reduce((pSum, p) => pSum + parseFloat(p.valor), 0) : 0;
            return sum + paidAmount;
        }, 0);
        const totalDue = totalSales - totalPaid;

        // Formatar dados para resposta
        const formattedSales = sales.map(sale => {
            const paidAmount = sale.pagamentos ? sale.pagamentos.reduce((sum, p) => sum + parseFloat(p.valor), 0) : 0;
            const dueAmount = parseFloat(sale.valorTotal) - paidAmount;

            return {
                id: sale.id,
                clientName: sale.client ? sale.client.nome : 'N/A',
                saleDate: sale.dataVenda,
                totalValue: parseFloat(sale.valorTotal),
                paidValue: paidAmount,
                dueValue: dueAmount,
                status: sale.status,
                seller: sale.user ? sale.user.username : 'N/A'
            };
        });

        res.json({
            sales: formattedSales,
            summary: {
                totalSales: totalSales,
                totalPaid: totalPaid,
                totalDue: totalDue,
                salesCount: sales.length
            },
            period: {
                startDate: startDate,
                endDate: endDate
            }
        });

    } catch (error) {
        console.error('❌ ERRO AO GERAR RELATÓRIO DE VENDAS:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório de vendas.' });
    }
});

// ROTA PARA RELATÓRIO DE FLUXO DE CAIXA
router.get('/reports/cash-flow', authorizeRole(['admin', 'gerente']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Cash flow report route accessed by ${req.user.username}.`);
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Data inicial e final são obrigatórias.' });
        }

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        // Buscar pagamentos de vendas (entradas)
        console.log('🔍 Buscando pagamentos entre:', start, 'e', end);
        let payments = [];
        
        // Primeiro, verificar se há pagamentos no período
        try {
            const paymentCount = await Payment.count({
                where: {
                    dataPagamento: { [Op.between]: [start, end] }
                }
            });
            console.log('📊 Total de pagamentos no período:', paymentCount);
            
            if (paymentCount > 0) {
                try {
                    payments = await Payment.findAll({
                        where: {
                            dataPagamento: { [Op.between]: [start, end] }
                        },
                        include: [
                            { model: Sale, as: 'sale', include: [{ model: Client, as: 'client', attributes: ['nome'] }] }
                        ],
                        order: [['dataPagamento', 'ASC']]
                    });
                    console.log('✅ Pagamentos encontrados com associações:', payments.length);
                } catch (paymentError) {
                    console.error('❌ Erro ao buscar pagamentos com associações:', paymentError);
                    // Se houver erro com associações, tentar sem include
                    try {
                        payments = await Payment.findAll({
                            where: {
                                dataPagamento: { [Op.between]: [start, end] }
                            },
                            order: [['dataPagamento', 'ASC']]
                        });
                        console.log('✅ Pagamentos encontrados (sem associações):', payments.length);
                    } catch (fallbackError) {
                        console.error('❌ Erro no fallback de pagamentos:', fallbackError);
                        payments = [];
                    }
                }
            } else {
                console.log('ℹ️ Nenhum pagamento encontrado no período');
            }
        } catch (countError) {
            console.error('❌ Erro ao contar pagamentos:', countError);
            payments = [];
        }

        // Buscar compras (saídas)
        const purchases = await Purchase.findAll({
            where: {
                dataCompra: { [Op.between]: [start, end] },
                status: 'Concluída'
            },
            include: [
                { model: Supplier, as: 'supplier', attributes: ['nome'] }
            ],
            order: [['dataCompra', 'ASC']]
        });

        // Formatar transações
        const transactions = [];

        // Adicionar entradas (pagamentos)
        payments.forEach(payment => {
            let entityName = 'N/A';
            try {
                if (payment.sale && payment.sale.client) {
                    entityName = payment.sale.client.nome;
                }
            } catch (error) {
                console.log('⚠️ Erro ao acessar dados da venda/cliente:', error.message);
            }
            
            transactions.push({
                date: payment.dataPagamento,
                type: 'ENTRADA',
                description: `Pagamento de Venda #${payment.saleId}`,
                amount: parseFloat(payment.valor),
                entity: entityName,
                paymentMethod: payment.formaPagamento || 'N/A',
                referenceId: payment.saleId
            });
        });

        // Adicionar saídas (compras)
        purchases.forEach(purchase => {
            transactions.push({
                date: purchase.dataCompra,
                type: 'SAÍDA',
                description: `Compra #${purchase.id}`,
                amount: parseFloat(purchase.valorTotal),
                entity: purchase.supplier ? purchase.supplier.nome : 'N/A',
                paymentMethod: 'N/A',
                referenceId: purchase.id
            });
        });

        // Ordenar por data
        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calcular totais
        const totalInflows = transactions
            .filter(t => t.type === 'ENTRADA')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalOutflows = transactions
            .filter(t => t.type === 'SAÍDA')
            .reduce((sum, t) => sum + t.amount, 0);

        const netFlow = totalInflows - totalOutflows;

        res.json({
            transactions: transactions,
            summary: {
                totalInflows: totalInflows,
                totalOutflows: totalOutflows,
                netFlow: netFlow,
                transactionCount: transactions.length
            },
            period: {
                startDate: startDate,
                endDate: endDate
            }
        });

    } catch (error) {
        console.error('❌ ERRO AO GERAR RELATÓRIO DE FLUXO DE CAIXA:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório de fluxo de caixa.' });
    }
});

// ROTA PARA EXPORTAR RELATÓRIO DE VENDAS EM CSV
router.get('/reports/sales/export', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales CSV export route accessed by ${req.user.username}.`);
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Data inicial e final são obrigatórias.' });
        }

        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Formato de data inválido. Use AAAA-MM-DD.' });
        }

        let whereClause = {
            dataVenda: { [Op.between]: [start, end] }
        };

        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                { model: Client, as: 'client', attributes: ['nome'] },
                { model: User, as: 'user', attributes: ['username'] },
                { model: Payment, as: 'payments', attributes: ['valor'] }
            ],
            order: [['dataVenda', 'DESC']]
        });

        const headers = [
            'ID',
            'Cliente',
            'Data da Venda',
            'Valor Total',
            'Valor Pago',
            'Valor Devido',
            'Status',
            'Vendedor'
        ];

        const csvRows = sales.map(sale => {
            const paidAmount = sale.pagamentos ? sale.pagamentos.reduce((sum, p) => sum + parseFloat(p.valor), 0) : 0;
            const dueAmount = parseFloat(sale.valorTotal) - paidAmount;

            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes(';')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            };

            return [
                escapeCsv(sale.id),
                escapeCsv(sale.client ? sale.client.nome : 'N/A'),
                escapeCsv(new Date(sale.dataVenda).toLocaleDateString('pt-BR')),
                escapeCsv(parseFloat(sale.valorTotal).toFixed(2).replace('.', ',')),
                escapeCsv(paidAmount.toFixed(2).replace('.', ',')),
                escapeCsv(dueAmount.toFixed(2).replace('.', ',')),
                escapeCsv(sale.status),
                escapeCsv(sale.user ? sale.user.username : 'N/A')
            ].join(';');
        });

        const csvContent = [headers.join(';'), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_vendas_${startDate}_${endDate}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR RELATÓRIO DE VENDAS:', error);
        res.status(500).json({ message: 'Erro ao exportar relatório de vendas.' });
    }
});

// ROTAS PARA ANÁLISE PREDITIVA SIMPLES
router.get('/finance/sales-prediction', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales Prediction report route accessed by ${req.user.username}.`);
    try {
        const { months = 12 } = req.query; 

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - parseInt(months));
        startDate.setDate(1); 

        let whereClause = {
            dataVenda: {
                [Op.between]: [startDate, endDate]
            }
        };
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const monthlySales = await Sale.findAll({
            attributes: [
                [fn('TO_CHAR', col('dataVenda'), 'YYYY-MM'), 'month'], 
                [fn('sum', col('valorTotal')), 'totalSales'], 
                [fn('count', col('id')), 'salesCount'] 
            ],
            where: whereClause,
            group: ['month'],
            order: [[fn('TO_CHAR', col('dataVenda'), 'YYYY-MM'), 'ASC']] 
        });

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

// --- ROTAS DO DASHBOARD TOP 5 ---
router.get('/dashboard/top-products', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Top Products route accessed by ${req.user.username}.`);
    try {
        await dashboardController.getProdutosMaisVendidos(req, res);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR TOP 5 PRODUTOS:', error);
        res.status(500).json({ message: 'Erro ao buscar top 5 produtos mais vendidos.' });
    }
});

router.get('/dashboard/top-clients', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Top Clients route accessed by ${req.user.username}.`);
    try {
        await dashboardController.getClientesMaisCompraram(req, res);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR TOP 5 CLIENTES:', error);
        res.status(500).json({ message: 'Erro ao buscar top 5 clientes que mais compraram.' });
    }
});

router.get('/dashboard/top-suppliers', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Top Suppliers route accessed by ${req.user.username}.`);
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const purchaseTable = 'Purchases';
        const supplierTable = 'Suppliers';

        // Query para buscar fornecedores com mais compras no mês
        const query = `
            SELECT s.nome AS nome_fornecedor, COALESCE(COUNT(p.id), 0) AS total_compras
            FROM "Suppliers" s
            LEFT JOIN "Purchases" p ON s.id = p."supplierId"
            WHERE (p."dataCompra" >= :monthStart AND p."dataCompra" < :nextMonthStart) OR p.id IS NULL
            GROUP BY s.id, s.nome
            ORDER BY total_compras DESC
            LIMIT 5
        `;

        const rows = await sequelize.query(query, {
            replacements: { monthStart, nextMonthStart },
            type: sequelize.QueryTypes.SELECT
        });

        const data = rows.map(r => ({
            nome_fornecedor: r.nome_fornecedor,
            total_compras: parseInt(r.total_compras, 10) || 0
        }));

        res.json(data);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR TOP 5 FORNECEDORES:', error);
        res.status(500).json({ message: 'Erro ao buscar top 5 fornecedores.' });
    }
});

// ROTA PARA VISUALIZAR LOGS DE ATIVIDADE (APENAS ADMIN E GERENTE)
router.get('/activity-logs', authorizeRole(['admin', 'gerente']), activityLogger('view_activity_logs'), async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, entityType, status, startDate, endDate } = req.query;
        
        // Construir where clause
        const whereClause = {};
        
        if (userId) whereClause.userId = userId;
        if (action) whereClause.action = action;
        if (entityType) whereClause.entityType = entityType;
        if (status) whereClause.status = status;
        
        // Filtros de data
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
            if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
        }
        
        const offset = (page - 1) * limit;
        
        const result = await ActivityLog.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email', 'role']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            total: result.count,
            data: result.rows,
            page: parseInt(page),
            totalPages: Math.ceil(result.count / limit)
        });
        
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR LOGS DE ATIVIDADE:', error);
        res.status(500).json({ message: error.message });
    }
});

// ROTA PARA ESTATÍSTICAS DE ATIVIDADE (APENAS ADMIN E GERENTE)
router.get('/activity-stats', authorizeRole(['admin', 'gerente']), activityLogger('view_activity_stats'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Construir where clause para datas
        const whereClause = {};
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
            if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
        }
        
        // Estatísticas por ação
        const actionStats = await ActivityLog.findAll({
            where: whereClause,
            attributes: [
                'action',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['action'],
            order: [[fn('COUNT', col('id')), 'DESC']]
        });
        
        // Estatísticas por usuário
        const userStats = await ActivityLog.findAll({
            where: whereClause,
            attributes: [
                'userId',
                'username',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['userId', 'username'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            limit: 10
        });
        
        // Estatísticas por status
        const statusStats = await ActivityLog.findAll({
            where: whereClause,
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status']
        });
        
        res.json({
            actionStats,
            userStats,
            statusStats
        });
        
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR ESTATÍSTICAS DE ATIVIDADE:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
