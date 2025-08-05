const { Sale, sequelize } = require('../database');
const { Op } = require('sequelize');

/**
 * Atualiza automaticamente o status das vendas baseado na data de vencimento
 */
async function updateSalesStatus() {
    try {
        console.log('🔄 Atualizando status das vendas...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Buscar vendas pendentes que estão vencidas
        const overdueSales = await Sale.findAll({
            where: {
                status: 'Pendente',
                dataVencimento: {
                    [Op.lt]: today
                }
            }
        });
        
        console.log(`📊 Encontradas ${overdueSales.length} vendas vencidas`);
        
        // Atualizar status para "Vencido"
        let updatedCount = 0;
        for (const sale of overdueSales) {
            await sale.update({ status: 'Vencido' });
            updatedCount++;
            console.log(`✅ Venda ID ${sale.id} atualizada para "Vencido"`);
        }
        
        console.log(`✅ ${updatedCount} vendas atualizadas automaticamente`);
        return updatedCount;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar status das vendas:', error);
        throw error;
    }
}

/**
 * Verifica e atualiza status de uma venda específica
 */
async function checkAndUpdateSaleStatus(saleId) {
    try {
        const sale = await Sale.findByPk(saleId);
        if (!sale) {
            console.log(`❌ Venda ID ${saleId} não encontrada`);
            return false;
        }
        
        // Se já está paga ou cancelada, não precisa verificar
        if (sale.status === 'Pago' || sale.status === 'Cancelado') {
            return false;
        }
        
        // Se não tem data de vencimento, não pode estar vencida
        if (!sale.dataVencimento) {
            return false;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(sale.dataVencimento);
        dueDate.setHours(0, 0, 0, 0);
        
        // Se está vencida e ainda está pendente, atualizar para vencido
        if (dueDate < today && sale.status === 'Pendente') {
            await sale.update({ status: 'Vencido' });
            console.log(`✅ Venda ID ${saleId} atualizada para "Vencido"`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ Erro ao verificar status da venda ${saleId}:`, error);
        return false;
    }
}

/**
 * Inicia o processo de atualização automática
 */
function startAutomaticStatusUpdate() {
    console.log('🚀 Iniciando atualização automática de status...');
    
    // Executar imediatamente
    updateSalesStatus();
    
    // Executar a cada hora
    setInterval(async () => {
        try {
            await updateSalesStatus();
        } catch (error) {
            console.error('❌ Erro na atualização automática:', error);
        }
    }, 60 * 60 * 1000); // 1 hora
    
    console.log('✅ Atualização automática configurada para rodar a cada hora');
}

module.exports = {
    updateSalesStatus,
    checkAndUpdateSaleStatus,
    startAutomaticStatusUpdate
}; 