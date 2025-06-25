// backend/middleware/roleMiddleware.js

/**
 * Middleware para verificar se o usuário tem uma das roles permitidas.
 * @param {Array<string>} allowedRoles - Um array de strings com as roles permitidas (ex: ['admin', 'gerente']).
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Pega o usuário que foi adicionado à requisição pelo authMiddleware
        const user = req.user;

        // Verifica se o usuário existe e se sua role está na lista de roles permitidas
        if (user && allowedRoles.includes(user.role)) {
            // Se a role do usuário é permitida, continua para a próxima rota/middleware
            next();
        } else {
            // Se o usuário não tem permissão, retorna um erro 403 (Forbidden)
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
        }
    };
};

module.exports = checkRole;
