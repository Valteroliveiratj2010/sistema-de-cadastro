// server-improved.js - Versão melhorada do servidor
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente - SEMPRE NO INÍCIO!
require('dotenv').config();

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

        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados com o banco de dados.');

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
            try {
                require('./backend/seeders/adminSeeder');
            } catch (seederError) {
                console.log('⚠️ Erro ao executar seeder:', seederError.message);
            }
        } else {
            console.log(`✅ Usuário admin encontrado: ${adminUser.username}`);
        }

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        console.log('⚠️ Continuando sem banco de dados...');
    }
}

// Inicializar banco de dados
initializeDatabase();

// --- ROTAS DA API COM TRATAMENTO DE ERRO MELHORADO ---
let apiRoutesLoaded = false;
try {
    const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
    console.log(`[SERVER_DEBUG] Tentando carregar rotas da API de: ${apiRoutesPath}`);
    
    // Verificar se o arquivo existe
    const fs = require('fs');
    if (!fs.existsSync(apiRoutesPath)) {
        throw new Error(`Arquivo de rotas não encontrado: ${apiRoutesPath}`);
    }
    
    const apiRoutes = require(apiRoutesPath);
    app.use('/api', apiRoutes);
    apiRoutesLoaded = true;
    console.log('✅ Rotas da API carregadas com sucesso');
} catch (error) {
    console.log('⚠️ Erro ao carregar rotas da API:', error.message);
    console.log('⚠️ Continuando sem API...');
    
    // Adicionar rota de fallback para API
    app.use('/api', (req, res) => {
        res.status(503).json({ 
            error: 'API Temporariamente Indisponível',
            message: 'As rotas da API não puderam ser carregadas',
            path: req.path
        });
    });
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

// --- ROTA DE HEALTH CHECK MELHORADA ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        database: sequelize ? 'connected' : 'not_available',
        api: apiRoutesLoaded ? 'loaded' : 'not_available'
    });
});

// --- ROTA DE TESTE ---
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        database: sequelize ? 'connected' : 'not_available',
        api: apiRoutesLoaded ? 'loaded' : 'not_available'
    });
});

// --- ROTA DE FALLBACK MELHORADA ---
app.get('*', (req, res) => {
    console.log(`[404] Rota não encontrada: ${req.path}`);
    
    // Se for uma requisição para API, retornar JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            error: 'API Endpoint Not Found',
            path: req.path,
            message: 'Endpoint da API não encontrado'
        });
    }
    
    // Para outras rotas, tentar servir arquivo estático ou retornar 404
    res.status(404).json({ 
        error: 'Not Found',
        path: req.path,
        message: 'Rota não encontrada'
    });
});

// --- TRATAMENTO DE ERROS GLOBAL ---
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', error);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Servidor Express melhorado rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
    console.log(`🔗 Teste: http://localhost:${port}/test`);
    console.log(`🔗 API Status: ${apiRoutesLoaded ? '✅ Carregada' : '❌ Não carregada'}`);
}); 