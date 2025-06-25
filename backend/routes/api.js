// backend/routes/api.js
const express = require('express');
const { Op, fn, col, where } = require('sequelize');

// Importar os modelos que serão usados nestas rotas.
const { Client, Sale, Payment, User, Product, SaleProduct } = require('../database'); 

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
    // CORREÇÃO: String de log formatada corretamente
    console.log(`[API Route Log] ${new Date().toISOString()} - Export clients CSV route accessed.`);
    try {
        const clients = await Client.findAll({ order: [['nome', 'ASC']] });

        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Data de Cadastro'];
        
        const csvRows = clients.map(client => {
            const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    // CORREÇÃO: Interpolação de string correta
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
        // CORREÇÃO: String do nome do arquivo formatada corretamente
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
    // CORREÇÃO: Uso correto de template literal para o Op.like
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
    // CORREÇÃO: String de log formatada corretamente
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
                    // CORREÇÃO: Interpolação de string correta
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
        // CORREÇÃO: String do nome do arquivo formatada corretamente
        res.setHeader('Content-Disposition', `attachment; filename="vendas_gestor_pro_${new Date().toISOString().slice(0,10)}.csv"`);
        
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('❌ ERRO AO EXPORTAR VENDAS PARA CSV:', error);
        res.status(500).json({ message: 'Erro ao gerar o relatório de vendas CSV.' });
    }
});

// Rota para relatório de vendas por período
router.get('/sales/report-by-period', async (req, res) => {
    // CORREÇÃO: String de log formatada corretamente
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
    // CORREÇÃO: Uso correto de template literal para o Op.like
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

// Rota para obter detalhes de uma venda específica (ATUALIZADA para incluir produtos e detalhes de pagamento)
router.get('/sales/:id', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
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
        else res.status(404).json({ message: 'Venda não encontrada' });
    } catch (error) {
        console.error('❌ ERRO AO OBTER DETALHES DA VENDA:', error);
        res.status(500).json({ message: error.message });
    }
});

// Rota para criar uma nova venda (ATUALIZADA para aceitar produtos e pagamento inicial)
router.post('/sales', async (req, res) => {
    console.log('[API Route Log] POST /sales - Request Body:', JSON.stringify(req.body, null, 2));

    const { clientId, dataVenda, dataVencimento, products: saleProductsData, initialPayment } = req.body; // initialPayment agora é recebido

    if (!clientId || !saleProductsData || saleProductsData.length === 0) {
        return res.status(400).json({ message: 'Cliente e produtos da venda são obrigatórios.' });
    }

    let transaction;
    try {
        transaction = await Sale.sequelize.transaction(); // Inicia uma transação

        // 1. Calcular valorTotal da venda e verificar estoque
        let valorTotalCalculado = 0;
        for (const item of saleProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) {
                // CORREÇÃO: String formatada corretamente
                throw new Error(`Produto com ID ${item.productId} não encontrado.`);
            }
            if (product.estoque < item.quantidade) {
                // CORREÇÃO: String formatada corretamente
                throw new Error(`Estoque insuficiente para o produto: ${product.nome}. Disponível: ${product.estoque}, Solicitado: ${item.quantidade}`);
            }
            // Usa o precoUnitario enviado pelo frontend, ou o precoVenda atual do produto como fallback
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.precoVenda;
            valorTotalCalculado += precoUnitario * item.quantidade;
        }

        // 2. Criar a venda principal
        const sale = await Sale.create({
            clientId,
            dataVenda: dataVenda || new Date(),
            dataVencimento: dataVencimento || null,
            valorTotal: valorTotalCalculado,
            // NOVO: Usar o valor do initialPayment para valorPago se existir
            valorPago: (initialPayment && initialPayment.valor) ? parseFloat(initialPayment.valor) : 0, 
            status: (initialPayment && initialPayment.valor >= valorTotalCalculado) ? 'Paga' : 'Pendente' // Define status com base no pagamento inicial
        }, { transaction });

        // NOVO: Se houver pagamento inicial E um valor > 0, crie um registro em Payment
        if (initialPayment && parseFloat(initialPayment.valor) > 0) {
            await Payment.create({
                valor: parseFloat(initialPayment.valor),
                dataPagamento: new Date(), // Data do pagamento inicial (pode ser ajustada se vier do frontend)
                saleId: sale.id,
                formaPagamento: initialPayment.formaPagamento || 'Dinheiro',
                parcelas: initialPayment.parcelas || 1,
                bandeiraCartao: initialPayment.bandeiraCartao || null,
                bancoCrediario: initialPayment.bancoCrediario || null
            }, { transaction });
        }


        // 3. Adicionar os itens de produto à venda e atualizar estoque
        for (const item of saleProductsData) {
            const product = await Product.findByPk(item.productId, { transaction });
            const precoUnitario = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : product.precoVenda;

            await SaleProduct.create({
                saleId: sale.id,
                productId: item.productId,
                quantidade: item.quantidade,
                precoUnitario: precoUnitario
            }, { transaction });

            // Reduzir o estoque do produto
            product.estoque -= item.quantidade;
            await product.save({ transaction });
        }

        await transaction.commit(); // Confirma a transação

        res.status(201).json(sale);

    } catch (error) {
        if (transaction) await transaction.rollback(); // Desfaz a transação em caso de erro
        console.error('❌ ERRO AO CRIAR VENDA COM PRODUTOS:', error);
        res.status(400).json({ message: error.message || 'Erro ao criar venda.' });
    }
});


// Rota para atualizar uma venda existente (ainda não totalmente atualizada para produtos e pagamentos)
router.put('/sales/:id', async (req, res) => {
    // Para esta fase, o PUT de venda não atualiza itens de produto ou pagamentos.
    // Isso será uma funcionalidade mais avançada (Fase 9.2).
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

// Rota para deletar uma venda (ATUALIZADA para reverter estoque e deletar SaleProducts e Payments)
router.delete('/sales/:id', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleProduct, as: 'saleProducts' }]
        });

        if (!sale) {
            return res.status(404).json({ message: 'Venda não encontrada' });
        }

        let transaction;
        try {
            transaction = await Sale.sequelize.transaction();

            // Reverter estoque dos produtos associados
            for (const item of sale.saleProducts) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    product.estoque += item.quantidade;
                    await product.save({ transaction });
                }
            }

            // Deletar os Payments associados
            await Payment.destroy({ where: { saleId: sale.id }, transaction });
            // Deletar os SaleProducts associados
            await SaleProduct.destroy({ where: { saleId: sale.id }, transaction });

            // Deletar a venda
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

// --- ROTA DE PAGAMENTOS (ATUALIZADA para aceitar detalhes de pagamento) ---
router.post('/sales/:saleId/payments', async (req, res) => {
    console.log('[API Route Log] POST /sales/:saleId/payments - Request Body:', JSON.stringify(req.body, null, 2));

    const { saleId } = req.params;
    const { valor, formaPagamento, parcelas, bandeiraCartao, bancoCrediario } = req.body;

    if (!valor || valor <= 0) {
        return res.status(400).json({ message: 'Valor do pagamento inválido.' });
    }
    if (!formaPagamento) {
        return res.status(400).json({ message: 'Forma de pagamento é obrigatória.' });
    }
    if (['Cartão de Crédito', 'Crediário'].includes(formaPagamento) && (!parcelas || parcelas < 1)) {
        // CORREÇÃO: String formatada corretamente
        return res.status(400).json({ message: `Número de parcelas inválido para ${formaPagamento}.` });
    }

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

// ==========> NOVA ROTA <==========
// Rota para listar produtos com estoque baixo.
router.get('/products/low-stock', async (req, res) => {
    // No futuro, este valor pode vir de uma configuração do sistema.
    const LOW_STOCK_THRESHOLD = 10; 
    try {
        const products = await Product.findAll({
            where: {
                estoque: {
                    [Op.lte]: LOW_STOCK_THRESHOLD
                }
            },
            order: [['estoque', 'ASC']] // Ordena para mostrar os mais críticos primeiro
        });
        res.json(products);
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR PRODUTOS COM ESTOQUE BAIXO:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos com estoque baixo.' });
    }
});

router.get('/products', async (req, res) => {
    const { page = 1, limit = 10, q = '' } = req.query;
    const offset = (page - 1) * limit;
    // CORREÇÃO: Uso correto de template literal para o Op.like
    const whereClause = q ? { nome: { [Op.like]: `%${q}%` } } : {};
    try {
        const { count, rows } = await Product.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['nome', 'ASC']] });
        res.json({ total: count, data: rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) res.json(product);
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/products/:id', async (req, res) => {
    try {
        const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.json(updatedProduct);
        } else { res.status(404).json({ message: 'Produto não encontrado' }); }
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Produto não encontrado' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
