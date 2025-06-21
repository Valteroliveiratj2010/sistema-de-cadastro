// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // O token é geralmente enviado no cabeçalho 'Authorization' como 'Bearer TOKEN'
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        // Se não há cabeçalho de autorização, o usuário não está logado ou não tentou
        return res.status(401).json({ message: 'Nenhum token fornecido, autorização negada.' });
    }

    // O cabeçalho é geralmente no formato "Bearer <token>", então dividimos para pegar apenas o token
    const token = authHeader.split(' ')[1]; 

    // Se o token não existir após a divisão ou se o formato estiver incorreto
    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido, autorização negada.' });
    }

    try {
        // Verificar o token usando a chave secreta
        // A chave secreta deve ser a mesma usada em auth.js para gerar o token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET || 'umasecretamuitoescondida');
        
        // Se o token for válido, adiciona os dados do usuário (payload do token) ao objeto `req`
        // Assim, outras rotas podem saber quem é o usuário logado (ex: req.user.id)
        req.user = decoded; 
        
        // NOVO: Log de requisições que passam pelo middleware de autenticação
        // console.log(`[AuthMiddleware Log] ${new Date().toISOString()} - User ${req.user.username} authenticated for path: ${req.path}`);

        // Continua para a próxima função middleware ou para a rota final
        next(); 
    } catch (error) {
        // Se a verificação do token falhar (token inválido, expirado, etc.)
        console.error('❌ Erro na verificação do token:', error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;