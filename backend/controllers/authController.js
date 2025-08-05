const { User } = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log('[LOGIN] Recebida requisição de login');
  console.log('[LOGIN] Dados recebidos:', { username, password });

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log('[LOGIN] Usuário não encontrado:', username);
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    console.log('[LOGIN] Usuário encontrado:', user.username);

    const senhaCorreta = await user.comparePassword(password);

    if (!senhaCorreta) {
      console.log('[LOGIN] Credenciais inválidas');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    console.log('[LOGIN] Senha válida, gerando token...');

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('[LOGIN] Token gerado com sucesso');

    // Retornar token e dados do usuário
    return res.json({
      success: true,
      message: 'Login bem-sucedido.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[LOGIN] Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno no login.', error: error.message });
  }
};
