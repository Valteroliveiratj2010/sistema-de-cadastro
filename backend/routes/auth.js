// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken'); // Para gerar JSON Web Tokens
const { User } = require('../database'); // Importa o modelo User
// Assumimos que bcryptjs está disponível no modelo User para comparação,
// mas vamos importá-lo aqui também para clareza na comparação se necessário direto.
// Se User.prototype.comparePassword for usado, não é estritamente necessário aqui.
const bcrypt = require('bcryptjs'); 

const router = express.Router();

// CHAVE SECRETA DO JWT
// ATENÇÃO: Em um ambiente de produção, esta chave DEVE ser uma variável de ambiente (process.env.JWT_SECRET)
// Nunca a deixe diretamente no código-fonte!
const JWT_SECRET = 'X4A1D2BZ0GUBD2QRQQATWI1INGV6BDW0P1WSTV30C4APHBAYF1095MJVEQUJ076X686XT3GIRCX3YU959EU73ASLEB07TFX8XG'; // <-- SUBSTITUA POR UMA CHAVE MAIS SEGURA E LONGA!

// Rota de Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Log para depuração - útil para ver o que está a ser recebido
    console.log(`[AUTH] Tentativa de login: Usuário=${username}`);

    try {
        // 1. Encontrar o utilizador na base de dados pelo nome de utilizador
        const user = await User.findOne({ where: { username } });

        // Se o utilizador não for encontrado
        if (!user) {
            console.log(`[AUTH] Login falhou: Usuário '${username}' não encontrado.`);
            return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
        }

        // 2. Comparar a senha fornecida com a senha hashed na base de dados
        // Usamos o método comparePassword definido no protótipo do modelo User (backend/models/User.js)
        const isPasswordValid = await user.comparePassword(password);

        // Se a senha não for válida
        if (!isPasswordValid) {
            console.log(`[AUTH] Login falhou: Senha inválida para o usuário '${username}'.`);
            return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
        }

        // 3. Se as credenciais forem válidas, gerar um token JWT
        // O token JWT conterá o ID do utilizador e a sua função (role)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // O token expira em 1 hora (ajuste conforme necessário)
        );

        console.log(`[AUTH] Login bem-sucedido para o usuário '${username}'. Token gerado.`);
        // 4. Retornar o token JWT para o frontend
        res.json({ message: 'Login bem-sucedido!', token });

    } catch (error) {
        console.error('❌ ERRO NO ENDPOINT DE LOGIN:', error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor durante o login.' });
    }
});

// Você pode adicionar uma rota para registo de utilizadores aqui no futuro, se necessário.
/*
router.post('/register', async (req, res) => {
    // Lógica para criar um novo utilizador
});
*/

module.exports = router;
