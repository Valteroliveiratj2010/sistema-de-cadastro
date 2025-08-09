// backend/middleware/activityLogger.js
const { ActivityLog } = require('../database');

/**
 * Middleware para registrar atividades dos usuários
 * Deve ser usado APÓS o authMiddleware
 */
const activityLogger = (action, entityType = null) => {
    return async (req, res, next) => {
        // Capturar o timestamp antes da execução
        const startTime = Date.now();
        
        // Salvar a função original de res.json para interceptar
        const originalJson = res.json;
        
        // Interceptar a resposta para capturar o status
        res.json = function(data) {
            // Restaurar a função original
            res.json = originalJson;
            
            // Registrar a atividade de forma assíncrona (não bloquear a resposta)
            logActivity(req, res, action, entityType, startTime, data).catch(err => {
                console.error('❌ Erro ao registrar atividade:', err);
            });
            
            // Chamar a função original
            return originalJson.call(this, data);
        };
        
        next();
    };
};

/**
 * Função para registrar a atividade
 */
async function logActivity(req, res, action, entityType, startTime, responseData) {
    try {
        // Verificar se o usuário está autenticado
        if (!req.user || !req.user.id) {
            return;
        }

        // Determinar o status baseado na resposta
        let status = 'success';
        if (res.statusCode >= 400) {
            status = 'error';
        } else if (res.statusCode >= 300) {
            status = 'warning';
        }

        // Extrair entityId da URL ou body
        let entityId = null;
        if (req.params.id) {
            entityId = parseInt(req.params.id);
        } else if (req.body && req.body.id) {
            entityId = parseInt(req.body.id);
        }

        // Preparar detalhes da atividade
        const details = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };

        // Adicionar informações específicas baseadas na ação
        if (action === 'login') {
            details.success = responseData && responseData.success;
        } else if (action.includes('create') || action.includes('update') || action.includes('delete')) {
            details.entityId = entityId;
            details.entityType = entityType;
        }

        // Obter IP e User Agent
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];

        // Criar o log de atividade
        await ActivityLog.create({
            userId: req.user.id,
            username: req.user.username,
            action: action,
            entityType: entityType,
            entityId: entityId,
            details: JSON.stringify(details),
            ipAddress: ipAddress,
            userAgent: userAgent,
            status: status
        });

        console.log(`📝 [ACTIVITY_LOG] ${req.user.username} - ${action} - ${entityType || 'N/A'} - ${status}`);
        
    } catch (error) {
        console.error('❌ Erro ao registrar atividade:', error);
        // Não falhar a requisição se o log falhar
    }
}

/**
 * Função para registrar atividades manuais (quando necessário)
 */
const logManualActivity = async (userId, username, action, entityType = null, entityId = null, details = null, status = 'success') => {
    try {
        await ActivityLog.create({
            userId: userId,
            username: username,
            action: action,
            entityType: entityType,
            entityId: entityId,
            details: details ? JSON.stringify(details) : null,
            status: status
        });
        
        console.log(`📝 [MANUAL_LOG] ${username} - ${action} - ${entityType || 'N/A'} - ${status}`);
    } catch (error) {
        console.error('❌ Erro ao registrar atividade manual:', error);
    }
};

module.exports = {
    activityLogger,
    logManualActivity
}; 