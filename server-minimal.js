// server-minimal.js - Servidor minimalista para garantir funcionamento
const express = require('express');
const path = require('path');
const cors = require('cors');

// Carrega variáveis de ambiente
require('dotenv').config();

const app = express();

// --- MIDDLEWARES BÁSICOS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- DEBUGGING ---
console.log(`[SERVER] CWD: ${process.cwd()}`);
console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[SERVER] PORT: ${process.env.PORT}`);

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS ---
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER] Frontend path: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- ROTAS MÍNIMAS ---
app.get('/', function(req, res) {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/health', function(req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        message: 'Servidor minimalista funcionando'
    });
});

app.get('/test', function(req, res) {
    res.json({
        message: 'Teste funcionando!',
        timestamp: new Date().toISOString()
    });
});

// --- FALLBACK SIMPLES ---
app.get('*', function(req, res) {
    console.log(`[404] Rota não encontrada: ${req.path}`);
    
    // Se for arquivo estático, retorna 404
    if (req.path.includes('.')) {
        return res.status(404).json({
            error: 'Not Found',
            path: req.path
        });
    }
    
    // Se for rota da aplicação, redireciona para index
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- INICIALIZAÇÃO ---
const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`🚀 Servidor MINIMALISTA rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log(`🧪 Teste: http://localhost:${port}/test`);
}); 