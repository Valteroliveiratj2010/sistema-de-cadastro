const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../database'); // Certifique-se de que User está exportado

router.get('/run-admin-seed', async (req, res) => {
  try {
    const exists = await User.findOne({ where: { username: '42vsilva' } });

    if (exists) {
      return res.send('⚠️ Usuário 42vsilva já existe.');
    }

    const hashedPassword = await bcrypt.hash('guaguas00-42', 10); // Aqui você define a senha original

    const novoUsuario = await User.create({
      username: '42vsilva',
      email: 'admin@sistema.com',
      password: hashedPassword,
      role: 'admin'
    });

    res.send('✅ Usuário admin criado com sucesso.');
  } catch (error) {
    console.error('[SEED DEBUG] Erro ao executar seed:', error);
    res.status(500).send('Erro ao executar seed.');
  }
});

module.exports = router;
