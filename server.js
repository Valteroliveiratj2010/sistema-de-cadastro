// server.js (ESTE ARQUIVO ESTÁ NA RAIZ DO PROJETO)
const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa o módulo cors
const app = express();

// Carrega variáveis de ambiente (agora que server.js está na raiz, esta é a forma mais simples)
require('dotenv').config();

// --- MIDDLEWARES GLOBAIS ---
// Permite que o Express lide com JSON no corpo das requisições
app.use(express.json());
// Permite que o Express lide com dados de formulário codificados em URL
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DE CORS ---
// Define as opções de CORS. Em produção, a origem deve ser a URL do seu frontend na Vercel.
// Em desenvolvimento, permite todas as origens ('*') para facilitar os testes locais.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://sistema-de-cadastro-auldbgbsm-valteroliveiratj2010s-projects.vercel.app' // <--- SUBSTITUA PELA URL REAL DO SEU FRONTEND NA VERCEL!
        : '*', // Permite todas as origens em ambiente de desenvolvimento
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Permite o envio de cookies de credenciais (se você usar)
    optionsSuccessStatus: 204 // Status para requisições OPTIONS bem-sucedidas (preflight)
};
// Aplica o middleware CORS com as opções definidas
app.use(cors(corsOptions));

// --- DEBUGGING: LOG O CURRENT WORKING DIRECTORY e __dirname ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);


// --- ROTAS DA API ---
// Constrói o caminho absoluto para o arquivo api.js dentro da pasta backend/routes
const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
// Carrega as rotas definidas em api.js
const apiRoutes = require(apiRoutesPath);
// Aplica as rotas da API sob o prefixo /api
app.use('/api', apiRoutes); // Todas as rotas da sua API começarão com /api

// Constrói o caminho absoluto para o arquivo debug.js dentro da pasta backend/routes
const debugRoutes = require(path.join(__dirname, 'backend', 'routes', 'debug'));
app.use('/debug', debugRoutes); // Aplica as rotas de debug sob o prefixo /debug


// --- SERVE ARQUIVOS ESTÁTICOS DO FRONTEND ---
// Constrói o caminho absoluto para a pasta 'frontend'
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
// Serve os arquivos estáticos (HTML, CSS, JS, imagens) da pasta 'frontend'
app.use(express.static(frontendPath));


// --- ROTA DE FALLBACK PARA index.html (SPA) ---
// Este middleware captura todas as requisições que não foram tratadas pelas rotas acima
// e tenta servir o index.html, o que é comum para Single Page Applications (SPAs)
app.use((req, res) => {
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
// Define a porta do servidor, usando a variável de ambiente PORT (para deploy) ou 4000 (localmente)
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse a aplicação (localmente) em: http://localhost:${port}`);
});
