// server-with-auth.js - Servidor com autenticação básica
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/login', async function(req, res) {
    try {
        console.log('[AUTH] Tentativa de login recebida');
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuário e senha são obrigatórios'
            });
        }
        
        console.log(`[AUTH] Tentativa de login: ${username}`);
        
        // Credenciais hardcoded para teste
        const validUsers = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: '19vsilva', password: 'dv201015', role: 'admin' }
        ];
        
        const user = validUsers.find(u => u.username === username);
        
        if (!user) {
            console.log(`[AUTH] Usuário não encontrado: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }
        
        // Verificar senha (simplificado para teste)
        if (password !== user.password) {
            console.log(`[AUTH] Senha incorreta para: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }
        
        // Gerar token JWT
        const jwtSecret = process.env.JWT_SECRET || 'gestor_pro_jwt_secret_2024_production_secure';
        const token = jwt.sign(
            { 
                id: 1, 
                username: user.username, 
                role: user.role 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );
        
        console.log(`[AUTH] Login bem-sucedido: ${username}`);
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                id: 1,
                username: user.username,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('[AUTH] Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor durante o login'
        });
    }
});

// --- ROTA DE VERIFICAÇÃO DE TOKEN ---
app.get('/api/auth/verify', function(req, res) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }
        
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'gestor_pro_jwt_secret_2024_production_secure';
        
        const decoded = jwt.verify(token, jwtSecret);
        
        res.json({
            success: true,
            user: decoded
        });
        
    } catch (error) {
        console.error('[AUTH] Erro na verificação:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
});

// --- ROTAS BÁSICAS ---
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
        message: 'Servidor com autenticação funcionando',
        features: ['login', 'health', 'static-files']
    });
});

app.get('/test', function(req, res) {
    res.json({
        message: 'Teste funcionando!',
        timestamp: new Date().toISOString(),
        auth: 'enabled'
    });
});

// --- FALLBACK ---
app.get('*', function(req, res) {
    console.log(`[404] Rota não encontrada: ${req.path}`);
    
    if (req.path.includes('.')) {
        return res.status(404).json({
            error: 'Not Found',
            path: req.path
        });
    }
    
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- INICIALIZAÇÃO ---
const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`🚀 Servidor COM AUTENTICAÇÃO rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log(`🧪 Teste: http://localhost:${port}/test`);
    console.log(`🔑 Login API: http://localhost:${port}/api/auth/login`);
}); 