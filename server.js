// server.js (ESTE ARQUIVO ESTÁ NA RAIZ DO PROJETO)
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente (agora que server.js está na raiz, esta é a forma mais simples)
require('dotenv').config();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- DEBUGGING: LOG O CURRENT WORKING DIRECTORY e __dirname ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);


// --- ROTAS DA API ---
// AGORA QUE server.js ESTÁ NA RAIZ:
// A pasta 'routes' está dentro de 'backend'
const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
const apiRoutes = require(apiRoutesPath); 
app.use('/api', apiRoutes); // Todas as rotas da sua API começarão com /api


// --- SERVE ARQUIVOS ESTÁTICOS DO FRONTEND ---
// AGORA QUE server.js ESTÁ NA RAIZ:
// A pasta 'frontend' está diretamente na raiz
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));


// --- ROTA DE FALLBACK PARA index.html (SPA) ---
app.get('*', (req, res) => {
    console.log(`[SERVER_DEBUG] Requisição não tratada, tentando servir index.html para: ${req.path}`);
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error(`❌ ERRO ao enviar index.html: ${err}`);
            console.error(`❌ Caminho de index.html tentado: ${path.join(frontendPath, 'index.html')}`);
            res.status(500).send('Erro interno do servidor ao carregar a página.');
        }
    });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse a aplicação (localmente) em: http://localhost:${port}`);
});