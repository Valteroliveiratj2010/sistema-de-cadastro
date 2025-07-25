// server.js (ESTE ARQUIVO ESTÁ NA RAIZ DO PROJETO)
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carrega variáveis de ambiente - SEMPRE NO INÍCIO!
require('dotenv').config();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DE CORS ---
// É importante definir o origin de forma mais segura em produção.
// Para o deploy no Render, 'https://sistema-de-cadastro-eosin.vercel.app' seria o host do seu frontend.
// Certifique-se de que é o URL EXATO.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://sistema-de-cadastro-frontend.onrender.com' // <-- ATUALIZE AQUI PARA O DOMÍNIO DO SEU FRONTEND NO RENDER/VERCEL, SE TIVER UM
        : '*', // Permite qualquer origem em desenvolvimento
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- DEBUGGING (Para ajudar a rastrear) ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);

// --- ROTAS DA API ---
const apiRoutesPath = path.join(__dirname, 'backend', 'routes', 'api.js');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`);
const apiRoutes = require(apiRoutesPath); // <-- LINHA 36
app.use('/api', apiRoutes); // <-- LINHA 37

// --- REMOVENDO ROTAS DE DEBUG SE O ARQUIVO FOI DELETADO ---
// Remova estas 2 linhas se você DELETOU o arquivo backend/routes/debug.js
// const debugRoutes = require(path.join(__dirname, 'backend', 'routes', 'debug')); // <-- Linha 39 original
// app.use('/debug', debugRoutes); // <-- Linha 40 original
// Se o debug.js ainda existe e você quer que ele rode SOMENTE em desenvolvimento:
/*
if (process.env.NODE_ENV !== 'production') {
    const debugRoutes = require(path.join(__dirname, 'backend', 'routes', 'debug'));
    app.use('/debug', debugRoutes);
    console.log('[SERVER_DEBUG] Rotas de debug ATIVADAS (ambiente de desenvolvimento).');
} else {
    console.log('[SERVER_DEBUG] Rotas de debug DESATIVADAS (ambiente de produção).');
}
*/


// --- SERVE ARQUIVOS ESTÁTICOS DO FRONTEND ---
// É importante notar que, se você tem um frontend separado (ex: no Vercel/outro serviço do Render),
// este bloco pode não ser necessário ou pode causar conflito se ambos tentam servir o index.html.
// No Render, geralmente o frontend é um "Static Site" separado.
const frontendPath = path.join(__dirname, 'frontend');
console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- ROTA DE FALLBACK PARA index.html (SPA) ---
// Similar ao comentário acima, se o frontend está separado, esta rota também não é necessária
// e pode causar comportamento inesperado.
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
const port = process.env.PORT || 8080; // Render irá fornecer process.env.PORT automaticamente

app.listen(port, () => {
    console.log(`Servidor Express rodando na porta: ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});