const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../database'); // Certifique-se de que o User está exportado corretamente

// 🧨 Rota de debug: Deletar o usuário admin '42vsilva'
router.get('/delete-admin', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { username: '42vsilva' } });
    if (deleted) {
      return res.send('✅ Usuário 42vsilva deletado com sucesso.');
    } else {
      return res.send('⚠️ Usuário 42vsilva não encontrado.');
    }
  } catch (error) {
    console.error('[DEBUG] Erro ao deletar admin:', error);
    res.status(500).send('Erro ao tentar deletar o usuário admin.');
  }
});

// 🔐 Rota de debug: Criar novo admin com bcrypt
router.get('/create-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ where: { username: '42vsilva' } });
    if (exists) {
      return res.send('⚠️ Usuário 42vsilva já existe.');
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.create({
      username: '42vsilva',
      email: 'admin@sistema.com',
      password: hashedPassword,
      role: 'admin'
    });

    res.send('✅ Usuário admin criado com bcrypt com sucesso.');
  } catch (error) {
    console.error('[DEBUG] Erro ao criar admin com bcrypt:', error);
    res.status(500).send('Erro ao criar novo admin.');
  }
});

module.exports = router;
