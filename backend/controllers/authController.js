const { User } = require('../database');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await user.comparePassword(password);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    // Aqui você pode gerar um token JWT ou apenas retornar os dados do usuário
    return res.json({
      message: 'Login bem-sucedido.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[AUTH] Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno no login.', error: error.message });
  }
};
