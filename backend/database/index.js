const { Sequelize } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs'); // Correct import for bcryptjs

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'data', 'dev.sqlite'), // Correct path to the database file
    logging: false
});

// Definir modelos (caminhos relativos à pasta 'database', i.e., um nível acima para 'models')
const defineClient = require('../models/Client');
const defineSale = require('../models/Sale');
const definePayment = require('../models/Payment');
const defineUser = require('../models/User'); 
const defineProduct = require('../models/Product');
const defineSaleProduct = require('../models/SaleProduct');

// Inicializa
const Client = defineClient(sequelize);
const Sale = defineSale(sequelize);
const Payment = definePayment(sequelize);
const User = defineUser(sequelize); 
const Product = defineProduct(sequelize);
const SaleProduct = defineSaleProduct(sequelize);

// Associações
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });

Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });

Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', as: 'products' });
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', as: 'sales' });

// Associação direta de SaleProduct => Product para facilitar include:
SaleProduct.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(SaleProduct, { foreignKey: 'productId', as: 'saleProducts' });

SaleProduct.belongsTo(Sale, { foreignKey: 'saleId' });
Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'saleProducts' });

// NOVO: Associações entre Sale e User (já estava correto)
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 
User.hasMany(Sale, { foreignKey: 'userId', as: 'salesMade' }); 

// NOVO: Associação entre Client e User
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Um Cliente pertence a um Utilizador (o vendedor que o cadastrou)
User.hasMany(Client, { foreignKey: 'userId', as: 'clientsRegistered' }); // Um Utilizador pode ter muitos Clientes cadastrados por ele


// Exporta
module.exports = {
    sequelize,
    syncDatabase: async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexão com o banco de dados estabelecida.');
            // IMPORTANTE: Use force: true APENAS UMA VEZ para recriar o banco de dados com a nova coluna 'userId' no Client
            // Após a primeira execução bem-sucedida, mude de volta para force: false para evitar perda de dados.
            await sequelize.sync({ force: true }); 
            console.log('✅ Tabelas sincronizadas.');
        } catch (error) {
            console.error('❌ Erro ao sincronizar banco:', error);
        }
    },
    seedData: async () => {
        try {
            if (!User) {
                console.error('Modelo User não está definido. Verifique a importação e inicialização.');
                return;
            }

            // CRIAÇÃO DOS USUÁRIOS (Admin, Gerente, Vendedor)
            let adminUser = await User.findOne({ where: { username: 'admin' } });
            if (!adminUser) {
                adminUser = await User.create({ username: 'admin', password: 'guaguas00', role: 'admin' });
                console.log('✅ Usuário admin criado com sucesso.');
            } else {
                console.log('Usuário admin já existe na base de dados.');
            }

            let gerenteUser = await User.findOne({ where: { username: 'gerente1' } });
            if (!gerenteUser) {
                gerenteUser = await User.create({ username: 'gerente1', password: 'senha_gerente', role: 'gerente' });
                console.log('✅ Usuário gerente1 criado com sucesso.');
            } else {
                console.log('Usuário gerente1 já existe na base de dados.');
            }

            let vendedorUser = await User.findOne({ where: { username: 'vendedor1' } });
            if (!vendedorUser) {
                vendedorUser = await User.create({ username: 'vendedor1', password: 'senha_vendedor1', role: 'vendedor' });
                console.log('✅ Usuário vendedor1 criado com sucesso.');
            } else {
                console.log('Usuário vendedor1 já existe na base de dados.');
            }
            
            // Seed de Clientes de Exemplo - AGORA ASSOCIADOS AOS USUÁRIOS
            let client1 = await Client.findOne({ where: { nome: 'João Silva' } });
            if (!client1) {
                // ATRIBUI JOÃO SILVA ao VENDEDOR1
                client1 = await Client.create({ nome: 'João Silva', email: 'joao@example.com', telefone: '11987654321', userId: vendedorUser.id }); 
                console.log('✅ Cliente João Silva criado (por Vendedor1).');
            } else {
                console.log('Cliente João Silva já existe.');
            }

            let client2 = await Client.findOne({ where: { nome: 'Maria Santos' } });
            if (!client2) {
                // ATRIBUI MARIA SANTOS ao GERENTE1
                client2 = await Client.create({ nome: 'Maria Santos', email: 'maria@example.com', telefone: '21998765432', userId: gerenteUser.id }); 
                console.log('✅ Cliente Maria Santos criado (por Gerente1).');
            } else {
                console.log('Cliente Maria Santos já existe.');
            }

            // Seed de Produtos de Exemplo (não precisam de userId, pois não são criados por um usuário específico para este propósito)
            let productA = await Product.findOne({ where: { nome: 'Notebook XYZ' } });
            if (!productA) {
                productA = await Product.create({ nome: 'Notebook XYZ', descricao: 'Notebook de alta performance', precoVenda: 2500.00, estoque: 50 });
                console.log('✅ Produto Notebook XYZ criado.');
            } else {
                console.log('Produto Notebook XYZ já existe.');
            }

            let productB = await Product.findOne({ where: { nome: 'Smartphone GHT' } });
            if (!productB) {
                productB = await Product.create({ nome: 'Smartphone GHT', descricao: 'Smartphone com câmera avançada', precoVenda: 1500.00, estoque: 100 });
                console.log('✅ Produto Smartphone GHT criado.');
            } else {
                console.log('Produto Smartphone GHT já existe.');
            }
            
            let productC = await Product.findOne({ where: { nome: 'Mouse Óptico' } });
            if (!productC) {
                productC = await Product.create({ nome: 'Mouse Óptico', descricao: 'Mouse ergonômico', precoVenda: 50.00, estoque: 200 });
                console.log('✅ Produto Mouse Óptico criado.');
            } else {
                console.log('Produto Mouse Óptico já existe.');
            }

            // Seed de Vendas de Exemplo
            const salesCount = await Sale.count();
            if (salesCount === 0 && client1 && client2 && productA && productB && productC && adminUser && vendedorUser && gerenteUser) {
                console.log('Criando vendas de exemplo...');

                // Venda 1: João compra 2 Notebooks, 1 Smartphone (criada pelo Vendedor1)
                const sale1 = await Sale.create({
                    clientId: client1.id,
                    userId: vendedorUser.id, // Associar ao vendedor1
                    dataVenda: new Date(),
                    valorTotal: (productA.precoVenda * 2) + (productB.precoVenda * 1),
                    valorPago: (productA.precoVenda * 2) + (productB.precoVenda * 1), // Paga integralmente
                    status: 'Paga'
                });
                await SaleProduct.create({ saleId: sale1.id, productId: productA.id, quantidade: 2, precoUnitario: productA.precoVenda });
                await SaleProduct.create({ saleId: sale1.id, productId: productB.id, quantidade: 1, precoUnitario: productB.precoVenda });
                productA.estoque -= 2; await productA.save();
                productB.estoque -= 1; await productB.save();
                console.log('✅ Venda 1 criada (por Vendedor1).');

                // Venda 2: Maria compra 1 Notebook, 3 Smartphones, 5 Mouses (criada pelo Gerente1)
                const sale2 = await Sale.create({
                    clientId: client2.id,
                    userId: gerenteUser.id, // Associar ao gerente1
                    dataVenda: new Date(),
                    valorTotal: (productA.precoVenda * 1) + (productB.precoVenda * 3) + (productC.precoVenda * 5),
                    valorPago: 1000.00, // Parcialmente paga
                    status: 'Pendente',
                    dataVencimento: new Date(new Date().setDate(new Date().getDate() + 7)) // Vence em 7 dias
                });
                await SaleProduct.create({ saleId: sale2.id, productId: productA.id, quantidade: 1, precoUnitario: productA.precoVenda });
                await SaleProduct.create({ saleId: sale2.id, productId: productB.id, quantidade: 3, precoUnitario: productB.precoVenda });
                await SaleProduct.create({ saleId: sale2.id, productId: productC.id, quantidade: 5, precoUnitario: productC.precoVenda });
                productA.estoque -= 1; await productA.save();
                productB.estoque -= 3; await productB.save();
                productC.estoque -= 5; await productC.save();
                console.log('✅ Venda 2 criada (por Gerente1).');

                // Venda 3: João compra mais 2 Mouses (criada pelo Admin)
                const sale3 = await Sale.create({
                    clientId: client1.id,
                    userId: adminUser.id, // Associar ao admin
                    dataVenda: new Date(),
                    valorTotal: (productC.precoVenda * 2),
                    valorPago: (productC.precoVenda * 2),
                    status: 'Paga'
                });
                await SaleProduct.create({ saleId: sale3.id, productId: productC.id, quantidade: 2, precoUnitario: productC.precoVenda });
                productC.estoque -= 2; await productC.save();
                console.log('✅ Venda 3 criada (por Admin).');

            } else if (salesCount > 0) {
                console.log('Vendas de exemplo já existem. Pulando seed de vendas.');
            } else {
                console.log('Dados de cliente/produto/usuário necessários para criar vendas de exemplo não existem.');
            }

            console.log('✅ Processo de seed de dados concluído.');

        } catch (error) {
            console.error('❌ Erro ao semear dados:', error);
        }
    },
    Client,
    Sale,
    Payment,
    User,
    Product,
    SaleProduct
};
