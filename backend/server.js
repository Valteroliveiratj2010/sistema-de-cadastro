// backend/server.js
// *** CORREÇÃO: path deve ser importado ANTES de ser usado no dotenv.config ***
const path = require('path'); // Módulo 'path' importado PRIMEIRO

// 1️⃣ Carrega o .env garantido que as variáveis venham da raiz se necessário
// Especifica o caminho para o .env, subindo um nível a partir do diretório atual (backend/)
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// *** Ordem é crucial: Rotas estáticas vêm primeiro para servir CSS/JS ***
// Garante que o Express sirva arquivos da pasta 'frontend'.
// Quando o navegador requisita /style.css, Express procura em <raiz_do_projeto>/frontend/style.css
app.use(express.static(path.join(__dirname, '../frontend')));

// Debug: caminho da pasta frontend que está sendo servida
console.log('📂 Express está servindo arquivos estáticos de:', path.join(__dirname, '../frontend'));


// *** Rota raiz para o index.html: Adicionado depuração e tratamento de erro ***
// Esta rota deve ser a primeira a ser acionada para '/' se o arquivo estático não for encontrado.
app.get('/', (req, res) => {
    console.log('➡️ Requisição GET / recebida.');
    const indexPath = path.join(__dirname, '../frontend', 'index.html');
    console.log('📄 Tentando enviar index.html de:', indexPath);

    res.sendFile(indexPath, err => {
        if (err) {
            console.error('❌ ERRO ao enviar index.html:', err);
            // Verifica se o erro é um ENOENT (arquivo não encontrado)
            if (err.code === 'ENOENT') {
                res.status(404).send('Página inicial (index.html) não encontrada no servidor.');
            } else {
                res.status(err.status || 500).send(`Erro interno ao carregar a página: ${err.message}`);
            }
        } else {
            console.log('✅ index.html enviado com sucesso.');
        }
    });
});

// Rotas da API (devem vir depois das rotas de arquivos estáticos e da rota raiz)
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Middleware de erros centralizado
app.use((err, req, res, next) => {
    console.error('❌ Erro no middleware centralizado:', err);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Ocorreu um erro inesperado no servidor.'
    });
});

// Função para iniciar o servidor após sincronizar o banco de dados
async function startServer() {
    try {
        await sequelize.sync({ force: false }); // force: false mantém os dados
        console.log('✅ Conexão com o banco de dados estabelecida e modelos sincronizados.');

        // --- CÓDIGO TEMPORÁRIO PARA CRIAR USUÁRIO ADMIN INICIAL ---
        // APENAS PARA O PRIMEIRO START. REMOVER DEPOIS DE LOGAR PELA PRIMEIRA VEZ.
        const { User } = require('./database'); // Importa o modelo User aqui temporariamente
        const defaultAdminUsername = 'admin';
        const defaultAdminPassword = 'adminpassword'; // Senha segura para o admin
        
        try {
            const [adminUser, created] = await User.findOrCreate({
                where: { username: defaultAdminUsername },
                defaults: {
                    username: defaultAdminUsername,
                    email: 'admin@gestorpro.com', // Email padrão
                    password: defaultAdminPassword, // A senha será hashed pelo hook do modelo User
                    role: 'admin'
                }
            });
            if (created) {
                console.log(`🔑 Usuário administrador '${defaultAdminUsername}' criado com sucesso! Senha: '${defaultAdminPassword}'`);
            } else {
                console.log(`🔑 Usuário administrador '${defaultAdminUsername}' já existe.`);
            }
        } catch (userCreateError) {
            console.error('❌ Erro ao criar/verificar usuário administrador inicial:', userCreateError.message);
        }
        // --- FIM DO CÓDIGO TEMPORÁRIO ---

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 Acesse o frontend em: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer();
