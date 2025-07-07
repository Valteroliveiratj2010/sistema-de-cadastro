// backend/database/index.js
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); // Usaremos apenas o bcrypt agora

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// --- Inicialização do Sequelize ---
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging || false,
    dialectOptions: config.dialectOptions || {}
  }
);

// --- Definição de TODOS os Modelos AQUI EM CIMA ---

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'gerente', 'vendedor'), allowNull: false, defaultValue: 'vendedor' }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
  telefone: { type: DataTypes.STRING }
});

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT },
  precoVenda: { type: DataTypes.FLOAT, allowNull: false },
  precoCusto: { type: DataTypes.FLOAT },
  estoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  sku: { type: DataTypes.STRING, unique: true }
});

const Sale = sequelize.define('Sale', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dataVenda: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  dataVencimento: { type: DataTypes.DATEONLY },
  valorTotal: { type: DataTypes.FLOAT, allowNull: false },
  valorPago: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('Paga', 'Pendente', 'Cancelada'), allowNull: false, defaultValue: 'Pendente' }
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  dataPagamento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  formaPagamento: { type: DataTypes.ENUM('Dinheiro', 'Cartão de Crédito', 'Crediário', 'PIX'), allowNull: false },
  parcelas: { type: DataTypes.INTEGER, defaultValue: 1 },
  bandeiraCartao: { type: DataTypes.STRING },
  bancoCrediario: { type: DataTypes.STRING }
});

const SaleProduct = sequelize.define('SaleProduct', {
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  precoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { timestamps: false });

const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  contato: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
  cnpj: { type: DataTypes.STRING, unique: true },
  endereco: { type: DataTypes.TEXT }
});

const Purchase = sequelize.define('Purchase', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dataCompra: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  valorTotal: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('Concluída', 'Pendente', 'Cancelada'), allowNull: false, defaultValue: 'Concluída' },
  observacoes: { type: DataTypes.TEXT }
});

const PurchaseProduct = sequelize.define('PurchaseProduct', {
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  precoCustoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { timestamps: false });

// --- Associações ---
User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });
Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', as: 'products' });
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', as: 'sales' });

Sale.hasMany(SaleProduct, { foreignKey: 'saleId', as: 'saleProducts' });
SaleProduct.belongsTo(Sale, { foreignKey: 'saleId' });
Product.hasMany(SaleProduct, { foreignKey: 'productId' });
SaleProduct.belongsTo(Product, { foreignKey: 'productId' });

Supplier.hasMany(Purchase, { foreignKey: 'supplierId', as: 'purchases' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Purchase.belongsToMany(Product, { through: PurchaseProduct, foreignKey: 'purchaseId', as: 'products' });
Product.belongsToMany(Purchase, { through: PurchaseProduct, foreignKey: 'productId', as: 'purchases' });

Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchaseId', as: 'purchaseProducts' });
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchaseId' });
Product.hasMany(PurchaseProduct, { foreignKey: 'productId' });
PurchaseProduct.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  User,
  Client,
  Product,
  Sale,
  Payment,
  SaleProduct,
  Supplier,
  Purchase,
  PurchaseProduct
};
