// backend/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Configura a conexão com o banco de dados SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database', 'dev.sqlite'), // Caminho para o arquivo do banco de dados
    logging: false // Opcional: define como false para não logar cada query SQL no console
});

// Importar as FUNÇÕES de definição dos modelos
const defineClient = require('./models/Client');
const defineSale = require('./models/Sale');
const definePayment = require('./models/Payment');
const defineUser = require('./models/User');
const defineProduct = require('./models/Product'); // NOVO: Importa a função de definição do modelo Produto

// Inicializar os modelos passando a instância 'sequelize'
const Client = defineClient(sequelize);
const Sale = defineSale(sequelize);
const Payment = definePayment(sequelize);
const User = defineUser(sequelize);
const Product = defineProduct(sequelize); // NOVO: Inicializa o modelo Produto

// Definir associações
// Isso deve ser feito APÓS TODOS os modelos serem definidos
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });

Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });

// Futura associação entre Sale e Product (será implementada depois)
// Sale.belongsToMany(Product, { through: 'SaleProducts', foreignKey: 'saleId', as: 'products' });
// Product.belongsToMany(Sale, { through: 'SaleProducts', foreignKey: 'productId', as: 'sales' });


// Função para sincronizar o banco de dados
async function syncDatabase() {
    try {
        await sequelize.authenticate(); // Testa a conexão antes de sincronizar
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
        
        // `force: true` recria as tabelas a cada inicialização (bom para desenvolvimento)
        // Em produção, use `alter: true` ou migrations
        await sequelize.sync({ force: true });
        console.log('✅ Tabelas do banco de dados sincronizadas.');
    } catch (error) {
        console.error('❌ Erro ao sincronizar o banco de dados:', error);
    }
}

// Função para inserir dados de teste (seed)
async function seedData() {
    try {
        // Verifica e cria o usuário admin de teste
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (!existingAdmin) {
            await User.create({
                username: 'admin',
                password: 'password123' // Esta senha será hashada automaticamente pelo hook no modelo User
            });
            console.log('✅ Usuário de teste "admin" criado.');
        }

        // Verifica se já existem dados para evitar duplicidade em execuções repetidas sem `force: true`
        const clientCount = await Client.count();
        if (clientCount === 0) {
            const client1 = await Client.create({ nome: 'Ana Silva', email: 'ana@teste.com', telefone: '11987654321' });
            const client2 = await Client.create({ nome: 'Bruno Costa', email: 'bruno@teste.com', telefone: '21998765432' });

            const sale1 = await Sale.create({
                valorTotal: 150.00,
                valorPago: 0,
                status: 'Pendente',
                dataVenda: new Date(),
                dataVencimento: new Date(new Date().setDate(new Date().getDate() + 30)), // Vence em 30 dias
                clientId: client1.id
            });
            await Payment.create({ valor: 50.00, dataPagamento: new Date(), saleId: sale1.id });
            sale1.valorPago = 50.00; // Atualiza o valorPago após o pagamento
            await sale1.save();

            const sale2 = await Sale.create({
                valorTotal: 200.00,
                valorPago: 200.00,
                status: 'Paga',
                dataVenda: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 dias atrás
                clientId: client2.id
            });
            await Payment.create({ valor: 200.00, dataPagamento: new Date(new Date().setDate(new Date().getDate() - 9)), saleId: sale2.id });

            // Mais alguns dados de exemplo para testar paginação e busca
            await Client.create({ nome: 'Carlos Eduardo', email: 'carlos@exemplo.com', telefone: '31987651234' });
            await Client.create({ nome: 'Daniela Pereira', email: 'dani@exemplo.com', telefone: '41991234567' });
            await Client.create({ nome: 'Eduardo Lima', email: 'edu@exemplo.com', telefone: '51988776655' });
            await Client.create({ nome: 'Fernanda Rocha', email: 'fer@exemplo.com', telefone: '61987659876' });
            await Client.create({ nome: 'Gustavo Santos', email: 'gus@exemplo.com', telefone: '71991122334' });
            await Client.create({ nome: 'Helena Costa', email: 'helena@exemplo.com', telefone: '81987650000' });
            await Client.create({ nome: 'Igor Souza', email: 'igor@teste.com', telefone: '7598804390' });
            await Client.create({ nome: 'João Pedro', email: 'joao@exemplo.com', telefone: '91987651111' });
            await Client.create({ nome: 'Karen Oliveira', email: 'karen@exemplo.com', telefone: '11999998888' });

            // NOVO: Adicionando alguns produtos de teste
            await Product.create({ nome: 'Produto A', descricao: 'Descrição do Produto A', precoVenda: 100.50, precoCusto: 50.00, estoque: 50, sku: 'PROD001' });
            await Product.create({ nome: 'Produto B', descricao: 'Descrição do Produto B', precoVenda: 25.00, precoCusto: 10.00, estoque: 120, sku: 'PROD002' });
            await Product.create({ nome: 'Serviço de Consultoria', descricao: 'Consultoria de 1 hora', precoVenda: 500.00, precoCusto: 50.00, estoque: 9999, sku: 'SERV001' });


            await Sale.create({ valorTotal: 50.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), clientId: client1.id });
            await Sale.create({ valorTotal: 300.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), clientId: client2.id });
            await Sale.create({ valorTotal: 120.00, valorPago: 120.00, status: 'Paga', dataVenda: new Date(new Date().setDate(new Date().getDate() - 5)), clientId: client1.id });
            await Sale.create({ valorTotal: 80.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), dataVencimento: new Date(new Date().setDate(new Date().getDate() - 5)), clientId: client2.id }); // Vencida
            
            console.log('✅ Dados de teste inseridos.');
        } else {
            console.log('ℹ️ Dados de teste já existem, pulando inserção.');
        }
    } catch (error) {
        console.error('❌ Erro ao inserir dados de teste:', error);
    }
}

// Exportar o objeto sequelize e as funções para serem usadas no server.js
module.exports = sequelize;
module.exports.syncDatabase = syncDatabase;
module.exports.seedData = seedData;
// Também é útil exportar os modelos para que outras partes do código (rotas, por exemplo) possam acessá-los
module.exports.Client = Client;
module.exports.Sale = Sale;
module.exports.Payment = Payment;
module.exports.User = User;
module.exports.Product = Product; // NOVO: Exporta o modelo Produto
