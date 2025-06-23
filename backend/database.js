// backend/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Configura a conexão com o banco de dados SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database', 'dev.sqlite'),
    logging: false
});

// Importar as FUNÇÕES de definição dos modelos
const defineClient = require('./models/Client');
const defineSale = require('./models/Sale');
const definePayment = require('./models/Payment');
const defineUser = require('./models/User');
const defineProduct = require('./models/Product');
const defineSaleProduct = require('./models/SaleProduct');

// Inicializar os modelos passando a instância 'sequelize'
const Client = defineClient(sequelize);
const Sale = defineSale(sequelize);
const Payment = definePayment(sequelize);
const User = defineUser(sequelize);
const Product = defineProduct(sequelize);
const SaleProduct = defineSaleProduct(sequelize);

// Definir associações
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });

Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });

Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', as: 'products' });
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', as: 'sales' });

Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'saleProducts' });
SaleProduct.belongsTo(Sale, { foreignKey: 'saleId' });
Product.hasMany(SaleProduct, { foreignKey: 'productId', as: 'productSales' });
SaleProduct.belongsTo(Product, { foreignKey: 'productId' });


// Função para sincronizar o banco de dados
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
        
        await sequelize.sync({ force: true });
        console.log('✅ Tabelas do banco de dados sincronizadas.');
    } catch (error) {
        console.error('❌ Erro ao sincronizar o banco de dados:', error);
    }
}

// Função para inserir dados de teste (seed)
async function seedData() {
    try {
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (!existingAdmin) {
            await User.create({
                username: 'admin',
                password: 'password123'
            });
            console.log('✅ Usuário de teste "admin" criado.');
        }

        const clientCount = await Client.count();
        if (clientCount === 0) {
            const client1 = await Client.create({ nome: 'Ana Silva', email: 'ana@teste.com', telefone: '11987654321' });
            const client2 = await Client.create({ nome: 'Bruno Costa', email: 'bruno@teste.com', telefone: '21998765432' });

            const product1 = await Product.create({ nome: 'Produto A', descricao: 'Descrição do Produto A', precoVenda: 100.50, precoCusto: 50.00, estoque: 50, sku: 'PROD001' });
            const product2 = await Product.create({ nome: 'Produto B', descricao: 'Descrição do Produto B', precoVenda: 25.00, precoCusto: 10.00, estoque: 120, sku: 'PROD002' });
            const product3 = await Product.create({ nome: 'Serviço de Consultoria', descricao: 'Consultoria de 1 hora', precoVenda: 500.00, precoCusto: 50.00, estoque: 9999, sku: 'SERV001' });

            // Vendas sem produtos específicos (para manter compatibilidade com dados existentes)
            const sale1 = await Sale.create({
                valorTotal: 150.00,
                valorPago: 0,
                status: 'Pendente',
                dataVenda: new Date(),
                dataVencimento: new Date(new Date().setDate(new Date().getDate() + 30)),
                clientId: client1.id
            });
            // NOVO: Adicionado formaPagamento e parcelas ao payment
            await Payment.create({ valor: 50.00, dataPagamento: new Date(), saleId: sale1.id, formaPagamento: 'Dinheiro', parcelas: 1 });
            sale1.valorPago = 50.00;
            await sale1.save();

            const sale2 = await Sale.create({
                valorTotal: 200.00,
                valorPago: 200.00,
                status: 'Paga',
                dataVenda: new Date(new Date().setDate(new Date().getDate() - 10)),
                clientId: client2.id
            });
            // NOVO: Adicionado formaPagamento e parcelas ao payment
            await Payment.create({ valor: 200.00, dataPagamento: new Date(new Date().setDate(new Date().getDate() - 9)), saleId: sale2.id, formaPagamento: 'PIX', parcelas: 1 });

            // Criando uma venda com produtos associados via SaleProduct
            const saleWithProducts1 = await Sale.create({
                valorTotal: 0, // Será calculado abaixo
                valorPago: 0,
                status: 'Pendente',
                dataVenda: new Date(),
                clientId: client1.id
            });

            await SaleProduct.create({
                saleId: saleWithProducts1.id,
                productId: product1.id,
                quantidade: 2,
                precoUnitario: product1.precoVenda
            });
            await SaleProduct.create({
                saleId: saleWithProducts1.id,
                productId: product2.id,
                quantidade: 3,
                precoUnitario: product2.precoVenda
            });

            saleWithProducts1.valorTotal = (product1.precoVenda * 2) + (product2.precoVenda * 3);
            await saleWithProducts1.save();

            // NOVO: Adicionando um pagamento a saleWithProducts1 com cartão
            await Payment.create({
                valor: saleWithProducts1.valorTotal / 2, // Paga metade
                dataPagamento: new Date(),
                saleId: saleWithProducts1.id,
                formaPagamento: 'Cartão de Crédito',
                parcelas: 3,
                bandeiraCartao: 'Visa'
            });
            saleWithProducts1.valorPago += saleWithProducts1.valorTotal / 2;
            await saleWithProducts1.save();


            await Client.create({ nome: 'Carlos Eduardo', email: 'carlos@exemplo.com', telefone: '31987651234' });
            await Client.create({ nome: 'Daniela Pereira', email: 'dani@exemplo.com', telefone: '41991234567' });
            await Client.create({ nome: 'Eduardo Lima', email: 'edu@exemplo.com', telefone: '51988776655' });
            await Client.create({ nome: 'Fernanda Rocha', email: 'fer@exemplo.com', telefone: '61987659876' });
            await Client.create({ nome: 'Gustavo Santos', email: 'gus@exemplo.com', telefone: '71991122334' });
            await Client.create({ nome: 'Helena Costa', email: 'helena@exemplo.com', telefone: '81987650000' });
            await Client.create({ nome: 'Igor Souza', email: 'igor@teste.com', telefone: '7598804390' });
            await Client.create({ nome: 'João Pedro', email: 'joao@exemplo.com', telefone: '91987651111' });
            await Client.create({ nome: 'Karen Oliveira', email: 'karen@exemplo.com', telefone: '11999998888' });

            await Sale.create({ valorTotal: 50.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), clientId: client1.id });
            await Sale.create({ valorTotal: 300.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), clientId: client2.id });
            await Sale.create({ valorTotal: 120.00, valorPago: 120.00, status: 'Paga', dataVenda: new Date(new Date().setDate(new Date().getDate() - 5)), clientId: client1.id });
            await Sale.create({ valorTotal: 80.00, valorPago: 0, status: 'Pendente', dataVenda: new Date(), dataVencimento: new Date(new Date().setDate(new Date().getDate() - 5)), clientId: client2.id });
            
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
module.exports.Client = Client;
module.exports.Sale = Sale;
module.exports.Payment = Payment;
module.exports.User = User;
module.exports.Product = Product;
module.exports.SaleProduct = SaleProduct;
