const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../database');
const { Op } = require('sequelize');

const router = express.Router();

// Usa a chave secreta do JWT vinda do .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET não definido no ambiente! Token não será gerado corretamente.');
}

// Rota de Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`[AUTH] Tentativa de login: ${username}`);

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      console.log(`[AUTH] Usuário '${username}' não encontrado.`);
      return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
    }

    console.log(`[AUTH] Usuário '${user.username}' encontrado. Validando senha...`);

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log(`[AUTH] Senha inválida para usuário '${user.username}'.`);
      return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`[AUTH] Login bem-sucedido para '${user.username}'.`);
    return res.json({
      message: 'Login bem-sucedido!',
      token,
      role: user.role,
      username: user.username,
      id: user.id
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno no servidor durante o login.' });
  }
});

module.exports = router;
