// server.js (ESTE ARQUIVO ESTÁ NA RAIZ DO PROJETO)
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente - SEMPRE NO INÍCIO!
// Essencial para que process.env esteja populado.
require('dotenv').config();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json()); // Para parsear requisições com corpo JSON
app.use(express.urlencoded({ extended: true })); // Para parsear requisições com corpo URL-encoded

// --- CONFIGURAÇÃO DE CORS ---
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir localhost para desenvolvimento
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            console.log(`[CORS] Permitindo origem local: ${origin}`);
            return callback(null, true);
        }
        
        // Permitir URLs do Railway em produção
        if (process.env.NODE_ENV === 'production' && /^https:\/\/sistema-de-cadastro.*\.up\.railway\.app$/.test(origin)) {
            console.log(`[CORS] Permitindo origem Railway: ${origin}`);
            return callback(null, true);
        }
        
        // Permitir URLs do Vercel em produção (mantido para compatibilidade)
        if (process.env.NODE_ENV === 'production' && /^https:\/\/sistema-de-cadastro.*\.vercel\.app$/.test(origin)) {
            console.log(`[CORS] Permitindo origem Vercel: ${origin}`);
            return callback(null, true);
        }
        
        console.log(`[CORS] Bloqueando origem: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- DEBUGGING (Para ajudar a rastrear o diretório de trabalho no deploy) ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);

// --- INICIALIZAÇÃO DO BANCO DE DADOS ---
const db = require('./backend/database');
const sequelize = db.sequelize;

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

    // Sincronizar modelos (criar tabelas se não existirem)
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados com o banco de dados.');

    // Verificar se existe usuário admin
    const { User } = db;
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      console.log('⚠️ Usuário admin não encontrado. Criando...');
      // Executar seeder de admin
      require('./backend/seeders/adminSeeder');
    } else {
      console.log('✅ Usuário admin já existe.');
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
}

// Inicializar banco de dados
initializeDatabase();

// --- ROTAS DA API ---
const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
const apiRoutes = require(apiRoutesPath);
app.use('/api', apiRoutes); // Todas as rotas definidas em api.js serão prefixadas com '/api'

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS DO FRONTEND ---
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Servindo arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- ROTA PARA A PÁGINA INICIAL ---
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- ROTA PARA LOGIN ---
app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Render irá fornecer process.env.PORT automaticamente em produção.
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor Express rodando na porta: ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});