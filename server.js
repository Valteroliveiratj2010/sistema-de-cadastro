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
// Permite que o frontend Vercel (ou qualquer outro host) se comunique com este backend.
// É CRÍTICO que o 'origin' em produção seja o URL EXATO do seu frontend.
// Use 'https://sistema-de-cadastro-eosin.vercel.app' para seu frontend no Vercel.
// Use 'https://sistema-de-cadastro-backend.onrender.com' para o URL do seu backend no Render.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? /^https:\/\/sistema-de-cadastro.*\.vercel\.app$/ // Aceita qualquer subdomínio do Vercel
        : '*', // Para desenvolvimento local, permite qualquer origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Permite o envio de cookies de credenciais (se usados)
    optionsSuccessStatus: 204 // Para requisições OPTIONS (preflight CORS)
};
app.use(cors(corsOptions));

// --- DEBUGGING (Para ajudar a rastrear o diretório de trabalho no deploy) ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);

// --- ROTAS DA API ---
const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
const apiRoutes = require(apiRoutesPath);
app.use('/api', apiRoutes); // Todas as rotas definidas em api.js serão prefixadas com '/api'

// --- REMOÇÃO DE ROTAS DE DEBUG EM PRODUÇÃO ---
// Se o arquivo debug.js foi deletado, estas linhas não farão sentido.
// Se ele existe e você quer que ele rode SOMENTE em desenvolvimento,
// use a lógica condicional como no exemplo abaixo.
// Eu vou REMOVER as linhas de 'require' e 'app.use' para 'debugRoutes'
// para evitar erros de 'MODULE_NOT_FOUND' se o arquivo não estiver lá.
// Se você quiser reintroduzi-las para o ambiente de desenvolvimento, use o bloco 'if' comentado.
/*
if (process.env.NODE_ENV !== 'production') {
    const debugRoutes = require(path.join(__dirname, 'backend', 'routes', 'debug'));
    app.use('/debug', debugRoutes);
    console.log('[SERVER_DEBUG] Rotas de debug ATIVADAS (ambiente de desenvolvimento).');
} else {
    console.log('[SERVER_DEBUG] Rotas de debug DESATIVADAS (ambiente de produção).');
}
*/

// --- REMOÇÃO DE SERVIÇO DE ARQUIVOS ESTÁTICOS DO FRONTEND E ROTA DE FALLBACK ---
// Se seu frontend está em um serviço separado (como Vercel ou Static Site no Render),
// o backend NÃO deve servir os arquivos estáticos do frontend.
// Remover este bloco evita conflitos e otimiza o backend para ser APENAS uma API.
/*
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

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
*/

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Render irá fornecer process.env.PORT automaticamente em produção.
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Servidor Express rodando na porta: ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});