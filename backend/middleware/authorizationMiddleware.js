// backend/middleware/authorizationMiddleware.js

/**
 * Middleware para verificar se o utilizador tem uma das roles permitidas.
 * Deve ser usado APÓS o authMiddleware, pois depende de req.user.role.
 *
 * @param {Array<string>} allowedRoles - Um array de strings que representa as roles permitidas (ex: ['admin', 'gerente']).
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // Verifica se req.user existe (authMiddleware deve ter anexado o utilizador)
        if (!req.user || !req.user.role) {
            console.warn('[AUTH_ROLE] Acesso negado: Usuário ou role não definidos. authMiddleware pode ter falhado ou não foi usado.');
            return res.status(403).json({ message: 'Acesso proibido: Informações de usuário incompletas.' });
        }

        const userRole = req.user.role;

        // Verifica se a role do usuário está na lista de roles permitidas
        if (allowedRoles.includes(userRole)) {
            console.log(`[AUTH_ROLE] Usuário '${req.user.username}' (Role: '${userRole}') autorizado.`);
            next(); // O usuário tem permissão, continue para a próxima função
        } else {
            console.warn(`[AUTH_ROLE] Acesso negado: Usuário '${req.user.username}' (Role: '${userRole}') não tem permissão para esta ação. Roles permitidas: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ message: 'Acesso proibido: Você não tem permissão para realizar esta ação.' });
        }
    };
};

module.exports = authorizeRole;
