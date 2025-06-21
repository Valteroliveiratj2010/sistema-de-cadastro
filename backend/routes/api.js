// backend/routes/api.js
const express = require('express');
const { Op, fn, col, where } = require('sequelize');

// Importar os modelos que serão usados nestas rotas.
const { Client, Sale, Payment, User, Product } = require('../database'); // NOVO: Importa o modelo Product

// Importe o middleware de autenticação
const authMiddleware = require('../middleware/authMiddleware'); 

const router = express.Router();

// APLICA O MIDDLEWARE PARA TODAS AS ROTAS NESTE ARQUIVO
router.use(authMiddleware); 

// --- ROTA DO DASHBOARD ---
router.get('/dashboard/stats', async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);

        const totalClients = await Client.count();
        const totalReceivable = (await Sale.sum('valorTotal') || 0) - (await Sale.sum('valorPago') || 0);
        
        const salesThisMonth = await Sale.sum('valorTotal', {
            where: where(fn('strftime', '%Y-%m', col('dataVenda')), currentMonth)
        });

        const overdueSales = await Sale.sum('valorTotal', {
            where: {
                status: 'Pendente',
                dataVencimento: { [Op.lt]: today }
            }
        });

        const salesByMonth = await Sale.findAll({
            attributes: [
                [fn('strftime', '%Y-%m', col('dataVenda')), 'month'],
                [fn('sum', col('valorTotal')), 'total']
            ],
            group: ['month'],
            order: [['month', 'DESC']],
            limit: 6
        });

        res.json({
            totalClients: totalClients || 0,
            totalReceivable: totalReceivable || 0,
            salesThisMonth: salesThisMonth || 0,
            overdueSales: overdueSales || 0,
            salesByMonth: salesByMonth.reverse()
        });
    } catch (error) {
        console.error('❌ ERRO NO ENDPOINT DO DASHBOARD:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- ROTAS DE CLIENTES ---

// Rota para exportar clientes para CSV
router.get('/clients/export-csv', async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Export clients CSV route accessed.`);
    try {
        const clients = await Client.findAll({ order: [['nome', 'ASC']] });

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

        const csvContent = [
            headers.join(';'),
            ...csvRows
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="clientes_gestor_pro_${new Date().toISOString().slice(0,10)}.csv"`);
        
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR CLIENTES PARA CSV:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de clientes CSV.' });
    }
});

// Rota para listar todos os clientes
router.get('/clients', async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = q ? { nome: { [Op.like]: `%${q}%` } } : {};
    try {
        const { count, rows } = await Client.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['nome', 'ASC']] });
        res.json({ total: count, data: rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Rota para obter cliente por ID
router.get('/clients/:id', async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client) res.json(client);
        else res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/clients', async (req, res) => {
    try {
        const client = await Client.create(req.body);
        res.status(201).json(client);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/clients/:id', async (req, res) => {
    try {
        const [updated] = await Client.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedClient = await Client.findByPk(req.params.id);
            res.json(updatedClient);
        } else { res.status(404).json({ message: 'Cliente não encontrado' }); }
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/clients/:id', async (req, res) => {
    try {
        const deleted = await Client.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});


// --- ROTAS DE VENDAS ---
// Rota para exportar vendas para CSV
router.get('/sales/export-csv', async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Export sales CSV route accessed.`);
    try {
        const sales = await Sale.findAll({
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

        const csvContent = [
            headers.join(';'),
            ...csvRows
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
        res.setHeader('Content-Disposition', `attachment; filename="vendas_gestor_pro_${new Date().toISOString().slice(0,10)}.csv"`);
        
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR VENDAS PARA CSV:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de vendas CSV.' });
    }
});

// Rota para relatório de vendas por período
router.get('/sales/report-by-period', async (req, res) => {
    console.log(`[API Route Log] ${new Date().toISOString()} - Sales report by period route accessed.`);
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

        const sales = await Sale.findAll({
            where: {
                dataVenda: {
                    [Op.between]: [startDate, endDate]
                }
            },
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


router.get('/sales', async (req, res) => {
    const { page = 1, limit = 5, q = '' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = q ? { '$client.nome$': { [Op.like]: `%${q}%` } } : {};
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
        res.status(500).json({ message: error.message });
    }
});

router.get('/sales/:id', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Payment, as: 'payments', order: [['dataPagamento', 'DESC']] }
            ]
        });
        if (sale) res.json(sale);
        else res.status(404).json({ message: 'Venda não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/sales', async (req, res) => {
    try {
        const sale = await Sale.create(req.body);
        res.status(201).json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/sales/:id', async (req, res) => {
    try {
        const [updated] = await Sale.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedSale = await Sale.findByPk(req.params.id);
            res.json(updatedSale);
        } else {
            res.status(404).json({ message: 'Venda não encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/sales/:id', async (req, res) => {
    try {
        const deleted = await Sale.destroy({ where: { id: req.params.id } }); // Corrected to Sale.destroy
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Venda não encontrada' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- ROTA DE PAGAMENTOS ---
router.post('/sales/:saleId/payments', async (req, res) => {
    try {
        const { saleId } = req.params;
        const { valor } = req.body;

        const sale = await Sale.findByPk(saleId);
        if (!sale) return res.status(404).json({ message: 'Venda não encontrada' });

        await Payment.create({ valor: parseFloat(valor), saleId: sale.id });
        const totalPaid = await Payment.sum('valor', { where: { saleId: sale.id } });
        sale.valorPago = totalPaid;
        
        if (sale.valorPago >= sale.valorTotal) {
            sale.status = 'Paga';
        } else {
            sale.status = 'Pendente';
        }
        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- ROTAS DE PRODUTOS ---
// Rota para listar todos os produtos
router.get('/products', async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = q ? { nome: { [Op.like]: `%${q}%` } } : {};
    try {
        const { count, rows } = await Product.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['nome', 'ASC']] });
        res.json({ total: count, data: rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Rota para obter produto por ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) res.json(product);
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Rota para criar um novo produto
router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// Rota para atualizar um produto existente
router.put('/products/:id', async (req, res) => {
    try {
        const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.json(updatedProduct);
        } else { res.status(404).json({ message: 'Produto não encontrado' }); }
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// Rota para deletar um produto
router.delete('/products/:id', async (req, res) => {
    try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
