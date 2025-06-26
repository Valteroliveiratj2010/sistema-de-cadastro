const express = require('express');
const { Op, fn, col, where } = require('sequelize');
const bcrypt = require('bcryptjs'); // Importar bcryptjs para criptografia de senhas

// Importar os modelos
const { Client, Sale, Payment, User, Product, SaleProduct } = require('../database'); 

// Importar os middlewares
const authMiddleware = require('../middleware/authMiddleware'); 
const authorizeRole = require('../middleware/authorizationMiddleware'); 

const router = express.Router();

// APLICA O MIDDLEWARE DE AUTENTICAÇÃO PARA TODAS AS ROTAS NESTE ARQUIVO
// Todas as rotas abaixo requerem um token JWT válido
router.use(authMiddleware); 

// --- ROTAS DO DASHBOARD ---
// Acesso: Admin, Gerente, Vendedor
router.get('/dashboard/stats', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);

        // Define a cláusula WHERE base para filtrar por userId se o usuário for 'vendedor'
        const baseWhereClause = (req.user.role === 'vendedor') ? { userId: req.user.id } : {};

        const totalClients = await Client.count({ where: baseWhereClause });
        
        const salesSumOptions = { where: baseWhereClause };
        const totalReceivable = (await Sale.sum('valorTotal', salesSumOptions) || 0) - (await Sale.sum('valorPago', salesSumOptions) || 0);
        
        const salesThisMonth = await Sale.sum('valorTotal', {
            where: { 
                ...baseWhereClause, // Inclui o filtro por userId para vendedores
                [Op.and]: [
                    where(fn('strftime', '%Y-%m', col('dataVenda')), currentMonth)
                ]
            }
        });

        const overdueSales = await Sale.sum('valorTotal', {
            where: {
                ...baseWhereClause, // Inclui o filtro por userId para vendedores
                status: 'Pendente',
                dataVencimento: { [Op.lt]: today }
            }
        });

        // Para vendas por mês, também filtrar por userId para vendedores
        const salesByMonth = await Sale.findAll({
            attributes: [
                [fn('strftime', '%Y-%m', col('dataVenda')), 'month'],
                [fn('sum', col('valorTotal')), 'total']
            ],
            where: baseWhereClause, // Filtra por userId para vendedores
            group: ['month'],
            order: [['month', 'DESC']],
            limit: 6
        });

        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const salesToday = await Sale.sum('valorTotal', {
            where: {
                ...baseWhereClause,
                dataVenda: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        }) || 0;

        const totalSalesCount = await Sale.count({ where: baseWhereClause }) || 1; // Evita divisão por zero
        const totalSalesSum = await Sale.sum('valorTotal', { where: baseWhereClause }) || 0;
        const averageTicket = totalSalesSum / totalSalesCount;


        res.json({
            totalClients: totalClients || 0,
            totalReceivable: totalReceivable || 0,
            salesThisMonth: salesThisMonth || 0,
            overdueSales: overdueSales || 0,
            salesByMonth: salesByMonth.reverse(),
            salesToday: salesToday, 
            averageTicket: averageTicket 
        });
    } catch (error) {
        console.error('❌ ERRO NO ENDPOINT DO DASHBOARD:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE CLIENTES ---
// Acesso: Admin, Gerente (todos os clientes); Vendedor (apenas seus próprios clientes)
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
    // Filtrar por vendedor se a role for 'vendedor'
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
        // Vendedor só pode ver seus próprios clientes
        // Gerente/Admin podem ver todos os clientes
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
        // Atribui o userId do usuário logado ao cliente se for vendedor ou não
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
        // Vendedor só pode editar seus próprios clientes
        // Gerente/Admin podem editar todos os clientes
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

// Acesso: Admin, Gerente (Deleção - mais restrito)
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
// Acesso: Admin, Gerente (todas as vendas); Vendedor (apenas suas próprias vendas)
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
        // Filtrar por vendedor se a role for 'vendedor'
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
        // Assume que a busca por nome do cliente é através de um join
        whereClause['$client.nome$'] = { [Op.like]: `%${q}%` };
    }
    // Filtrar por vendedor se a role for 'vendedor'
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
        // Vendedor só pode ver suas próprias vendas
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const sale = await Sale.findByPk(id, {
            where: whereClause, // Filtra por userId para vendedores
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

// Acesso: Admin, Gerente, Vendedor (Criação de Vendas)
router.post('/sales', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log('[API Route Log] POST /sales - Request Body:', JSON.stringify(req.body, null, 2));
    const { clientId, dataVenda, dataVencimento, products: saleProductsData, initialPayment } = req.body;

    // Garante que o userId do utilizador logado é atribuído à venda
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
            userId, // Atribui o userId do usuário logado
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

// Vendedor pode editar SUAS próprias vendas
router.put('/sales/:id', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    try {
        const id = req.params.id;
        let whereClause = { id };
        // Vendedor só pode editar suas próprias vendas
        if (req.user.role === 'vendedor') {
            whereClause.userId = req.user.id;
        }

        const [updated] = await Sale.update(req.body, { where: whereClause });
        if (updated) {
            const updatedSale = await Sale.findByPk(id); // Buscar a venda atualizada
            res.json(updatedSale);
        } else { res.status(404).json({ message: 'Venda não encontrada ou você não tem permissão para editá-la.' }); }
    } catch (error) { 
        console.error('❌ ERRO AO ATUALIZAR VENDA:', error);
        res.status(400).json({ message: error.message }); 
    }
});

// Acesso: Admin, Gerente (Deleção - mais restrito)
router.delete('/sales/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleProduct, as: 'saleProducts' }]
        });
        
        if (!sale) { return res.status(404).json({ message: 'Venda não encontrada' }); }

        // Acesso restrito: gerente só pode deletar as vendas que criou (apenas se for a sua própria)
        if (req.user.role === 'gerente' && sale.userId !== req.user.id) {
            return res.status(403).json({ message: 'Acesso proibido: Você não pode deletar esta venda.' });
        }

        let transaction;
        try {
            transaction = await Sale.sequelize.transaction();
            for (const item of sale.saleProducts) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    product.estoque += item.quantidade;
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

// Acesso: Admin, Gerente, Vendedor (Criação de Pagamentos)
router.post('/sales/:saleId/payments', authorizeRole(['admin', 'gerente', 'vendedor']), async (req, res) => {
    console.log('[API Route Log] POST /sales/:saleId/payments - Request Body:', JSON.stringify(req.body, null, 2));
    const { saleId } = req.params;
    const { valor, formaPagamento, parcelas, bandeiraCartao, bancoCrediario } = req.body;
    
    // Validar se a venda pertence ao vendedor antes de permitir o pagamento
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
// Acesso: Admin, Gerente, Vendedor (Leitura)
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
        console.error('❌ ERRO AO OBTER RANKING DE PRODUTOS:', error);
        res.status(500).json({ message: error.message || 'Erro ao buscar ranking de produtos.' });
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
        res.status(500).json({ message: error.message || 'Erro ao buscar ranking de clientes.' });
    }
});

// Rota para Ranking de Vendedores
// Acesso: Admin, Gerente (restrito)
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
        console.error('❌ ERRO AO OBTER RANKING DE VENDEDORES:', error);
        res.status(500).json({ message: error.message || 'Erro ao buscar ranking de vendedores.' });
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

// Acesso: Admin, Gerente (Criação/Edição de Produtos)
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

// Acesso: Admin, Gerente (Deleção - mais restrito)
router.delete('/products/:id', authorizeRole(['admin', 'gerente']), async (req, res) => {
    try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- NOVAS ROTAS DE GESTÃO DE UTILIZADORES (APENAS PARA ADMIN) ---
// Acesso: Admin
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
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'], // Não retornar a senha
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

// Acesso: Admin
router.get('/users/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'] // Não retornar a senha
        });
        if (user) res.json(user);
        else res.status(404).json({ message: 'Utilizador não encontrado' });
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR UTILIZADOR POR ID:', error);
        res.status(500).json({ message: error.message });
    }
});

// Acesso: Admin
router.post('/users', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para criar um novo utilizador.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a senha
        const user = await User.create({ username, email, password: hashedPassword, role });
        // Retorna o usuário sem a senha
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO CRIAR UTILIZADOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao criar utilizador.' });
    }
});

// Acesso: Admin
router.put('/users/:id', authorizeRole(['admin']), async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        // Atualiza apenas os campos fornecidos
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        // Se uma nova senha for fornecida, criptografa e atualiza
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        // Retorna o usuário atualizado sem a senha
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ ERRO AO ATUALIZAR UTILIZADOR:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nome de usuário ou email já em uso.' });
        }
        res.status(400).json({ message: error.message || 'Erro ao atualizar utilizador.' });
    }
});

// Acesso: Admin
router.delete('/users/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        // Impedir que o admin logado exclua sua própria conta
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

module.exports = router;
