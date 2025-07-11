const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

// 💚 Rota de Health Check simples e rápida (RECOMENDADO PARA O RAILWAY)
// Esta rota deve apenas verificar se o servidor Express está ativo.
// Ela não deve fazer chamadas ao banco de dados ou operações complexas.
router.get('/', (req, res) => {
  console.log('[DEBUG] Health check recebido na rota /debug');
  res.status(200).send('OK'); // Responde com status 200 OK e um texto simples
});

// 🔐 Sua rota original de verificação de senha (OPCIONAL: Mantenha se ainda precisar dela)
// Se você quiser manter esta rota para depuração, ela agora estará em /debug/verify-password.
// Se não precisar mais dela, pode removê-la completamente.
router.get('/verify-password', async (req, res) => {
  try {
    // Importar User aqui dentro da rota para garantir que o DB esteja conectado
    // no momento da requisição, e não na inicialização do módulo.
    const { User } = require('../database'); // Importa User aqui dentro da rota

    // --- ATUALIZADO: Usuário e Senha do Seeder ---
    const usernameToVerify = 'temedv'; // O novo username do seeder
    const plainPassword = '1914144000sky'; // A nova senha do seeder
    // --- FIM DA ATUALIZAÇÃO ---

    const user = await User.findOne({ where: { username: usernameToVerify } });

    if (!user) {
      return res.status(404).send(`Usuário ${usernameToVerify} não encontrado.`);
    }

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
