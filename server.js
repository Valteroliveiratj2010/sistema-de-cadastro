// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors'); // Certifique-se de que o 'cors' está instalado
const app = express();

// Carrega as variáveis de ambiente (se ainda não carregou em um ponto de entrada superior)
// Se seu principal server.js está na raiz e ele que tem o dotenv.config(), pode remover esta parte.
// Mas se backend/server.js é o ponto de entrada principal, mantenha.
// (Assumindo que o dotenv já foi carregado em server.js que está na raiz do seu projeto)
// const path = require('path'); // Já está lá em cima
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Se o server.js da raiz não faz isso

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json()); // Body parser para JSON
app.use(express.urlencoded({ extended: true })); // Body parser para URL-encoded
app.use(cors()); // Habilita CORS. Para produção, considere configurar origens específicas!

// --- DEBUGGING: LOG O CURRENT WORKING DIRECTORY ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);


// --- CONFIGURAÇÃO PARA SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND ---
// A PASTA 'frontend' está no mesmo nível que 'backend'.
// Baseado no erro anterior, parece que o CWD do processo Node.js na Render é '/opt/render/project'.
// E seus arquivos estão em '/opt/render/project/src/frontend'.
// Por isso, precisamos adicionar 'src' explicitamente ao caminho.

const renderProjectRoot = process.cwd(); // Isso deve ser '/opt/render/project' na Render
const frontendPath = path.join(renderProjectRoot, 'src', 'frontend'); // Monta o caminho completo até a pasta 'frontend'

console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath)); // Isso serve CSS, JS, imagens, etc.

// --- ROTAS DA API ---
// Devem vir antes da rota de fallback para index.html
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes); // Todas as rotas da sua API começarão com /api

// --- ROTA DE FALLBACK PARA index.html (SPA) ---
// Qualquer rota que não foi tratada pelas rotas da API ou pelos arquivos estáticos
// será redirecionada para o index.html do frontend.
// ISSO DEVE VIR POR ÚLTIMO, DEPOIS DE TODAS AS ROTAS DE API E ARQUIVOS ESTÁTICOS!
app.get('*', (req, res) => {
    // Log para depuração
    console.log(`[SERVER_DEBUG] Requisição não tratada, tentando servir index.html para: ${req.path}`);
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error(`❌ ERRO ao enviar index.html: ${err}`);
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