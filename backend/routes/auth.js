// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../database'); 

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }
        const payload = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(
            payload,
            process.env.TOKEN_SECRET || 'umasecretamuitoescondida',
            { expiresIn: '8h' }
        );
        res.json({ token, message: 'Login bem-sucedido!' });
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor durante o login.' });
    }
});

module.exports = router;
