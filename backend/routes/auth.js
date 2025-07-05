// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../database'); 
const { Op } = require('sequelize'); // Certifique-se de que esta linha está correta para importar Op

const router = express.Router();

// CHAVE SECRETA DO JWT
// ATENÇÃO: Em um ambiente de produção, esta chave DEVE ser uma variável de ambiente (process.env.JWT_SECRET)
// NUNCA a deixe diretamente no código-fonte!
const JWT_SECRET = process.env.JWT_SECRET; // <<< AGORA LÊ DA VARIÁVEL DE AMBIENTE! ISSO É CRUCIAL!

// Rota de Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`[AUTH] Tentativa de login: Usuário/Email=${username}`);
    // AVISO: Não faça isso em produção! Apenas para depuração.
    // console.log(`[AUTH] Senha recebida (para debug): ${password}`); 

    try {
        console.log(`[AUTH] Iniciando busca no DB por username ou email: ${username}`);
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [ 
                    { username: username },
                    { email: username } 
                ]
            } 
        });
        console.log(`[AUTH] Busca no DB finalizada. Usuário encontrado? ${!!user}`);

        // Se o utilizador não for encontrado
        if (!user) {
            console.log(`[AUTH] Login falhou: Usuário/Email '${username}' não encontrado na base de dados.`);
            return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
        }

        console.log(`[AUTH] Usuário '${user.username}' encontrado. Iniciando comparação de senha.`);
        // Chama o método comparePassword do modelo User para verificar a senha
        const isPasswordValid = await user.comparePassword(password);
        console.log(`[AUTH] Resultado da comparação de senha: ${isPasswordValid ? 'Válida' : 'Inválida'}.`);

        // Se a senha não for válida
        if (!isPasswordValid) {
            console.log(`[AUTH] Login falhou: Senha inválida para o usuário '${user.username}'.`);
            return res.status(401).json({ message: 'Nome de utilizador ou senha inválidos.' });
        }

        // Se as credenciais forem válidas, gerar um token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET, // JWT_SECRET agora é a variável de ambiente
            { expiresIn: '1h' } 
        );

        console.log(`[AUTH] Login bem-sucedido para o usuário '${user.username}'. Token gerado.`);
        // Retorna o token, role, username e id para o frontend
        res.json({ message: 'Login bem-sucedido!', token, role: user.role, username: user.username, id: user.id }); 
        
    } catch (error) {
        console.error('❌ ERRO NO ENDPOINT DE LOGIN (BLOCO CATCH):', error);
        res.status(500).json({ message: 'Ocorreu um erro no servidor durante o login.' });
    }
});

module.exports = router;
