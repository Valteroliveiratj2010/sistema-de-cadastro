const { Sequelize } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'data', 'dev.sqlite'),
    logging: false
});

// Definir modelos
const defineClient = require('../models/Client');
const defineSale = require('../models/Sale');
const definePayment = require('../models/Payment');
const defineUser = require('../models/User'); 
const defineProduct = require('../models/Product');
const defineSaleProduct = require('../models/SaleProduct');
const defineSupplier = require('../models/Supplier');
const definePurchase = require('../models/Purchase'); // NOVO: Importar modelo Purchase
const definePurchaseProduct = require('../models/PurchaseProduct'); // NOVO: Importar modelo PurchaseProduct

// Inicializa
const Client = defineClient(sequelize);
const Sale = defineSale(sequelize);
const Payment = definePayment(sequelize);
const User = defineUser(sequelize); 
const Product = defineProduct(sequelize);
const SaleProduct = defineSaleProduct(sequelize);
const Supplier = defineSupplier(sequelize);
const Purchase = definePurchase(sequelize); // NOVO: Inicializar modelo Purchase
const PurchaseProduct = definePurchaseProduct(sequelize); // NOVO: Inicializar modelo PurchaseProduct

// Associações
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });

Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });

Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', as: 'products' });
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', as: 'sales' });

SaleProduct.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(SaleProduct, { foreignKey: 'productId', as: 'saleProducts' });

SaleProduct.belongsTo(Sale, { foreignKey: 'saleId' });
Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'saleProducts' });

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 
User.hasMany(Sale, { foreignKey: 'userId', as: 'salesMade' }); 

Client.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 
User.hasMany(Client, { foreignKey: 'userId', as: 'clientsRegistered' }); 

// NOVO: Associações para Compras
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' }); // Compra pertence a um Fornecedor
Supplier.hasMany(Purchase, { foreignKey: 'supplierId', as: 'purchases' }); // Fornecedor tem muitas Compras

Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Compra pertence a um Usuário (quem registrou)
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchasesMade' }); // Usuário pode ter muitas Compras registradas

Purchase.belongsToMany(Product, { through: PurchaseProduct, foreignKey: 'purchaseId', as: 'products' }); // Compra tem muitos Produtos
Product.belongsToMany(Purchase, { through: PurchaseProduct, foreignKey: 'productId', as: 'purchases' }); // Produto está em muitas Compras

// Associação direta de PurchaseProduct => Product para facilitar include:
PurchaseProduct.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseProduct, { foreignKey: 'productId', as: 'purchaseProducts' });

PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchaseId' });
Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchaseId', as: 'purchaseProducts' });


// Exporta
module.exports = {
    sequelize,
    syncDatabase: async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexão com o banco de dados estabelecida.');
            // IMPORTANTE: Mantenha force: true ATÉ as novas tabelas (purchases, purchase_products) serem criadas.
            // Após, mude para force: false para evitar perda de dados.
            await sequelize.sync({ force: true }); 
            console.log('✅ Tabelas sincronizadas.');
        } catch (error) {
            console.error('❌ Erro ao sincronizar banco:', error);
        }
    },
    seedData: async () => {
        try {
            if (!User || !Supplier || !Product || !Client) { // NOVO: Incluir todos os modelos importantes na verificação
                console.error('Um ou mais modelos essenciais não estão definidos. Verifique a importação e inicialização.');
                return;
            }

            // CRIAÇÃO DOS USUÁRIOS (Admin, Gerente, Vendedor)
            let adminUser = await User.findOne({ where: { username: 'admin' } });
            if (!adminUser) {
                adminUser = await User.create({ username: 'admin', email: 'admin@gestorpro.com', password: 'guaguas00', role: 'admin' });
                console.log('✅ Usuário admin criado com sucesso.');
            } else {
                console.log('Usuário admin já existe na base de dados.');
            }

            let gerenteUser = await User.findOne({ where: { username: 'gerente1' } });
            if (!gerenteUser) {
                gerenteUser = await User.create({ username: 'gerente1', email: 'gerente1@gestorpro.com', password: 'senha_gerente', role: 'gerente' });
                console.log('✅ Usuário gerente1 criado com sucesso.');
            } else {
                console.log('Usuário gerente1 já existe na base de dados.');
            }

            let vendedorUser = await User.findOne({ where: { username: 'vendedor1' } });
            if (!vendedorUser) {
                vendedorUser = await User.create({ username: 'vendedor1', email: 'vendedor1@gestorpro.com', password: 'senha_vendedor1', role: 'vendedor' });
                console.log('✅ Usuário vendedor1 criado com sucesso.');
            } else {
                console.log('Usuário vendedor1 já existe na base de dados.');
            }
            
            // Seed de Clientes de Exemplo
            let client1 = await Client.findOne({ where: { nome: 'João Silva' } });
            if (!client1) {
                client1 = await Client.create({ nome: 'João Silva', email: 'joao@example.com', telefone: '11987654321', userId: vendedorUser.id }); 
                console.log('✅ Cliente João Silva criado (por Vendedor1).');
            } else {
                console.log('Cliente João Silva já existe.');
            }

            let client2 = await Client.findOne({ where: { nome: 'Maria Santos' } });
            if (!client2) {
                client2 = await Client.create({ nome: 'Maria Santos', email: 'maria@example.com', telefone: '21998765432', userId: gerenteUser.id }); 
                console.log('✅ Cliente Maria Santos criado (por Gerente1).');
            } else {
                console.log('Cliente Maria Santos já existe.');
            }

            // Seed de Produtos de Exemplo
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

            // Seed de Fornecedores de Exemplo
            let supplier1 = await Supplier.findOne({ where: { nome: 'Tech Distribuidora' } });
            if (!supplier1) {
                supplier1 = await Supplier.create({ nome: 'Tech Distribuidora', contato: 'Carlos Silva', email: 'contato@techdist.com', cnpj: '11.111.111/0001-11', endereco: 'Rua Digital, 100' });
                console.log('✅ Fornecedor Tech Distribuidora criado.');
            } else {
                console.log('Fornecedor Tech Distribuidora já existe.');
            }

            let supplier2 = await Supplier.findOne({ where: { nome: 'Eletrônicos Giga' } });
            if (!supplier2) {
                supplier2 = await Supplier.create({ nome: 'Eletrônicos Giga', contato: 'Ana Paula', email: 'vendas@eletronicosgiga.com', cnpj: '22.222.222/0001-22', endereco: 'Av. Componente, 200' });
                console.log('✅ Fornecedor Eletrônicos Giga criado.');
            } else {
                console.log('Fornecedor Eletrônicos Giga já existe.');
            }

            // NOVO: Seed de Compras de Exemplo
            const purchasesCount = await Purchase.count();
            if (purchasesCount === 0 && supplier1 && supplier2 && productA && productB && adminUser && gerenteUser) {
                console.log('Criando compras de exemplo...');

                // Compra 1: Admin compra Notebooks e Smartphones da Tech Distribuidora
                const purchase1 = await Purchase.create({
                    supplierId: supplier1.id,
                    userId: adminUser.id,
                    dataCompra: new Date(),
                    valorTotal: (productA.precoVenda * 10 * 0.8) + (productB.precoVenda * 20 * 0.8), // Exemplo de 20% de desconto no custo
                    status: 'Concluída',
                    observacoes: 'Compra de estoque regular'
                });
                await PurchaseProduct.create({ purchaseId: purchase1.id, productId: productA.id, quantidade: 10, precoCustoUnitario: productA.precoVenda * 0.8 });
                await PurchaseProduct.create({ purchaseId: purchase1.id, productId: productB.id, quantidade: 20, precoCustoUnitario: productB.precoVenda * 0.8 });
                // Atualizar estoque dos produtos
                productA.estoque += 10; await productA.save();
                productB.estoque += 20; await productB.save();
                console.log('✅ Compra 1 criada (por Admin).');

                // Compra 2: Gerente compra Mouses da Eletrônicos Giga
                const purchase2 = await Purchase.create({
                    supplierId: supplier2.id,
                    userId: gerenteUser.id,
                    dataCompra: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 dias atrás
                    valorTotal: (productC.precoVenda * 50 * 0.7), // Exemplo de 30% de desconto no custo
                    status: 'Concluída',
                    observacoes: 'Promoção de fim de mês'
                });
                await PurchaseProduct.create({ purchaseId: purchase2.id, productId: productC.id, quantidade: 50, precoCustoUnitario: productC.precoVenda * 0.7 });
                // Atualizar estoque do produto
                productC.estoque += 50; await productC.save();
                console.log('✅ Compra 2 criada (por Gerente).');

            } else if (purchasesCount > 0) {
                console.log('Compras de exemplo já existem. Pulando seed de compras.');
            } else {
                console.log('Dados de fornecedor/produto/usuário necessários para criar compras de exemplo não existem.');
            }


            // Seed de Vendas de Exemplo
            const salesCount = await Sale.count();
            if (salesCount === 0 && client1 && client2 && productA && productB && productC && adminUser && vendedorUser && gerenteUser) {
                console.log('Criando vendas de exemplo...');

                const sale1 = await Sale.create({
                    clientId: client1.id,
                    userId: vendedorUser.id,
                    dataVenda: new Date(),
                    valorTotal: (productA.precoVenda * 2) + (productB.precoVenda * 1),
                    valorPago: (productA.precoVenda * 2) + (productB.precoVenda * 1),
                    status: 'Paga'
                });
                await SaleProduct.create({ saleId: sale1.id, productId: productA.id, quantidade: 2, precoUnitario: productA.precoVenda });
                await SaleProduct.create({ saleId: sale1.id, productId: productB.id, quantidade: 1, precoUnitario: productB.precoVenda });
                productA.estoque -= 2; await productA.save();
                productB.estoque -= 1; await productB.save();
                console.log('✅ Venda 1 criada (por Vendedor1).');

                const sale2 = await Sale.create({
                    clientId: client2.id,
                    userId: gerenteUser.id,
                    dataVenda: new Date(),
                    valorTotal: (productA.precoVenda * 1) + (productB.precoVenda * 3) + (productC.precoVenda * 5),
                    valorPago: 1000.00,
                    status: 'Pendente',
                    dataVencimento: new Date(new Date().setDate(new Date().getDate() + 7))
                });
                await SaleProduct.create({ saleId: sale2.id, productId: productA.id, quantidade: 1, precoUnitario: productA.precoVenda });
                await SaleProduct.create({ saleId: sale2.id, productId: productB.id, quantidade: 3, precoUnitario: productB.precoVenda });
                await SaleProduct.create({ saleId: sale2.id, productId: productC.id, quantidade: 5, precoUnitario: productC.precoVenda });
                productA.estoque -= 1; await productA.save();
                productB.estoque -= 3; await productB.save();
                productC.estoque -= 5; await productC.save();
                console.log('✅ Venda 2 criada (por Gerente1).');

                const sale3 = await Sale.create({
                    clientId: client1.id,
                    userId: adminUser.id,
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
    SaleProduct,
    Supplier, // NOVO: Exportar modelo Supplier
    Purchase, // NOVO: Exportar modelo Purchase
    PurchaseProduct // NOVO: Exportar modelo PurchaseProduct
};
