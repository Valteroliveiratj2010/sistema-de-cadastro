// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// A CHAVE SECRETA DO JWT DEVE SER EXATAMENTE A MESMA QUE EM backend/routes/auth.js
// ATENÇÃO: Em produção, ambas DEVEM vir de variáveis de ambiente.
const JWT_SECRET = 'X4A1D2BZ0GUBD2QRQQATWI1INGV6BDW0P1WSTV30C4APHBAYF1095MJVEQUJ076X686XT3GIRCX3YU959EU73ASLEB07TFX8XG'; // <-- Use A MESMA CHAVE AQUI!

module.exports = (req, res, next) => {
    // 1. Obter o token do cabeçalho da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: "Bearer SEU_TOKEN_JWT"

    if (!token) {
        console.log('[AUTH_MIDDLEWARE] Acesso negado: Token não fornecido.');
        return res.status(401).json({ message: 'Acesso negado: Token não fornecido.' });
    }

    try {
        // 2. Verificar o token usando a chave secreta
        const decoded = jwt.verify(token, JWT_SECRET); // Verifica a assinatura do token
        
        // 3. Anexar os dados do utilizador (id, username, role) à requisição para uso nas rotas
        req.user = decoded; 
        console.log(`[AUTH_MIDDLEWARE] Token verificado com sucesso para usuário: ${req.user.username}`);
        
        // 4. Continuar para a próxima função middleware ou rota
        next();
    } catch (error) {
        // Se a verificação falhar (token inválido, expirado, assinatura errada)
        console.error('❌ Erro na verificação do token:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
        }
        // Inclui 'JsonWebTokenError: invalid signature'
        return res.status(403).json({ message: 'Token inválido ou não autorizado.' });
    }
};
