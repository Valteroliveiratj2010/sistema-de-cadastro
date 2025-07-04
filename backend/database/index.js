const { Sequelize, DataTypes } = require('sequelize');
const scrypt = require('scrypt-js'); // Scrypt principal

// Helper functions para Scrypt (agora usando Buffer para garantir consistência de bytes)
const encodeUTF8 = (str) => Buffer.from(str, 'utf8');
const toHex = (bytes) => Buffer.from(bytes).toString('hex');

// --- Desestruturação das variáveis de ambiente ---
const {
    DB_DIALECT = 'postgres', // Mantemos o padrão como 'postgres'
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    NODE_ENV // Adicionado para verificar o ambiente
} = process.env;

// --- Configuração condicional do SSL ---
// Se o NODE_ENV for 'production', ou se você decidir usar DATABASE_URL para conexão,
// então `ssl` será true e configurado. Caso contrário, será `false` (desabilitado).
// Para o seu .env atual, que não tem NODE_ENV=production, e usa DB_HOST/DB_PORT, etc.,
// o SSL será 'false' para a conexão local.
const sslConfig = NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false // Importante para produção na Render
} : false; // Desabilita SSL para desenvolvimento local

// --- Inicialização do Sequelize ---
// Usando as variáveis de ambiente separadas do seu .env
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT, // Usará 'postgres' do .env ou o padrão
    logging: false,
    dialectOptions: {
        ssl: sslConfig // Aplicamos a configuração condicional de SSL aqui
    }
});

// --- Definição de TODOS os Modelos AQUI EM CIMA ---

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role:     { type: DataTypes.ENUM('admin','gerente','vendedor'), allowNull: false, defaultValue: 'vendedor' }
}, {
    hooks: {
        beforeCreate: async (user) => { 
            console.log(`[HOOK] beforeCreate: Hashing senha para novo usuário ${user.username} com Scrypt...`);
            const N = 16384; // 2^14 (fator de custo)
            const r = 8;     // fator de block size
            const p = 1;     // fator de paralelismo
            const dkLen = 32; // Tamanho da chave derivada em bytes (32 bytes = 256 bits)
            const salt = Math.random().toString(36).substring(2, 18); // Gerar um salt aleatório (16 chars)
            
            const derivedKey = await scrypt.scrypt(
                encodeUTF8(user.password),
                encodeUTF8(salt),
                N, r, p, dkLen
            );
            user.password = `scrypt$${N}$${r}$${p}$${salt}$${toHex(derivedKey)}`;
            console.log(`[HOOK] beforeCreate: Senha hashed com Scrypt. Início do hash: ${user.password.substring(0, 30)}...`);
        },
        beforeUpdate: async (user) => { 
            if (user.changed('password')) {
                console.log(`[HOOK] beforeUpdate: Senha foi alterada para o usuário ${user.username}. Hashing nova senha com Scrypt...`);
                const N = 16384;
                const r = 8;
                const p = 1;
                const dkLen = 32;
                const salt = Math.random().toString(36).substring(2, 18); 

                const derivedKey = await scrypt.scrypt(
                    encodeUTF8(user.password), 
                    encodeUTF8(salt), 
                    N, r, p, dkLen
                );
                user.password = `scrypt$${N}$${r}$${p}$${salt}$${toHex(derivedKey)}`;
                console.log(`[HOOK] beforeUpdate: Nova senha hashed com Scrypt. Início do hash: ${user.password.substring(0, 30)}...`);
            } else {
                console.log(`[HOOK] beforeUpdate: Senha NÃO foi alterada para o usuário ${user.username}.`);
            }
        }
    },
    indexes: []
});

User.prototype.comparePassword = async function (plainPassword) {
    console.log(`\n[COMPARE-ULTIMATE-DEBUG] --- INÍCIO DA COMPARAÇÃO (SCRYPT) ---`);
    console.log(`[COMPARE-ULTIMATE-DEBUG] Usuário: ${this.username}`);
    
    const plain = String(plainPassword); 
    const storedHashFull = String(this.password); 

    console.log(`[COMPARE-ULTIMATE-DEBUG] Plain Password (Type: ${typeof plain}, Length: ${plain.length}): '${plain}'`);
    console.log(`[COMPARE-ULTIMATE-DEBUG] Char Codes (Plain): [${Array.from(plain).map(c => c.charCodeAt(0)).join(', ')}]`); 

    console.log(`[COMPARE-ULTIMATE-DEBUG] Stored Hash Full: '${storedHashFull.substring(0, 30)}...' (Length: ${storedHashFull.length})`);
    console.log(`[COMPARE-ULTIMATE-DEBUG] Char Codes (Stored Hash Início): [${Array.from(storedHashFull.substring(0, 20)).map(c => c.charCodeAt(0)).join(', ')}]`); 

    const parts = storedHashFull.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') {
        console.error('[COMPARE-ULTIMATE-DEBUG] ERRO: Formato de hash Scrypt inválido. Hash não começa com "scrypt$" ou tem partes insuficientes.');
        return false;
    }
    const N_stored = parseInt(parts[1]);
    const r_stored = parseInt(parts[2]);
    const p_stored = parseInt(parts[3]);
    const salt_stored = parts[4];
    const hashedKey_stored = parts[5];
    const dkLen_stored = 32; 

    console.log(`[COMPARE-ULTIMATE-DEBUG] Parâmetros Scrypt extraídos: N=${N_stored}, r=${r_stored}, p=${p_stored}, Salt='${salt_stored}'`);

    let isLoginValid = false;

    try {
        const derivedKey_plain = await scrypt.scrypt(
            encodeUTF8(plain), 
            encodeUTF8(salt_stored), 
            N_stored, r_stored, p_stored, dkLen_stored
        );
        const derivedKey_plain_hex = toHex(derivedKey_plain); 

        isLoginValid = (derivedKey_plain_hex === hashedKey_stored);

        console.log(`[COMPARE-ULTIMATE-DEBUG] Chave Derivada (Plain, Início): '${derivedKey_plain_hex.substring(0, 30)}...'`);
        console.log(`[COMPARE-ULTIMATE-DEBUG] Chave Armazenada (Início):     '${hashedKey_stored.substring(0, 30)}...'`);
        
    } catch (e) {
        console.error('[COMPARE-ULTIMATE-DEBUG] ERRO na re-derivação/comparação Scrypt:', e);
        isLoginValid = false;
    }

    console.log(`[COMPARE-ULTIMATE-DEBUG] Resultado FINAL de Comparação Scrypt: ${isLoginValid}`);
    console.log(`[COMPARE-ULTIMATE-DEBUG] --- FIM DA COMPARAÇÃO (SCRYPT) ---`);
    return isLoginValid;
};

const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome:     { type: DataTypes.STRING, allowNull: false },
    email:    { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    telefone: { type: DataTypes.STRING }
}, {
    indexes: [
        { fields: ['userId'] },
        { fields: ['nome'] }
    ]
});

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome:        { type: DataTypes.STRING, allowNull: false },
    descricao:   { type: DataTypes.TEXT },
    precoVenda:  { type: DataTypes.FLOAT, allowNull: false },
    precoCusto:  { type: DataTypes.FLOAT },
    estoque:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sku:         { type: DataTypes.STRING, unique: true }
}, {
    indexes: [
        { fields: ['nome'] },
        { fields: ['estoque'] }
    ]
});

const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    dataVenda:       { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dataVencimento: { type: DataTypes.DATEONLY },
    valorTotal:      { type: DataTypes.FLOAT, allowNull: false },
    valorPago:       { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status:          { type: DataTypes.ENUM('Paga','Pendente','Cancelada'), allowNull: false, defaultValue: 'Pendente' }
}, {
    indexes: [
        { fields: ['clientId'] },
        { fields: ['userId'] },
        { fields: ['dataVenda'] },
        { fields: ['dataVencimento'] },
        { fields: ['status'] }
    ]
});

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    valor:           { type: DataTypes.FLOAT, allowNull: false },
    dataPagamento:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    formaPagamento: { type: DataTypes.ENUM('Dinheiro','Cartão de Crédito','Crediário','PIX'), allowNull: false },
    parcelas:        { type: DataTypes.INTEGER, defaultValue: 1 },
    bandeiraCartao: { type: DataTypes.STRING },
    bancoCrediario: { type: DataTypes.STRING }
}, {
    indexes: [
        { fields: ['saleId'] },
        { fields: ['dataPagamento'] }
    ]
});

const SaleProduct = sequelize.define('SaleProduct', {
    quantidade:      { type: DataTypes.INTEGER, allowNull: false },
    precoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { 
    timestamps: false,
    indexes: [
        { fields: ['saleId'] },
        { fields: ['productId'] },
        { fields: ['quantidade'] }
    ]
});

const Supplier = sequelize.define('Supplier', {
    id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome:     { type: DataTypes.STRING, allowNull: false, unique: true },
    contato:  { type: DataTypes.STRING },
    email:    { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    cnpj:     { type: DataTypes.STRING, unique: true },
    endereco: { type: DataTypes.TEXT }
}, {
    indexes: [
        { fields: ['nome'] },
    ]
});

const Purchase = sequelize.define('Purchase', {
    id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    dataCompra:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    valorTotal:    { type: DataTypes.FLOAT, allowNull: false },
    status:        { type: DataTypes.ENUM('Concluída','Pendente','Cancelada'), allowNull: false, defaultValue: 'Concluída' },
    observacoes: { type: DataTypes.TEXT }
}, {
    indexes: [
        { fields: ['supplierId'] },
        { fields: ['userId'] },
        { fields: ['dataCompra'] },
        { fields: ['status'] }
    ]
});

const PurchaseProduct = sequelize.define('PurchaseProduct', {
    quantidade:         { type: DataTypes.INTEGER, allowNull: false },
    precoCustoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { 
    timestamps: false,
    indexes: [
        { fields: ['purchaseId'] },
        { fields: ['productId'] }
    ]
});

// --- Associações entre Modelos ---
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