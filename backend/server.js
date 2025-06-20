const express = require('express');
const cors = require('cors');
const sequelize = require('./database.js'); // Importa a instância do Sequelize
const apiRoutes = require('./routes/api.js');

// Importa todos os modelos no início
const Client = require('./models/Client.js');
const Sale = require('./models/Sale.js');
const Payment = require('./models/Payment.js');


const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static('../frontend')); 

// Rotas da API
app.use('/api', apiRoutes);

// Sincroniza o banco de dados e inicia o servidor
async function startServer() {
    try {
        // Agora a variável 'sequelize' é reconhecida aqui
        await sequelize.sync({ force: true });
        console.log('🗃️ Tabelas do banco de dados sincronizadas.');

        // Criando dados de teste
        const client1 = await Client.create({ nome: 'Ana Silva', email: 'ana@teste.com', telefone: '1199998888' });
        const client2 = await Client.create({ nome: 'Bruno Costa', email: 'bruno@teste.com', telefone: '2198887777' });
        
        const sale1 = await Sale.create({ valorTotal: 150, clientId: client1.id, dataVencimento: '2025-07-20' });
        await Payment.create({ valor: 50, saleId: sale1.id });
        await sale1.update({ valorPago: 50 }); // Atualiza o total pago na venda

        const sale2 = await Sale.create({ valorTotal: 300, valorPago: 300, status: 'Paga', clientId: client2.id });
        await Payment.create({ valor: 300, saleId: sale2.id });

        console.log('📝 Dados de teste inseridos.');


        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
    }
}

startServer();