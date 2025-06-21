// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Importar o modelo de usuário do 'database' que agora o exporta
const { User } = require('../database'); 

// Rota de Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Encontrar o usuário pelo username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // 2. Comparar a senha fornecida com a senha hashada no banco de dados
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // 3. Se as credenciais estiverem corretas, gerar um JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.TOKEN_SECRET || 'umasecretamuitoescondida', // ATENÇÃO: Usar variável de ambiente em produção!
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        // 4. Enviar o token para o frontend
        res.json({ token, message: 'Login bem-sucedido!' });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor durante o login.' });
    }
});

module.exports = router;