// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- DEBUGGING: LOG O CURRENT WORKING DIRECTORY e __dirname ---
console.log(`[SERVER_DEBUG] Current Working Directory (CWD): ${process.cwd()}`);
console.log(`[SERVER_DEBUG] __dirname: ${__dirname}`);


// --- CONFIGURAÇÃO PARA SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND ---
const renderProjectRoot = process.cwd(); // Isso deve ser '/opt/render/project' na Render
const frontendPath = path.join(renderProjectRoot, 'src', 'frontend'); // Monta o caminho completo até a pasta 'frontend'

console.log(`[SERVER_LOG] Tentando servir arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));


// --- ROTAS DA API ---
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>> NOVO DEBUG AQUI E AJUSTE ROBUSTO PARA IMPORTAÇÃO DA API <<<<<<<<<<<<<<<<<<<<<<<<
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
const apiRoutesPath = path.join(__dirname, 'routes', 'api');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO para api.js: ${apiRoutesPath}`); // NOVO DEBUG!

// Vamos tentar um require que é 100% absoluto desde a raiz do sistema de arquivos
// Isso é mais uma medida de depuração, pois path.join(__dirname...) deveria ser suficiente
// Mas dada a persistência do erro, precisamos testar todas as hipóteses.
// Usaremos '/opt/render/project/src/backend/routes/api' que é o caminho esperado.
// Para construir isso dinamicamente:
const absoluteApiRoutesPath = path.join(process.cwd(), 'src', 'backend', 'routes', 'api');
console.log(`[SERVER_DEBUG] Caminho ABSOLUTO construído a partir do CWD: ${absoluteApiRoutesPath}`); // NOVO DEBUG!

// O REQUIRE FINAL - vamos tentar com o caminho absoluto mais robusto
const apiRoutes = require(absoluteApiRoutesPath); 
app.use('/api', apiRoutes); // Todas as rotas da sua API começarão com /api


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