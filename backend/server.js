// backend/server.js
const express = require('express');
const cors = require('cors');

// Importe o objeto sequelize E as funções syncDatabase e seedData do database.js
const sequelize = require('./database'); // A instância do Sequelize para testConnection
const { syncDatabase, seedData } = require('./database'); // Importa as funções para usar aqui!

// Importe as rotas
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth'); // Importe authRoutes

const app = express();
const PORT = process.env.PORT || 5000; // Use a porta 5000 ou o que estiver definido no ambiente

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo da requisição
app.use(cors());         // Para permitir requisições do frontend

// NOVO: Log de todas as requisições que chegam ao servidor
app.use((req, res, next) => {
    // console.log(`[Server Log] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir arquivos estáticos do frontend
app.use(express.static('../frontend')); 

// Conecte as rotas
// A rota de autenticação DEVE VIR ANTES da rota de API protegida
app.use('/auth', authRoutes); // Rotas de autenticação (não protegidas por JWT para o login)
app.use('/api', apiRoutes);   // Rotas da API (AGORA PROTEGIDAS POR JWT via authMiddleware em api.js)

// Sincroniza o banco de dados e inicia o servidor
async function startServer() {
    try {
        // Chame a função de sincronização do banco de dados do database.js
        await syncDatabase();
        
        // Chame a função de seed de dados do database.js
        await seedData();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar o servidor:', error);
    }
}

// Inicia o servidor
startServer();