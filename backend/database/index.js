const { Sequelize, DataTypes } = require('sequelize');
const scrypt = require('scrypt-js'); // Scrypt principal
// const { TextEncoder } = require('util'); // <-- NÃO PRECISA MAIS DO TEXTENCODER AQUI

// Helper functions para Scrypt (agora usando Buffer para garantir consistência de bytes)
const encodeUTF8 = (str) => Buffer.from(str, 'utf8'); // <-- MUDANÇA AQUI: USANDO BUFFER.FROM
const toHex = (bytes) => Buffer.from(bytes).toString('hex');

const {
    DB_DIALECT = 'mysql',
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    logging: false
});

// --- Definição dos Modelos ---

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
                encodeUTF8(user.password), // Usando Buffer.from
                encodeUTF8(salt),          // Usando Buffer.from
                N, r, p, dkLen
            );
            user.password = `scrypt$${N}$${r}$${p}$${salt}$${toHex(derivedKey)}`; // Formato customizado
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
    indexes: [
        // unique: true já cria índices para username e email
    ]
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

    // Extrair parâmetros (N, r, p, salt, hashedKey) do hash armazenado
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
        // Re-derivar a chave com a senha plain e os parâmetros do hash armazenado
        const derivedKey_plain = await scrypt.scrypt(
            encodeUTF8(plain),           // Usando Buffer.from
            encodeUTF8(salt_stored),     // Usando Buffer.from
            N_stored, r_stored, p_stored, dkLen_stored
        );
        const derivedKey_plain_hex = toHex(derivedKey_plain); 

        // Comparar a chave derivada da senha plain com a chave armazenada
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
        { fields: ['userId'] }, // Índice para chave estrangeira userId
        { fields: ['nome'] }    // Índice para buscas por nome
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
        // unique: true já cria índice para sku
        { fields: ['nome'] },    // Índice para buscas por nome
        { fields: ['estoque'] }  // Índice para queries de estoque baixo
    ]
});

const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    dataVenda:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dataVencimento: { type: DataTypes.DATEONLY },
    valorTotal:     { type: DataTypes.FLOAT, allowNull: false },
    valorPago:      { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status:         { type: DataTypes.ENUM('Paga','Pendente','Cancelada'), allowNull: false, defaultValue: 'Pendente' }
}, {
    indexes: [
        { fields: ['clientId'] },       // Índice para chave estrangeira clientId
        { fields: ['userId'] },         // Índice para chave estrangeira userId
        { fields: ['dataVenda'] },      // Índice para buscas por data e ordenação
        { fields: ['dataVencimento'] }, // Índice para buscas de vencimentos
        { fields: ['status'] }          // Índice para buscas por status (Pendente, Paga, etc.)
    ]
});

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    valor:          { type: DataTypes.FLOAT, allowNull: false },
    dataPagamento:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    formaPagamento: { type: DataTypes.ENUM('Dinheiro','Cartão de Crédito','Crediário','PIX'), allowNull: false },
    parcelas:       { type: DataTypes.INTEGER, defaultValue: 1 },
    bandeiraCartao: { type: DataTypes.STRING },
    bancoCrediario: { type: DataTypes.STRING }
}, {
    indexes: [
        { fields: ['saleId'] },         // Índice para chave estrangeira saleId
        { fields: ['dataPagamento'] }   // Índice para buscas por data de pagamento (fluxo de caixa)
    ]
});

const SaleProduct = sequelize.define('SaleProduct', {
    quantidade:    { type: DataTypes.INTEGER, allowNull: false },
    precoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { 
    timestamps: false,
    indexes: [
        { fields: ['saleId'] },    // Índice para chave estrangeira saleId
        { fields: ['productId'] }, // Índice para chave estrangeira productId
        { fields: ['quantidade'] } // Índice para rankings de produtos (group by quantidade)
    ]
});

const Supplier = sequelize.define('Supplier', {
    id:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome:    { type: DataTypes.STRING, allowNull: false, unique: true },
    contato: { type: DataTypes.STRING },
    email:   { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    cnpj:    { type: DataTypes.STRING, unique: true },
    endereco:{ type: DataTypes.TEXT }
}, {
    indexes: [
        { fields: ['nome'] },    // Índice para buscas por nome
    ]
});

const Purchase = sequelize.define('Purchase', {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    dataCompra:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    valorTotal:  { type: DataTypes.FLOAT, allowNull: false },
    status:      { type: DataTypes.ENUM('Concluída','Pendente','Cancelada'), allowNull: false, defaultValue: 'Concluída' },
    observacoes: { type: DataTypes.TEXT }
}, {
    indexes: [
        { fields: ['supplierId'] }, // Índice para chave estrangeira supplierId
        { fields: ['userId'] },     // Índice para chave estrangeira userId
        { fields: ['dataCompra'] }, // Índice para buscas por data e ordenação
        { fields: ['status'] }      // Índice para buscas por status
    ]
});

const PurchaseProduct = sequelize.define('PurchaseProduct', {
    quantidade:         { type: DataTypes.INTEGER, allowNull: false },
    precoCustoUnitario: { type: DataTypes.FLOAT, allowNull: false }
}, { 
    timestamps: false,
    indexes: [
        { fields: ['purchaseId'] },  // Índice para chave estrangeira purchaseId
        { fields: ['productId'] }    // Índice para chave estrangeira productId
    ]
});

// --- Associações entre Modelos (mantidas as mesmas, sem alterações nesta seção) ---
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