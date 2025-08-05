// server.js (ESTE ARQUIVO ESTÁ NA RAIZ DO PROJETO)
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente - SEMPRE NO INÍCIO!
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DE CORS SIMPLIFICADA ---
app.use(cors({
    origin: true, // Permitir todas as origens em desenvolvimento
    credentials: true
}));

// --- DEBUGGING ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);
console.log(`[SERVER_DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[SERVER_DEBUG] PORT: ${process.env.PORT}`);

// --- INICIALIZAÇÃO DO BANCO DE DADOS ---
let db, sequelize;

try {
    db = require('./backend/database');
    sequelize = db.sequelize;
    console.log('[DATABASE] Módulo de banco carregado com sucesso');
} catch (error) {
    console.log('[DATABASE] Erro ao carregar banco de dados:', error.message);
    console.log('[DATABASE] Continuando sem banco de dados...');
}

// Função para inicializar o banco de dados
async function initializeDatabase() {
    if (!sequelize) {
        console.log('[DATABASE] Pulando inicialização - banco não disponível');
        return;
    }

    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

        // Verificar se as tabelas já existem antes de sincronizar
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'Users'
        `);
        
        if (tables.length === 0) {
            console.log('📋 Tabelas não existem. Executando sincronização...');
            await sequelize.sync({ force: false });
            console.log('✅ Modelos sincronizados com o banco de dados.');
        } else {
            console.log('✅ Tabelas já existem. Pulando sincronização.');
        }

        const { User } = db;
        const adminUser = await User.findOne({ 
            where: { 
                [db.Sequelize.Op.or]: [
                    { username: 'admin' },
                    { username: '19vsilva' }
                ]
            } 
        });
        
        if (!adminUser) {
            console.log('⚠️ Usuário admin não encontrado. Criando...');
            require('./backend/seeders/adminSeeder');
        } else {
            console.log(`✅ Usuário admin encontrado: ${adminUser.username}`);
        }

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        console.log('⚠️ Continuando sem banco de dados...');
    }
}

// Inicializar banco de dados
initializeDatabase().then(() => {
    // Iniciar atualização automática de status após inicializar o banco
    try {
        const { startAutomaticStatusUpdate } = require('./backend/utils/statusUpdater');
        startAutomaticStatusUpdate();
        console.log('✅ Sistema de atualização automática de status iniciado');
    } catch (error) {
        console.log('⚠️ Erro ao iniciar atualização automática de status:', error.message);
    }
});

// --- ROTAS DA API ---
try {
    const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
    console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
    const apiRoutes = require(apiRoutesPath);
    app.use('/api', apiRoutes);
    console.log('✅ Rotas da API carregadas com sucesso');
} catch (error) {
    console.log('⚠️ Erro ao carregar rotas da API:', error.message);
    console.log('⚠️ Continuando sem API...');
}

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS DO FRONTEND ---
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Servindo arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- ROTAS BÁSICAS ---
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// --- ROTAS DE TESTE ---
app.get('/teste-dados-venda', (req, res) => {
    res.sendFile(path.join(frontendPath, 'teste-dados-venda.html'));
});

// --- ROTA DE HEALTH CHECK ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        database: sequelize ? 'connected' : 'not_available'
    });
});

// --- ROTA DE FALLBACK ---
app.get('*', (req, res) => {
    console.log(`[404] Rota não encontrada: ${req.path}`);
    res.status(404).json({ 
        error: 'Not Found',
        path: req.path,
        message: 'Rota não encontrada'
    });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Servidor Express rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
});