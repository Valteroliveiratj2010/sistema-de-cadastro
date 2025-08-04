// server-with-api.js - Servidor com API básica
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

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
function authMiddleware(req, res, next) {
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
        req.user = decoded;
        next();
        
    } catch (error) {
        console.error('[AUTH] Erro na verificação:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
}

// --- DADOS EM MEMÓRIA (para teste) ---
let clients = [
    {
        id: 1,
        nome: 'Cliente Teste',
        email: 'teste@email.com',
        telefone: '11999999999',
        cpfCnpj: '12345678901',
        endereco: 'Rua Teste, 123'
    }
];

let products = [
    {
        id: 1,
        nome: 'Produto Teste',
        descricao: 'Descrição do produto teste',
        preco: 100.00,
        estoque: 50,
        categoria: 'Geral'
    }
];

let sales = [
    {
        id: 1,
        clienteId: 1,
        valorTotal: 100.00,
        valorPago: 100.00,
        status: 'Pago',
        dataVenda: new Date().toISOString()
    }
];

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
        
        if (password !== user.password) {
            console.log(`[AUTH] Senha incorreta para: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }
        
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

// --- ROTAS DE CLIENTES ---
app.get('/api/clients', authMiddleware, function(req, res) {
    console.log('[API] GET /api/clients');
    res.json({
        success: true,
        data: clients
    });
});

app.post('/api/clients', authMiddleware, function(req, res) {
    console.log('[API] POST /api/clients', req.body);
    
    const newClient = {
        id: clients.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    clients.push(newClient);
    
    res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: newClient
    });
});

app.put('/api/clients/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const clientIndex = clients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Cliente não encontrado'
        });
    }
    
    clients[clientIndex] = { ...clients[clientIndex], ...req.body };
    
    res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: clients[clientIndex]
    });
});

app.delete('/api/clients/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const clientIndex = clients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Cliente não encontrado'
        });
    }
    
    clients.splice(clientIndex, 1);
    
    res.json({
        success: true,
        message: 'Cliente removido com sucesso'
    });
});

// --- ROTAS DE PRODUTOS ---
app.get('/api/products', authMiddleware, function(req, res) {
    console.log('[API] GET /api/products');
    res.json({
        success: true,
        data: products
    });
});

app.get('/api/products/low-stock', authMiddleware, function(req, res) {
    const lowStockProducts = products.filter(p => p.estoque < 10);
    res.json({
        success: true,
        data: lowStockProducts
    });
});

app.post('/api/products', authMiddleware, function(req, res) {
    console.log('[API] POST /api/products', req.body);
    
    const newProduct = {
        id: products.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: newProduct
    });
});

app.delete('/api/products/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Produto não encontrado'
        });
    }
    
    products.splice(productIndex, 1);
    
    res.json({
        success: true,
        message: 'Produto removido com sucesso'
    });
});

app.put('/api/products/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Produto não encontrado'
        });
    }
    
    products[productIndex] = { ...products[productIndex], ...req.body };
    
    res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: products[productIndex]
    });
});

// --- ROTAS DE VENDAS ---
app.get('/api/sales', authMiddleware, function(req, res) {
    console.log('[API] GET /api/sales');
    res.json({
        success: true,
        data: sales
    });
});

app.post('/api/sales', authMiddleware, function(req, res) {
    console.log('[API] POST /api/sales', req.body);
    
    const newSale = {
        id: sales.length + 1,
        ...req.body,
        dataVenda: new Date().toISOString()
    };
    
    sales.push(newSale);
    
    res.status(201).json({
        success: true,
        message: 'Venda criada com sucesso',
        data: newSale
    });
});

app.delete('/api/sales/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const saleIndex = sales.findIndex(s => s.id === id);
    
    if (saleIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Venda não encontrada'
        });
    }
    
    sales.splice(saleIndex, 1);
    
    res.json({
        success: true,
        message: 'Venda removida com sucesso'
    });
});

app.put('/api/sales/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const saleIndex = sales.findIndex(s => s.id === id);
    
    if (saleIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Venda não encontrada'
        });
    }
    
    sales[saleIndex] = { ...sales[saleIndex], ...req.body };
    
    res.json({
        success: true,
        message: 'Venda atualizada com sucesso',
        data: sales[saleIndex]
    });
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
        message: 'Servidor com API funcionando',
        features: ['login', 'clients', 'products', 'sales', 'health', 'static-files']
    });
});

app.get('/test', function(req, res) {
    res.json({
        message: 'Teste funcionando!',
        timestamp: new Date().toISOString(),
        api: 'enabled'
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
    console.log(`🚀 Servidor COM API rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log(`🧪 Teste: http://localhost:${port}/test`);
    console.log(`🔑 Login API: http://localhost:${port}/api/auth/login`);
    console.log(`👥 Clients API: http://localhost:${port}/api/clients`);
    console.log(`📦 Products API: http://localhost:${port}/api/products`);
    console.log(`💰 Sales API: http://localhost:${port}/api/sales`);
}); 