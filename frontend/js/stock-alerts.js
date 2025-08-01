/**
 * Sistema de Alertas de Estoque - Gestor PRO
 * Gerencia alertas configuráveis para estoque baixo e crítico
 */

class StockAlertManager {
    constructor() {
        this.settings = this.loadSettings();
        this.alerts = [];
        this.init();
    }

    /**
     * Inicializar o sistema
     */
    init() {
        this.setupEventListeners();
        this.loadStockAlerts();
        this.startAutoCheck();
    }

    /**
     * Iniciar verificação automática
     */
    startAutoCheck() {
        // Verificar a cada 30 segundos
        this.autoCheckInterval = setInterval(() => {
            this.checkStockAlerts();
        }, 30000); // 30 segundos
        
        console.log('🔄 Verificação automática de alertas iniciada (30s)');
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
     * Carregar configurações salvas
     */
    loadSettings() {
        const defaultSettings = {
            warningThreshold: 10,
            criticalThreshold: 5
        };

        try {
            const saved = localStorage.getItem('stockAlertSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Erro ao carregar configurações de estoque:', error);
            return defaultSettings;
        }
    }

    /**
     * Salvar configurações
     */
    saveSettings() {
        try {
            localStorage.setItem('stockAlertSettings', JSON.stringify(this.settings));
            console.log('✅ Configurações de alerta de estoque salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Salvar configurações
        document.addEventListener('DOMContentLoaded', () => {
            const saveButton = document.getElementById('saveStockSettings');
            if (saveButton) {
                saveButton.addEventListener('click', () => this.saveStockSettings());
            }

            // Carregar configurações no modal
            const modal = document.getElementById('stockSettingsModal');
            if (modal) {
                modal.addEventListener('show.bs.modal', () => this.loadSettingsToModal());
            }
        });

        // Limpar intervalo quando a página for fechada
        window.addEventListener('beforeunload', () => {
            this.stopAutoCheck();
        });

        // Pausar verificação quando a aba não estiver ativa
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoCheck();
            } else {
                this.startAutoCheck();
            }
        });
    }

    /**
     * Carregar configurações no modal
     */
    loadSettingsToModal() {
        const warningInput = document.getElementById('warningThreshold');
        const criticalInput = document.getElementById('criticalThreshold');

        if (warningInput) {
            warningInput.value = this.settings.warningThreshold;
        }
        if (criticalInput) {
            criticalInput.value = this.settings.criticalThreshold;
        }
    }

    /**
     * Salvar configurações do modal
     */
    saveStockSettings() {
        const warningInput = document.getElementById('warningThreshold');
        const criticalInput = document.getElementById('criticalThreshold');

        if (warningInput && criticalInput) {
            const warningValue = parseInt(warningInput.value) || 10;
            const criticalValue = parseInt(criticalInput.value) || 5;

            // Validar que o limite crítico seja menor que o de aviso
            if (criticalValue >= warningValue) {
                showToast('O limite crítico deve ser menor que o limite de aviso', 'warning');
                return;
            }

            this.settings.warningThreshold = warningValue;
            this.settings.criticalThreshold = criticalValue;
            this.saveSettings();

            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('stockSettingsModal'));
            if (modal) {
                modal.hide();
            }

            // Recarregar alertas
            this.loadStockAlerts();
            showToast('Configurações salvas com sucesso!', 'success');
        }
    }

    /**
     * Carregar alertas de estoque
     */
    async loadStockAlerts() {
        try {
            console.log('🔄 Carregando alertas de estoque...');
            
            // Buscar TODOS os produtos (sem limite de página)
            const response = await api.get('/products', { limit: 10000 });
            console.log('📦 Produtos carregados para análise:', response);
            
            let products = [];
            
            // Extrair produtos da resposta
            if (response && response.products) {
                products = response.products;
            } else if (response && response.data) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            }
            
            console.log(`📊 Analisando ${products.length} produtos para alertas de estoque`);
            
            if (products.length > 0) {
                this.processStockAlerts(products);
            } else {
                console.log('❌ Nenhum produto encontrado para análise de estoque');
                this.showNoAlerts();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar alertas de estoque:', error);
            this.showNoAlerts();
        }
    }

    /**
     * Verificar alertas de estoque em tempo real
     */
    async checkStockAlerts() {
        try {
            console.log('🔍 Verificando alertas de estoque em tempo real...');
            
            // Buscar TODOS os produtos (sem limite de página)
            const response = await api.get('/products', { limit: 10000 });
            
            let products = [];
            
            // Extrair produtos da resposta
            if (response && response.products) {
                products = response.products;
            } else if (response && response.data) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            }
            
            if (products.length > 0) {
                const previousAlertsCount = this.alerts.length;
                this.processStockAlerts(products);
                
                // Verificar se houve mudança nos alertas
                if (this.alerts.length !== previousAlertsCount) {
                    console.log(`📊 Alertas atualizados: ${previousAlertsCount} → ${this.alerts.length}`);
                    
                    // Mostrar notificação se alertas foram resolvidos
                    if (this.alerts.length < previousAlertsCount) {
                        const resolvedCount = previousAlertsCount - this.alerts.length;
                        showToast(`${resolvedCount} alerta(s) de estoque resolvido(s)!`, 'success');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar alertas de estoque:', error);
        }
    }

    /**
     * Processar alertas de estoque
     */
    processStockAlerts(products) {
        this.alerts = [];
        let criticalCount = 0;
        let warningCount = 0;

        console.log(`🔍 Processando ${products.length} produtos com limites: Crítico=${this.settings.criticalThreshold}, Aviso=${this.settings.warningThreshold}`);

        products.forEach(product => {
            const stock = parseInt(product.stock) || 0;
            const productName = product.nome || product.name || 'Produto sem nome';
            
            console.log(`📦 ${productName}: Estoque=${stock}, Limite Crítico=${this.settings.criticalThreshold}, Limite Aviso=${this.settings.warningThreshold}`);
            
            if (stock <= this.settings.criticalThreshold) {
                this.alerts.push({
                    type: 'critical',
                    product: product,
                    stock: stock,
                    limit: this.settings.criticalThreshold
                });
                criticalCount++;
                console.log(`🚨 ALERTA CRÍTICO: ${productName} (Estoque: ${stock})`);
            } else if (stock <= this.settings.warningThreshold) {
                this.alerts.push({
                    type: 'warning',
                    product: product,
                    stock: stock,
                    limit: this.settings.warningThreshold
                });
                warningCount++;
                console.log(`⚠️ ALERTA AVISO: ${productName} (Estoque: ${stock})`);
            }
        });

        console.log(`📊 Resumo: ${criticalCount} críticos, ${warningCount} avisos, Total: ${this.alerts.length} alertas`);
        this.renderAlerts();
    }

    /**
     * Renderizar alertas
     */
    renderAlerts() {
        const alertsSection = document.getElementById('stockAlertsSection');
        const alertsContent = document.getElementById('stockAlertsContent');

        if (!alertsSection || !alertsContent) {
            console.log('❌ Elementos de alerta não encontrados');
            return;
        }

        if (this.alerts.length === 0) {
            this.showNoAlerts();
            return;
        }

        // Separar alertas por tipo
        const criticalAlerts = this.alerts.filter(alert => alert.type === 'critical');
        const warningAlerts = this.alerts.filter(alert => alert.type === 'warning');

        let html = '';

        // Alertas críticos (vermelhos)
        if (criticalAlerts.length > 0) {
            html += this.renderAlertGroup('critical', criticalAlerts);
        }

        // Alertas de aviso (amarelos)
        if (warningAlerts.length > 0) {
            html += this.renderAlertGroup('warning', warningAlerts);
        }

        // Verificar se a seção está visível
        const isVisible = alertsSection.style.display !== 'none';
        
        if (!isVisible) {
            // Mostrar seção com animação
            alertsSection.style.display = 'block';
            alertsSection.style.opacity = '0';
            alertsSection.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                alertsSection.style.transition = 'all 0.3s ease';
                alertsSection.style.opacity = '1';
                alertsSection.style.transform = 'translateY(0)';
            }, 10);
        }

        alertsContent.innerHTML = html;

        // Atualizar traduções
        if (window.i18n) {
            window.i18n.updateAllElements();
        }

        console.log(`✅ ${this.alerts.length} alertas de estoque renderizados`);
    }

    /**
     * Renderizar grupo de alertas
     */
    renderAlertGroup(type, alerts) {
        const isCritical = type === 'critical';
        const alertClass = isCritical ? 'danger' : 'warning';
        const icon = isCritical ? 'exclamation-circle' : 'exclamation-triangle';
        const title = isCritical ? 'criticalStock' : 'lowStock';

        let html = `
            <div class="alert alert-${alertClass} border-${alertClass} mb-3 stock-alert-container">
                <div class="d-flex align-items-center mb-2">
                    <i class="bi bi-${icon} me-2 fs-5"></i>
                    <h6 class="mb-0" data-i18n="${title}">${isCritical ? 'Estoque Crítico' : 'Estoque Baixo'}</h6>
                    <span class="badge bg-${alertClass} ms-auto stock-alert-badge">${alerts.length}</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-borderless mb-0 stock-alert-table">
                        <thead>
                            <tr>
                                <th data-i18n="productName">Nome do Produto</th>
                                <th data-i18n="currentStock">Estoque Atual</th>
                                <th data-i18n="stockLimit">Limite</th>
                                <th class="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        alerts.forEach(alert => {
            const stockClass = alert.stock === 0 ? 'text-danger fw-bold' : '';
            html += `
                <tr>
                    <td>
                        <strong>${alert.product.nome}</strong>
                        ${alert.product.sku ? `<br><small class="text-muted">SKU: ${alert.product.sku}</small>` : ''}
                    </td>
                    <td>
                        <span class="${stockClass}">${alert.stock}</span>
                    </td>
                    <td>
                        <span class="text-muted">${alert.limit}</span>
                    </td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-${alertClass} stock-alert-button" 
                                onclick="stockAlertManager.viewProduct(${alert.product.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Mostrar mensagem quando não há alertas
     */
    showNoAlerts() {
        const alertsSection = document.getElementById('stockAlertsSection');
        const alertsContent = document.getElementById('stockAlertsContent');

        if (alertsSection && alertsContent) {
            // Animar a saída se estiver visível
            if (alertsSection.style.display !== 'none') {
                alertsSection.style.transition = 'all 0.3s ease';
                alertsSection.style.opacity = '0';
                alertsSection.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    alertsSection.style.display = 'none';
                    alertsSection.style.opacity = '';
                    alertsSection.style.transform = '';
                }, 300);
            } else {
                alertsSection.style.display = 'none';
            }
        }
    }

    /**
     * Visualizar produto
     */
    viewProduct(productId) {
        // Implementar visualização do produto
        console.log('Visualizando produto:', productId);
        // Aqui você pode abrir o modal de detalhes do produto
    }

    /**
     * Atualizar alertas (chamado quando produtos são modificados)
     */
    refreshAlerts() {
        this.loadStockAlerts();
    }

    /**
     * Forçar atualização dos alertas (para debug)
     */
    forceUpdate() {
        console.log('🔄 Forçando atualização dos alertas de estoque...');
        this.loadStockAlerts();
    }

    /**
     * Mostrar informações de debug dos alertas
     */
    debugAlerts() {
        console.log('🔍 DEBUG - Informações dos Alertas:');
        console.log('📊 Configurações:', this.settings);
        console.log('🚨 Alertas ativos:', this.alerts);
        console.log('📦 Total de alertas:', this.alerts.length);
        
        const criticalAlerts = this.alerts.filter(alert => alert.type === 'critical');
        const warningAlerts = this.alerts.filter(alert => alert.type === 'warning');
        
        console.log('🔴 Alertas críticos:', criticalAlerts.length);
        console.log('🟡 Alertas de aviso:', warningAlerts.length);
    }

    /**
     * Obter configurações atuais
     */
    getSettings() {
        return this.settings;
    }

    /**
     * Definir configurações
     */
    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.loadStockAlerts();
    }
}

// Instância global do gerenciador de alertas
window.stockAlertManager = new StockAlertManager();

// Expor métodos de debug globalmente
window.debugStockAlerts = () => window.stockAlertManager.debugAlerts();
window.forceUpdateStockAlerts = () => window.stockAlertManager.forceUpdate(); 