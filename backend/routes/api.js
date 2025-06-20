const express = require('express');
const { Op, fn, col, where } = require('sequelize');
const sequelize = require('../database.js');
const Client = require('../models/Client.js');
const Sale = require('../models/Sale.js');
const Payment = require('../models/Payment.js');

const router = express.Router();

// --- ROTA DO DASHBOARD ---
router.get('/dashboard/stats', async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7); // Formato 'YYYY-MM'

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
router.get('/clients', async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = q ? { nome: { [Op.like]: `%${q}%` } } : {};
    try {
        const { count, rows } = await Client.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['nome', 'ASC']] });
        res.json({ total: count, data: rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
});
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
        const deleted = await Sale.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Venda não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

module.exports = router;