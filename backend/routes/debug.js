// backend/routes/debug.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../database');

router.get('/delete-admin', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { username: '42vsilva' } });

    if (deleted > 0) {
      return res.send('✅ Usuário admin deletado com sucesso.');
    } else {
      return res.send('⚠️ Usuário admin não encontrado.');
    }
  } catch (error) {
    console.error('[DEBUG] Erro ao deletar admin:', error);
    res.status(500).send('Erro ao deletar admin.');
  }
});

router.get('/create-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ where: { username: '42vsilva' } });

    if (exists) {
      return res.send('⚠️ Usuário admin já existe.');
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const newUser = await User.create({
      username: '42vsilva',
      email: 'admin@sistema.com',
      password: hashedPassword,
      role: 'admin'
    });

    res.send('✅ Usuário admin criado com sucesso.');
  } catch (error) {
    console.error('[DEBUG] Erro ao criar admin:', error);
    res.status(500).send('Erro ao criar admin.');
  }
});

module.exports = router;
