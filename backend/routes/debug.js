const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../database');

const router = express.Router();

// 🔐 Verifica o hash salvo no banco para o usuário 42vsilva
router.get('/verify-password', async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: '42vsilva' } });

    if (!user) {
      return res.status(404).send('Usuário 42vsilva não encontrado.');
    }

    const plainPassword = '123456';
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    res.send(`
      <pre>
Usuário: ${user.username}
Senha Padrão Testada: "${plainPassword}"

Hash no banco:
${user.password}

Resultado do bcrypt.compare:
${isMatch ? '✅ SENHA CORRETA' : '❌ SENHA INCORRETA'}
      </pre>
    `);
  } catch (error) {
    console.error('[DEBUG] Erro ao verificar senha:', error);
    res.status(500).send('Erro interno ao verificar senha.');
  }
});

module.exports = router;
