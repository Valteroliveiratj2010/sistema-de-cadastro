const bcrypt = require('bcryptjs');
const { User } = require('../database'); // Ajuste para o caminho correto

async function seedAdmin() {
  try {
    const existing = await User.findOne({ where: { username: 'admin' } });
    if (!existing) {
      await User.create({
        username: 'admin',
        password: await bcrypt.hash('123456', 10),
        role: 'admin'
      });
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe.');
    }
  } catch (err) {
    console.error('Erro ao criar admin:', err);
  }
}

seedAdmin();
