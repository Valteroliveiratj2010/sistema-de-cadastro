const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../database'); // Certifique-se de que está exportando corretamente

router.get('/run-admin-seed', async (req, res) => {
  try {
    const exists = await User.findOne({ where: { username: 'admin' } });

    if (exists) {
      return res.send('⚠️ Usuário admin já existe.');
    }

    await User.create({
      username: '42vsilva',
      email: 'admin@sistema.com', // ✅ Adicionado para evitar erro
      password: await bcrypt.hash('guaguas00', 10),
      role: 'admin'
    });

    res.send('✅ Usuário admin criado com sucesso.');
  } catch (error) {
    console.error('[SEED DEBUG] Erro ao executar seed:', error);
    res.status(500).send('Erro ao executar seed.');
  }
});

module.exports = router;
