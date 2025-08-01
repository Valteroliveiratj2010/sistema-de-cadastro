/**
 * Sistema de Notificações Toast para Alertas de Estoque - Gestor PRO
 * Sistema discreto que mostra notificações apenas quando há alertas reais
 */

class StockNotificationManager {
    constructor() {
        this.settings = this.loadSettings();
        this.alerts = [];
        this.activeNotifications = new Set();
        this.init();
    }

    /**
     * Inicializar o sistema
     */
    init() {
        this.setupEventListeners();
        this.startAutoCheck();
    }

    /**
     * Carregar configurações salvas
     */
    loadSettings() {
        const defaultSettings = {
            warningThreshold: 10,
            criticalThreshold: 5,
            notificationDuration: 8000, // 8 segundos
            checkInterval: 30000 // 30 segundos
        };

        try {
            const saved = localStorage.getItem('stockNotificationSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Erro ao carregar configurações de notificação:', error);
            return defaultSettings;
        }
    }

    /**
     * Salvar configurações
     */
    saveSettings() {
        try {
            localStorage.setItem('stockNotificationSettings', JSON.stringify(this.settings));
            console.log('✅ Configurações de notificação salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Limpar intervalo quando a página for fechada
        window.addEventListener('beforeunload', () => {
            this.stopAutoCheck();
        });

        // Pausar verificação quando a aba não estiver ativa (opcional)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Aba oculta - mantendo verificação ativa');
                // Não parar a verificação para manter alertas funcionando
            } else {
                console.log('📱 Aba visível - verificação já ativa');
            }
        });
    }

    /**
     * Iniciar verificação automática
     */
    startAutoCheck() {
        // Parar verificação anterior se existir
        this.stopAutoCheck();
        
        // Verificar a cada 30 segundos
        this.autoCheckInterval = setInterval(() => {
            this.checkStockAlerts();
        }, this.settings.checkInterval);
        
        console.log('🔄 Verificação automática de alertas iniciada');
        
        // Fazer primeira verificação imediatamente
        setTimeout(() => {
            this.checkStockAlerts();
        }, 1000);
    }

    /**
     * Parar verificação automática
     */
    stopAutoCheck() {
        if (this.autoCheckInterval) {
            clearInterval(this.autoCheckInterval);
            this.autoCheckInterval = null;
            console.log('⏹️ Verificação automática de alertas parada');
        }
    }

    /**
     * Verificar alertas de estoque
     */
    async checkStockAlerts() {
        try {
            console.log('🔍 Verificando alertas de estoque...');
            
            // Verificar se a API está disponível
            if (typeof api === 'undefined') {
                console.log('⚠️ API não disponível, aguardando...');
                return;
            }
            
            // Buscar TODOS os produtos
            const response = await api.get('/products', { limit: 10000 });
            console.log('📦 Resposta da API:', response);
            
            let products = [];
            
            // Extrair produtos da resposta
            if (response && response.products) {
                products = response.products;
            } else if (response && response.data) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            }
            
            console.log(`📊 ${products.length} produtos carregados para análise`);
            
            if (products.length > 0) {
                this.processStockAlerts(products);
            } else {
                console.log('📭 Nenhum produto encontrado para análise');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar alertas de estoque:', error);
            
            // Em caso de erro, tentar novamente em 10 segundos
            setTimeout(() => {
                console.log('🔄 Tentando novamente após erro...');
                this.checkStockAlerts();
            }, 10000);
        }
    }

    /**
     * Processar alertas de estoque
     */
    processStockAlerts(products) {
        const previousAlerts = [...this.alerts];
        this.alerts = [];
        
        let criticalCount = 0;
        let warningCount = 0;

        products.forEach(product => {
            // Tentar diferentes nomes de campo para estoque
            const stockValue = product.estoque || product.stock || product.quantidade || product.quantity || 0;
            const stock = parseInt(stockValue) || 0;
            const productName = product.nome || product.name || 'Produto sem nome';
            
            if (stock <= this.settings.criticalThreshold) {
                this.alerts.push({
                    type: 'critical',
                    product: product,
                    stock: stock,
                    limit: this.settings.criticalThreshold
                });
                criticalCount++;
            } else if (stock <= this.settings.warningThreshold) {
                this.alerts.push({
                    type: 'warning',
                    product: product,
                    stock: stock,
                    limit: this.settings.warningThreshold
                });
                warningCount++;
            }
        });

        console.log(`📊 Resumo: ${criticalCount} críticos, ${warningCount} avisos, Total: ${this.alerts.length} alertas`);

        // Sempre mostrar alertas se existirem (independente de ser primeira verificação)
        if (this.alerts.length > 0) {
            if (previousAlerts.length === 0) {
                // Primeira verificação - mostrar todos os alertas existentes
                console.log('🆕 Primeira verificação - mostrando alertas existentes');
                this.showNewAlertsNotification(this.alerts);
            } else {
                // Verificar mudanças nos alertas
                this.handleAlertChanges(previousAlerts);
            }
        } else {
            console.log('📭 Nenhum alerta encontrado');
        }
        
        // Debug: verificar se as notificações estão sendo criadas
        console.log(`🔔 Total de alertas processados: ${this.alerts.length}`);
        console.log(`🔔 Notificações ativas: ${this.activeNotifications.size}`);
    }

    /**
     * Lidar com mudanças nos alertas
     */
    handleAlertChanges(previousAlerts) {
        console.log('🔄 Analisando mudanças nos alertas...');
        console.log(`📊 Alertas anteriores: ${previousAlerts.length}`);
        console.log(`📊 Alertas atuais: ${this.alerts.length}`);
        
        const currentAlertIds = this.alerts.map(alert => alert.product.id);
        const previousAlertIds = previousAlerts.map(alert => alert.product.id);
        
        // Novos alertas
        const newAlerts = this.alerts.filter(alert => !previousAlertIds.includes(alert.product.id));
        
        // Alertas resolvidos
        const resolvedAlerts = previousAlerts.filter(alert => !currentAlertIds.includes(alert.product.id));
        
        // Alertas modificados (mesmo produto, mas estoque mudou)
        const modifiedAlerts = this.alerts.filter(currentAlert => {
            const previousAlert = previousAlerts.find(prev => prev.product.id === currentAlert.product.id);
            return previousAlert && previousAlert.stock !== currentAlert.stock;
        });
        
        console.log(`🆕 Novos alertas: ${newAlerts.length}`);
        console.log(`✅ Alertas resolvidos: ${resolvedAlerts.length}`);
        console.log(`🔄 Alertas modificados: ${modifiedAlerts.length}`);
        
        // Se há mudanças significativas, atualizar notificações
        if (newAlerts.length > 0 || resolvedAlerts.length > 0 || modifiedAlerts.length > 0) {
            console.log('🔄 Mudanças detectadas - atualizando notificações');
            
            // Limpar notificações antigas
            this.clearOldNotifications();
            
            // Mostrar notificações para novos alertas
            if (newAlerts.length > 0) {
                console.log('🔔 Mostrando novos alertas');
                this.showNewAlertsNotification(newAlerts);
            }
            
            // Mostrar notificações para alertas modificados
            if (modifiedAlerts.length > 0) {
                console.log('🔔 Mostrando alertas modificados');
                this.showNewAlertsNotification(modifiedAlerts);
            }
            
            // Mostrar notificação para alertas resolvidos
            if (resolvedAlerts.length > 0) {
                console.log('✅ Mostrando alertas resolvidos');
                this.showResolvedAlertsNotification(resolvedAlerts);
            }
        } else if (this.alerts.length > 0 && this.activeNotifications.size === 0) {
            // Se há alertas ativos mas não há notificações visíveis
            console.log('🔔 Alertas ativos sem notificações visíveis - mostrando notificações');
            this.showNewAlertsNotification(this.alerts);
        } else if (this.alerts.length === 0 && this.activeNotifications.size > 0) {
            // Se não há alertas mas há notificações visíveis
            console.log('🧹 Limpando notificações - não há alertas ativos');
            this.clearOldNotifications();
        }
        
        // Atualizar notificações ativas
        this.updateActiveNotifications();
    }

    /**
     * Mostrar notificação para novos alertas
     */
    showNewAlertsNotification(newAlerts) {
        console.log('🔔 showNewAlertsNotification chamado com:', newAlerts.length, 'alertas');
        
        // Limpar notificações antigas antes de mostrar novas
        this.clearOldNotifications();
        
        const criticalAlerts = newAlerts.filter(alert => alert.type === 'critical');
        const warningAlerts = newAlerts.filter(alert => alert.type === 'warning');
        
        console.log(`🔔 Alertas críticos: ${criticalAlerts.length}, Alertas de aviso: ${warningAlerts.length}`);
        
        let message = '';
        let type = 'info';
        
        if (criticalAlerts.length > 0) {
            message += `${criticalAlerts.length} produto(s) com estoque crítico! `;
            type = 'error';
        }
        
        if (warningAlerts.length > 0) {
            message += `${warningAlerts.length} produto(s) com estoque baixo. `;
            if (type === 'info') type = 'warning';
        }
        
        message += 'Clique para ver detalhes.';
        
        console.log(`🔔 Mensagem da notificação: "${message}"`);
        console.log(`🔔 Tipo da notificação: ${type}`);
        
        this.showToastNotification(message, type, true);
    }

    /**
     * Mostrar notificação para alertas resolvidos
     */
    showResolvedAlertsNotification(resolvedAlerts) {
        const message = `${resolvedAlerts.length} alerta(s) de estoque resolvido(s)!`;
        this.showToastNotification(message, 'success', false);
    }

    /**
     * Mostrar notificação toast
     */
    showToastNotification(message, type = 'info', isActionable = false) {
        console.log('🔔 showToastNotification chamado:', { message, type, isActionable });
        
        const notificationId = 'stock-alert-' + Date.now();
        
        // Criar elemento da notificação
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `stock-notification stock-notification-${type}`;
        
        // Adicionar classe actionable para notificações críticas
        if (type === 'critical' || type === 'error') {
            notification.classList.add('stock-notification-actionable');
        }
        notification.innerHTML = `
            <div class="stock-notification-content">
                <div class="stock-notification-icon">
                    <i class="bi bi-${this.getIconForType(type)}"></i>
                </div>
                <div class="stock-notification-message">
                    ${message}
                </div>
                <div class="stock-notification-actions">
                    ${isActionable ? '<button class="btn btn-sm btn-outline-light" onclick="stockNotificationManager.showAlertsModal()">Ver</button>' : ''}
                    <button class="btn btn-sm btn-outline-light" onclick="stockNotificationManager.dismissNotification('${notificationId}')">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar ao container de notificações
        const container = this.getNotificationContainer();
        console.log('🔔 Container de notificações:', container);
        
        container.appendChild(notification);
        console.log('🔔 Notificação adicionada ao DOM');
        
        // Adicionar à lista de notificações ativas
        this.activeNotifications.add(notificationId);
        
        // Para alertas críticos, manter a notificação até que o usuário feche ou o estoque seja reposto
        if (type === 'critical' || type === 'error') {
            // Não auto-remover alertas críticos
            console.log('🔔 Notificação crítica - não será auto-removida');
        } else {
            // Auto-remover apenas notificações não críticas
            setTimeout(() => {
                this.dismissNotification(notificationId);
            }, this.settings.notificationDuration);
        }
        
        console.log(`🔔 Notificação criada com ID: ${notificationId}`);
        console.log(`🔔 Notificação mostrada: ${message}`);
        
        // Verificar se a notificação está visível
        setTimeout(() => {
            const createdNotification = document.getElementById(notificationId);
            if (createdNotification) {
                console.log('🔔 Notificação encontrada no DOM:', createdNotification);
                console.log('🔔 Estilos aplicados:', window.getComputedStyle(createdNotification));
            } else {
                console.error('❌ Notificação não encontrada no DOM!');
            }
        }, 100);
    }

    /**
     * Obter ícone para o tipo de notificação
     */
    getIconForType(type) {
        switch (type) {
            case 'error':
            case 'critical':
                return 'exclamation-circle';
            case 'warning':
                return 'exclamation-triangle';
            case 'success':
                return 'check-circle';
            default:
                return 'info-circle';
        }
    }

    /**
     * Obter container de notificações
     */
    getNotificationContainer() {
        let container = document.getElementById('stock-notifications-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'stock-notifications-container';
            container.className = 'stock-notifications-container';
            document.body.appendChild(container);
        }
        
        return container;
    }

    /**
     * Descartar notificação
     */
    dismissNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.add('stock-notification-dismissing');
            setTimeout(() => {
                notification.remove();
                this.activeNotifications.delete(notificationId);
            }, 300);
        }
    }

    /**
     * Limpar notificações antigas
     */
    clearOldNotifications() {
        console.log('🧹 Limpando notificações antigas...');
        const container = this.getNotificationContainer();
        const oldNotifications = container.querySelectorAll('.stock-notification');
        
        oldNotifications.forEach(notification => {
            notification.remove();
        });
        
        this.activeNotifications.clear();
        console.log(`🧹 ${oldNotifications.length} notificações antigas removidas`);
    }

    /**
     * Atualizar notificações ativas
     */
    updateActiveNotifications() {
        // Para alertas críticos, manter as notificações ativas
        // Só remover notificações que não são mais relevantes
        this.activeNotifications.forEach(notificationId => {
            const notification = document.getElementById(notificationId);
            if (notification) {
                // Verificar se é uma notificação crítica
                const isCritical = notification.classList.contains('stock-notification-error') || 
                                  notification.classList.contains('stock-notification-critical');
                
                // Só remover se não for crítica e não for acionável
                if (!isCritical && !notification.classList.contains('stock-notification-actionable')) {
                    console.log('🗑️ Removendo notificação não crítica:', notificationId);
                    this.dismissNotification(notificationId);
                } else {
                    console.log('🔒 Mantendo notificação crítica:', notificationId);
                }
            }
        });
    }

    /**
     * Mostrar modal de alertas (quando clicar em "Ver")
     */
    async showAlertsModal() {
        console.log('🔍 Abrindo modal de alertas - buscando dados frescos...');
        
        // Criar modal dinâmico
        const modalId = 'stockAlertsModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                Alertas de Estoque Ativos
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="stockAlertsModalContent">
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                                <p class="mt-2">Carregando dados de estoque...</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#stockSettingsModal">
                                Configurações
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Mostrar modal primeiro
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        try {
            // Buscar dados frescos da API
            console.log('🔄 Buscando dados frescos da API...');
            const response = await api.get('/products', { limit: 10000 });
            
            console.log('📊 Resposta completa da API:', response);
            console.log('📊 Tipo da resposta:', typeof response);
            console.log('📊 Chaves da resposta:', Object.keys(response));
            
            let products = [];
            if (response && response.products) {
                products = response.products;
                console.log('📦 Produtos extraídos de response.products');
            } else if (response && response.data) {
                products = response.data;
                console.log('📦 Produtos extraídos de response.data');
            } else if (Array.isArray(response)) {
                products = response;
                console.log('📦 Produtos extraídos diretamente do array');
            } else {
                console.log('❌ Estrutura de resposta não reconhecida');
                console.log('📊 Tentando acessar response.products:', response?.products);
                console.log('📊 Tentando acessar response.data:', response?.data);
            }
            
            console.log(`📦 ${products.length} produtos carregados para o modal`);
            console.log('📋 Dados dos produtos:', products);
            
            // Verificar estrutura de cada produto
            if (products.length > 0) {
                console.log('🔍 Estrutura do primeiro produto:');
                const firstProduct = products[0];
                console.log('📊 Chaves do produto:', Object.keys(firstProduct));
                console.log('📊 Produto completo:', firstProduct);
                console.log('📊 Estoque (raw):', firstProduct.stock);
                console.log('📊 Estoque (parsed):', parseInt(firstProduct.stock));
                console.log('📊 Tipo do estoque:', typeof firstProduct.stock);
            }
            
            // Processar alertas com dados frescos
            const freshAlerts = this.processProductsForAlerts(products);
            
            // Preencher conteúdo do modal com dados frescos
            const content = document.getElementById('stockAlertsModalContent');
            if (freshAlerts.length === 0) {
                content.innerHTML = `
                    <div class="text-center">
                        <i class="bi bi-check-circle text-success fs-1"></i>
                        <h5 class="mt-3">Nenhum Alerta Ativo</h5>
                        <p class="text-muted">Todos os produtos estão com estoque adequado.</p>
                        <div class="mt-3">
                            <small class="text-muted">Última atualização: ${new Date().toLocaleString()}</small>
                        </div>
                    </div>
                `;
            } else {
                content.innerHTML = this.generateAlertsContentFromData(freshAlerts);
            }
            
            console.log(`✅ Modal atualizado com ${freshAlerts.length} alertas frescos`);
            
            // Adicionar timestamp de atualização
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'text-center mt-3';
            timestampDiv.innerHTML = `<small class="text-muted">Última atualização: ${new Date().toLocaleString()}</small>`;
            content.appendChild(timestampDiv);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados para o modal:', error);
            const content = document.getElementById('stockAlertsModalContent');
            content.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
                    <h5 class="mt-3">Erro ao Carregar Dados</h5>
                    <p class="text-muted">Não foi possível carregar os dados de estoque.</p>
                    <button class="btn btn-primary" onclick="stockNotificationManager.showAlertsModal()">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Processar produtos para gerar alertas frescos
     */
    processProductsForAlerts(products) {
        const alerts = [];
        
        console.log(`🔍 Processando ${products.length} produtos para alertas frescos...`);
        console.log('📋 Produtos recebidos:', products);
        
        products.forEach((product, index) => {
            // Tentar diferentes nomes de campo para estoque
            const stockValue = product.estoque || product.stock || product.quantidade || product.quantity || 0;
            const stock = parseInt(stockValue) || 0;
            const productName = product.nome || product.name || 'Produto sem nome';
            const productId = product.id || product._id || `produto_${index}`;
            
            console.log(`📦 Produto ${index + 1}:`);
            console.log(`   ID: ${productId}`);
            console.log(`   Nome: ${productName}`);
            console.log(`   Estoque (raw): ${stockValue}`);
            console.log(`   Estoque (parsed): ${stock} (tipo: ${typeof stockValue})`);
            console.log(`   SKU: ${product.sku || 'N/A'}`);
            console.log(`   Limite Crítico: ${this.settings.criticalThreshold}`);
            console.log(`   Limite Aviso: ${this.settings.warningThreshold}`);
            
            if (stock <= this.settings.criticalThreshold) {
                alerts.push({
                    type: 'critical',
                    product: product,
                    stock: stock,
                    limit: this.settings.criticalThreshold
                });
                console.log(`🚨 ALERTA CRÍTICO FRESCO: ${productName} (Estoque: ${stock})`);
            } else if (stock <= this.settings.warningThreshold) {
                alerts.push({
                    type: 'warning',
                    product: product,
                    stock: stock,
                    limit: this.settings.warningThreshold
                });
                console.log(`⚠️ ALERTA AVISO FRESCO: ${productName} (Estoque: ${stock})`);
            } else {
                console.log(`✅ Estoque normal: ${productName} (Estoque: ${stock})`);
            }
        });
        
        console.log(`📊 Resumo de alertas frescos: ${alerts.length} alertas encontrados`);
        return alerts;
    }

    /**
     * Gerar conteúdo dos alertas para o modal
     */
    generateAlertsContent() {
        if (this.alerts.length === 0) {
            return '<p class="text-muted">Nenhum alerta ativo no momento.</p>';
        }
        
        const criticalAlerts = this.alerts.filter(alert => alert.type === 'critical');
        const warningAlerts = this.alerts.filter(alert => alert.type === 'warning');
        
        let html = '';
        
        // Alertas críticos
        if (criticalAlerts.length > 0) {
            html += this.generateAlertGroup('critical', criticalAlerts);
        }
        
        // Alertas de aviso
        if (warningAlerts.length > 0) {
            html += this.generateAlertGroup('warning', warningAlerts);
        }
        
        return html;
    }

    /**
     * Gerar conteúdo dos alertas a partir de dados frescos
     */
    generateAlertsContentFromData(freshAlerts) {
        if (freshAlerts.length === 0) {
            return '<p class="text-muted">Nenhum alerta ativo no momento.</p>';
        }
        
        const criticalAlerts = freshAlerts.filter(alert => alert.type === 'critical');
        const warningAlerts = freshAlerts.filter(alert => alert.type === 'warning');
        
        let html = '';
        
        // Alertas críticos
        if (criticalAlerts.length > 0) {
            html += this.generateAlertGroup('critical', criticalAlerts);
        }
        
        // Alertas de aviso
        if (warningAlerts.length > 0) {
            html += this.generateAlertGroup('warning', warningAlerts);
        }
        
        return html;
    }

    /**
     * Gerar grupo de alertas
     */
    generateAlertGroup(type, alerts) {
        const isCritical = type === 'critical';
        const alertClass = isCritical ? 'danger' : 'warning';
        const icon = isCritical ? 'exclamation-circle' : 'exclamation-triangle';
        const title = isCritical ? 'Estoque Crítico' : 'Estoque Baixo';

        return `
            <div class="alert alert-${alertClass} border-${alertClass} mb-3">
                <div class="d-flex align-items-center mb-2">
                    <i class="bi bi-${icon} me-2 fs-5"></i>
                    <h6 class="mb-0">${title}</h6>
                    <span class="badge bg-${alertClass} ms-auto">${alerts.length}</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-borderless mb-0">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Estoque Atual</th>
                                <th>Limite</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${alerts.map(alert => `
                                <tr>
                                    <td>
                                        <strong>${alert.product.nome || alert.product.name}</strong>
                                        ${alert.product.sku ? `<br><small class="text-muted">SKU: ${alert.product.sku}</small>` : ''}
                                    </td>
                                    <td>
                                        <span class="${alert.stock === 0 ? 'text-danger fw-bold' : ''}">${alert.stock}</span>
                                    </td>
                                    <td>
                                        <span class="text-muted">${alert.limit}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Definir configurações
     */
    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.checkStockAlerts();
    }

    /**
     * Obter configurações atuais
     */
    getSettings() {
        return this.settings;
    }

    /**
     * Forçar verificação
     */
    forceCheck() {
        console.log('🔄 Forçando verificação de alertas...');
        
        // Limpar alertas anteriores para forçar nova análise
        const previousAlerts = [...this.alerts];
        this.alerts = [];
        
        // Fazer nova verificação
        this.checkStockAlerts().then(() => {
            // Após verificação, forçar análise de mudanças
            if (previousAlerts.length > 0 || this.alerts.length > 0) {
                console.log('🔄 Forçando análise de mudanças após verificação...');
                this.handleAlertChanges(previousAlerts);
            }
        });
    }

    /**
     * Forçar exibição de alertas ativos
     */
    forceShowActiveAlerts() {
        console.log('🚨 Forçando exibição de alertas ativos...');
        console.log(`📊 Alertas ativos: ${this.alerts.length}`);
        console.log(`📊 Notificações visíveis: ${this.activeNotifications.size}`);
        
        if (this.alerts.length > 0) {
            console.log('🔔 Mostrando alertas ativos...');
            this.showNewAlertsNotification(this.alerts);
        } else {
            console.log('📭 Nenhum alerta ativo para mostrar');
        }
    }

    /**
     * Verificar alertas imediatamente (para debug)
     */
    debugCheck() {
        console.log('🔍 DEBUG - Verificando alertas com logs detalhados...');
        console.log('📊 Configurações atuais:', this.settings);
        console.log('🚨 Alertas ativos:', this.alerts);
        this.checkStockAlerts();
    }

    /**
     * Mostrar alertas ativos (para debug)
     */
    showActiveAlerts() {
        if (this.alerts.length === 0) {
            console.log('📭 Nenhum alerta ativo no momento');
            return;
        }
        
        console.log(`📊 ${this.alerts.length} alertas ativos:`);
        this.alerts.forEach((alert, index) => {
            console.log(`${index + 1}. ${alert.product.nome || alert.product.name} - Estoque: ${alert.stock} (${alert.type})`);
        });
        
        // Verificar se há notificações visíveis
        const container = this.getNotificationContainer();
        const visibleNotifications = container.querySelectorAll('.stock-notification');
        console.log(`🔔 Notificações visíveis no DOM: ${visibleNotifications.length}`);
        
        if (visibleNotifications.length === 0 && this.alerts.length > 0) {
            console.log('⚠️ Alertas ativos mas sem notificações visíveis - forçando exibição');
            this.forceShowActiveAlerts();
        }
    }
}

// Instância global do gerenciador de notificações
window.stockNotificationManager = new StockNotificationManager();

// Expor métodos de debug globalmente
window.debugStockAlerts = () => window.stockNotificationManager.debugCheck();
window.showActiveAlerts = () => window.stockNotificationManager.showActiveAlerts();
window.forceCheckAlerts = () => window.stockNotificationManager.forceCheck();

// Método de teste para forçar notificação
window.testNotification = () => {
    if (window.stockNotificationManager) {
        console.log('🧪 Testando notificação...');
        window.stockNotificationManager.showToastNotification('Teste de notificação - 2 produtos com estoque crítico!', 'critical', true);
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para forçar verificação e mostrar alertas
window.forceShowAlerts = () => {
    if (window.stockNotificationManager) {
        console.log('🚨 Forçando exibição de alertas...');
        window.stockNotificationManager.forceShowActiveAlerts();
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para verificar status das notificações
window.checkNotificationStatus = () => {
    if (window.stockNotificationManager) {
        const container = window.stockNotificationManager.getNotificationContainer();
        const notifications = container.querySelectorAll('.stock-notification');
        
        console.log('🔍 Status das notificações:');
        console.log(`📊 Total de notificações no DOM: ${notifications.length}`);
        console.log(`📊 Alertas ativos: ${window.stockNotificationManager.alerts.length}`);
        console.log(`📊 Notificações ativas (Set): ${window.stockNotificationManager.activeNotifications.size}`);
        
        notifications.forEach((notification, index) => {
            const classes = notification.className;
            const isActionable = notification.classList.contains('stock-notification-actionable');
            const isDismissing = notification.classList.contains('stock-notification-dismissing');
            
            console.log(`📋 Notificação ${index + 1}:`);
            console.log(`   ID: ${notification.id}`);
            console.log(`   Classes: ${classes}`);
            console.log(`   Acionável: ${isActionable}`);
            console.log(`   Removendo: ${isDismissing}`);
        });
        
        // Mostrar detalhes dos alertas ativos
        if (window.stockNotificationManager.alerts.length > 0) {
            console.log('📊 Detalhes dos alertas ativos:');
            window.stockNotificationManager.alerts.forEach((alert, index) => {
                console.log(`   ${index + 1}. ${alert.product.nome || alert.product.name}: Estoque=${alert.stock}, Tipo=${alert.type}`);
            });
        }
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para forçar atualização completa
window.forceUpdateAlerts = () => {
    if (window.stockNotificationManager) {
        console.log('🔄 Forçando atualização completa dos alertas...');
        window.stockNotificationManager.forceCheck();
        
        // Aguardar um pouco e verificar status
        setTimeout(() => {
            window.checkNotificationStatus();
        }, 2000);
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para abrir modal com dados frescos
window.openFreshAlertsModal = () => {
    if (window.stockNotificationManager) {
        console.log('🔍 Abrindo modal com dados frescos...');
        window.stockNotificationManager.showAlertsModal();
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para forçar refresh da API e abrir modal
window.forceRefreshAndOpenModal = async () => {
    if (window.stockNotificationManager) {
        console.log('🔄 Forçando refresh da API e abrindo modal...');
        
        try {
            // Forçar refresh da API com cache busting
            const timestamp = Date.now();
            const response = await api.get(`/products?limit=10000&_t=${timestamp}`);
            
            console.log('📊 Resposta da API com cache busting:', response);
            
            // Abrir modal com dados frescos
            window.stockNotificationManager.showAlertsModal();
            
        } catch (error) {
            console.error('❌ Erro ao forçar refresh:', error);
            // Tentar abrir modal mesmo assim
            window.stockNotificationManager.showAlertsModal();
        }
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
};

// Método para abrir modal com dados frescos
window.openFreshAlertsModal = () => {
    if (window.stockNotificationManager) {
        console.log('🔍 Abrindo modal de alertas de estoque...');
        window.stockNotificationManager.showAlertsModal();
    } else {
        console.error('❌ Sistema de notificações não encontrado');
    }
}; 