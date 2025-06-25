// backend/database.js
const { Sequelize } = require('sequelize');
const path = require('path');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database', 'dev.sqlite'),
    logging: false
});

// Definir modelos
const defineClient = require('./models/Client');
const defineSale = require('./models/Sale');
const definePayment = require('./models/Payment');
const defineUser = require('./models/User');
const defineProduct = require('./models/Product');
const defineSaleProduct = require('./models/SaleProduct');

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

// Exporta
module.exports = {
    sequelize,
    syncDatabase: async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexão com o banco de dados estabelecida.');
            // Em dev, force: true ou false conforme necessidade
            await sequelize.sync({ force: false });
            console.log('✅ Tabelas sincronizadas.');
        } catch (error) {
            console.error('❌ Erro ao sincronizar banco:', error);
        }
    },
    seedData: async () => {
        // seu seed existente...
    },
    Client,
    Sale,
    Payment,
    User,
    Product,
    SaleProduct
};
