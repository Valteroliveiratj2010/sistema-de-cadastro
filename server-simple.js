// server-simple.js - Versão simplificada para evitar problemas de path-to-regexp
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente
require('dotenv').config();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DE CORS SIMPLIFICADA ---
app.use(cors({
    origin: true,
    credentials: true
}));

// --- DEBUGGING ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);
console.log(`[SERVER_DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[SERVER_DEBUG] PORT: ${process.env.PORT}`);

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS DO FRONTEND ---
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Servindo arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- ROTAS BÁSICAS SIMPLIFICADAS ---
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// --- ROTA DE HEALTH CHECK ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        message: 'Servidor funcionando corretamente'
    });
});

// --- ROTA DE TESTE SIMPLES ---
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Teste funcionando!',
        timestamp: new Date().toISOString()
    });
});

// --- ROTA DE FALLBACK ---
app.get('*', (req, res) => {
    console.log(`[404] Rota não encontrada: ${req.path}`);
    
    // Se for uma requisição para arquivo estático, retorna 404
    if (req.path.includes('.')) {
        return res.status(404).json({ 
            error: 'Not Found',
            path: req.path,
            message: 'Arquivo não encontrado'
        });
    }
    
    // Se for uma rota da aplicação, redireciona para o index
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Servidor Express SIMPLIFICADO rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
    console.log(`🧪 Teste: http://localhost:${port}/test`);
}); 