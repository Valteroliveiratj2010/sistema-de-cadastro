// server-test-local.js - Servidor de teste local
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

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS ---
const frontendPath = path.join(__dirname, 'frontend');
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

// --- DADOS EM MEMÓRIA ---
let clients = [{ id: 1, nome: 'Cliente Teste', email: 'teste@email.com' }];
let products = [{ id: 1, nome: 'Produto Teste', preco: 100.00 }];
let sales = [{ id: 1, valorTotal: 100.00, status: 'Pago' }];
let suppliers = [{ id: 1, nome: 'Fornecedor Teste', email: 'fornecedor@email.com' }];
let purchases = [{ id: 1, valorTotal: 500.00, status: 'Pago' }];
let users = [{ id: 1, username: 'admin', email: 'admin@gestorpro.com' }];

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/login', function(req, res) {
    console.log('[AUTH] Tentativa de login:', req.body);
    
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        const jwtSecret = process.env.JWT_SECRET || 'gestor_pro_jwt_secret_2024_production_secure';
        const token = jwt.sign({ username, role: 'admin' }, jwtSecret, { expiresIn: '24h' });
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: { username, role: 'admin' }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Credenciais inválidas'
        });
    }
});

// --- ROTAS DE CLIENTES ---
app.get('/api/clients', authMiddleware, function(req, res) {
    res.json({ success: true, data: clients });
});

app.post('/api/clients', authMiddleware, function(req, res) {
    const newClient = { id: clients.length + 1, ...req.body };
    clients.push(newClient);
    res.status(201).json({ success: true, message: 'Cliente criado', data: newClient });
});

app.put('/api/clients/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    clients[index] = { ...clients[index], ...req.body };
    res.json({ success: true, message: 'Cliente atualizado', data: clients[index] });
});

app.delete('/api/clients/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    clients.splice(index, 1);
    res.json({ success: true, message: 'Cliente removido' });
});

// --- ROTAS DE PRODUTOS ---
app.get('/api/products', authMiddleware, function(req, res) {
    res.json({ success: true, data: products });
});

app.post('/api/products', authMiddleware, function(req, res) {
    const newProduct = { id: products.length + 1, ...req.body };
    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Produto criado', data: newProduct });
});

app.put('/api/products/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    products[index] = { ...products[index], ...req.body };
    res.json({ success: true, message: 'Produto atualizado', data: products[index] });
});

app.delete('/api/products/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    products.splice(index, 1);
    res.json({ success: true, message: 'Produto removido' });
});

// --- ROTAS DE VENDAS ---
app.get('/api/sales', authMiddleware, function(req, res) {
    res.json({ success: true, data: sales });
});

app.post('/api/sales', authMiddleware, function(req, res) {
    const newSale = { id: sales.length + 1, ...req.body };
    sales.push(newSale);
    res.status(201).json({ success: true, message: 'Venda criada', data: newSale });
});

app.put('/api/sales/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Venda não encontrada' });
    sales[index] = { ...sales[index], ...req.body };
    res.json({ success: true, message: 'Venda atualizada', data: sales[index] });
});

app.delete('/api/sales/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Venda não encontrada' });
    sales.splice(index, 1);
    res.json({ success: true, message: 'Venda removida' });
});

// --- ROTAS DE FORNECEDORES ---
app.get('/api/suppliers', authMiddleware, function(req, res) {
    res.json({ success: true, data: suppliers });
});

app.post('/api/suppliers', authMiddleware, function(req, res) {
    const newSupplier = { id: suppliers.length + 1, ...req.body };
    suppliers.push(newSupplier);
    res.status(201).json({ success: true, message: 'Fornecedor criado', data: newSupplier });
});

app.put('/api/suppliers/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Fornecedor não encontrado' });
    suppliers[index] = { ...suppliers[index], ...req.body };
    res.json({ success: true, message: 'Fornecedor atualizado', data: suppliers[index] });
});

app.delete('/api/suppliers/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Fornecedor não encontrado' });
    suppliers.splice(index, 1);
    res.json({ success: true, message: 'Fornecedor removido' });
});

// --- ROTAS DE COMPRAS ---
app.get('/api/purchases', authMiddleware, function(req, res) {
    res.json({ success: true, data: purchases });
});

app.post('/api/purchases', authMiddleware, function(req, res) {
    const newPurchase = { id: purchases.length + 1, ...req.body };
    purchases.push(newPurchase);
    res.status(201).json({ success: true, message: 'Compra criada', data: newPurchase });
});

app.put('/api/purchases/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = purchases.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Compra não encontrada' });
    purchases[index] = { ...purchases[index], ...req.body };
    res.json({ success: true, message: 'Compra atualizada', data: purchases[index] });
});

app.delete('/api/purchases/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = purchases.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Compra não encontrada' });
    purchases.splice(index, 1);
    res.json({ success: true, message: 'Compra removida' });
});

// --- ROTAS DE USUÁRIOS ---
app.get('/api/users', authMiddleware, function(req, res) {
    res.json({ success: true, data: users });
});

app.post('/api/users', authMiddleware, function(req, res) {
    const newUser = { id: users.length + 1, ...req.body };
    users.push(newUser);
    res.status(201).json({ success: true, message: 'Usuário criado', data: newUser });
});

app.put('/api/users/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    users[index] = { ...users[index], ...req.body };
    res.json({ success: true, message: 'Usuário atualizado', data: users[index] });
});

app.delete('/api/users/:id', authMiddleware, function(req, res) {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    users.splice(index, 1);
    res.json({ success: true, message: 'Usuário removido' });
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
        message: 'Servidor de teste local funcionando',
        features: ['login', 'clients', 'products', 'sales', 'suppliers', 'purchases', 'users']
    });
});

// --- FALLBACK ---
app.get('*', function(req, res) {
    if (req.path.includes('.')) {
        return res.status(404).json({ error: 'Not Found', path: req.path });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- INICIALIZAÇÃO ---
const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`🚀 Servidor de TESTE LOCAL rodando na porta: ${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${frontendPath}`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log(`🔗 Login: http://localhost:${port}/login`);
    console.log(`🔗 App: http://localhost:${port}`);
    console.log(`📋 Credenciais: admin / admin123`);
}); 