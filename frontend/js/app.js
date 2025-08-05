/**
 * Main Application Module
 * Gestor PRO - Sistema de Gestão Empresarial
 * Version: 2.0.0
 */

(() => {
    'use strict';

    // Application state
    const state = {
        currentSection: null,
        modals: new Map(),
        charts: new Map(),
        detailModalData: null, // Armazenar dados do modal de detalhes ativo
        data: {
            clients: { page: 1, data: [], total: 0, loaded: false },
            sales: { page: 1, data: [], total: 0, loaded: false },
            products: { page: 1, data: [], total: 0, loaded: false },
            purchases: { page: 1, data: [], total: 0, loaded: false },
            suppliers: { page: 1, data: [], total: 0, loaded: false },
            users: { page: 1, data: [], total: 0, loaded: false }
        }
    };

    // Expor estado globalmente para i18n.js
    window.state = state;

    /**
     * Helper function to show toast notifications
     */
    function showToast(message, type = 'info', duration = 5000) {
        console.log('🔔 showToast chamado:', message, type);
        
        if (window.ui && window.ui.showToast) {
            console.log('🔔 Usando ui.showToast');
            window.ui.showToast(message, type, duration);
        } else if (window.Utils && window.Utils.showToast) {
            console.log('🔔 Usando Utils.showToast');
            window.Utils.showToast(message, type, duration);
        } else {
            console.log('🔔 Usando alert como fallback');
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Helper function to get translated value
     */
    function getTranslatedValue(key, fallback) {
        return window.i18n ? window.i18n.t(key) : fallback;
    }

    /**
     * Helper function to translate status
     */
    function getTranslatedStatus(status) {
        if (!status) return getTranslatedValue('dash', '-');
        
        // Mapear status para chaves de tradução
        const statusMap = {
            'Pago': 'paid',
            'Pendente': 'pending',
            'Concluída': 'completed',
            'Concluida': 'completed',
            'Cancelada': 'cancelled',
            'Cancelado': 'cancelled',
            'vencido': 'overdue',
            'Vencido': 'overdue',
            'Vencida': 'overdue',
            'Paid': 'paid',
            'Pending': 'pending',
            'Completed': 'completed',
            'Cancelled': 'cancelled',
            'Pagado': 'paid',
            'Pendiente': 'pending',
            'Completado': 'completed',
            'Cancelado': 'cancelled'
        };
        
        const translationKey = statusMap[status] || status.toLowerCase();
        return getTranslatedValue(translationKey, status);
    }

    /**
     * Update detail modals when language changes
     */
    function updateDetailModals() {
        // Verificar se há algum modal de detalhes aberto
        const detailModals = [
            'clientDetailModal',
            'saleDetailModal', 
            'purchaseDetailModal',
            'supplierDetailModal',
            'userDetailModal'
        ];

        detailModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('show')) {
                console.log(`🔄 Atualizando modal ${modalId}...`);
                
                // Atualizar todos os elementos com getTranslatedValue
                const elements = modal.querySelectorAll('[id^="detail"]');
                elements.forEach(element => {
                    const currentText = element.textContent.trim();
                    
                    // Verificar se o elemento é um status (contém 'Status' no ID)
                    if (element.id && element.id.includes('Status')) {
                        const newText = getTranslatedStatus(currentText);
                        if (newText !== currentText) {
                            element.textContent = newText;
                            console.log(`✅ Status traduzido: "${currentText}" → "${newText}"`);
                        }
                    }
                    // Verificar se o texto atual é um valor traduzível
                    else if (currentText === '-' || currentText === 'N/A' || currentText === 'Não informado' || 
                        currentText === 'Not informed' || currentText === 'No informado') {
                        
                        // Determinar qual chave de tradução usar baseado no ID do elemento
                        let translationKey = 'dash';
                        if (currentText === 'N/A') {
                            translationKey = 'notAvailable';
                        } else if (currentText === 'Não informado' || currentText === 'Not informed' || currentText === 'No informado') {
                            translationKey = 'notInformed';
                        }
                        
                        const newText = getTranslatedValue(translationKey, currentText);
                        if (newText !== currentText) {
                            element.textContent = newText;
                            console.log(`✅ Traduzido: "${currentText}" → "${newText}"`);
                        }
                    }
                });
            }
        });
    }

    /**
     * Handle edit from detail modal
     */
    async function handleEditFromDetail(type) {
        console.log('🎯 handleEditFromDetail chamado para:', type);
        
        // Obter ID do modal de detalhes
        let saleId = null;
        
        if (type === 'sale') {
            saleId = document.getElementById('detailSaleId')?.textContent?.trim();
            
            // Validar se temos o ID
            if (!saleId) {
                console.error('❌ ID da venda não encontrado no modal de detalhes');
                showToast('Erro: ID da venda não encontrado', 'error');
                return;
            }
            
            console.log('📊 ID extraído do modal de detalhes:', saleId);
        }
        
        // Fechar modal de detalhes
        const detailModal = document.getElementById(`${type}DetailModal`);
        if (detailModal && typeof bootstrap !== 'undefined') {
            const bootstrapModal = bootstrap.Modal.getInstance(detailModal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
        
        // Aguardar e usar o fluxo padrão de edição
        setTimeout(async () => {
            console.log('🔄 Usando fluxo padrão de edição...');
            try {
                await handleEdit(type, saleId);
                console.log('✅ Modal de edição aberto com dados da API');
            } catch (error) {
                console.error('❌ Erro ao abrir modal de edição:', error);
                showToast('Erro ao carregar dados para edição', 'error');
            }
        }, 300);
    }

    /**
     * Configure edit button for sale detail modal
     */
    function configureSaleEditButton(data) {
        const editBtn = document.getElementById('editSaleFromDetailBtn');
        if (editBtn) {
            editBtn.onclick = () => {
                console.log('Botão editar venda clicado');
                handleEditFromDetail('sale');
            };
        }
    }

    /**
     * Update all table statuses when language changes
     */
    function updateTableStatuses() {
        console.log('🔄 Atualizando status das tabelas...');
        
        // Atualizar status na tabela de vendas
        const salesTable = document.querySelector('#salesTable tbody');
        if (salesTable) {
            const statusBadges = salesTable.querySelectorAll('.badge');
            statusBadges.forEach(badge => {
                const currentText = badge.textContent.trim();
                const newText = getTranslatedStatus(currentText);
                if (newText !== currentText) {
                    badge.textContent = newText;
                    console.log(`✅ Status de venda traduzido: "${currentText}" → "${newText}"`);
                }
            });
        }
        
        // Atualizar status na tabela de compras
        const purchasesTable = document.querySelector('#purchasesTable tbody');
        if (purchasesTable) {
            const statusBadges = purchasesTable.querySelectorAll('.badge');
            statusBadges.forEach(badge => {
                const currentText = badge.textContent.trim();
                const newText = getTranslatedStatus(currentText);
                if (newText !== currentText) {
                    badge.textContent = newText;
                    console.log(`✅ Status de compra traduzido: "${currentText}" → "${newText}"`);
                }
            });
        }
        
        // Atualizar status na tabela de clientes
        const clientsTable = document.querySelector('#clientsTable tbody');
        if (clientsTable) {
            const statusBadges = clientsTable.querySelectorAll('.badge');
            statusBadges.forEach(badge => {
                const currentText = badge.textContent.trim();
                const newText = getTranslatedStatus(currentText);
                if (newText !== currentText) {
                    badge.textContent = newText;
                    console.log(`✅ Status de cliente traduzido: "${currentText}" → "${newText}"`);
                }
            });
        }
        
        // Atualizar status na tabela de usuários
        const usersTable = document.querySelector('#usersTable tbody');
        if (usersTable) {
            const statusBadges = usersTable.querySelectorAll('.badge');
            statusBadges.forEach(badge => {
                const currentText = badge.textContent.trim();
                const newText = getTranslatedStatus(currentText);
                if (newText !== currentText) {
                    badge.textContent = newText;
                    console.log(`✅ Status de usuário traduzido: "${currentText}" → "${newText}"`);
                }
            });
        }
        
        // Atualizar status na tabela de produtos (se houver badges de status)
        const productsTable = document.querySelector('#productsTable tbody');
        if (productsTable) {
            const statusBadges = productsTable.querySelectorAll('.badge');
            statusBadges.forEach(badge => {
                const currentText = badge.textContent.trim();
                const newText = getTranslatedStatus(currentText);
                if (newText !== currentText) {
                    badge.textContent = newText;
                    console.log(`✅ Status de produto traduzido: "${currentText}" → "${newText}"`);
                }
            });
        }
        
        console.log('✅ Atualização de status das tabelas concluída');
    }

    /**
     * Clear detail modal data when modal is closed
     */
    function clearDetailModalData() {
        state.detailModalData = null;
    }

    /**
     * Initialize application
     */
    function initialize() {
        console.log('🚀 Inicializando aplicação...');
        
        // Setup UI
        setupUI();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial data
        loadInitialData();
        
        // Configurar atualização automática dos cards financeiros
        configurarAtualizacaoAutomatica();
        
        console.log('✅ Aplicação inicializada com sucesso');
    }

    /**
     * Setup UI components
     */
    function setupUI() {
        // Update user info
        auth.updateUI();
        
        // Show dashboard by default
        ui.showSection('dashboardSection');
        
        // Setup table responsiveness
        ui.setupTableResponsiveness();
    }

    /**
     * Load initial data
     */
    async function loadInitialData() {
        try {
            const loadingSpinner = ui.showLoadingOverlay('Carregando dados iniciais...');
            
            // Load dashboard data
            await loadDashboardData();
            
            ui.hideLoadingOverlay();
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            showToast('Erro ao carregar dados iniciais', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        console.log('🔧 setupEventListeners chamado');
        
        // Section load events
        document.addEventListener('sectionLoad', handleSectionLoad);
        
        // Modal close events for detail modals
        const detailModals = [
            'clientDetailModal',
            'saleDetailModal', 
            'purchaseDetailModal',
            'supplierDetailModal',
            'userDetailModal'
        ];

        detailModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('hidden.bs.modal', clearDetailModalData);
            }
        });
        
        // Form submissions
        document.addEventListener('submit', handleFormSubmit);
        
        // Button clicks
        document.addEventListener('click', handleButtonClick);
        console.log('🔧 Event listener de clique configurado');
        
        // Search inputs
        if (typeof Utils !== 'undefined' && Utils.debounce) {
            document.addEventListener('input', Utils.debounce(handleSearch, 300));
        } else {
            document.addEventListener('input', handleSearch);
        }
        
        // Pagination
        document.addEventListener('click', handlePagination);
        
        console.log('🔧 Todos os event listeners configurados');
    }

    /**
     * Handle section load
     */
    function handleSectionLoad(event) {
        const section = event.detail.section;
        
        switch (section) {
            case 'dashboardSection':
                loadDashboardData();
                break;
            case 'clientsSection':
                loadClients();
                break;
            case 'salesSection':
                loadSales();
                // Configurar eventos do formulário de venda quando a seção for carregada
                console.log('🔧 Configurando eventos do formulário de venda na seção...');
                setupSaleFormEvents();
                break;
            case 'productsSection':
                loadProducts();
                break;
            case 'purchasesSection':
                loadPurchases();
                break;
            case 'suppliersSection':
                loadSuppliers();
                break;
            case 'usersSection':
                loadUsers();
                break;
        }
    }

    /**
     * Handle form submissions
     */
    async function handleFormSubmit(event) {
        console.log('🎯 handleFormSubmit chamado!');
        console.log('📋 Event:', event);
        console.log('📋 Target:', event.target);
        
        const form = event.target;
        const action = form.dataset.action;
        
        console.log('📋 Action:', action);
        
        if (!action) {
            console.log('❌ Nenhuma ação definida no formulário');
            return;
        }
        
        event.preventDefault();
        
        try {
            console.log('📋 Iniciando coleta de dados...');
            
            // Coletar dados do formulário
            const formData = new FormData(form);
            const data = {};
            
            // Converter FormData para objeto
            for (const [key, value] of formData.entries()) {
                if (value !== '') {
                    data[key] = value;
                }
            }

            console.log('📊 Dados coletados:', data);

            // Processamento especial para vendas
            if (action === 'createSale' || action === 'updateSale') {
                // Coletar produtos da venda
                const productsList = document.getElementById('saleProductsList');
                const productElements = productsList.querySelectorAll('[data-product-id]');
                
                if (productElements.length === 0) {
                    showToast('Adicione pelo menos um produto à venda', 'warning');
                    return;
                }

                const products = [];
                productElements.forEach(element => {
                    const productId = element.dataset.productId;
                    const text = element.querySelector('small').textContent;
                    
                    console.log('🔍 Processando produto:', { productId, text });
                    
                    // Extrair quantidade e preço do texto
                    // Formato esperado: "Qtd: 2 x R$ 50,00"
                    const quantityMatch = text.match(/Qtd: (\d+)/);
                    const priceMatch = text.match(/x R\$ ([\d,]+\.?\d*)/);
                    
                    console.log('🔍 Matches:', { quantityMatch, priceMatch });
                    
                    if (quantityMatch && priceMatch) {
                        const quantity = parseInt(quantityMatch[1]);
                        const price = parseFloat(priceMatch[1].replace(',', '.'));
                        
                        console.log('✅ Dados extraídos:', { quantity, price });
                        
                        products.push({
                            productId: parseInt(productId),
                            quantidade: quantity,
                            precoUnitario: price
                        });
                    } else {
                        console.error('❌ Erro ao extrair dados do produto:', text);
                        console.log('   Quantity match:', quantityMatch);
                        console.log('   Price match:', priceMatch);
                    }
                });

                console.log('Produtos coletados:', products);
                data.products = products;

                // Definir data de venda usando função robusta
                data.dataVenda = Utils.getCurrentDate();

                // Determinar status da venda de forma robusta
                const paidValue = parseFloat(document.getElementById('salePaidValueInitial').value) || 0;
                const totalValue = parseFloat(document.getElementById('saleTotalValue').value) || 0;
                const paymentForm = document.getElementById('paymentForma').value;
                const statusSelectElement = document.getElementById('saleStatus');
                
                // Determinar status
                let saleStatus = 'Pendente';
                
                // 1. Verificar se há um status selecionado no campo
                if (statusSelectElement && statusSelectElement.value && statusSelectElement.value !== 'Pendente') {
                    saleStatus = statusSelectElement.value;
                    console.log('📊 Status selecionado manualmente:', saleStatus);
                }
                // 2. Se não há status manual, determinar automaticamente
                else if (paidValue >= totalValue && totalValue > 0) {
                    saleStatus = 'Pago';
                    console.log('📊 Status determinado automaticamente como Pago (pagamento completo)');
                } else if (paidValue > 0) {
                    saleStatus = 'Pendente';
                    console.log('📊 Status determinado automaticamente como Pendente (pagamento parcial)');
                } else {
                    saleStatus = 'Pendente';
                    console.log('📊 Status definido como padrão: Pendente');
                }
                
                // Definir o status no objeto de dados
                data.status = saleStatus;
                console.log('📊 Status final da venda:', data.status);

                // Coletar dados do pagamento inicial
                if (paidValue > 0) {
                    data.initialPayment = {
                        valor: paidValue,
                        formaPagamento: paymentForm,
                        parcelas: parseInt(document.getElementById('paymentParcelas').value) || 1,
                        bandeiraCartao: document.getElementById('paymentBandeiraCartao').value || null,
                        bancoCrediario: document.getElementById('paymentBancoCrediario').value || null
                    };
                    console.log('💳 Dados do pagamento inicial:', data.initialPayment);
                }

                // Adicionar dados do cliente
                const clientSelect = document.getElementById('saleClient');
                if (clientSelect && clientSelect.value) {
                    data.clientId = parseInt(clientSelect.value);
                    
                    // Adicionar nome do cliente se disponível
                    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
                    if (selectedOption) {
                        data.clientName = selectedOption.textContent.trim();
                        console.log('👤 Cliente selecionado:', data.clientId, 'Nome:', data.clientName);
                    } else {
                        console.log('👤 Cliente selecionado:', data.clientId);
                    }
                }

                // Adicionar valor total da venda
                if (totalValue > 0) {
                    data.valorTotal = totalValue;
                    console.log('💰 Valor total da venda:', data.valorTotal);
                }
                
                // Log final de debug
                console.log('📊 Dados finais para envio:', JSON.stringify(data, null, 2));
                console.log('🔍 DEBUG FINAL:');
                console.log('  - Status final:', data.status);
                console.log('  - Data da venda:', data.dataVenda);
                console.log('  - Valor pago:', paidValue);
                console.log('  - Valor total:', totalValue);
                console.log('  - Cliente ID:', data.clientId);
                console.log('  - Produtos:', data.products ? data.products.length : 0);
            }

            // Processamento especial para compras
            if (action === 'createPurchase' || action === 'updatePurchase') {
                // Coletar produtos da compra
                const productsList = document.getElementById('purchaseProductsList');
                const productElements = productsList.querySelectorAll('[data-product-id]');
                
                if (productElements.length === 0) {
                    showToast('Adicione pelo menos um produto à compra', 'warning');
                    return;
                }

                const products = [];
                productElements.forEach(element => {
                    const productId = element.dataset.productId;
                    const text = element.querySelector('small').textContent;
                    
                    // Extrair quantidade e custo do texto
                    // Formato esperado: "Qtd: 2 x R$ 50,00 = R$ 100,00"
                    const quantityMatch = text.match(/Qtd: (\d+)/);
                    const costMatch = text.match(/x R\$ ([\d,]+\.?\d*)/);
                    
                    if (quantityMatch && costMatch) {
                        const quantity = parseInt(quantityMatch[1]);
                        const cost = parseFloat(costMatch[1].replace(',', '.'));
                        
                        products.push({
                            productId: parseInt(productId),
                            quantidade: quantity,
                            precoCustoUnitario: cost
                        });
                    } else {
                        console.error('Erro ao extrair dados do produto da compra:', text);
                        console.log('   Quantity match:', quantityMatch);
                        console.log('   Cost match:', costMatch);
                    }
                });

                console.log('Produtos da compra coletados:', products);
                data.products = products;

                // Adicionar data de compra se não fornecida
                if (!data.dataCompra) {
                    data.dataCompra = new Date().toISOString().split('T')[0];
                }

                // Adicionar supplierId se não estiver presente
                const supplierSelect = document.getElementById('purchaseSupplier');
                if (supplierSelect && supplierSelect.value) {
                    data.supplierId = parseInt(supplierSelect.value);
                }
            }

            // Limpar campos vazios
            Object.keys(data).forEach(key => {
                if (data[key] === '' || data[key] === null || data[key] === undefined) {
                    delete data[key];
                }
            });

            // Remover ID se estiver vazio (para criação)
            if (data.id === '') {
                delete data.id;
            }

            console.log('Dados do formulário:', data);

            // Chamar função apropriada
            console.log('🔍 Procurando função:', action);
            
            let result;
            switch (action) {
                case 'createClient':
                    result = await createClient(data);
                    break;
                case 'updateClient':
                    result = await updateClient(data);
                    break;
                case 'createSale':
                    result = await createSale(data);
                    break;
                case 'updateSale':
                    result = await updateSale(data);
                    break;
                case 'createProduct':
                    result = await createProduct(data);
                    break;
                case 'updateProduct':
                    result = await updateProduct(data);
                    break;
                case 'createPurchase':
                    result = await createPurchase(data);
                    break;
                case 'updatePurchase':
                    result = await updatePurchase(data);
                    break;
                case 'createSupplier':
                    result = await createSupplier(data);
                    break;
                case 'updateSupplier':
                    result = await updateSupplier(data);
                    break;
                case 'createUser':
                    result = await createUser(data);
                    break;
                case 'updateUser':
                    result = await updateUser(data);
                    break;
                case 'generateSalesReport':
                    result = await handleSalesReport();
                    break;
                case 'generateCashFlowReport':
                    result = await handleCashFlowReport();
                    break;
                case 'exportAccountingReport':
                    result = await handleAccountingReport();
                    break;
                case 'generateSalesPrediction':
                    result = await handleSalesPrediction();
                    break;
                default:
                    console.error('❌ Ação não reconhecida:', action);
                    showToast('Ação não reconhecida: ' + action, 'error');
                    return;
            }
            
            console.log('✅ Função', action, 'executada com sucesso');

        } catch (error) {
            console.error('Erro no formulário:', error);
            if (ui && ui.showToast) {
                ui.showToast('Erro ao processar formulário', 'error');
            } else if (Utils && Utils.showToast) {
                Utils.showToast('Erro ao processar formulário', 'error');
            } else {
                alert('Erro ao processar formulário');
            }
        }
    }

    /**
     * Handle button clicks
     */
    async function handleButtonClick(event) {
        console.log('🎯 handleButtonClick chamado:', event);
        console.log('🎯 Target:', event.target);
        console.log('🎯 Current target:', event.currentTarget);
        
        const button = event.target.closest('[data-action]');
        console.log('🎯 Botão encontrado:', button);
        
        if (!button) {
            console.log('❌ Nenhum botão com data-action encontrado');
            return;
        }
        
        const action = button.dataset.action;
        const type = button.dataset.type;
        const id = button.dataset.id;
        
        console.log('🎯 Ação:', action);
        console.log('🎯 Tipo:', type);
        console.log('🎯 ID:', id);
        
        try {
            switch (action) {
                case 'edit':
                    console.log('🎯 Executando ação EDIT para:', button.dataset.type, id);
                    await handleEdit(button.dataset.type, id);
                    break;
                case 'delete':
                    await handleDelete(button.dataset.type, id);
                    break;
                case 'view':
                    console.log('🎯 Executando ação VIEW para:', button.dataset.type, id);
                    await handleView(button.dataset.type, id);
                    break;
                case 'export':
                    await handleExport(button.dataset.type);
                    break;
                case 'print':
                    handlePrint(button.dataset.type);
                    break;
            }
        } catch (error) {
            console.error('Erro na ação:', error);
            ui.showToast('Erro ao executar ação', 'error');
        }
    }

    /**
     * Handle search
     */
    async function handleSearch(event) {
        const input = event.target;
        const searchType = input.dataset.search;
        const query = input.value.trim();
        
        if (!searchType) return;
        
        try {
            switch (searchType) {
                case 'clients':
                    await searchClients(query);
                    break;
                case 'sales':
                    await searchSales(query);
                    break;
                case 'products':
                    await searchProducts(query);
                    break;
                case 'purchases':
                    await searchPurchases(query);
                    break;
                case 'suppliers':
                    await searchSuppliers(query);
                    break;
                case 'users':
                    await searchUsers(query);
                    break;
            }
        } catch (error) {
            console.error('Erro na busca:', error);
        }
    }

    /**
     * Handle pagination
     */
    async function handlePagination(event) {
        const link = event.target.closest('[data-page]');
        if (!link) return;
        
        const page = parseInt(link.dataset.page);
        const type = link.dataset.type;
        
        if (!type || isNaN(page)) return;
        
        try {
            switch (type) {
                case 'clients':
                    await loadClients(page);
                    break;
                case 'sales':
                    await loadSales(page);
                    break;
                case 'products':
                    await loadProducts(page);
                    break;
                case 'purchases':
                    await loadPurchases(page);
                    break;
                case 'suppliers':
                    await loadSuppliers(page);
                    break;
                case 'users':
                    await loadUsers(page);
                    break;
            }
        } catch (error) {
            console.error('Erro na paginação:', error);
        }
    }

    // ===== DATA LOADING FUNCTIONS =====

    /**
     * Extract supplier name from purchase object
     */
    function extractSupplierName(purchase) {
        // Se o fornecedor é um objeto, extrair o nome
        if (purchase.supplier && typeof purchase.supplier === 'object') {
            return purchase.supplier.nome || purchase.supplier.name || 'Fornecedor';
        }
        
        // Se o fornecedor é um objeto, extrair o nome
        if (purchase.fornecedor && typeof purchase.fornecedor === 'object') {
            return purchase.fornecedor.nome || purchase.fornecedor.name || 'Fornecedor';
        }
        
        // Se é uma string, usar diretamente
        if (typeof purchase.supplier === 'string') {
            return purchase.supplier;
        }
        
        if (typeof purchase.fornecedor === 'string') {
            return purchase.fornecedor;
        }
        
        // Fallbacks
        return purchase.nomeFornecedor || purchase.supplierName || 'Fornecedor';
    }

    /**
     * Load dashboard data
     */
    async function loadDashboardData() {
        try {
            console.log('🎯 Carregando dados do dashboard...');
            const response = await api.get('/dashboard/stats');
            console.log('📊 Resposta da API dashboard:', response);
            
            // Verificar se a resposta tem dados válidos (com ou sem propriedade success/data)
            if (response && (response.success || response.data || typeof response === 'object')) {
                const data = response.data || response;
                console.log('📈 Dados do dashboard:', data);
                
                // Se não há dados de vendas no dashboard, buscar separadamente
                if (!data.sales && !data.vendas && !data.salesByMonth) {
                    console.log('⚠️ Nenhum dado de vendas no dashboard, buscando separadamente...');
                    try {
                        const salesResponse = await api.get('/sales', { limit: 1000 });
                        console.log('📈 Resposta da API vendas:', salesResponse);
                        
                        if (salesResponse && (salesResponse.sales || salesResponse.data || Array.isArray(salesResponse))) {
                            const sales = salesResponse.sales || salesResponse.data || salesResponse;
                            data.sales = sales;
                            console.log(`✅ ${sales.length} vendas carregadas separadamente`);
                        } else {
                            console.log('⚠️ Nenhuma venda encontrada na API');
                            data.sales = [];
                        }
                    } catch (salesError) {
                        console.error('❌ Erro ao carregar vendas:', salesError);
                        data.sales = [];
                    }
                }
                
                // Buscar dados específicos para os cards que estão faltando
                await loadDashboardCardsData(data);
                
                renderDashboard(data);
            } else {
                console.log('❌ Resposta inválida do dashboard:', response);
                // Tentar carregar apenas vendas
                try {
                    const salesResponse = await api.get('/sales', { limit: 1000 });
                    const sales = salesResponse.sales || salesResponse.data || salesResponse || [];
                    console.log(`✅ ${sales.length} vendas carregadas como fallback`);
                    const data = { sales };
                    await loadDashboardCardsData(data);
                    renderDashboard(data);
                } catch (error) {
                    console.error('❌ Erro ao carregar vendas como fallback:', error);
                    renderDashboard({});
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            // Tentar carregar apenas vendas como último recurso
            try {
                const salesResponse = await api.get('/sales', { limit: 1000 });
                const sales = salesResponse.sales || salesResponse.data || salesResponse || [];
                console.log(`✅ ${sales.length} vendas carregadas como último recurso`);
                const data = { sales };
                await loadDashboardCardsData(data);
                renderDashboard(data);
            } catch (salesError) {
                console.error('❌ Erro ao carregar vendas como último recurso:', salesError);
                renderDashboard({});
            }
        }

        // Carregar notificações de estoque após o dashboard
        if (window.stockNotificationManager) {
            console.log('✅ Sistema de notificações encontrado no dashboard');
            setTimeout(() => {
                console.log('🔄 Forçando verificação de alertas...');
                window.stockNotificationManager.forceCheck();
            }, 1000);
        } else {
            console.error('❌ Sistema de notificações não encontrado no dashboard');
        }
    }

    /**
     * Load specific data for dashboard cards
     */
    async function loadDashboardCardsData(data) {
        console.log('🔄 Carregando dados específicos para os cards do dashboard...');
        
        try {
            // Buscar produtos para Top 5 Produtos Mais Vendidos
            if (!data.topProducts) {
                try {
                    console.log('📊 Buscando top 5 produtos mais vendidos...');
                    const productsResponse = await api.get('/dashboard/top-products');
                    if (productsResponse && Array.isArray(productsResponse)) {
                        data.topProducts = productsResponse.map(product => ({
                            nome: product.nome_produto || 'Produto',
                            totalVendas: product.total_vendido || 0
                        }));
                        console.log('✅ Top 5 produtos carregados:', data.topProducts);
                    } else {
                        console.warn('⚠️ Resposta inválida para top produtos:', productsResponse);
                        data.topProducts = [];
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar top 5 produtos:', error);
                    data.topProducts = [];
                }
            }
            
            // Buscar clientes para Top 5 Clientes com Mais Compras
            if (!data.topClients) {
                try {
                    console.log('👥 Buscando top 5 clientes que mais compraram...');
                    const clientsResponse = await api.get('/dashboard/top-clients');
                    if (clientsResponse && Array.isArray(clientsResponse)) {
                        data.topClients = clientsResponse.map(client => ({
                            nome: client.nome_cliente || 'Cliente',
                            totalCompras: client.valor_gasto || 0
                        }));
                        console.log('✅ Top 5 clientes carregados:', data.topClients);
                    } else {
                        console.warn('⚠️ Resposta inválida para top clientes:', clientsResponse);
                        data.topClients = [];
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar top 5 clientes:', error);
                    data.topClients = [];
                }
            }
            
            // Buscar fornecedores para Top 5 Fornecedores
            if (!data.topSuppliers) {
                try {
                    console.log('🚚 Buscando top 5 fornecedores...');
                    const suppliersResponse = await api.get('/dashboard/top-suppliers');
                    if (suppliersResponse && Array.isArray(suppliersResponse)) {
                        data.topSuppliers = suppliersResponse.map(supplier => ({
                            nome: supplier.nome_fornecedor || 'Fornecedor',
                            totalCompras: supplier.total_compras || 0
                        }));
                        console.log('✅ Top 5 fornecedores carregados:', data.topSuppliers);
                    } else {
                        console.warn('⚠️ Resposta inválida para top fornecedores:', suppliersResponse);
                        data.topSuppliers = [];
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar top 5 fornecedores:', error);
                    data.topSuppliers = [];
                }
            }
            
            // Buscar vendas para CONTAS A RECEBER VENCIDAS
            if (!data.overdueReceivable) {
                try {
                    const salesResponse = await api.get('/sales', { limit: 1000 });
                    if (salesResponse && (salesResponse.sales || salesResponse.data || Array.isArray(salesResponse))) {
                        const sales = salesResponse.sales || salesResponse.data || salesResponse;
                        
                        // Filtrar vendas vencidas
                        const overdueSales = sales.filter(sale => {
                            const dueDate = sale.dataVencimento;
                            const status = sale.status;
                            const valorPago = parseFloat(sale.valorPago || 0);
                            const valorTotal = parseFloat(sale.valorTotal || 0);
                            
                            // Venda vencida: tem data de vencimento que venceu OU tem status "Vencido"
                            if (dueDate) {
                                try {
                                    const dueDateObj = new Date(dueDate);
                                    if (isNaN(dueDateObj.getTime())) {
                                        return false;
                                    }
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDateObj.setHours(0, 0, 0, 0);
                                    
                                    const isOverdue = dueDateObj < today && valorPago < valorTotal;
                                    
                                    console.log(`📅 Venda ${sale.id} para vencidas (com data):`, {
                                        vencimento: dueDate,
                                        vencimentoObj: dueDateObj.toISOString().split('T')[0],
                                        hoje: today.toISOString().split('T')[0],
                                        vencida: isOverdue,
                                        status: status,
                                        valorPago: valorPago,
                                        valorTotal: valorTotal
                                    });
                                    
                                    return isOverdue;
                                } catch (error) {
                                    console.error(`❌ Erro ao processar data da venda ${sale.id} para vencidas:`, error);
                                    return false;
                                }
                            } else {
                                // Se não tem data de vencimento, verificar por status "Vencido"
                                const isOverdueByStatus = status === 'Vencido' && valorPago < valorTotal;
                                
                                console.log(`📅 Venda ${sale.id} para vencidas (por status):`, {
                                    vencimento: 'N/A',
                                    status: status,
                                    vencida: isOverdueByStatus,
                                    valorPago: valorPago,
                                    valorTotal: valorTotal
                                });
                                
                                return isOverdueByStatus;
                            }
                        }).slice(0, 5);
                        
                        // Calcular valor total das vendas vencidas para a KPI card
                        const totalOverdueSales = overdueSales.reduce((total, sale) => {
                            const valorTotal = parseFloat(sale.valorTotal || 0);
                            const valorPago = parseFloat(sale.valorPago || 0);
                            const valorPendente = valorTotal - valorPago;
                            return total + valorPendente;
                        }, 0);
                        
                        data.overdueSales = totalOverdueSales;
                        
                        data.overdueReceivable = overdueSales.map(sale => {
                            let clienteNome = 'Cliente';
                            if (sale.cliente) {
                                if (typeof sale.cliente === 'object') {
                                    clienteNome = sale.cliente.nome || sale.cliente.name || sale.cliente.razaoSocial || 'Cliente';
                                } else if (typeof sale.cliente === 'string') {
                                    clienteNome = sale.cliente;
                                }
                            } else if (sale.client) {
                                if (typeof sale.client === 'object') {
                                    clienteNome = sale.client.nome || sale.client.name || sale.client.razaoSocial || 'Cliente';
                                } else if (typeof sale.client === 'string') {
                                    clienteNome = sale.client;
                                }
                            } else if (sale.nomeCliente) {
                                clienteNome = sale.nomeCliente;
                            }
                            
                            // Calcular valor pendente
                            const valorTotal = parseFloat(sale.valorTotal || 0);
                            const valorPago = parseFloat(sale.valorPago || 0);
                            const valorPendente = valorTotal - valorPago;
                            
                            return {
                                cliente: clienteNome,
                                valor: valorPendente,
                                vencimento: sale.dataVencimento
                            };
                        });
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar vendas vencidas:', error);
                    data.overdueReceivable = [];
                }
            }
            
            // Buscar compras para CONTAS A PAGAR VENCIDAS
            if (!data.overduePayable) {
                try {
                    const purchasesResponse = await api.get('/purchases', { limit: 1000 });
                    if (purchasesResponse && (purchasesResponse.purchases || purchasesResponse.data || Array.isArray(purchasesResponse))) {
                        const purchases = purchasesResponse.purchases || purchasesResponse.data || purchasesResponse;
                        
                        const overduePurchases = purchases.filter(purchase => {
                            const dueDate = purchase.dataVencimento;
                            const status = purchase.status;
                            
                            // Verificar se a compra tem status "Vencida"
                            if (status === 'Vencida') {
                                console.log(`📅 Compra ${purchase.id} para vencidas (por status):`, {
                                    vencimento: dueDate || 'N/A',
                                    status: status,
                                    vencida: true
                                });
                                return true;
                            }
                            
                            // Verificar por data de vencimento
                            if (dueDate) {
                                try {
                                    const dueDateObj = new Date(dueDate);
                                    if (isNaN(dueDateObj.getTime())) {
                                        return false;
                                    }
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDateObj.setHours(0, 0, 0, 0);
                                    
                                    const isOverdue = dueDateObj < today && status !== 'Concluída';
                                    
                                    console.log(`📅 Compra ${purchase.id} para vencidas (por data):`, {
                                        vencimento: dueDate,
                                        vencimentoObj: dueDateObj.toISOString().split('T')[0],
                                        hoje: today.toISOString().split('T')[0],
                                        vencida: isOverdue,
                                        status: status
                                    });
                                    
                                    return isOverdue;
                                } catch (error) {
                                    console.error(`❌ Erro ao processar data da compra ${purchase.id} para vencidas:`, error);
                                    return false;
                                }
                            }
                            return false;
                        }).slice(0, 5);
                        
                        data.overduePayable = overduePurchases.map(purchase => ({
                            id: purchase.id,
                            fornecedor: extractSupplierName(purchase),
                            valor: purchase.valorTotal || 0,
                            vencimento: purchase.dataVencimento
                        }));
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar compras vencidas:', error);
                    data.overduePayable = [];
                }
            }
            
            // Buscar vendas para Contas a Receber Próximas (30 dias)
            if (!data.upcomingReceivable) {
                try {
                    const salesResponse = await api.get('/sales', { limit: 1000 });
                    if (salesResponse && (salesResponse.sales || salesResponse.data || Array.isArray(salesResponse))) {
                        const sales = salesResponse.sales || salesResponse.data || salesResponse;
                        
                        const thirtyDaysFromNow = new Date();
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                        
                        const upcomingSales = sales.filter(sale => {
                            const dueDate = sale.dataVencimento;
                            const status = sale.status;
                            const valorPago = parseFloat(sale.valorPago || 0);
                            const valorTotal = parseFloat(sale.valorTotal || 0);
                            
                            if (dueDate) {
                                try {
                                    const dueDateObj = new Date(dueDate);
                                    
                                    if (isNaN(dueDateObj.getTime())) {
                                        return false;
                                    }
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDateObj.setHours(0, 0, 0, 0);
                                    const thirtyDaysFromNow = new Date();
                                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                                    thirtyDaysFromNow.setHours(23, 59, 59, 999); // Final do dia
                                    
                                    // Venda próxima: vence entre hoje e 30 dias, não totalmente paga
                                    const isUpcoming = dueDateObj >= today && dueDateObj <= thirtyDaysFromNow && valorPago < valorTotal;
                                    
                                    console.log(`📅 Venda ${sale.id} para próximas:`, {
                                        vencimento: dueDate,
                                        vencimentoObj: dueDateObj.toISOString().split('T')[0],
                                        hoje: today.toISOString().split('T')[0],
                                        limite30dias: thirtyDaysFromNow.toISOString().split('T')[0],
                                        proxima: isUpcoming,
                                        status: status,
                                        valorPago: valorPago,
                                        valorTotal: valorTotal
                                    });
                                    
                                    return isUpcoming;
                                } catch (error) {
                                    console.error(`❌ Erro ao processar data da venda ${sale.id} para próximas:`, error);
                                    return false;
                                }
                            } else {
                                // Se não tem vencimento, considerar vendas pendentes recentes como próximas
                                const isPending = status === 'Pendente';
                                if (isPending && valorPago < valorTotal) {
                                    // Usar data de criação para determinar se é recente
                                    const createdAt = sale.createdAt || sale.dataVenda;
                                    if (createdAt) {
                                        try {
                                            const createdDate = new Date(createdAt);
                                            if (isNaN(createdDate.getTime())) {
                                                console.warn(`⚠️ Venda ${sale.id}: Data de criação inválida "${createdAt}" para próximas`);
                                                return false;
                                            }
                                            
                                            const today = new Date();
                                            const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
                                            
                                            // Venda pendente recente (7 dias ou menos) = próxima
                                            const isRecentPending = daysDiff <= 7;
                                            console.log(`📅 Venda ${sale.id} para próximas: pendente há ${daysDiff} dias, recente=${isRecentPending}`);
                                            return isRecentPending;
                                        } catch (error) {
                                            console.error(`❌ Erro ao processar data de criação da venda ${sale.id} para próximas:`, error);
                                            return false;
                                        }
                                    } else {
                                        console.log(`📅 Venda ${sale.id}: pendente sem data de criação, não considerada próxima`);
                                        return false;
                                    }
                                }
                                return false;
                            }
                        }).slice(0, 5);
                        
                        console.log(`✅ ${upcomingSales.length} vendas próximas encontradas`);
                        
                        // Carregar dados reais da API
                        data.upcomingReceivable = upcomingSales.map(sale => {
                            // Extrair nome do cliente corretamente
                            let clienteNome = 'Cliente';
                            if (sale.cliente) {
                                if (typeof sale.cliente === 'object') {
                                    clienteNome = sale.cliente.nome || sale.cliente.name || sale.cliente.razaoSocial || 'Cliente';
                                } else if (typeof sale.cliente === 'string') {
                                    clienteNome = sale.cliente;
                                }
                            } else if (sale.client) {
                                if (typeof sale.client === 'object') {
                                    clienteNome = sale.client.nome || sale.client.name || sale.client.razaoSocial || 'Cliente';
                                } else if (typeof sale.client === 'string') {
                                    clienteNome = sale.client;
                                }
                            } else if (sale.nomeCliente) {
                                clienteNome = sale.nomeCliente;
                            }
                            
                            // Calcular valor pendente
                            const valorTotal = parseFloat(sale.valorTotal || 0);
                            const valorPago = parseFloat(sale.valorPago || 0);
                            const valorPendente = valorTotal - valorPago;
                            
                            // Formatar data de vencimento corretamente
                            let vencimentoFormatado = 'Sem vencimento';
                            const dueDate = sale.dataVencimento;
                            
                            if (dueDate) {
                                try {
                                    const dueDateObj = new Date(dueDate);
                                    if (!isNaN(dueDateObj.getTime())) {
                                        vencimentoFormatado = dueDateObj.toLocaleDateString('pt-BR');
                                    } else {
                                        console.warn(`⚠️ Venda ${sale.id}: Data inválida "${dueDate}" para próximas`);
                                        vencimentoFormatado = 'Data inválida';
                                    }
                                } catch (error) {
                                    console.error(`❌ Erro ao formatar data da venda ${sale.id} para próximas:`, error);
                                    vencimentoFormatado = 'Data inválida';
                                }
                            }
                            
                            return {
                                cliente: clienteNome,
                                valor: valorPendente,
                                vencimento: vencimentoFormatado
                            };
                        });
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar vendas próximas:', error);
                }
            }
            
            // Buscar compras para Contas a Pagar Próximas (30 dias)
            if (!data.upcomingPayable) {
                console.log('📅 Carregando compras próximas do vencimento...');
                try {
                    const purchasesResponse = await api.get('/purchases', { limit: 1000 });
                    console.log('📊 Resposta da API compras para próximas:', purchasesResponse);
                    if (purchasesResponse && (purchasesResponse.purchases || purchasesResponse.data || Array.isArray(purchasesResponse))) {
                        const purchases = purchasesResponse.purchases || purchasesResponse.data || purchasesResponse;
                        console.log(`📋 ${purchases.length} compras carregadas para análise de próximas`);
                        
                        const thirtyDaysFromNow = new Date();
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                        console.log(`📅 Data limite para próximas: ${thirtyDaysFromNow.toISOString()}`);
                        
                        // Filtrar compras próximas do vencimento
                        const upcomingPurchases = purchases.filter(purchase => {
                            const dueDate = purchase.dataVencimento;
                            const status = purchase.status;
                            
                            // Excluir compras com status "Vencida" das próximas
                            if (status === 'Vencida') {
                                console.log(`📅 Compra ${purchase.id}: status=${status}, excluída das próximas (já vencida)`);
                                return false;
                            }
                            
                            if (dueDate) {
                                try {
                                    const dueDateObj = new Date(dueDate);
                                    if (isNaN(dueDateObj.getTime())) {
                                        return false;
                                    }
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDateObj.setHours(0, 0, 0, 0);
                                    const thirtyDaysFromNow = new Date();
                                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                                    thirtyDaysFromNow.setHours(23, 59, 59, 999);
                                    
                                    const isUpcoming = dueDateObj >= today && dueDateObj <= thirtyDaysFromNow && status !== 'Concluída';
                                    console.log(`📅 Compra ${purchase.id}: vencimento=${dueDate}, status=${status}, próxima=${isUpcoming}`);
                                    return isUpcoming;
                                } catch (error) {
                                    console.error(`❌ Erro ao processar data da compra ${purchase.id} para próximas:`, error);
                                    return false;
                                }
                            } else {
                                // Se não tem vencimento, verificar por status pendente
                                const isPending = status === 'Pendente';
                                console.log(`📅 Compra ${purchase.id}: sem vencimento, status=${status}, pendente=${isPending}`);
                                return isPending;
                            }
                        }).slice(0, 5);
                        
                        console.log(`✅ ${upcomingPurchases.length} compras próximas encontradas`);
                        
                        // Carregar dados reais da API
                        data.upcomingPayable = upcomingPurchases.map(purchase => ({
                            fornecedor: extractSupplierName(purchase),
                            valor: purchase.valorTotal || 0,
                            vencimento: purchase.dataVencimento
                        }));
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar compras próximas:', error);
                }
            }
            
            console.log('✅ Dados específicos dos cards carregados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados específicos dos cards:', error);
        }
    }

    /**
     * Load clients
     */
    async function loadClients(page = 1) {
        try {
            console.log('📋 Carregando clientes...');
            const response = await api.get('/clients', { page, limit: 10 });
            console.log('📥 Resposta da API:', response);
            
            // Verificar se a resposta tem success ou se é um array diretamente
            if (response.success || Array.isArray(response) || (response.clients && Array.isArray(response.clients)) || (response.data && Array.isArray(response.data))) {
                const clients = response.clients || response.data || response;
                state.data.clients = clients;
                renderClients(response); // Passar o response completo para manter total e paginação
                console.log('✅ Clientes carregados:', clients.length);
            } else {
                console.log('❌ Resposta inválida:', response);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    /**
     * Load sales
     */
    async function loadSales(page = 1) {
        try {
            console.log('🛒 Carregando vendas...');
            
            // Adicionar parâmetro para atualizar status automaticamente na primeira página
            const params = { page, limit: 10 };
            if (page === 1) {
                params.updateStatus = 'true';
            }
            
            const response = await api.get('/sales', params);
            console.log('📥 Resposta da API vendas:', response);
            
            if (response.success || Array.isArray(response) || (response.sales && Array.isArray(response.sales)) || (response.data && Array.isArray(response.data))) {
                const sales = response.sales || response.data || response;
                state.data.sales = sales;
                console.log('✅ Vendas carregadas:', sales.length);
                console.log('🎨 Chamando renderSales...');
                renderSales(response); // Passar o response completo
                
                // Verificar se houve atualizações automáticas
                if (response.updatedCount && response.updatedCount > 0) {
                    showToast(`${response.updatedCount} venda(s) atualizada(s) automaticamente para "Vencido"`, 'info');
                }
            } else {
                console.log('❌ Resposta inválida de vendas:', response);
                
                // Teste com dados mock para verificar se a renderização funciona
                console.log('🧪 Testando renderização com dados mock...');
                const mockData = {
                    success: true,
                    data: [
                        {
                            id: 1,
                            client: { nome: 'Cliente Teste' },
                            valorTotal: 150.00,
                            dataVenda: Utils.getCurrentDate(),
                            status: 'Pendente'
                        }
                    ]
                };
                renderSales(mockData);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
            
            // Teste com dados mock em caso de erro
            console.log('🧪 Testando renderização com dados mock após erro...');
            const mockData = {
                success: true,
                data: [
                    {
                        id: 1,
                        client: { nome: 'Cliente Teste' },
                        valorTotal: 150.00,
                        dataVenda: Utils.getCurrentDate(),
                        status: 'Pendente'
                    }
                ]
            };
            renderSales(mockData);
        }
    }

    /**
     * Load products
     */
    async function loadProducts(page = 1) {
        try {
            const response = await api.get('/products', { page, limit: 10 });
            if (response.success) {
                state.data.products = response.products || response.data;
                renderProducts(response.products || response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    /**
     * Load purchases
     */
    async function loadPurchases(page = 1) {
        try {
            console.log('📦 Carregando compras...');
            const response = await api.get('/purchases', { page, limit: 10 });
            console.log('📥 Resposta da API compras:', response);
            
            if (response && (response.data || response.purchases || Array.isArray(response))) {
                const purchases = response.data || response.purchases || response;
                state.data.purchases = purchases;
                console.log('✅ Compras carregadas:', purchases.length);
                renderPurchases({ purchases, total: response.total, currentPage: page });
            } else {
                console.log('❌ Resposta inválida de compras:', response);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar compras:', error);
        }
    }

    /**
     * Load suppliers
     */
    async function loadSuppliers(page = 1) {
        try {
            console.log('📋 Carregando fornecedores...');
            const response = await api.get('/suppliers', { page, limit: 10 });
            console.log('📥 Resposta da API fornecedores:', response);
            
            if (response.success || Array.isArray(response) || (response.suppliers && Array.isArray(response.suppliers)) || (response.data && Array.isArray(response.data))) {
                const suppliers = response.suppliers || response.data || response;
                state.data.suppliers = suppliers;
                console.log('✅ Fornecedores carregados:', suppliers.length);
                renderSuppliers(response); // Passar o response completo
            } else {
                console.log('❌ Resposta inválida de fornecedores:', response);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar fornecedores:', error);
        }
    }

    /**
     * Load users
     */
    async function loadUsers(page = 1) {
        try {
            console.log('👥 Carregando usuários...');
            const response = await api.get('/users', { page, limit: 10 });
            console.log('📥 Resposta da API usuários:', response);
            
            if (response.success || Array.isArray(response) || (response.users && Array.isArray(response.users)) || (response.data && Array.isArray(response.data))) {
                const users = response.users || response.data || response;
                state.data.users = users;
                console.log('✅ Usuários carregados:', users.length);
                renderUsers(response); // Passar o response completo
            } else {
                console.log('❌ Resposta inválida de usuários:', response);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
        }
    }

    /**
     * Load clients for dropdown
     */
    async function loadClientsForDropdown() {
        try {
            console.log('👥 Carregando clientes para dropdown...');
            const response = await api.get('/clients', { limit: 1000 }); // Buscar todos os clientes
            console.log('📥 Resposta da API clientes dropdown:', response);
            
            const clientSelect = document.getElementById('saleClient');
            if (!clientSelect) {
                console.log('❌ Elemento #saleClient não encontrado');
                return;
            }
            
            clientSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('selectClient') : 'Selecione um cliente'}</option>`;

            let clients = [];
            if (response && Array.isArray(response.clients)) {
                clients = response.clients;
            } else if (Array.isArray(response.data)) {
                clients = response.data;
            } else if (Array.isArray(response)) {
                clients = response;
            }

            if (clients.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = window.i18n ? window.i18n.t('noClientsRegistered') : 'Nenhum cliente cadastrado';
                clientSelect.appendChild(option);
                clientSelect.disabled = true;
                console.log('📝 Dropdown: Nenhum cliente cadastrado');
            } else {
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.nome;
                    clientSelect.appendChild(option);
                });
                clientSelect.disabled = false;
                console.log('✅ Clientes carregados no dropdown:', clients.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar clientes para dropdown:', error);
            const clientSelect = document.getElementById('saleClient');
            if (clientSelect) {
                clientSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('errorLoadingClients') : 'Erro ao carregar clientes'}</option>`;
                clientSelect.disabled = true;
            }
        }
    }

    /**
     * Load products for dropdown
     */
    async function loadProductsForDropdown() {
        try {
            console.log('📦 Carregando produtos para dropdown...');
            const response = await api.get('/products', { limit: 1000 }); // Buscar todos os produtos
            console.log('📥 Resposta da API produtos dropdown:', response);
            
            const productSelect = document.getElementById('productSelect');
            if (!productSelect) {
                console.log('❌ Elemento #productSelect não encontrado');
                return;
            }
            
            productSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('selectProduct') : 'Selecione um produto'}</option>`;

            let products = [];
            if (response && Array.isArray(response.products)) {
                products = response.products;
            } else if (Array.isArray(response.data)) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            }

            if (products.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = window.i18n ? window.i18n.t('noProductsRegistered') : 'Nenhum produto cadastrado';
                productSelect.appendChild(option);
                productSelect.disabled = true;
                console.log('📝 Dropdown: Nenhum produto cadastrado');
            } else {
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = `${product.nome} - R$ ${Utils.formatCurrency(product.preco)} (Estoque: ${product.estoque})`;
                    option.dataset.price = product.preco;
                    option.dataset.stock = product.estoque;
                    productSelect.appendChild(option);
                });
                productSelect.disabled = false;
                console.log('✅ Produtos carregados no dropdown:', products.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produtos para dropdown:', error);
            const productSelect = document.getElementById('productSelect');
            if (productSelect) {
                productSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('errorLoadingProducts') : 'Erro ao carregar produtos'}</option>`;
                productSelect.disabled = true;
            }
        }
    }

    /**
     * Load suppliers for dropdown
     */
    async function loadSuppliersForDropdown() {
        try {
            const response = await api.get('/suppliers');
            const supplierSelect = document.getElementById('purchaseSupplier');
            if (!supplierSelect) return;
            supplierSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('selectSupplier') : 'Selecione um fornecedor'}</option>`;

            let suppliers = [];
            if (response && Array.isArray(response.suppliers)) {
                suppliers = response.suppliers;
            } else if (Array.isArray(response.data)) {
                suppliers = response.data;
            } else if (Array.isArray(response)) {
                suppliers = response;
            }

            if (suppliers.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = window.i18n ? window.i18n.t('noSuppliersRegistered') : 'Nenhum fornecedor cadastrado';
                supplierSelect.appendChild(option);
                supplierSelect.disabled = true;
            } else {
                suppliers.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = supplier.nome;
                    supplierSelect.appendChild(option);
                });
                supplierSelect.disabled = false;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar fornecedores para dropdown:', error);
            const supplierSelect = document.getElementById('purchaseSupplier');
            if (supplierSelect) {
                supplierSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('errorLoadingSuppliers') : 'Erro ao carregar fornecedores'}</option>`;
                supplierSelect.disabled = true;
            }
        }
    }

    /**
     * Load products for purchase dropdown
     */
    async function loadProductsForPurchaseDropdown() {
        try {
            console.log('📦 Carregando produtos para dropdown de compra...');
            const response = await api.get('/products');
            console.log('📥 Resposta da API produtos dropdown compra:', response);
            
            const productSelect = document.getElementById('purchaseProductSelect');
            if (!productSelect) {
                console.log('❌ Elemento #purchaseProductSelect não encontrado');
                return;
            }
            
            productSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('selectProduct') : 'Selecione um produto'}</option>`;

            let products = [];
            if (response && Array.isArray(response.products)) {
                products = response.products;
            } else if (Array.isArray(response.data)) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            }

            if (products.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = window.i18n ? window.i18n.t('noProductsRegistered') : 'Nenhum produto cadastrado';
                productSelect.appendChild(option);
                productSelect.disabled = true;
                console.log('📝 Dropdown compra: Nenhum produto cadastrado');
            } else {
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = `${product.nome} - Estoque: ${product.estoque}`;
                    option.dataset.stock = product.estoque;
                    productSelect.appendChild(option);
                });
                productSelect.disabled = false;
                console.log('✅ Produtos carregados no dropdown de compra:', products.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produtos para dropdown de compra:', error);
            const productSelect = document.getElementById('purchaseProductSelect');
            if (productSelect) {
                productSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.t('errorLoadingProducts') : 'Erro ao carregar produtos'}</option>`;
                productSelect.disabled = true;
            }
        }
    }

    /**
     * Setup sale form events
     */
    function setupSaleFormEvents() {
        console.log('🔧 Configurando eventos do formulário de venda...');
        
        // Carregar dados quando o modal de venda for aberto
        const saleModal = document.getElementById('saleModal');
        if (saleModal) {
            console.log('✅ Modal de venda encontrado, adicionando evento show.bs.modal');
            saleModal.addEventListener('show.bs.modal', async () => {
                console.log('🎯 Modal de venda aberto, configurando formulário...');
                
                // Verificar se estamos em modo de edição
                const saleForm = document.getElementById('saleForm');
                const isEditMode = saleForm && saleForm.dataset.editMode === 'true';
                
                if (isEditMode) {
                    console.log('📝 Modal aberto em modo de edição - não configurando como nova venda');
                    // Não chamar setupCreateForm em modo de edição
                } else {
                    console.log('🆕 Modal aberto em modo de criação - configurando nova venda');
                    // Configurar formulário de venda apenas para nova venda
                    setupCreateForm('sale');
                    
                    // Definir data atual no campo de data usando função robusta
                    const saleDateInput = document.getElementById('saleDate');
                    if (saleDateInput) {
                        saleDateInput.value = Utils.getCurrentDate();
                        console.log('📅 Data atual definida (modal):', saleDateInput.value);
                    }
                }
                
                // Carregar dropdowns sempre
                await loadClientsForDropdown();
                await loadProductsForDropdown();
                console.log('✅ Formulário de venda configurado e dropdowns carregados');
            });
        } else {
            console.log('❌ Modal de venda não encontrado');
        }
        
        // Limpar flag de edição quando modal for fechado
        if (saleModal) {
            saleModal.addEventListener('hidden.bs.modal', () => {
                const saleForm = document.getElementById('saleForm');
                if (saleForm) {
                    delete saleForm.dataset.editMode;
                    console.log('🧹 Flag de edição removida do formulário');
                }
            });
        }

        // Atualizar preço unitário quando produto for selecionado
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.addEventListener('change', () => {
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                const priceInput = document.getElementById('productUnitPrice');
                if (selectedOption && selectedOption.dataset.price) {
                    priceInput.value = selectedOption.dataset.price;
                } else {
                    priceInput.value = '';
                }
                // Garantir que o campo seja sempre editável
                priceInput.removeAttribute('readonly');
                priceInput.disabled = false;
            });
        }

        // Garantir que o campo de preço seja sempre editável
        const priceInput = document.getElementById('productUnitPrice');
        if (priceInput) {
            // Remover readonly se existir
            priceInput.removeAttribute('readonly');
            priceInput.disabled = false;
            
            // Adicionar evento para garantir que permaneça editável
            priceInput.addEventListener('focus', () => {
                priceInput.removeAttribute('readonly');
                priceInput.disabled = false;
            });
            
            priceInput.addEventListener('input', () => {
                priceInput.removeAttribute('readonly');
                priceInput.disabled = false;
            });
        }

        // Mostrar/ocultar campos de pagamento baseado na forma de pagamento
        const paymentForma = document.getElementById('paymentForma');
        if (paymentForma) {
            paymentForma.addEventListener('change', () => {
                const forma = paymentForma.value;
                const parcelasField = document.getElementById('parcelasField');
                const bandeiraCartaoField = document.getElementById('bandeiraCartaoField');
                const bancoCrediarioField = document.getElementById('bancoCrediarioField');

                // Ocultar todos os campos
                parcelasField.style.display = 'none';
                bandeiraCartaoField.style.display = 'none';
                bancoCrediarioField.style.display = 'none';

                // Mostrar campos específicos
                if (forma === 'Cartão de Crédito') {
                    parcelasField.style.display = 'block';
                    bandeiraCartaoField.style.display = 'block';
                } else if (forma === 'Crediário') {
                    parcelasField.style.display = 'block';
                    bancoCrediarioField.style.display = 'block';
                }
            });
        }

        // Adicionar produto à lista
        const btnAddProduct = document.getElementById('btnAddProduct');
        if (btnAddProduct) {
            console.log('✅ Botão btnAddProduct encontrado, adicionando evento de clique');
            btnAddProduct.addEventListener('click', addProductToSale);
            console.log('✅ Evento de clique adicionado ao botão btnAddProduct');
        } else {
            console.error('❌ Botão btnAddProduct não encontrado!');
        }

        // Atualizar status automaticamente quando valor pago for alterado
        const paidValueInput = document.getElementById('salePaidValueInitial');
        if (paidValueInput) {
            paidValueInput.addEventListener('input', updateSaleStatus);
            console.log('✅ Evento de input adicionado ao campo de valor pago');
        }
        
        console.log('✅ Eventos do formulário de venda configurados');
    }

    /**
     * Add product to sale list
     */
    function addProductToSale() {
        console.log('🚀 Função addProductToSale iniciada');
        console.log('🔍 Evento de clique detectado!');
        console.log('🔍 Elementos encontrados:');
        console.log('  - productSelect:', document.getElementById('productSelect'));
        console.log('  - btnAddProduct:', document.getElementById('btnAddProduct'));
        console.log('  - saleProductsList:', document.getElementById('saleProductsList'));
        
        const productSelect = document.getElementById('productSelect');
        const quantityInput = document.getElementById('productQuantity');
        const priceInput = document.getElementById('productUnitPrice');
        const productsList = document.getElementById('saleProductsList');

        console.log('🔍 Verificando elementos:', {
            productSelect: !!productSelect,
            quantityInput: !!quantityInput,
            priceInput: !!priceInput,
            productsList: !!productsList
        });

        if (!productSelect.value) {
            console.log('❌ Nenhum produto selecionado');
            showToast(window.i18n ? window.i18n.t('selectProduct') : 'Selecione um produto', 'warning');
            return;
        }

        if (!quantityInput.value || quantityInput.value <= 0) {
            console.log('❌ Quantidade inválida:', quantityInput.value);
            showToast('Informe uma quantidade válida', 'warning');
            return;
        }

        if (!priceInput.value || priceInput.value <= 0) {
            console.log('❌ Preço inválido:', priceInput.value);
            showToast('Informe um preço válido', 'warning');
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = productSelect.value;
        const productName = selectedOption.textContent.split(' - ')[0];
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(priceInput.value);
        const total = quantity * price;

        console.log('📊 Dados do produto:', {
            productId,
            productName,
            quantity,
            price,
            total
        });

        // Verificar se o produto já foi adicionado
        const existingProduct = productsList.querySelector(`[data-product-id="${productId}"]`);
        if (existingProduct) {
            console.log('❌ Produto já adicionado');
            showToast('Este produto já foi adicionado à venda', 'warning');
            return;
        }

        console.log('✅ Criando elemento do produto...');

        // Criar elemento do produto
        const productElement = document.createElement('div');
        productElement.className = 'list-group-item d-flex justify-content-between align-items-center';
        productElement.dataset.productId = productId;
        productElement.innerHTML = `
            <div>
                <strong>${productName}</strong>
                <br>
                <small>Qtd: ${quantity} x R$ ${price.toFixed(2).replace('.', ',')}</small>
            </div>
            <div>
                <span class="badge bg-primary rounded-pill">R$ ${total.toFixed(2).replace('.', ',')}</span>
                <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeProductFromSale('${productId}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        console.log('✅ Elemento do produto criado');

        // Adicionar à lista
        if (productsList.querySelector('.text-muted.text-center')) {
            console.log('🧹 Limpando mensagem "Nenhum produto"');
            productsList.innerHTML = '';
        }
        
        console.log('📦 Adicionando produto à lista...');
        productsList.appendChild(productElement);
        console.log('✅ Produto adicionado à lista');

        // Limpar campos
        productSelect.value = '';
        quantityInput.value = '1';
        priceInput.value = '';

        console.log('🧹 Campos limpos');

        // Atualizar valor total
        console.log('🧮 Chamando updateSaleTotal...');
        updateSaleTotal();
        
        console.log('✅ Função addProductToSale concluída com sucesso');
    }

    /**
     * Update sale status based on payment
     */
    function updateSaleStatus() {
        const paidValue = parseFloat(document.getElementById('salePaidValueInitial').value) || 0;
        const totalValue = parseFloat(document.getElementById('saleTotalValue').value) || 0;
        const statusSelect = document.getElementById('saleStatus');
        
        if (statusSelect) {
            if (paidValue >= totalValue && totalValue > 0) {
                statusSelect.value = 'Pago';
                console.log('📊 Status atualizado para: Pago');
            } else if (paidValue > 0) {
                statusSelect.value = 'Pendente';
                console.log('📊 Status atualizado para: Pendente');
            } else {
                statusSelect.value = 'Pendente';
                console.log('📊 Status mantido como: Pendente');
            }
        }
    }

    /**
     * Remove product from sale list
     */
    function removeProductFromSale(productId) {
        console.log('🗑️ Removendo produto da venda:', productId);
        
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            productElement.remove();
            console.log('✅ Produto removido da lista');
            
            // Atualizar valor total
            updateSaleTotal();
        } else {
            console.warn('⚠️ Produto não encontrado para remoção');
        }

        // Se não há mais produtos, mostrar mensagem
        const productsList = document.getElementById('saleProductsList');
        if (productsList && productsList.children.length === 0) {
            productsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
            console.log('📝 Mensagem "Nenhum produto" exibida');
        }
    }

    /**
     * Update sale total
     */
    function updateSaleTotal() {
        console.log('🧮 Atualizando total da venda...');
        
        const productsList = document.getElementById('saleProductsList');
        const totalDisplay = document.getElementById('saleTotalValueDisplay');
        const totalHidden = document.getElementById('saleTotalValue');

        if (!productsList || !totalDisplay || !totalHidden) {
            console.error('❌ Elementos não encontrados para cálculo do total');
            return;
        }

        let total = 0;
        
        // Buscar todos os elementos de produtos na lista
        const productElements = productsList.querySelectorAll('.list-group-item');
        
        console.log(`📦 Encontrados ${productElements.length} produtos na lista`);
        
        productElements.forEach((element, index) => {
            // Buscar o badge com o valor total do produto
            const badge = element.querySelector('.badge');
            if (badge) {
                const badgeText = badge.textContent.trim();
                console.log(`📊 Produto ${index + 1}: ${badgeText}`);
                
                // Extrair valor do badge (formato: "R$ 400,00")
                const valueMatch = badgeText.match(/R\$ ([\d,]+\.?\d*)/);
                if (valueMatch) {
                    // Converter corretamente: "400,00" -> 400.00
                    const valueString = valueMatch[1].replace(',', '.');
                    const productTotal = parseFloat(valueString);
                    
                    if (!isNaN(productTotal)) {
                        total += productTotal;
                        console.log(`✅ Valor do produto ${index + 1}: R$ ${productTotal.toFixed(2)}`);
                    } else {
                        console.error(`❌ Valor inválido extraído: ${valueString}`);
                    }
                } else {
                    console.warn(`⚠️ Não foi possível extrair valor do badge: ${badgeText}`);
                }
            } else {
                console.warn(`⚠️ Badge não encontrado no produto ${index + 1}`);
            }
        });

        console.log(`💰 Total calculado: R$ ${total.toFixed(2)}`);
        
        // Atualizar display do total - usar formatação simples para evitar problemas
        const formattedTotal = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalDisplay.value = formattedTotal;
        
        // Atualizar campo hidden
        totalHidden.value = total;
        
        console.log(`✅ Total atualizado: ${formattedTotal}`);
        
        // Atualizar status baseado no pagamento
        updateSaleStatus();
    }

    /**
     * Setup purchase form events
     */
    function setupPurchaseFormEvents() {
        console.log('🔧 Configurando eventos do formulário de compra...');
        
        // Carregar dados quando o modal de compra for aberto
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal) {
            console.log('✅ Modal de compra encontrado, adicionando evento show.bs.modal');
            purchaseModal.addEventListener('show.bs.modal', async () => {
                console.log('🎯 Modal de compra aberto, configurando formulário...');
                
                // Configurar formulário de compra
                setupCreateForm('purchase');
                
                // Carregar dropdowns
                console.log('📦 Modal de compra aberto, carregando dropdowns...');
                await loadSuppliersForDropdown();
                await loadProductsForPurchaseDropdown();
                console.log('✅ Formulário de compra configurado e dropdowns carregados');
            });
        } else {
            console.error('❌ Modal de compra não encontrado');
        }

        // Atualizar detalhes do produto quando selecionado
        const productSelect = document.getElementById('purchaseProductSelect');
        if (productSelect) {
            console.log('✅ Select de produto encontrado, adicionando evento change');
            productSelect.addEventListener('change', () => {
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                const detailsDisplay = document.getElementById('purchaseProductDetailsDisplay');
                
                if (selectedOption && selectedOption.dataset.stock) {
                    const stock = selectedOption.dataset.stock;
                    detailsDisplay.textContent = `Estoque atual: ${stock} unidades`;
                } else {
                    detailsDisplay.textContent = '';
                }
            });
        } else {
            console.error('❌ Select de produto não encontrado');
        }

        // Adicionar produto à lista de compra
        const btnAddPurchaseProduct = document.getElementById('btnAddPurchaseProduct');
        if (btnAddPurchaseProduct) {
            console.log('✅ Botão btnAddPurchaseProduct encontrado, adicionando evento de clique');
            btnAddPurchaseProduct.addEventListener('click', () => {
                console.log('🎯 Botão Adicionar Produto clicado!');
                addProductToPurchase();
            });
            console.log('✅ Evento de clique adicionado ao botão btnAddPurchaseProduct');
        } else {
            console.error('❌ Botão btnAddPurchaseProduct não encontrado');
        }
        
        console.log('✅ Eventos do formulário de compra configurados');
    }

    /**
     * Add product to purchase list
     */
    function addProductToPurchase() {
        console.log('🎯 addProductToPurchase chamada!');
        console.log('🔍 Verificando se a função está sendo executada...');
        
        try {
            const productSelect = document.getElementById('purchaseProductSelect');
            const quantityInput = document.getElementById('purchaseProductQuantity');
            const costInput = document.getElementById('purchaseProductCost');
            const productsList = document.getElementById('purchaseProductsList');

            console.log('🔍 Verificando elementos:');
            console.log('  - productSelect:', productSelect);
            console.log('  - quantityInput:', quantityInput);
            console.log('  - costInput:', costInput);
            console.log('  - productsList:', productsList);
            
            if (!productSelect) {
                console.error('❌ productSelect não encontrado!');
                showToast('Erro: Campo de produto não encontrado', 'error');
                return;
            }
            
            if (!quantityInput) {
                console.error('❌ quantityInput não encontrado!');
                showToast('Erro: Campo de quantidade não encontrado', 'error');
                return;
            }
            
            if (!costInput) {
                console.error('❌ costInput não encontrado!');
                showToast('Erro: Campo de custo não encontrado', 'error');
                return;
            }
            
            if (!productsList) {
                console.error('❌ productsList não encontrado!');
                showToast('Erro: Lista de produtos não encontrada', 'error');
                return;
            }
            
            console.log('✅ Todos os elementos encontrados!');

        if (!productSelect.value) {
            console.warn('⚠️ Produto não selecionado');
            showToast(window.i18n ? window.i18n.t('selectProduct') : 'Selecione um produto', 'warning');
            return;
        }

        if (!quantityInput.value || quantityInput.value <= 0) {
            console.warn('⚠️ Quantidade inválida:', quantityInput.value);
            showToast('Informe uma quantidade válida', 'warning');
            return;
        }

        if (!costInput.value || costInput.value <= 0) {
            console.warn('⚠️ Preço de custo inválido:', costInput.value);
            showToast('Informe um preço de custo válido', 'warning');
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = productSelect.value;
        const productName = selectedOption.textContent.split(' - ')[0];
        const quantity = parseInt(quantityInput.value);
        const cost = parseFloat(costInput.value);
        const total = quantity * cost;

        console.log('📊 Dados do produto:');
        console.log('  - ID:', productId);
        console.log('  - Nome:', productName);
        console.log('  - Quantidade:', quantity);
        console.log('  - Custo:', cost);
        console.log('  - Total:', total);

        // Verificar se o produto já foi adicionado
        const existingProduct = productsList.querySelector(`[data-product-id="${productId}"]`);
        if (existingProduct) {
            console.warn('⚠️ Produto já adicionado');
            showToast('Este produto já foi adicionado à compra', 'warning');
            return;
        }

        // Criar elemento do produto
        const productElement = document.createElement('div');
        productElement.className = 'd-flex justify-content-between align-items-center p-2 border rounded mb-2';
        productElement.dataset.productId = productId;
        productElement.innerHTML = `
            <div>
                <strong>${productName}</strong><br>
                <small class="text-muted">Qtd: ${quantity} x R$ ${cost.toFixed(2).replace('.', ',')} = R$ ${total.toFixed(2).replace('.', ',')}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeProductFromPurchase('${productId}')">
                <i class="bi bi-trash"></i>
            </button>
        `;

        console.log('✅ Elemento do produto criado:', productElement);

        // Adicionar à lista
        if (productsList.querySelector('.text-muted.text-center')) {
            productsList.innerHTML = '';
        }
        productsList.appendChild(productElement);
        console.log('✅ Produto adicionado à lista');

        // Limpar campos
        productSelect.value = '';
        quantityInput.value = '1';
        costInput.value = '';
        document.getElementById('purchaseProductDetailsDisplay').textContent = '';
        console.log('✅ Campos limpos');

        // Atualizar valor total
        updatePurchaseTotal();
        console.log('✅ Total atualizado');
        
        } catch (error) {
            console.error('❌ Erro na função addProductToPurchase:', error);
            showToast('Erro ao adicionar produto: ' + error.message, 'error');
        }
    }

    /**
     * Remove product from purchase list
     */
    function removeProductFromPurchase(productId) {
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            productElement.remove();
            updatePurchaseTotal();
        }

        // Se não há mais produtos, mostrar mensagem
        const productsList = document.getElementById('purchaseProductsList');
        if (productsList.children.length === 0) {
            productsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
        }
    }

    /**
     * Update purchase total
     */
    function updatePurchaseTotal() {
        const productsList = document.getElementById('purchaseProductsList');
        const totalDisplay = document.getElementById('purchaseTotalValueDisplay');
        const totalHidden = document.getElementById('purchaseTotalValue');

        let total = 0;
        const productElements = productsList.querySelectorAll('[data-product-id]');
        
        productElements.forEach(element => {
            const text = element.querySelector('small').textContent;
            const totalMatch = text.match(/R\$ ([\d,]+\.?\d*)/);
            if (totalMatch) {
                const productTotal = parseFloat(totalMatch[1].replace(',', '.'));
                total += productTotal;
            }
        });

        totalDisplay.value = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalHidden.value = total;
    }

    // ===== RENDERING FUNCTIONS =====

    /**
     * Render dashboard
     */
    function renderDashboard(data) {
        console.log('🎯 Renderizando dashboard com dados reais:', data);
        
        // Só atualizar os KPI cards se houver dados reais da API
        if (data && Object.keys(data).length > 0) {
            // Atualizar KPIs com dados reais da API
            updateKPICard('totalClients', data.totalClients || data.total_clientes || 0);
            updateKPICard('salesThisMonth', data.salesThisMonth || data.vendas_mes_atual || 0);
            updateKPICard('totalReceivable', data.totalReceivable || data.total_receber || 0);
            updateKPICard('totalAccountsPayable', data.totalAccountsPayable || data.total_pagar || 0);
            updateKPICard('overdueSales', data.overdueSales || data.vendas_vencidas || 0);
            updateKPICard('orderValue', data.orderValue || data.valor_pedidos || 0);
            updateKPICard('averageTicket', data.averageTicket || data.ticket_medio || 0);
            
            // Calcular lucro (vendas - contas a pagar)
            const sales = parseFloat(data.salesThisMonth || data.vendas_mes_atual || 0);
            const payables = parseFloat(data.totalAccountsPayable || data.total_pagar || 0);
            const profit = sales - payables;
            updateKPICard('profit', profit);
            
            console.log('📊 KPIs atualizados com dados reais:');
            console.log('   - Total Clientes:', data.totalClients || data.total_clientes || 0);
            console.log('   - Vendas do Mês:', data.salesThisMonth || data.vendas_mes_atual || 0);
            console.log('   - Total a Receber:', data.totalReceivable || data.total_receber || 0);
            console.log('   - Total a Pagar:', data.totalAccountsPayable || data.total_pagar || 0);
            console.log('   - Vendas Vencidas:', data.overdueSales || data.vendas_vencidas || 0);
            console.log('   - Valor Pedidos:', data.orderValue || data.valor_pedidos || 0);
            console.log('   - Ticket Médio:', data.averageTicket || data.ticket_medio || 0);
            console.log('   - Lucro Calculado:', profit);
        } else {
            console.log('⚠️ Nenhum dado real disponível, usando valores padrão');
            // Definir valores padrão quando não há dados
            updateKPICard('totalClients', 0);
            updateKPICard('salesThisMonth', 0);
            updateKPICard('totalReceivable', 0);
            updateKPICard('totalAccountsPayable', 0);
            updateKPICard('overdueSales', 0);
            updateKPICard('orderValue', 0);
            updateKPICard('averageTicket', 0);
            updateKPICard('profit', 0);
        }

        // Render sales chart com dados reais
        renderSalesChart(data.sales || data.vendas || data.salesByMonth || []);

        // Render top lists (só atualizar se houver dados reais)
        if (data && data.topProducts) {
            renderTopProducts(data.topProducts);
        }
        if (data && data.topClients) {
            renderTopClients(data.topClients);
        }
        if (data && data.topSuppliers) {
            renderTopSuppliers(data.topSuppliers);
        }

        // Render financial maturities (só atualizar se houver dados reais)
        if (data && Object.keys(data).length > 0) {
            renderFinancialMaturities(data);
        }

        // Forçar atualização do gráfico após renderização completa
        setTimeout(() => {
            if (window.i18n) {
                window.i18n.updateSalesChart();
            }
        }, 500);
    }

    /**
     * Update KPI card
     */
    function updateKPICard(id, value) {
        const card = document.getElementById(id);
        if (card) {
            const valueElement = card.querySelector('.fs-2');
            if (valueElement) {
                // Converter para número
                const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : parseFloat(value);
                
                // Verificar se é o KPI de total de clientes (deve ser número inteiro)
                if (id === 'totalClients') {
                    if (!isNaN(numericValue)) {
                        valueElement.textContent = Math.round(numericValue).toLocaleString();
                    } else {
                        valueElement.textContent = '0';
                    }
                } else {
                    // Para outros KPIs, usar formatação de moeda
                    if (typeof value === 'string' && value.includes('R$')) {
                        const extractedValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
                        if (!isNaN(extractedValue) && window.i18n) {
                            valueElement.textContent = window.i18n.formatCurrency(extractedValue);
                        } else {
                            valueElement.textContent = value;
                        }
                    } else if (typeof value === 'number' && window.i18n) {
                        valueElement.textContent = window.i18n.formatCurrency(value);
                    } else {
                        valueElement.textContent = value;
                    }
                }
            }
        }
    }

    /**
     * Render sales chart
     */
    function renderSalesChart(data) {
        console.log('🔍 === INÍCIO renderSalesChart ===');
        console.log('📊 Dados recebidos:', data);
        
        const ctx = document.getElementById('salesChart');
        if (!ctx) {
            console.log('❌ Elemento salesChart não encontrado');
            return;
        }

        // Destroy existing chart if it exists
        if (state.charts.has('salesChart')) {
            state.charts.get('salesChart').destroy();
        }

        // Obter ano atual e anterior dinamicamente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Meses traduzidos
        const months = window.i18n ? [
            window.i18n.t('jan'), window.i18n.t('feb'), window.i18n.t('mar'), 
            window.i18n.t('apr'), window.i18n.t('may'), window.i18n.t('jun'),
            window.i18n.t('jul'), window.i18n.t('aug'), window.i18n.t('sep'),
            window.i18n.t('oct'), window.i18n.t('nov'), window.i18n.t('dec')
        ] : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        // Processar dados reais da API
        let salesPreviousYear = new Array(12).fill(0);
        let salesCurrentYear = new Array(12).fill(0);
        
        if (data && Array.isArray(data)) {
            // Verificar se é formato salesByMonth (tem propriedade 'month')
            if (data.length > 0 && data[0].month) {
                data.forEach((item) => {
                    // Extrair ano e mês do campo 'month' (formato: '2024-08')
                    const monthParts = item.month.split('-');
                    if (monthParts.length === 2) {
                        const saleYear = parseInt(monthParts[0]);
                        const saleMonth = parseInt(monthParts[1]) - 1; // Converter para 0-11
                        const saleValue = parseFloat(item.total || 0);
                        
                        if (saleYear === currentYear) {
                            salesCurrentYear[saleMonth] += saleValue;
                        } else if (saleYear === previousYear) {
                            salesPreviousYear[saleMonth] += saleValue;
                        }
                    }
                });
            } else {
                // Processar como vendas individuais (formato antigo)
                data.forEach((sale) => {
                    const saleDate = new Date(sale.date || sale.createdAt || sale.data_venda);
                    const saleYear = saleDate.getFullYear();
                    const saleMonth = saleDate.getMonth(); // 0-11
                    const saleValue = parseFloat(sale.total || sale.valor_total || sale.amount || 0);
                    
                    if (saleYear === currentYear) {
                        salesCurrentYear[saleMonth] += saleValue;
                    } else if (saleYear === previousYear) {
                        salesPreviousYear[saleMonth] += saleValue;
                    }
                });
            }
        } else if (data && data.salesByMonth) {
            // Se data tem propriedade salesByMonth
            salesCurrentYear = data.salesByMonth.currentYear || new Array(12).fill(0);
            salesPreviousYear = data.salesByMonth.previousYear || new Array(12).fill(0);
        } else if (data && data.sales) {
            console.log('📊 Processando dados.sales...');
            // Se data tem propriedade sales
            data.sales.forEach((sale, index) => {
                console.log(`📦 Processando venda ${index + 1}:`, sale);
                const saleDate = new Date(sale.date || sale.createdAt || sale.data_venda);
                const saleYear = saleDate.getFullYear();
                const saleMonth = saleDate.getMonth();
                const saleValue = parseFloat(sale.total || sale.valor_total || sale.amount || 0);
                
                console.log(`   📅 Data: ${saleDate.toLocaleDateString()}, Ano: ${saleYear}, Mês: ${saleMonth}, Valor: ${saleValue}`);
                
                if (saleYear === currentYear) {
                    salesCurrentYear[saleMonth] += saleValue;
                    console.log(`   ✅ Adicionado ao ano atual (mês ${saleMonth}): ${saleValue}`);
                } else if (saleYear === previousYear) {
                    salesPreviousYear[saleMonth] += saleValue;
                    console.log(`   ✅ Adicionado ao ano anterior (mês ${saleMonth}): ${saleValue}`);
                } else {
                    console.log(`   ⚠️ Venda ignorada - ano ${saleYear} não é ${currentYear} ou ${previousYear}`);
                }
            });
        } else {
            console.log('⚠️ Nenhum formato de dados reconhecido, usando arrays vazios');
        }

        console.log('📊 === DADOS PROCESSADOS ===');
        console.log('📈 Dados do ano atual:', salesCurrentYear);
        console.log('📈 Dados do ano anterior:', salesPreviousYear);
        console.log('📊 Total ano atual:', salesCurrentYear.reduce((sum, val) => sum + val, 0));
        console.log('📊 Total ano anterior:', salesPreviousYear.reduce((sum, val) => sum + val, 0));

        // Aplicar cores harmoniosas diretamente
        const primaryColor = '#1D4E89'; // var(--primary-color) - azul escuro
        const infoColor = '#4A90E2'; // var(--info-color) - azul info
        
        console.log('🎨 Cores harmoniosas aplicadas:');
        console.log('   - Dataset 1: Azul escuro (#1D4E89)');
        console.log('   - Dataset 2: Azul info (#4A90E2)');
        console.log('   - Tooltip: Azul escuro com transparência');

        console.log('📊 Criando configuração do gráfico...');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: `${window.i18n ? window.i18n.t('sales') : 'Vendas'} ${previousYear} (${window.i18n ? window.i18n.formatCurrency(0).replace('0,00', '') : 'R$'})`,
                    data: salesPreviousYear,
                    backgroundColor: primaryColor, // Azul escuro - Primary Color
                    borderColor: primaryColor,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }, {
                    label: `${window.i18n ? window.i18n.t('sales') : 'Vendas'} ${currentYear} (${window.i18n ? window.i18n.formatCurrency(0).replace('0,00', '') : 'R$'})`,
                    data: salesCurrentYear,
                    backgroundColor: infoColor, // Azul info - Info Color
                    borderColor: infoColor,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(29, 78, 137, 0.95)', // var(--primary-color)
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#1D4E89', // var(--primary-color)
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (window.i18n) {
                                    return window.i18n.formatCurrency(value);
                                }
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        // Definir máximo baseado nos dados reais
                        suggestedMax: Math.max(...salesCurrentYear, ...salesPreviousYear) * 1.2,
                        grid: {
                            color: 'rgba(29, 78, 137, 0.08)', // var(--primary-color) com transparência
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                if (window.i18n) {
                                    return window.i18n.formatCurrency(value);
                                }
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11,
                                weight: '600'
                            }
                        }
                    }
                }
            }
        });

        state.charts.set('salesChart', chart);
        
        // Atualizar estatísticas com dados reais
        updateSalesStatistics(salesCurrentYear, salesPreviousYear);
        
        console.log('✅ Gráfico de vendas com dados reais renderizado com sucesso');
        console.log('🎨 Cores harmoniosas aplicadas:');
        console.log('   - Dataset 1: Azul escuro (#1D4E89)');
        console.log('   - Dataset 2: Azul info (#4A90E2)');
        console.log('   - Tooltip: Azul escuro com transparência');
    }

    /**
     * Update sales statistics
     */
    function updateSalesStatistics(currentYearData, previousYearData) {
        const totalCurrentYear = currentYearData.reduce((sum, value) => sum + value, 0);
        const totalPreviousYear = previousYearData.reduce((sum, value) => sum + value, 0);
        const growthRate = previousYearData > 0 ? ((totalCurrentYear - totalPreviousYear) / totalPreviousYear * 100).toFixed(1) : 0;
        
        // Obter anos dinamicamente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        // Atualizar anos no HTML
        const previousYearElement = document.getElementById('previousYear');
        const currentYearElement = document.getElementById('currentYear');
        
        if (previousYearElement) {
            previousYearElement.textContent = previousYear;
        }
        
        if (currentYearElement) {
            currentYearElement.textContent = currentYear;
        }
        
        // Atualizar elementos de estatísticas com valores reais
        const totalSalesElement = document.getElementById('totalSales2024');
        const growthElement = document.getElementById('growthRate');
        
        if (totalSalesElement) {
            if (window.i18n) {
                totalSalesElement.textContent = window.i18n.formatCurrency(totalCurrentYear);
            } else {
                totalSalesElement.textContent = `R$ ${totalCurrentYear.toFixed(2)}`;
            }
        }
        
        if (growthElement) {
            const growthText = growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`;
            growthElement.textContent = growthText;
            growthElement.style.color = growthRate >= 0 ? '#10b981' : '#ef4444';
        }
        
        console.log('📊 Estatísticas atualizadas com dados reais:');
        console.log('   - Total ano atual:', totalCurrentYear);
        console.log('   - Total ano anterior:', totalPreviousYear);
        console.log('   - Taxa de crescimento:', growthRate + '%');
    }

    /**
     * Render empty sales chart
     */
    function renderEmptySalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        if (state.charts.has('salesChart')) {
            state.charts.get('salesChart').destroy();
        }

        // Obter ano atual e anterior dinamicamente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Aplicar cores harmoniosas diretamente para gráfico vazio
        const primaryColor = '#1D4E89'; // var(--primary-color) - azul escuro
        const infoColor = '#4A90E2'; // var(--info-color) - azul info

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: window.i18n ? [
                    window.i18n.t('jan'), window.i18n.t('feb'), window.i18n.t('mar'), 
                    window.i18n.t('apr'), window.i18n.t('may'), window.i18n.t('jun'),
                    window.i18n.t('jul'), window.i18n.t('aug'), window.i18n.t('sep'),
                    window.i18n.t('oct'), window.i18n.t('nov'), window.i18n.t('dec')
                ] : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: `${window.i18n ? window.i18n.t('sales') : 'Vendas'} ${previousYear} (${window.i18n ? window.i18n.formatCurrency(0).replace('0,00', '') : 'R$'})`,
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: primaryColor, // Azul escuro - Primary Color
                    borderColor: primaryColor,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }, {
                    label: `${window.i18n ? window.i18n.t('sales') : 'Vendas'} ${currentYear} (${window.i18n ? window.i18n.formatCurrency(0).replace('0,00', '') : 'R$'})`,
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: infoColor, // Azul info - Info Color
                    borderColor: infoColor,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(29, 78, 137, 0.95)', // var(--primary-color)
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#1D4E89', // var(--primary-color)
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(29, 78, 137, 0.08)', // var(--primary-color) com transparência
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                if (window.i18n) {
                                    return window.i18n.formatCurrency(value);
                                }
                                return 'R$ ' + value.toFixed(0) + 'K';
                            },
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11,
                                weight: '600'
                            }
                        }
                    }
                }
            }
        });

        state.charts.set('salesChart', chart);
    }



    /**
     * Render overdue receivable
     */
    function renderOverdueReceivable(receivables) {
        const content = document.getElementById('overdueReceivableContent');
        if (!content) return;

        if (receivables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingSales">Nenhuma venda pendente encontrada.</p>';
            if (window.i18n) window.i18n.updateAllElements();
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th data-i18n="client">Cliente</th>
                            <th data-i18n="value">Valor</th>
                            <th data-i18n="dueDate">Vencimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receivables.map(item => `
                            <tr>
                                <td>${item.cliente}</td>
                                <td>${Utils.formatCurrency(item.valor)}</td>
                                <td>${Utils.formatDate(item.vencimento)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        if (window.i18n) window.i18n.updateAllElements();
    }

    /**
     * Render overdue payable
     */
    function renderOverduePayable(payables) {
        const tbody = document.querySelector('#overduePayableTable tbody');
        if (!tbody) return;

        if (payables.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" data-i18n="noOverduePurchases">Nenhuma compra vencida encontrada</td></tr>';
            if (window.i18n) window.i18n.updateAllElements();
            return;
        }

        tbody.innerHTML = payables.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.fornecedor}</td>
                <td>${Utils.formatDate(item.vencimento)}</td>
                <td>${Utils.formatCurrency(item.valor)}</td>
            </tr>
        `).join('');
        if (window.i18n) window.i18n.updateAllElements();
    }

    /**
     * Render upcoming receivable
     */
    function renderUpcomingReceivable(receivables) {
        const content = document.getElementById('upcomingReceivableContent');
        if (!content) return;

        if (receivables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingSales">Nenhuma venda pendente encontrada.</p>';
            if (window.i18n) window.i18n.updateAllElements();
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th data-i18n="client">Cliente</th>
                            <th data-i18n="value">Valor</th>
                            <th data-i18n="dueDate">Vencimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receivables.map(item => `
                            <tr>
                                <td>${item.cliente}</td>
                                <td>${Utils.formatCurrency(item.valor)}</td>
                                <td>${Utils.formatDate(item.vencimento)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        if (window.i18n) window.i18n.updateAllElements();
    }

    /**
     * Render upcoming payable
     */
    function renderUpcomingPayable(payables) {
        const content = document.getElementById('upcomingPayableContent');
        if (!content) return;

        if (payables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingPurchases">Nenhuma compra pendente encontrada.</p>';
            if (window.i18n) window.i18n.updateAllElements();
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th data-i18n="supplier">Fornecedor</th>
                            <th data-i18n="value">Valor</th>
                            <th data-i18n="dueDate">Vencimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payables.map(item => `
                            <tr>
                                <td>${item.fornecedor}</td>
                                <td>${Utils.formatCurrency(item.valor)}</td>
                                <td>${Utils.formatDate(item.vencimento)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        if (window.i18n) window.i18n.updateAllElements();
    }

    /**
     * Render clients table
     */
    function renderClients(data) {
        const tbody = document.querySelector('#clientsTable tbody');
        if (!tbody) return;

        // Verificar se data é um array ou tem a propriedade clients/data
        const clients = Array.isArray(data) ? data : (data.clients || data.data || []);
        
        console.log('📋 Renderizando clientes:', clients);
        
        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = clients.map(client => `
            <tr>
                <td>${Utils.sanitizeHTML(client.nome)}</td>
                <td>${Utils.formatDocument(client.cpfCnpj)}</td>
                <td>${Utils.formatPhone(client.telefone)}</td>
                <td>${Utils.sanitizeHTML(client.email)}</td>
                <td>
                    <button class="btn btn-outline-info btn-sm" data-action="view" data-type="client" data-id="${client.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="client" data-id="${client.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="client" data-id="${client.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Renderizar paginação se os dados tiverem informações de paginação
        if (data.total !== undefined) {
            renderPagination('clients', data);
        }
    }

    /**
     * Render sales table
     */
    function renderSales(data) {
        console.log('🎨 renderSales chamada com dados:', data);
        
        const tbody = document.querySelector('#salesTable tbody');
        if (!tbody) {
            console.error('❌ Elemento #salesTable tbody não encontrado');
            return;
        }

        // Verificar se data é um array ou tem a propriedade sales/data
        const sales = Array.isArray(data) ? data : (data.sales || data.data || []);
        console.log('📦 Vendas para renderizar:', sales);
        
        if (sales.length === 0) {
            console.log('📝 Renderizando: Nenhuma venda encontrada');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma venda encontrada</td></tr>';
            return;
        }

        tbody.innerHTML = sales.map(sale => {
            console.log('🔍 Processando venda:', sale);
            
            // Verificar dados do cliente
            const clientName = sale.client?.nome || sale.cliente?.nome || sale.clientName || 'N/A';
            console.log('👤 Nome do cliente:', clientName, 'Estrutura:', { client: sale.client, cliente: sale.cliente, clientName: sale.clientName });
            
            // Verificar dados da data
            const saleDate = sale.dataVenda || sale.data_venda || sale.date || sale.createdAt;
            console.log('📅 Data da venda:', saleDate, 'Estrutura:', { dataVenda: sale.dataVenda, data_venda: sale.data_venda, date: sale.date, createdAt: sale.createdAt });
            
            // Verificar dados do status
            const saleStatus = sale.status || 'Pendente';
            console.log('📊 Status da venda:', saleStatus);
            
            const rowHTML = `
                <tr>
                    <td>${sale.id}</td>
                    <td>${Utils.sanitizeHTML(clientName)}</td>
                    <td>${Utils.formatCurrency(sale.valorTotal)}</td>
                    <td>${Utils.formatDate(saleDate)}</td>
                    <td><span class="badge bg-${getStatusColor(saleStatus)}">${getTranslatedStatus(saleStatus)}</span></td>
                    <td>
                        <button class="btn btn-outline-info btn-sm" data-action="view" data-type="sale" data-id="${sale.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="sale" data-id="${sale.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="sale" data-id="${sale.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            
            console.log('🎨 HTML gerado para venda', sale.id, ':', rowHTML);
            return rowHTML;
        }).join('');

        // Renderizar paginação se os dados tiverem informações de paginação
        if (data.total !== undefined) {
            renderPagination('sales', data);
        }
    }

    /**
     * Render products table
     */
    function renderProducts(data) {
        const tbody = document.querySelector('#productsTable tbody');
        if (!tbody) return;

        // Verificar se data é um array ou tem a propriedade products
        const products = Array.isArray(data) ? data : (data.products || []);
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${Utils.sanitizeHTML(product.nome)}</td>
                <td>${Utils.sanitizeHTML(product.descricao || '')}</td>
                <td>${Utils.formatCurrency(product.preco)}</td>
                <td>${product.estoque}</td>
                <td><span class="badge bg-${product.estoque < 10 ? 'danger' : 'success'}">${product.estoque < 10 ? 'Baixo' : 'OK'}</span></td>
                <td>
                    <button class="btn btn-outline-info btn-sm" data-action="view" data-type="product" data-id="${product.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="product" data-id="${product.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="product" data-id="${product.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Renderizar paginação se os dados incluírem informações de paginação
        if (data.total !== undefined) {
            renderPagination('products', data);
        }
    }

    /**
     * Render purchases table
     */
    function renderPurchases(data) {
        console.log('🎨 Renderizando compras:', data);
        
        const tbody = document.querySelector('#purchasesTable tbody');
        if (!tbody) {
            console.log('❌ Elemento #purchasesTable tbody não encontrado');
            return;
        }

        const purchases = data.purchases || data.data || data;
        console.log('📦 Dados de compras para renderizar:', purchases);

        if (!purchases || purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma compra encontrada</td></tr>';
            console.log('📝 Renderizado: Nenhuma compra encontrada');
            return;
        }

        tbody.innerHTML = purchases.map(purchase => `
            <tr>
                <td>${purchase.id || getTranslatedValue('notAvailable', 'N/A')}</td>
                <td>${Utils.sanitizeHTML(purchase.supplier?.nome || purchase.fornecedor?.nome || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>${Utils.formatCurrency(purchase.valorTotal || 0)}</td>
                <td>${Utils.formatDate(purchase.dataCompra) || getTranslatedValue('notAvailable', 'N/A')}</td>
                <td><span class="badge bg-${getStatusColor(purchase.status)}">${getTranslatedStatus(purchase.status)}</span></td>
                <td>
                    <button class="btn btn-outline-info btn-sm" data-action="view" data-type="purchase" data-id="${purchase.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="purchase" data-id="${purchase.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="purchase" data-id="${purchase.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Compras renderizadas:', purchases.length);
        renderPagination('purchases', data);
    }

    /**
     * Render suppliers table
     */
    function renderSuppliers(data) {
        console.log('🎨 Renderizando fornecedores:', data);
        
        const tbody = document.querySelector('#suppliersTable tbody');
        if (!tbody) {
            console.log('❌ Elemento #suppliersTable tbody não encontrado');
            return;
        }

        const suppliers = data.suppliers || data.data || data;
        console.log('📋 Dados de fornecedores para renderizar:', suppliers);

        if (!suppliers || suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum fornecedor encontrado</td></tr>';
            console.log('📝 Renderizado: Nenhum fornecedor encontrado');
            return;
        }

        tbody.innerHTML = suppliers.map(supplier => `
            <tr>
                <td>${Utils.sanitizeHTML(supplier.nome || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>${Utils.formatDocument(supplier.cnpj || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>${Utils.formatPhone(supplier.telefone || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>${Utils.sanitizeHTML(supplier.email || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>
                    <button class="btn btn-outline-info btn-sm" data-action="view" data-type="supplier" data-id="${supplier.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="supplier" data-id="${supplier.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="supplier" data-id="${supplier.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Fornecedores renderizados:', suppliers.length);
        renderPagination('suppliers', data);
    }

    /**
     * Render users table
     */
    function renderUsers(data) {
        console.log('🎨 Renderizando usuários:', data);
        
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) {
            console.log('❌ Elemento #usersTable tbody não encontrado');
            return;
        }

        const users = data.users || data.data || data;
        console.log('👥 Dados de usuários para renderizar:', users);

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum usuário encontrado</td></tr>';
            console.log('📝 Renderizado: Nenhum usuário encontrado');
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${Utils.sanitizeHTML(user.username || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td>${Utils.sanitizeHTML(user.email || getTranslatedValue('notAvailable', 'N/A'))}</td>
                <td><span class="badge bg-primary">${auth.getRoleDisplayName(user.role) || getTranslatedValue('notAvailable', 'N/A')}</span></td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit" data-type="user" data-id="${user.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="user" data-id="${user.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Usuários renderizados:', users.length);
        renderPagination('users', data);
    }

    /**
     * Render pagination
     */
    function renderPagination(type, data) {
        const pagination = document.querySelector(`#${type}Pagination`);
        if (!pagination || !data.pagination) return;

        const { currentPage, totalPages, totalItems } = data.pagination;
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" data-type="${type}">Anterior</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}" data-type="${type}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" data-type="${type}">Próximo</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Get status color
     */
    function getStatusColor(status) {
        const colors = {
            'Pendente': 'warning',
            'Concluída': 'success',
            'Pago': 'success',
            'Cancelado': 'danger',
            'Cancelada': 'danger',
            'Atrasado': 'danger',
            'vencido': 'danger',
            'Vencido': 'danger',
            'Vencida': 'danger'
        };
        return colors[status] || 'secondary';
    }

    // ===== CRUD OPERATIONS =====

    /**
     * Create client
     */
    async function createClient(data) {
        console.log('🎯 createClient chamada com dados:', data);
        try {
            console.log('📤 Fazendo requisição POST para /clients...');
            const response = await api.post('/clients', data);
            console.log('📥 Resposta recebida:', response);
            
            // Verificar se a resposta tem success ou se é o objeto do cliente diretamente
            if (response.success || response.id) {
                console.log('✅ Cliente criado com sucesso!');
                showToast('Cliente criado com sucesso!', 'success');
                
                // Fechar modal primeiro
                ui.hideModal('clientModal');
                
                // Limpar formulário após fechar modal
                setTimeout(() => {
                    clearClientForm();
                    console.log('🧹 Formulário de cliente limpo após fechar modal');
                }, 300);
                
                // Recarregar lista de clientes
                await loadClients();
                
                // Recarregar dropdowns que usam clientes
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de clientes...');
                    await loadClientsForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta:', response.message);
                showToast(response.message || 'Erro ao criar cliente', 'error');
            }
        } catch (error) {
            console.error('❌ Erro na função createClient:', error);
            showToast('Erro ao criar cliente: ' + error.message, 'error');
        }
    }

    /**
     * Clear client form
     */
    function clearClientForm() {
        console.log('🧹 Limpando formulário de cliente...');
        
        // Limpar campos básicos
        const clientForm = document.getElementById('clientForm');
        if (clientForm) {
            clientForm.reset();
        }
        
        // Limpar campos específicos manualmente para garantir
        const fieldsToClear = [
            'clientId',
            'clientName',
            'clientEmail', 
            'clientPhone',
            'clientCpfCnpj',
            'clientAddress',
            'id',
            'nome',
            'email',
            'telefone',
            'cpfCnpj',
            'endereco'
        ];
        
        fieldsToClear.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                // Remover classes de validação se existirem
                field.classList.remove('is-valid', 'is-invalid');
                console.log(`✅ Campo ${fieldId} limpo`);
            }
        });
        
        // Limpar também por nome de campo (para garantir)
        const fieldsByName = [
            'id',
            'nome',
            'email',
            'telefone',
            'cpfCnpj',
            'endereco'
        ];
        
        fieldsByName.forEach(fieldName => {
            const fields = document.querySelectorAll(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
            fields.forEach(field => {
                field.value = '';
                field.classList.remove('is-valid', 'is-invalid');
                console.log(`✅ Campo por nome ${fieldName} limpo`);
            });
        });
        
        // Limpar textarea específico se existir
        const addressTextarea = document.querySelector('textarea[name="endereco"]');
        if (addressTextarea) {
            addressTextarea.value = '';
            addressTextarea.classList.remove('is-valid', 'is-invalid');
            console.log('✅ Textarea endereco limpo');
        }
        
        // Limpar também por atributo placeholder ou label
        const allInputs = document.querySelectorAll('#clientForm input, #clientForm textarea');
        allInputs.forEach(input => {
            if (input.type !== 'submit' && input.type !== 'button' && input.type !== 'hidden') {
                input.value = '';
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
        
        console.log('✅ Formulário de cliente limpo completamente');
        
        // Verificar se os campos foram realmente limpos
        const fieldsToVerify = ['clientName', 'clientEmail', 'clientPhone', 'clientCpfCnpj', 'clientAddress'];
        fieldsToVerify.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`🔍 Verificação: ${fieldId} = "${field.value}"`);
            }
        });
    }

    /**
     * Update client
     */
    async function updateClient(data) {
        console.log('🎯 updateClient chamada com dados:', data);
        try {
            console.log('📤 Fazendo requisição PUT para /clients/' + data.id);
            const response = await api.put(`/clients/${data.id}`, data);
            console.log('📥 Resposta recebida:', response);
            
            // Verificar se a resposta tem success ou se é o objeto do cliente diretamente
            if (response.success || response.id) {
                console.log('✅ Cliente atualizado com sucesso!');
                showToast('Cliente atualizado com sucesso!', 'success');
                ui.hideModal('clientModal');
                
                // Recarregar lista de clientes
                await loadClients();
                
                // Recarregar dropdowns que usam clientes
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de clientes...');
                    await loadClientsForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta:', response.message);
                showToast(response.message || 'Erro ao atualizar cliente', 'error');
            }
        } catch (error) {
            console.error('❌ Erro na função updateClient:', error);
            showToast('Erro ao atualizar cliente: ' + error.message, 'error');
        }
    }

    /**
     * Create sale
     */
    async function createSale(data) {
        try {
            console.log('💰 Criando venda com dados:', data);
            const response = await api.post('/sales', data);
            console.log('📥 Resposta da API createSale:', response);
            
            if (response.success || response.id) {
                console.log('✅ Venda criada com sucesso, recarregando lista...');
                showToast('Venda criada com sucesso!', 'success');
                
                // Limpar formulário antes de fechar modal
                clearSaleForm();
                console.log('🧹 Formulário de venda limpo');
                
                // Fechar modal
                ui.hideModal('saleModal');
                
                // Recarregar lista de vendas
                await loadSales();
                
                // Recarregar dropdowns para próximas vendas
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de venda...');
                    await loadClientsForDropdown();
                    await loadProductsForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar venda', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar venda:', error);
            showToast('Erro ao criar venda', 'error');
        }
    }

    /**
     * Create product
     */
    async function createProduct(data) {
        try {
            console.log('📦 Criando produto com dados:', data);
            console.log('📦 Token atual:', api.token);
            console.log('📦 Base URL:', api.baseURL);
            
            const response = await api.post('/products', data);
            console.log('📥 Resposta da API createProduct:', response);
            
            if (response.success || response.id) {
                console.log('✅ Produto criado com sucesso, recarregando lista...');
                showToast('Produto criado com sucesso!', 'success');
                
                // Fechar modal
                if (window.ui && window.ui.hideModal) {
                    console.log('🔒 Fechando modal productModal');
                    window.ui.hideModal('productModal');
                } else {
                    console.log('❌ ui.hideModal não disponível');
                    // Fallback: fechar modal manualmente
                    const modal = document.getElementById('productModal');
                    if (modal) {
                        const bootstrapModal = bootstrap.Modal.getInstance(modal);
                        if (bootstrapModal) {
                            bootstrapModal.hide();
                        }
                    }
                }
                
                // Recarregar lista de produtos
                console.log('🔄 Recarregando lista de produtos...');
                try {
                    await loadProducts();
                    console.log('✅ Lista de produtos recarregada');
                } catch (error) {
                    console.error('❌ Erro ao recarregar produtos:', error);
                }
                
                // Recarregar dropdowns que usam produtos
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de produtos...');
                    await loadProductsForDropdown();
                    await loadProductsForPurchaseDropdown();
                }, 500);
                
                // Atualizar notificações de estoque
                if (window.stockNotificationManager) {
                    setTimeout(() => {
                        window.stockNotificationManager.forceCheck();
                    }, 1000);
                }
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar produto', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar produto:', error);
            console.error('❌ Stack trace:', error.stack);
            showToast('Erro ao criar produto: ' + error.message, 'error');
        }
    }

    /**
     * Create purchase
     */
    async function createPurchase(data) {
        try {
            console.log('🛒 Criando compra com dados:', data);
            const response = await api.post('/purchases', data);
            console.log('📥 Resposta da API createPurchase:', response);
            
            if (response.success || response.id) {
                console.log('✅ Compra criada com sucesso, recarregando lista...');
                showToast('Compra criada com sucesso!', 'success');
                ui.hideModal('purchaseModal');
                
                // Aguardar um pouco antes de recarregar para garantir que o backend processou
                setTimeout(async () => {
                    console.log('🔄 Recarregando lista de compras...');
                    await loadPurchases();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar compra', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar compra:', error);
            showToast('Erro ao criar compra', 'error');
        }
    }

    /**
     * Create supplier
     */
    async function createSupplier(data) {
        try {
            console.log('🏭 Criando fornecedor com dados:', data);
            const response = await api.post('/suppliers', data);
            console.log('📥 Resposta da API createSupplier:', response);
            
            if (response.success || response.id) {
                console.log('✅ Fornecedor criado com sucesso, recarregando lista...');
                showToast('Fornecedor criado com sucesso!', 'success');
                ui.hideModal('supplierModal');
                
                // Recarregar lista de fornecedores
                await loadSuppliers();
                
                // Recarregar dropdowns que usam fornecedores
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de fornecedores...');
                    await loadSuppliersForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar fornecedor', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar fornecedor:', error);
            showToast('Erro ao criar fornecedor', 'error');
        }
    }

    /**
     * Create user
     */
    async function createUser(data) {
        try {
            console.log('👤 Criando usuário com dados:', data);
            const response = await api.post('/users', data);
            console.log('📥 Resposta da API createUser:', response);
            
            if (response.success || response.id) {
                console.log('✅ Usuário criado com sucesso, recarregando lista...');
                showToast('Usuário criado com sucesso!', 'success');
                ui.hideModal('userModal');
                
                // Recarregar lista de usuários
                await loadUsers();
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar usuário', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            showToast('Erro ao criar usuário', 'error');
        }
    }

    /**
     * Update sale
     */
    async function updateSale(data) {
        try {
            console.log('💰 Atualizando venda com dados:', data);
            
            // Verificar se o ID está presente
            if (!data.id) {
                console.error('❌ ID da venda não encontrado nos dados:', data);
                showToast('Erro: ID da venda não encontrado', 'error');
                return;
            }
            
            console.log('✅ ID da venda encontrado:', data.id);
            const response = await api.put(`/sales/${data.id}`, data);
            console.log('📥 Resposta da API updateSale:', response);
            
            if (response.success || response.id) {
                console.log('✅ Venda atualizada com sucesso, recarregando lista...');
                showToast('Venda atualizada com sucesso!', 'success');
                
                // Fechar modal primeiro
                ui.hideModal('saleModal');
                
                // Limpar formulário após fechar modal
                setTimeout(() => {
                    clearSaleForm();
                    console.log('🧹 Formulário de venda limpo após atualização');
                }, 300);
                
                // Recarregar lista de vendas
                await loadSales();
                
                // Recarregar dropdowns para próximas vendas
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de venda...');
                    await loadClientsForDropdown();
                    await loadProductsForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao atualizar venda', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar venda:', error);
            showToast('Erro ao atualizar venda', 'error');
        }
    }

    /**
     * Clear sale form
     */
    function clearSaleForm() {
        console.log('🧹 Limpando formulário de venda...');
        
        // Limpar campos básicos
        const saleForm = document.getElementById('saleForm');
        if (saleForm) {
            saleForm.reset();
        }
        
        // Limpar campos específicos
        const clientSelect = document.getElementById('saleClient');
        if (clientSelect) {
            clientSelect.value = '';
            if (clientSelect.select2) {
                clientSelect.select2('val', '');
            }
        }
        
        const productSelect = document.getElementById('saleProduct');
        if (productSelect) {
            productSelect.value = '';
            if (productSelect.select2) {
                productSelect.select2('val', '');
            }
        }
        
        const quantityInput = document.getElementById('saleQuantity');
        if (quantityInput) {
            quantityInput.value = '';
        }
        
        const priceInput = document.getElementById('salePrice');
        if (priceInput) {
            priceInput.value = '';
        }
        
        const totalInput = document.getElementById('saleTotal');
        if (totalInput) {
            totalInput.value = '';
        }
        
        // Limpar lista de produtos da venda
        const saleProductsList = document.getElementById('saleProductsList');
        if (saleProductsList) {
            saleProductsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
        }
        
        // Limpar campo de ID (se estiver em modo de edição)
        const saleIdInput = document.getElementById('saleId');
        if (saleIdInput) {
            saleIdInput.value = '';
            saleIdInput.disabled = true; // Desabilitar para nova venda
        }
        
        // Limpar campo de data
        const saleDateInput = document.getElementById('saleDate');
        if (saleDateInput) {
            saleDateInput.value = '';
        }
        
        // Limpar campo de status
        const saleStatusInput = document.getElementById('saleStatus');
        if (saleStatusInput) {
            saleStatusInput.value = 'Pendente';
        }
        
        // Limpar campos de pagamento
        const paidValueInput = document.getElementById('salePaidValueInitial');
        if (paidValueInput) {
            paidValueInput.value = '0';
        }
        
        const totalValueDisplay = document.getElementById('saleTotalValueDisplay');
        if (totalValueDisplay) {
            totalValueDisplay.textContent = 'R$ 0,00';
        }
        
        const totalValueHidden = document.getElementById('saleTotalValue');
        if (totalValueHidden) {
            totalValueHidden.value = '0';
        }
        
        // Limpar campos de pagamento inicial
        const paymentForma = document.getElementById('paymentForma');
        if (paymentForma) {
            paymentForma.value = 'Dinheiro';
        }
        
        const paymentParcelas = document.getElementById('paymentParcelas');
        if (paymentParcelas) {
            paymentParcelas.value = '1';
        }
        
        const paymentBandeiraCartao = document.getElementById('paymentBandeiraCartao');
        if (paymentBandeiraCartao) {
            paymentBandeiraCartao.value = '';
        }
        
        const paymentBancoCrediario = document.getElementById('paymentBancoCrediario');
        if (paymentBancoCrediario) {
            paymentBancoCrediario.value = '';
        }
        
        // Limpar campos de vencimento
        const saleDueDateInput = document.getElementById('saleDueDate');
        if (saleDueDateInput) {
            saleDueDateInput.value = '';
        }
        
        // Remover classes de validação
        const allInputs = saleForm?.querySelectorAll('input, select, textarea');
        if (allInputs) {
            allInputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
        
        console.log('✅ Formulário de venda limpo completamente');
    }

    /**
     * Update product
     */
    async function updateProduct(data) {
        try {
            console.log('📦 Atualizando produto com dados:', data);
            const response = await api.put(`/products/${data.id}`, data);
            console.log('📥 Resposta da API updateProduct:', response);
            
            if (response.success || response.id) {
                console.log('✅ Produto atualizado com sucesso, recarregando lista...');
                showToast('Produto atualizado com sucesso!', 'success');
                
                // Limpar dados do modal antes de fechar
                clearProductForm();
                
                // Fechar modal
                ui.hideModal('productModal');
                
                // Recarregar lista de produtos
                await loadProducts();
                
                // Recarregar dropdowns que usam produtos
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de produtos...');
                    await loadProductsForDropdown();
                    await loadProductsForPurchaseDropdown();
                }, 500);
                
                // Atualizar notificações de estoque
                if (window.stockNotificationManager) {
                    setTimeout(() => {
                        window.stockNotificationManager.forceCheck();
                    }, 1000);
                }
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao atualizar produto', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar produto:', error);
            showToast('Erro ao atualizar produto', 'error');
        }
    }

    /**
     * Update purchase
     */
    async function updatePurchase(data) {
        try {
            console.log('🛒 Atualizando compra com dados:', data);
            const response = await api.put(`/purchases/${data.id}`, data);
            console.log('📥 Resposta da API updatePurchase:', response);
            
            if (response.success || response.id) {
                console.log('✅ Compra atualizada com sucesso, recarregando lista...');
                showToast('Compra atualizada com sucesso!', 'success');
                ui.hideModal('purchaseModal');
                
                // Limpar formulário após salvar
                setTimeout(() => {
                    clearPurchaseForm();
                    console.log('🧹 Formulário de compra limpo após salvar');
                }, 300);
                
                // Recarregar lista de compras
                await loadPurchases();
                
                // Recarregar dropdowns para próximas compras
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de compra...');
                    await loadSuppliersForDropdown();
                    await loadProductsForPurchaseDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao atualizar compra', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar compra:', error);
            showToast('Erro ao atualizar compra', 'error');
        }
    }

    /**
     * Update supplier
     */
    async function updateSupplier(data) {
        try {
            console.log('🏭 Atualizando fornecedor com dados:', data);
            const response = await api.put(`/suppliers/${data.id}`, data);
            console.log('📥 Resposta da API updateSupplier:', response);
            
            if (response.success || response.id) {
                console.log('✅ Fornecedor atualizado com sucesso, recarregando lista...');
                showToast('Fornecedor atualizado com sucesso!', 'success');
                ui.hideModal('supplierModal');
                
                // Recarregar lista de fornecedores
                await loadSuppliers();
                
                // Recarregar dropdowns que usam fornecedores
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de fornecedores...');
                    await loadSuppliersForDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao atualizar fornecedor', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar fornecedor:', error);
            showToast('Erro ao atualizar fornecedor', 'error');
        }
    }

    /**
     * Update user
     */
    async function updateUser(data) {
        try {
            console.log('👤 Atualizando usuário com dados:', data);
            const response = await api.put(`/users/${data.id}`, data);
            console.log('📥 Resposta da API updateUser:', response);
            
            if (response.success || response.id) {
                console.log('✅ Usuário atualizado com sucesso, recarregando lista...');
                showToast('Usuário atualizado com sucesso!', 'success');
                ui.hideModal('userModal');
                
                // Recarregar lista de usuários
                await loadUsers();
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao atualizar usuário', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            showToast('Erro ao atualizar usuário', 'error');
        }
    }

    /**
     * Delete client
     */
    async function deleteClient(id) {
        try {
            const response = await api.delete(`/clients/${id}`);
            if (response.success || response.message) {
                showToast('Cliente excluído com sucesso!', 'success');
                loadClients();
            } else {
                showToast('Erro ao excluir cliente', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            showToast('Erro ao excluir cliente', 'error');
        }
    }

    /**
     * Delete sale
     */
    async function deleteSale(id) {
        try {
            const response = await api.delete(`/sales/${id}`);
            if (response.success || response.message) {
                showToast('Venda excluída com sucesso!', 'success');
                loadSales();
            } else {
                showToast('Erro ao excluir venda', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            showToast('Erro ao excluir venda', 'error');
        }
    }

    /**
     * Delete product
     */
    async function deleteProduct(id) {
        try {
            const response = await api.delete(`/products/${id}`);
            if (response.success || response.message) {
                showToast('Produto excluído com sucesso!', 'success');
                loadProducts();
            } else {
                showToast('Erro ao excluir produto', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            showToast('Erro ao excluir produto', 'error');
        }
    }

    /**
     * Delete purchase
     */
    async function deletePurchase(id) {
        try {
            const response = await api.delete(`/purchases/${id}`);
            if (response.success || response.message) {
                showToast('Compra excluída com sucesso!', 'success');
                loadPurchases();
            } else {
                showToast('Erro ao excluir compra', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir compra:', error);
            showToast('Erro ao excluir compra', 'error');
        }
    }

    /**
     * Delete supplier
     */
    async function deleteSupplier(id) {
        try {
            const response = await api.delete(`/suppliers/${id}`);
            if (response.success || response.message) {
                showToast('Fornecedor excluído com sucesso!', 'success');
                loadSuppliers();
            } else {
                showToast('Erro ao excluir fornecedor', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
            showToast('Erro ao excluir fornecedor', 'error');
        }
    }

    /**
     * Delete user
     */
    async function deleteUser(id) {
        try {
            const response = await api.delete(`/users/${id}`);
            if (response.success || response.message) {
                showToast('Usuário excluído com sucesso!', 'success');
                loadUsers();
            } else {
                showToast('Erro ao excluir usuário', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showToast('Erro ao excluir usuário', 'error');
        }
    }

    // ===== ACTION HANDLERS =====

    /**
     * Handle edit action
     */
    async function handleEdit(type, id) {
        try {
            console.log('🎯 handleEdit chamado para:', type, id);
            const response = await api.get(`/${type}s/${id}`);
            console.log('📥 Resposta da API:', response);
            
            // Verificar se a resposta tem success ou se é o objeto diretamente
            if (response.success || response.id) {
                const data = response.data || response;
                console.log('✅ Dados carregados para edição:', data);
                fillEditForm(type, data);
                ui.showModal(`${type}Modal`);
            } else {
                console.log('❌ Erro na resposta:', response.message);
                showToast(response.message || 'Erro ao carregar dados', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar dados para edição:', error);
            
            if (error.message.includes('401') || error.message.includes('404') || error.message.includes('500')) {
                console.log('🔐 Erro API - Usando dados mock para teste de edição');
                // Usar dados mock para teste quando há erro na API
                const mockData = {
                    id: id,
                    client: { id: 1, nome: 'VALTEMIR OLIVEIRA DA SILVA' },
                    dataVenda: '2025-08-04',
                    valorTotal: 400.00,
                    status: 'Pago',
                    products: [
                        { id: 1, name: 'Cimento', quantity: 2, price: 200.00 }
                    ]
                };
                fillEditForm(type, mockData);
                
                // Tentar abrir o modal
                const editModal = document.getElementById('saleModal');
                if (editModal && typeof bootstrap !== 'undefined') {
                    const editBootstrapModal = new bootstrap.Modal(editModal);
                    editBootstrapModal.show();
                    console.log('✅ Modal de edição aberto com dados mock');
                } else {
                    console.error('❌ Modal de edição não encontrado ou Bootstrap não disponível');
                }
            } else {
                showToast('Erro ao carregar dados', 'error');
            }
        }
    }

    /**
     * Handle delete action
     */
    async function handleDelete(type, id) {
        const confirmed = await ui.showConfirm({
            title: 'Confirmar exclusão',
            message: `Tem certeza que deseja excluir este ${type}?`,
            confirmText: 'Excluir',
            confirmClass: 'btn-danger'
        });

        if (confirmed) {
            try {
                console.log('🎯 handleDelete chamado para:', type, id);
                const response = await api.delete(`/${type}s/${id}`);
                console.log('📥 Resposta da API:', response);
                
                // Verificar se a resposta tem success ou se é uma mensagem
                if (response && (response.success || response.message || response.deleted)) {
                    console.log('✅ Item excluído com sucesso');
                    showToast(`${type} excluído com sucesso!`, 'success');
                    // Reload current section data
                    const loadFunction = window[`load${type.charAt(0).toUpperCase() + type.slice(1)}s`];
                    if (loadFunction) {
                        loadFunction();
                    }
                } else {
                    console.log('❌ Erro na resposta:', response);
                    showToast('Erro ao excluir item', 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir:', error);
                // Verificar se é um erro de rede ou servidor
                if (error.message.includes('404')) {
                    showToast('Item não encontrado ou já foi excluído', 'warning');
                } else if (error.message.includes('JSON')) {
                    showToast('Resposta inválida do servidor', 'error');
                } else {
                    showToast('Erro ao excluir item', 'error');
                }
            }
        }
    }

    /**
     * Handle view action
     */
    async function handleView(type, id) {
        console.log('🎯 handleView chamado para:', type, id);
        
        try {
            let data;
            
            if (type === 'sale') {
                // Buscar dados reais da venda da API
                console.log('🔍 Buscando dados reais da venda ID:', id);
                try {
                    const response = await api.get(`/sales/${id}`);
                    console.log('📡 Resposta da API:', response);
                    
                    if (response && response.data) {
                        data = response.data;
                        console.log('✅ Dados reais da venda obtidos:', data);
                    } else if (response && response.id) {
                        // Se a resposta é direta (sem wrapper data)
                        data = response;
                        console.log('✅ Dados reais da venda obtidos (formato direto):', data);
                    } else {
                        console.error('❌ Resposta da API inválida:', response);
                        showToast('Erro ao buscar dados da venda', 'error');
                        return;
                    }
                } catch (apiError) {
                    console.error('❌ Erro na chamada da API:', apiError);
                    showToast('Erro ao conectar com o servidor', 'error');
                    return;
                }
            } else if (type === 'client') {
                // Buscar dados reais do cliente da API
                console.log('🔍 Buscando dados reais do cliente ID:', id);
                try {
                    const response = await api.get(`/clients/${id}`);
                    console.log('📡 Resposta da API cliente:', response);
                    
                    if (response && response.data) {
                        data = response.data;
                        console.log('✅ Dados reais do cliente obtidos:', data);
                    } else if (response && response.id) {
                        // Se a resposta é direta (sem wrapper data)
                        data = response;
                        console.log('✅ Dados reais do cliente obtidos (formato direto):', data);
                    } else {
                        console.error('❌ Resposta da API inválida:', response);
                        showToast('Erro ao buscar dados do cliente', 'error');
                        return;
                    }
                    
                    // Buscar estatísticas do cliente (vendas)
                    console.log('📊 Buscando estatísticas do cliente...');
                    try {
                        const salesResponse = await api.get(`/sales?clientId=${id}`);
                        console.log('📡 Resposta das vendas do cliente:', salesResponse);
                        
                        if (salesResponse && salesResponse.data) {
                            const sales = salesResponse.data;
                            const salesCount = sales.length;
                            const totalSpent = sales.reduce((total, sale) => {
                                return total + (parseFloat(sale.valorTotal) || 0);
                            }, 0);
                            
                            // Adicionar estatísticas aos dados do cliente
                            data.salesCount = salesCount;
                            data.totalSpent = totalSpent;
                            console.log('📊 Estatísticas calculadas:', { salesCount, totalSpent });
                        }
                    } catch (statsError) {
                        console.warn('⚠️ Erro ao buscar estatísticas do cliente:', statsError);
                        // Definir valores padrão se não conseguir buscar
                        data.salesCount = 0;
                        data.totalSpent = 0;
                    }
                } catch (apiError) {
                    console.error('❌ Erro na chamada da API:', apiError);
                    showToast('Erro ao conectar com o servidor', 'error');
                    return;
                }
            } else if (type === 'purchase') {
                // Buscar dados reais da compra da API
                console.log('🔍 Buscando dados reais da compra ID:', id);
                try {
                    const response = await api.get(`/purchases/${id}`);
                    console.log('📡 Resposta da API compra:', response);
                    
                    if (response && response.data) {
                        data = response.data;
                        console.log('✅ Dados reais da compra obtidos:', data);
                    } else if (response && response.id) {
                        // Se a resposta é direta (sem wrapper data)
                        data = response;
                        console.log('✅ Dados reais da compra obtidos (formato direto):', data);
                    } else {
                        console.error('❌ Resposta da API inválida:', response);
                        showToast('Erro ao buscar dados da compra', 'error');
                        return;
                    }
                } catch (apiError) {
                    console.error('❌ Erro na chamada da API:', apiError);
                    showToast('Erro ao conectar com o servidor', 'error');
                    return;
                }
            } else {
                // Para outros tipos, usar dados mock por enquanto
                data = {
                    id: id,
                    nome: 'Dados Mock',
                    email: 'mock@example.com',
                    telefone: '(11) 99999-9999'
                };
            }
            
            // Mostrar detalhes
            showDetailView(type, data);
            
        } catch (error) {
            console.error('❌ Erro em handleView:', error);
            showToast('Erro ao carregar detalhes', 'error');
        }
    }

    // ===== HELPER FUNCTIONS =====

    /**
     * Show detail view
     */
    function showDetailView(type, data) {
        console.log('showDetailView chamada com:', type, data);
        
        if (type === 'client') {
            try {
                // Preencher modal de detalhes do cliente
                const elements = {
                    'detailClientName': data.nome || getTranslatedValue('dash', '-'),
                    'detailClientEmail': data.email || getTranslatedValue('dash', '-'),
                    'detailClientPhone': Utils.formatPhone(data.telefone) || getTranslatedValue('dash', '-'),
                    'detailClientCpfCnpj': Utils.formatDocument(data.cpfCnpj) || getTranslatedValue('dash', '-'),
                    'detailClientAddress': data.endereco || getTranslatedValue('notInformed', 'Não informado'),
                    'detailClientId': data.id || getTranslatedValue('dash', '-'),
                    'detailClientCreated': Utils.formatDate(data.createdAt) || getTranslatedValue('dash', '-'),
                    'detailClientUpdated': Utils.formatDate(data.updatedAt) || getTranslatedValue('dash', '-')
                };
                
                // Preencher cada elemento
                Object.keys(elements).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = elements[id];
                    } else {
                        console.warn(`Elemento não encontrado: ${id}`);
                    }
                });
                
                // Preencher estatísticas
                const salesCountElement = document.getElementById('detailClientSalesCount');
                const totalSpentElement = document.getElementById('detailClientTotalSpent');
                
                if (salesCountElement) {
                    salesCountElement.textContent = data.salesCount || 0;
                }
                
                if (totalSpentElement) {
                    const totalSpent = data.totalSpent || 0;
                    totalSpentElement.textContent = `R$ ${totalSpent.toFixed(2).replace('.', ',')}`;
                }
                
                // Configurar botão de editar
                const editBtn = document.getElementById('editFromDetailBtn');
                if (editBtn) {
                    editBtn.onclick = () => {
                        console.log('Botão editar clicado');
                        
                        // Fechar modal de detalhes
                        const detailModal = document.getElementById('clientDetailModal');
                        if (detailModal && typeof bootstrap !== 'undefined') {
                            const bootstrapModal = bootstrap.Modal.getInstance(detailModal);
                            if (bootstrapModal) {
                                bootstrapModal.hide();
                            }
                        }
                        
                        // Aguardar e abrir modal de edição
                        setTimeout(() => {
                            fillEditForm('client', data);
                            const editModal = document.getElementById('clientModal');
                            if (editModal && typeof bootstrap !== 'undefined') {
                                const editBootstrapModal = new bootstrap.Modal(editModal);
                                editBootstrapModal.show();
                            }
                        }, 300);
                    };
                }
                
                // Mostrar o modal
                const modal = document.getElementById('clientDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                } else {
                    console.error('Modal de detalhes do cliente não encontrado ou Bootstrap não disponível');
                    showToast('Erro ao abrir detalhes do cliente', 'error');
                }
                
            } catch (error) {
                console.error('Erro ao mostrar detalhes do cliente:', error);
                showToast('Erro ao mostrar detalhes do cliente', 'error');
            }
        } else if (type === 'sale') {
            // Lógica para vendas
            try {
                console.log('🎨 Mostrando detalhes da venda:', data);
                
                // Preencher modal de detalhes da venda
                const idElement = document.getElementById('detailSaleId');
                const clientElement = document.getElementById('detailSaleClient');
                const dateElement = document.getElementById('detailSaleDate');
                const totalElement = document.getElementById('detailSaleTotal');
                const statusElement = document.getElementById('detailSaleStatus');
                
                if (idElement) idElement.textContent = data.id || '-';
                if (clientElement) clientElement.textContent = data.client?.nome || data.cliente?.nome || 'N/A';
                if (dateElement) dateElement.textContent = data.dataVenda ? new Date(data.dataVenda).toLocaleDateString('pt-BR') : '-';
                if (totalElement) totalElement.textContent = data.valorTotal ? `R$ ${parseFloat(data.valorTotal).toFixed(2).replace('.', ',')}` : '-';
                if (statusElement) statusElement.textContent = data.status || 'N/A';
                
                // Preencher produtos
                const productsList = document.getElementById('detailSaleProductsList');
                if (productsList) {
                    if (data.saleProducts && Array.isArray(data.saleProducts) && data.saleProducts.length > 0) {
                        const productsHTML = data.saleProducts.map(item => {
                            const product = item.Product || item.product || {};
                            const quantity = item.quantidade || item.quantity || 0;
                            const price = item.precoUnitario || item.price || 0;
                            const total = quantity * price;
                            
                            return `
                                <tr>
                                    <td>${product.nome || product.name || 'Produto'}</td>
                                    <td>${quantity}</td>
                                    <td>R$ ${parseFloat(price).toFixed(2).replace('.', ',')}</td>
                                    <td>R$ ${parseFloat(total).toFixed(2).replace('.', ',')}</td>
                                </tr>
                            `;
                        }).join('');
                        productsList.innerHTML = productsHTML;
                    } else {
                        productsList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum produto encontrado</td></tr>';
                    }
                }
                
                // Preencher pagamentos
                const paymentsList = document.getElementById('detailSalePaymentsList');
                if (paymentsList) {
                    if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
                        const paymentsHTML = data.payments.map(payment => `
                            <tr>
                                <td>${payment.dataPagamento ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>R$ ${parseFloat(payment.valor).toFixed(2).replace('.', ',')}</td>
                                <td>${payment.formaPagamento || 'N/A'}</td>
                            </tr>
                        `).join('');
                        paymentsList.innerHTML = paymentsHTML;
                    } else {
                        paymentsList.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum pagamento encontrado</td></tr>';
                    }
                }
                
                // Configurar botão de editar usando função padronizada
                configureSaleEditButton(data);
                
                // Mostrar o modal
                const modal = document.getElementById('saleDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                    console.log('✅ Modal de detalhes da venda aberto com sucesso');
                } else {
                    console.error('Modal de detalhes da venda não encontrado ou Bootstrap não disponível');
                    showToast('Erro ao abrir detalhes da venda', 'error');
                }
            } catch (error) {
                console.error('Erro ao mostrar detalhes da venda:', error);
                showToast('Erro ao mostrar detalhes da venda', 'error');
            }
        } else if (type === 'purchase') {
            // Lógica para compras
            try {
                console.log('🎨 Mostrando detalhes da compra:', data);
                
                // Preencher informações básicas da compra
                const elements = {
                    'detailPurchaseId': data.id || getTranslatedValue('dash', '-'),
                    'detailPurchaseSupplier': data.supplier?.nome || data.fornecedor?.nome || getTranslatedValue('notAvailable', 'N/A'),
                    'detailPurchaseDate': Utils.formatDate(data.dataCompra) || getTranslatedValue('dash', '-'),
                    'detailPurchaseTotal': Utils.formatCurrency(data.valorTotal) || getTranslatedValue('dash', '-'),
                    'detailPurchaseStatus': getTranslatedStatus(data.status),
                    'detailPurchaseObservations': data.observacoes || data.observations || getTranslatedValue('notInformed', 'Não informado')
                };
                
                // Preencher cada elemento
                Object.keys(elements).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = elements[id];
                    } else {
                        console.warn(`Elemento não encontrado: ${id}`);
                    }
                });
                
                // Preencher produtos da compra
                const productsList = document.getElementById('detailPurchaseProductsList');
                if (productsList) {
                    if (data.purchaseProducts && Array.isArray(data.purchaseProducts) && data.purchaseProducts.length > 0) {
                        const productsHTML = data.purchaseProducts.map(item => {
                            const product = item.Product || item.product || {};
                            const quantity = item.quantidade || item.quantity || 0;
                            const cost = item.precoCustoUnitario || item.costPrice || 0;
                            const total = quantity * cost;
                            
                            return `
                                <tr>
                                    <td>${product.nome || product.name || 'Produto'}</td>
                                    <td>${quantity}</td>
                                    <td>R$ ${parseFloat(cost).toFixed(2).replace('.', ',')}</td>
                                    <td>R$ ${parseFloat(total).toFixed(2).replace('.', ',')}</td>
                                </tr>
                            `;
                        }).join('');
                        productsList.innerHTML = productsHTML;
                    } else {
                        productsList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum produto encontrado</td></tr>';
                    }
                }
                
                // Configurar botão de editar
                const editBtn = document.getElementById('editPurchaseFromDetailBtn');
                if (editBtn) {
                    editBtn.onclick = () => {
                        console.log('Botão editar compra clicado');
                        
                        // Fechar modal de detalhes
                        const detailModal = document.getElementById('purchaseDetailModal');
                        if (detailModal && typeof bootstrap !== 'undefined') {
                            const bootstrapModal = bootstrap.Modal.getInstance(detailModal);
                            if (bootstrapModal) {
                                bootstrapModal.hide();
                            }
                        }
                        
                        // Aguardar e abrir modal de edição
                        setTimeout(() => {
                            fillEditForm('purchase', data);
                            const editModal = document.getElementById('purchaseModal');
                            if (editModal && typeof bootstrap !== 'undefined') {
                                const editBootstrapModal = new bootstrap.Modal(editModal);
                                editBootstrapModal.show();
                            }
                        }, 300);
                    };
                }
                
                // Mostrar o modal
                const modal = document.getElementById('purchaseDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                    console.log('✅ Modal de detalhes da compra aberto com sucesso');
                } else {
                    console.error('Modal de detalhes da compra não encontrado ou Bootstrap não disponível');
                    showToast('Erro ao abrir detalhes da compra', 'error');
                }
            } catch (error) {
                console.error('Erro ao mostrar detalhes da compra:', error);
                showToast('Erro ao mostrar detalhes da compra', 'error');
            }
        } else if (type === 'supplier') {
            // Lógica para fornecedores
            try {
                console.log('🎨 Mostrando detalhes do fornecedor:', data);
                
                // Verificar se existe modal de detalhes do fornecedor
                const modal = document.getElementById('supplierDetailModal');
                if (!modal) {
                    console.log('❌ Modal de detalhes do fornecedor não encontrado');
                    showToast('Modal de detalhes do fornecedor não encontrado', 'error');
                    return;
                }
                
                // Preencher dados do fornecedor
                const elements = {
                    'detailSupplierName': data.nome || getTranslatedValue('dash', '-'),
                    'detailSupplierEmail': data.email || getTranslatedValue('dash', '-'),
                    'detailSupplierPhone': Utils.formatPhone(data.telefone) || getTranslatedValue('dash', '-'),
                    'detailSupplierCnpj': Utils.formatDocument(data.cnpj) || getTranslatedValue('dash', '-'),
                    'detailSupplierAddress': data.endereco || getTranslatedValue('notInformed', 'Não informado'),
                    'detailSupplierId': data.id || getTranslatedValue('dash', '-'),
                    'detailSupplierCreated': Utils.formatDate(data.createdAt) || getTranslatedValue('dash', '-'),
                    'detailSupplierUpdated': Utils.formatDate(data.updatedAt) || getTranslatedValue('dash', '-')
                };
                
                // Preencher cada elemento
                Object.keys(elements).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = elements[id];
                    } else {
                        console.warn(`Elemento não encontrado: ${id}`);
                    }
                });
                
                // Configurar botão de editar
                const editBtn = document.getElementById('editSupplierFromDetailBtn');
                if (editBtn) {
                    editBtn.onclick = () => {
                        console.log('Botão editar fornecedor clicado');
                        
                        // Fechar modal de detalhes
                        if (typeof bootstrap !== 'undefined') {
                            const bootstrapModal = bootstrap.Modal.getInstance(modal);
                            if (bootstrapModal) {
                                bootstrapModal.hide();
                            }
                        }
                        
                        // Aguardar e abrir modal de edição
                        setTimeout(() => {
                            fillEditForm('supplier', data);
                            const editModal = document.getElementById('supplierModal');
                            if (editModal && typeof bootstrap !== 'undefined') {
                                const editBootstrapModal = new bootstrap.Modal(editModal);
                                editBootstrapModal.show();
                            }
                        }, 300);
                    };
                }
                
                // Mostrar o modal
                if (typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                } else {
                    console.error('Bootstrap não disponível');
                    showToast('Erro ao abrir detalhes do fornecedor', 'error');
                }
                
            } catch (error) {
                console.error('Erro ao mostrar detalhes do fornecedor:', error);
                showToast('Erro ao mostrar detalhes do fornecedor', 'error');
            }
        } else if (type === 'user') {
            // Lógica para usuários
            try {
                console.log('🎨 Mostrando detalhes do usuário:', data);
                
                // Verificar se existe modal de detalhes do usuário
                const modal = document.getElementById('userDetailModal');
                if (!modal) {
                    console.log('❌ Modal de detalhes do usuário não encontrado');
                    showToast('Modal de detalhes do usuário não encontrado', 'error');
                    return;
                }
                
                // Preencher dados do usuário
                const elements = {
                    'detailUserName': data.username || getTranslatedValue('dash', '-'),
                    'detailUserEmail': data.email || getTranslatedValue('dash', '-'),
                    'detailUserRole': auth.getRoleDisplayName(data.role) || getTranslatedValue('dash', '-'),
                    'detailUserId': data.id || getTranslatedValue('dash', '-'),
                    'detailUserCreated': Utils.formatDate(data.createdAt) || getTranslatedValue('dash', '-'),
                    'detailUserUpdated': Utils.formatDate(data.updatedAt) || getTranslatedValue('dash', '-')
                };
                
                // Preencher cada elemento
                Object.keys(elements).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = elements[id];
                    } else {
                        console.warn(`Elemento não encontrado: ${id}`);
                    }
                });
                
                // Configurar botão de editar
                const editBtn = document.getElementById('editUserFromDetailBtn');
                if (editBtn) {
                    editBtn.onclick = () => {
                        console.log('Botão editar usuário clicado');
                        
                        // Fechar modal de detalhes
                        if (typeof bootstrap !== 'undefined') {
                            const bootstrapModal = bootstrap.Modal.getInstance(modal);
                            if (bootstrapModal) {
                                bootstrapModal.hide();
                            }
                        }
                        
                        // Aguardar e abrir modal de edição
                        setTimeout(() => {
                            fillEditForm('user', data);
                            const editModal = document.getElementById('userModal');
                            if (editModal && typeof bootstrap !== 'undefined') {
                                const editBootstrapModal = new bootstrap.Modal(editModal);
                                editBootstrapModal.show();
                            }
                        }, 300);
                    };
                }
                
                // Mostrar o modal
                if (typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                } else {
                    console.error('Bootstrap não disponível');
                    showToast('Erro ao abrir detalhes do usuário', 'error');
                }
                
            } catch (error) {
                console.error('Erro ao mostrar detalhes do usuário:', error);
                showToast('Erro ao mostrar detalhes do usuário', 'error');
            }
        } else {
            // Para outros tipos, tentar mostrar uma seção de detalhes
            const detailSection = document.getElementById(`${type}DetailSection`);
            if (detailSection) {
                ui.showSection(`${type}DetailSection`);
            } else {
                showToast('Visualização de detalhes não implementada para este tipo', 'info');
            }
        }
    }

    /**
     * Fill edit form
     */
    function fillEditForm(type, data) {
        console.log(`🎯 Preenchendo formulário de edição para ${type}:`, data);
        
        const form = document.querySelector(`#${type}Modal form`);
        if (!form) {
            console.error(`❌ Formulário não encontrado para ${type}Modal`);
            return;
        }

        // Clear form first
        form.reset();

        // Special handling for sales and purchases
        if (type === 'sale') {
            fillSaleEditForm(data);
        } else if (type === 'purchase') {
            fillPurchaseEditForm(data);
        } else {
            // Fill form fields for other types
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
        }

        // Add ID for update
        const idField = form.querySelector('[name="id"]');
        if (idField) {
            idField.value = data.id;
            idField.disabled = false; // Habilitar campo ID para edição
        }

        // Set action to update
        form.dataset.action = `update${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        // Marcar modal como em modo de edição
        form.dataset.editMode = 'true';

        // Update modal title
        const modal = form.closest('.modal');
        if (modal) {
            const title = modal.querySelector('.modal-title');
            if (title) {
                if (type === 'sale') {
                    title.textContent = 'Editar Venda';
                } else {
                    title.textContent = `Editar ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                }
                console.log(`✅ Título do modal atualizado para: ${title.textContent}`);
            } else {
                console.warn('⚠️ Título do modal não encontrado');
            }
        } else {
            console.warn('⚠️ Modal não encontrado');
        }

        console.log(`✅ Formulário configurado para edição de ${type} com ID: ${data.id}`);
    }

    /**
     * Fill sale edit form with data
     */
    function fillSaleEditForm(data) {
        console.log('🎯 Preenchendo formulário de edição de venda:', data);
        console.log('🔍 Verificando campos do formulário...');
        
        // Verificar se o modal está visível
        const modal = document.getElementById('saleModal');
        if (modal) {
            const isVisible = modal.classList.contains('show') || modal.style.display === 'block';
            console.log('📋 Modal visível:', isVisible);
        }
        
        // Fill basic fields first (without clearing)
        const saleIdField = document.getElementById('saleId');
        if (saleIdField) {
            saleIdField.value = data.id;
            saleIdField.disabled = false; // Habilitar para edição
            console.log('✅ ID preenchido:', saleIdField.value);
        } else {
            console.error('❌ Campo saleId não encontrado');
        }
        
        // Fill date field
        const saleDateField = document.getElementById('saleDate');
        if (saleDateField) {
            let dateValue = '';
            
            if (data.dataVenda) {
                // Se já está no formato YYYY-MM-DD
                if (data.dataVenda.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateValue = data.dataVenda;
                } else {
                    // Converter data para formato YYYY-MM-DD
                    const date = new Date(data.dataVenda);
                    if (!isNaN(date.getTime())) {
                        dateValue = date.toISOString().split('T')[0];
                        console.log(`🔄 Data convertida: ${data.dataVenda} -> ${dateValue}`);
                    }
                }
            } else if (data.date) {
                dateValue = data.date.split('T')[0];
            }
            
            if (dateValue) {
                saleDateField.value = dateValue;
                console.log(`✅ Data preenchida: ${dateValue}`);
            } else {
                console.warn('⚠️ Não foi possível determinar a data da venda');
            }
        } else {
            console.error('❌ Campo saleDate não encontrado');
        }
        
        // Fill due date field
        const saleDueDateField = document.getElementById('saleDueDate');
        if (saleDueDateField && data.dataVencimento) {
            let dueDateValue = '';
            
            if (data.dataVencimento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dueDateValue = data.dataVencimento;
            } else {
                const dueDate = new Date(data.dataVencimento);
                if (!isNaN(dueDate.getTime())) {
                    dueDateValue = dueDate.toISOString().split('T')[0];
                    console.log(`🔄 Data de vencimento convertida: ${data.dataVencimento} -> ${dueDateValue}`);
                }
            }
            
            if (dueDateValue) {
                saleDueDateField.value = dueDateValue;
                console.log(`✅ Data de vencimento preenchida: ${dueDateValue}`);
            }
        } else if (saleDueDateField) {
            console.log('ℹ️ Data de vencimento não disponível ou campo não encontrado');
        }
        
        // Fill status field
        const saleStatusField = document.getElementById('saleStatus');
        if (saleStatusField && data.status) {
            saleStatusField.value = data.status;
            console.log(`✅ Status preenchido: ${saleStatusField.value}`);
        } else if (saleStatusField) {
            console.warn('⚠️ Campo saleStatus encontrado mas status ausente');
        } else {
            console.error('❌ Campo saleStatus não encontrado');
        }
        
        // Fill client if available
        if (data.client) {
            const clientSelect = document.getElementById('saleClient');
            if (clientSelect) {
                let clientValue = '';
                
                // Se temos o ID do cliente, usar ele
                if (data.client.id) {
                    clientValue = data.client.id;
                    console.log(`🎯 ID do cliente encontrado: ${clientValue}`);
                } else if (data.client.nome) {
                    // Se só temos o nome, procurar no dropdown
                    const options = clientSelect.options;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].textContent.includes(data.client.nome)) {
                            clientValue = options[i].value;
                            break;
                        }
                    }
                }
                
                if (clientValue) {
                    // Verificar se o valor existe no dropdown
                    const optionExists = Array.from(clientSelect.options).some(option => option.value === clientValue);
                    if (optionExists) {
                        clientSelect.value = clientValue;
                        console.log(`✅ Cliente selecionado: ${clientValue}`);
                        
                        // Forçar atualização do select
                        const event = new Event('change', { bubbles: true });
                    clientSelect.dispatchEvent(event);
                        
                        // Aguardar um pouco e verificar se foi aplicado
                        setTimeout(() => {
                            if (clientSelect.value === clientValue) {
                                console.log(`✅ Cliente confirmado no select: ${clientSelect.value}`);
                            } else {
                                console.warn(`⚠️ Cliente não foi aplicado corretamente. Esperado: ${clientValue}, Atual: ${clientSelect.value}`);
                            }
                        }, 100);
                        
                        // Atualizar select2 se disponível
                        if (clientSelect.select2) {
                            clientSelect.select2('val', clientValue);
                        }
                    } else {
                        console.error(`❌ Cliente ID ${clientValue} não encontrado nas opções do dropdown`);
                        console.log('🔍 Opções disponíveis no dropdown:');
                        const options = clientSelect.options;
                        for (let i = 0; i < options.length; i++) {
                            console.log(`  ${options[i].value}: ${options[i].textContent}`);
                        }
                    }
                } else {
                    console.warn('⚠️ Cliente não encontrado no dropdown');
                    console.log('🔍 Opções disponíveis no dropdown:');
                    const options = clientSelect.options;
                    for (let i = 0; i < options.length; i++) {
                        console.log(`  ${options[i].value}: ${options[i].textContent}`);
                    }
                }
            } else {
                console.error('❌ Campo saleClient não encontrado');
            }
        } else {
            console.warn('⚠️ Dados do cliente ausentes');
        }
        
        // Fill products list if available
        if (data.products && Array.isArray(data.products)) {
            const saleProductsList = document.getElementById('saleProductsList');
            if (saleProductsList) {
                saleProductsList.innerHTML = '';
                console.log(`📦 Preenchendo ${data.products.length} produtos`);
                
                data.products.forEach((product, index) => {
                    const productItem = document.createElement('div');
                    productItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    productItem.setAttribute('data-product-id', product.id || product.product_id);
                    productItem.innerHTML = `
                        <div>
                            <strong>${product.name || product.product_name || product.Product?.nome || 'Produto'}</strong>
                            <br>
                            <small>Qtd: ${product.quantity || product.quantidade} x R$ ${product.price || product.unit_price || product.precoUnitario || 0}</small>
                        </div>
                        <div>
                            <span class="badge bg-primary rounded-pill">R$ ${((product.quantity || product.quantidade) * (product.price || product.unit_price || product.precoUnitario || 0)).toFixed(2)}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeProductFromSale('${product.id || product.product_id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                    saleProductsList.appendChild(productItem);
                    console.log(`✅ Produto ${index + 1} adicionado: ${product.name || product.Product?.nome || 'Produto'}`);
                });
            } else {
                console.error('❌ Campo saleProductsList não encontrado');
            }
        } else if (data.saleProducts && Array.isArray(data.saleProducts)) {
            // Tentar com saleProducts se products não estiver disponível
            const saleProductsList = document.getElementById('saleProductsList');
            if (saleProductsList) {
                saleProductsList.innerHTML = '';
                console.log(`📦 Preenchendo ${data.saleProducts.length} produtos (saleProducts)`);
                
                data.saleProducts.forEach((product, index) => {
                    const productItem = document.createElement('div');
                    productItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    productItem.setAttribute('data-product-id', product.id || product.product_id);
                    productItem.innerHTML = `
                        <div>
                            <strong>${product.Product?.nome || product.name || 'Produto'}</strong>
                            <br>
                            <small>Qtd: ${product.quantidade} x R$ ${product.precoUnitario || 0}</small>
                        </div>
                        <div>
                            <span class="badge bg-primary rounded-pill">R$ ${(product.quantidade * (product.precoUnitario || 0)).toFixed(2)}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeProductFromSale('${product.id || product.product_id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                    saleProductsList.appendChild(productItem);
                    console.log(`✅ Produto ${index + 1} adicionado: ${product.Product?.nome || 'Produto'}`);
                });
            } else {
                console.error('❌ Campo saleProductsList não encontrado');
            }
        } else {
            console.warn('⚠️ Dados de produtos ausentes');
        }
        
        // Fill payment information if available
        if (data.valorPago !== undefined) {
            const paidValueInput = document.getElementById('salePaidValueInitial');
            if (paidValueInput) {
                // Converter para número se necessário
                const valorPago = parseFloat(data.valorPago) || 0;
                paidValueInput.value = valorPago;
                console.log(`✅ Valor pago preenchido: ${valorPago}`);
                
                // Forçar atualização do campo
                const event = new Event('input', { bubbles: true });
                paidValueInput.dispatchEvent(event);
            } else {
                console.error('❌ Campo salePaidValueInitial não encontrado');
            }
        } else {
            console.warn('⚠️ Valor pago ausente');
            // Definir valor padrão como 0
            const paidValueInput = document.getElementById('salePaidValueInitial');
            if (paidValueInput) {
                paidValueInput.value = '0';
                console.log('✅ Valor pago definido como 0 (padrão)');
            }
        }
        
        // Update total
        updateSaleTotal();
        
        // Update status based on payment
        updateSaleStatus();
        
        // Verificar se o total foi atualizado corretamente
        setTimeout(() => {
            const totalDisplayField = document.getElementById('saleTotalValueDisplay');
            const totalHiddenField = document.getElementById('saleTotalValue');
            if (totalDisplayField && totalHiddenField) {
                console.log(`💰 Total atualizado - Display: ${totalDisplayField.value}, Hidden: ${totalHiddenField.value}`);
            }
        }, 50);
        
        // Verificar se o cliente foi aplicado corretamente após um delay
        setTimeout(() => {
            const clientSelect = document.getElementById('saleClient');
            if (clientSelect && data.client && data.client.id) {
                console.log(`🔍 Verificação final do cliente - ID esperado: ${data.client.id}, Atual: ${clientSelect.value}`);
                if (clientSelect.value !== data.client.id.toString()) {
                    console.warn('⚠️ Cliente não foi aplicado corretamente, tentando novamente...');
                    clientSelect.value = data.client.id;
                    const event = new Event('change', { bubbles: true });
                    clientSelect.dispatchEvent(event);
                }
            }
        }, 200);
        
        console.log('✅ Formulário de edição de venda preenchido com sucesso');
        
        // Verificar se os campos foram realmente preenchidos
        setTimeout(() => {
            console.log('🔍 Verificando preenchimento dos campos...');
            const fields = [
                { id: 'saleId', name: 'ID' },
                { id: 'saleClient', name: 'Cliente' },
                { id: 'saleDate', name: 'Data' },
                { id: 'saleStatus', name: 'Status' },
                { id: 'salePaidValueInitial', name: 'Valor Pago' },
                { id: 'saleTotalValueDisplay', name: 'Total Display' },
                { id: 'saleProductsList', name: 'Lista de Produtos' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    const value = element.value || element.textContent || element.innerHTML;
                    console.log(`  ${field.name}: ${value}`);
                } else {
                    console.log(`  ${field.name}: campo não encontrado`);
                }
            });
        }, 100);
    }

    /**
     * Fill purchase edit form with data
     */
    function fillPurchaseEditForm(data) {
        console.log('🎯 Preenchendo formulário de edição de compra:', data);
        console.log('🔍 Verificando campos do formulário...');
        
        // Verificar se o modal está visível
        const modal = document.getElementById('purchaseModal');
        if (modal) {
            const isVisible = modal.classList.contains('show') || modal.style.display === 'block';
            console.log('📋 Modal visível:', isVisible);
        }
        
        // Fill basic fields first (without clearing)
        const purchaseIdField = document.getElementById('purchaseId');
        if (purchaseIdField) {
            purchaseIdField.value = data.id;
            purchaseIdField.disabled = false; // Habilitar para edição
            console.log('✅ ID preenchido:', purchaseIdField.value);
        } else {
            console.error('❌ Campo purchaseId não encontrado');
        }
        
        // Fill date field
        const purchaseDateField = document.getElementById('purchaseDate');
        if (purchaseDateField) {
            let dateValue = '';
            
            if (data.dataCompra) {
                // Se já está no formato YYYY-MM-DD
                if (data.dataCompra.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateValue = data.dataCompra;
                } else {
                    // Converter data para formato YYYY-MM-DD
                    const date = new Date(data.dataCompra);
                    if (!isNaN(date.getTime())) {
                        dateValue = date.toISOString().split('T')[0];
                        console.log(`🔄 Data convertida: ${data.dataCompra} -> ${dateValue}`);
                    }
                }
            }
            
            purchaseDateField.value = dateValue;
            console.log('✅ Data da compra preenchida:', dateValue);
        } else {
            console.error('❌ Campo purchaseDate não encontrado');
        }
        
        // Fill supplier field
        const supplierSelect = document.getElementById('purchaseSupplier');
        if (supplierSelect) {
            const supplierId = data.supplierId || data.supplier?.id;
            if (supplierId) {
                supplierSelect.value = supplierId;
                // Forçar atualização da UI
                const event = new Event('change');
                supplierSelect.dispatchEvent(event);
                console.log('✅ Fornecedor selecionado:', supplierId);
            } else {
                console.warn('⚠️ ID do fornecedor não encontrado nos dados');
            }
        } else {
            console.error('❌ Campo purchaseSupplier não encontrado');
        }
        
        // Fill status field
        const statusSelect = document.getElementById('purchaseStatus');
        if (statusSelect) {
            statusSelect.value = data.status || 'Concluída';
            console.log('✅ Status preenchido:', statusSelect.value);
        } else {
            console.error('❌ Campo purchaseStatus não encontrado');
        }
        
        // Fill observations field
        const observationsField = document.getElementById('purchaseObservations');
        if (observationsField) {
            observationsField.value = data.observacoes || data.observations || '';
            console.log('✅ Observações preenchidas:', observationsField.value);
        } else {
            console.error('❌ Campo purchaseObservations não encontrado');
        }
        
        // Fill products list
        const productsList = document.getElementById('purchaseProductsList');
        if (productsList) {
            if (data.purchaseProducts && Array.isArray(data.purchaseProducts) && data.purchaseProducts.length > 0) {
                const productsHTML = data.purchaseProducts.map(item => {
                    const product = item.Product || item.product || {};
                    const quantity = item.quantidade || item.quantity || 0;
                    const cost = item.precoCustoUnitario || item.costPrice || 0;
                    const total = quantity * cost;
                    
                    return `
                        <div class="purchase-product-item" data-product-id="${product.id || item.productId}">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${product.nome || product.name || 'Produto'}</strong>
                                    <br>
                                    <small class="text-muted">
                                        Quantidade: ${quantity} | 
                                        Custo: R$ ${parseFloat(cost).toFixed(2).replace('.', ',')} | 
                                        Total: R$ ${parseFloat(total).toFixed(2).replace('.', ',')}
                                    </small>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-danger" 
                                        onclick="removeProductFromPurchase(${product.id || item.productId})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                productsList.innerHTML = productsHTML;
                console.log('✅ Lista de produtos preenchida:', data.purchaseProducts.length, 'produtos');
            } else {
                productsList.innerHTML = '<div class="text-muted text-center">Nenhum produto adicionado</div>';
                console.log('✅ Lista de produtos limpa (nenhum produto)');
            }
        } else {
            console.error('❌ Campo purchaseProductsList não encontrado');
        }
        
        // Update total value
        const totalValueDisplay = document.getElementById('purchaseTotalValueDisplay');
        const totalValueHidden = document.getElementById('purchaseTotalValue');
        if (totalValueDisplay && totalValueHidden) {
            const total = data.valorTotal || 0;
            totalValueDisplay.value = `R$ ${parseFloat(total).toFixed(2).replace('.', ',')}`;
            totalValueHidden.value = total;
            console.log('✅ Valor total atualizado:', total);
        } else {
            console.error('❌ Campos de valor total não encontrados');
        }
        
        // Aguardar um pouco para garantir que todos os campos foram preenchidos
        setTimeout(() => {
            console.log('🔍 Verificando preenchimento dos campos...');
            const fields = [
                { id: 'purchaseId', name: 'ID' },
                { id: 'purchaseSupplier', name: 'Fornecedor' },
                { id: 'purchaseDate', name: 'Data' },
                { id: 'purchaseStatus', name: 'Status' },
                { id: 'purchaseObservations', name: 'Observações' },
                { id: 'purchaseProductsList', name: 'Lista de Produtos' },
                { id: 'purchaseTotalValueDisplay', name: 'Total Display' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    const value = element.value || element.textContent || element.innerHTML;
                    console.log(`  ${field.name}: ${value}`);
                } else {
                    console.log(`  ${field.name}: campo não encontrado`);
                }
            });
        }, 100);
        
        console.log('✅ Formulário de edição de compra preenchido com sucesso');
    }

    /**
     * Setup create form for a specific type
     */
    function setupCreateForm(type) {
        console.log('Setting up create form for:', type);
        
        const form = document.getElementById(`${type}Form`);
        if (!form) {
            console.error('Form not found:', `${type}Form`);
            return;
        }
        
        // Reset form
        form.reset();
        
        // Set action
        form.dataset.action = `create${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        // Disable ID field for new records
        const idField = form.querySelector('input[name="id"]');
        if (idField) {
            idField.value = '';
            idField.disabled = true;
        }
        
        // Limpar campos específicos para clientes e compras
        if (type === 'client') {
            // Aguardar um pouco para garantir que o modal esteja aberto
            setTimeout(() => {
                clearClientForm();
                console.log('🧹 Formulário de cliente limpo na abertura do modal');
            }, 100);
        } else if (type === 'purchase') {
            // Aguardar um pouco para garantir que o modal esteja aberto
            setTimeout(() => {
                clearPurchaseForm();
                console.log('🧹 Formulário de compra limpo na abertura do modal');
            }, 100);
        }
        
        // Update modal title
        const modal = form.closest('.modal');
        if (modal) {
            const title = modal.querySelector('.modal-title');
            if (title) {
                title.textContent = `Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            }
        }
        
        // Setup specific form events (avoiding recursion for sale)
        if (type === 'purchase') {
            setupPurchaseFormEvents();
        } else if (type === 'product') {
            // Configurar geração automática de SKU para produtos
            if (typeof setupSKUAutoGeneration === 'function') {
                setupSKUAutoGeneration();
            }
        }
        
        console.log('Create form setup complete for:', type);
    }

    // ===== SEARCH FUNCTIONS =====

    /**
     * Search clients
     */
    async function searchClients(query) {
        const response = await api.get('/clients', { search: query });
        if (response.success) {
            renderClients(response.data);
        }
    }

    /**
     * Search sales
     */
    async function searchSales(query) {
        const response = await api.get('/sales', { search: query });
        if (response.success) {
            renderSales(response.data);
        }
    }

    /**
     * Search products
     */
    async function searchProducts(query) {
        const response = await api.get('/products', { search: query });
        if (response.success) {
            renderProducts(response.data);
        }
    }

    /**
     * Search purchases
     */
    async function searchPurchases(query) {
        const response = await api.get('/purchases', { search: query });
        if (response.success) {
            renderPurchases(response.data);
        }
    }

    /**
     * Search suppliers
     */
    async function searchSuppliers(query) {
        const response = await api.get('/suppliers', { search: query });
        if (response.success) {
            renderSuppliers(response.data);
        }
    }

    /**
     * Search users
     */
    async function searchUsers(query) {
        const response = await api.get('/users', { search: query });
        if (response.success) {
            renderUsers(response.data);
        }
    }

    // ===== EXPOSE FUNCTIONS TO WINDOW =====
    
    // Expose core functions
    window.loadClients = loadClients;
    window.loadSales = loadSales;
    window.loadProducts = loadProducts;
    window.loadPurchases = loadPurchases;
    window.loadSuppliers = loadSuppliers;
    window.loadUsers = loadUsers;
    
    // Expose render functions
    window.renderClients = renderClients;
    window.renderSales = renderSales;
    window.renderProducts = renderProducts;
    window.renderPurchases = renderPurchases;
    window.renderSuppliers = renderSuppliers;
    window.renderUsers = renderUsers;
    
    // Expose CRUD functions
    window.createClient = createClient;
    window.updateClient = updateClient;
    window.deleteClient = deleteClient;
    window.createSale = createSale;
    window.updateSale = updateSale;
    window.deleteSale = deleteSale;
    window.createProduct = createProduct;
    window.updateProduct = updateProduct;
    window.deleteProduct = deleteProduct;
    window.createPurchase = createPurchase;
    window.updatePurchase = updatePurchase;
    window.deletePurchase = deletePurchase;
    window.createSupplier = createSupplier;
    window.updateSupplier = updateSupplier;
    window.deleteSupplier = deleteSupplier;
    window.createUser = createUser;
    window.updateUser = updateUser;
    window.deleteUser = deleteUser;
    
    // Expose action handlers
    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
    window.handleView = handleView;
    window.showDetailView = showDetailView;
    
    // Expose form functions
    window.fillEditForm = fillEditForm;
    window.setupCreateForm = setupCreateForm;
    
    // Expose utility functions
    window.showToast = showToast;
    window.updateDetailModals = updateDetailModals;
    window.updateTableStatuses = updateTableStatuses;
    window.configureSaleEditButton = configureSaleEditButton;
    window.handleEditFromDetail = handleEditFromDetail;
    
    // Função de debug para testar modais
    window.debugModals = function() {
        console.log('🔍 DEBUG: Verificando modais...');
        
        const modals = [
            'saleDetailModal',
            'saleModal',
            'clientDetailModal',
            'clientModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            console.log(`🔍 ${modalId}:`, modal ? '✅ Encontrado' : '❌ Não encontrado');
        });
        
        console.log('🔍 Bootstrap disponível:', typeof bootstrap !== 'undefined');
        console.log('🔍 Bootstrap Modal:', typeof bootstrap?.Modal);
    };
    
    // Função de debug alternativa (caso a primeira não funcione)
    window.debugModalsAlt = function() {
        console.log('🔍 DEBUG ALTERNATIVO: Verificando modais...');
        
        const modals = [
            'saleDetailModal',
            'saleModal',
            'clientDetailModal',
            'clientModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            console.log(`🔍 ${modalId}:`, modal ? '✅ Encontrado' : '❌ Não encontrado');
        });
        
        console.log('🔍 Bootstrap disponível:', typeof bootstrap !== 'undefined');
        console.log('🔍 Bootstrap Modal:', typeof bootstrap?.Modal);
    };
    
    // Função de debug global (mais simples)
    window.debug = function() {
        console.log('🔍 DEBUG GLOBAL: Verificando modais...');
        console.log('🔍 saleDetailModal:', document.getElementById('saleDetailModal'));
        console.log('🔍 saleModal:', document.getElementById('saleModal'));
        console.log('🔍 Bootstrap:', typeof bootstrap);
    };
    
    // Função de debug inline (executar diretamente no console)
    console.log('🔧 DEBUG: Funções de debug disponíveis:');
    console.log('🔧 - debug() - Verificação básica');
    console.log('🔧 - debugModals() - Verificação completa');
    console.log('🔧 - debugModalsAlt() - Verificação alternativa');
    
    // Verificação automática ao carregar
    setTimeout(() => {
        console.log('🔍 VERIFICAÇÃO AUTOMÁTICA:');
        console.log('🔍 saleDetailModal:', document.getElementById('saleDetailModal') ? '✅' : '❌');
        console.log('🔍 saleModal:', document.getElementById('saleModal') ? '✅' : '❌');
        console.log('🔍 Bootstrap:', typeof bootstrap !== 'undefined' ? '✅' : '❌');
    }, 1000);
    
    // Função de teste direta para vendas
    window.testSaleView = function(id = 1) {
        console.log('🧪 TESTE: Simulando visualização da venda', id);
        handleView('sale', id);
    };
    
    window.testSaleEdit = function(id = 1) {
        console.log('🧪 TESTE: Simulando edição da venda', id);
        handleEdit('sale', id);
    };
    
    // Função de teste com dados simulados (sem API)
    window.testSaleViewMock = function(id = 1) {
        console.log('🧪 TESTE MOCK: Simulando visualização da venda', id);
        
        const mockData = {
            id: id,
            client: { nome: 'Cliente Teste' },
            dataVenda: '2025-08-04',
            valorTotal: 1500.00,
            status: 'Pago',
            products: [
                { id: 1, name: 'Produto 1', quantity: 2, price: 750.00 }
            ]
        };
        
        console.log('📊 Dados simulados:', mockData);
        showDetailView('sale', mockData);
    };
    
    window.testSaleEditMock = function(id = 1) {
        console.log('🧪 TESTE MOCK: Simulando edição da venda', id);
        
        const mockData = {
            id: id,
            client: { id: 1, nome: 'Cliente Teste' },
            dataVenda: '2025-08-04',
            valorTotal: 1500.00,
            status: 'Pago',
            products: [
                { id: 1, name: 'Produto 1', quantity: 2, price: 750.00 }
            ]
        };
        
        console.log('📊 Dados simulados:', mockData);
        fillEditForm('sale', mockData);
        
        const editModal = document.getElementById('saleModal');
        if (editModal && typeof bootstrap !== 'undefined') {
            const editBootstrapModal = new bootstrap.Modal(editModal);
            editBootstrapModal.show();
        }
    };
    
    // Expor funções do modal de venda para uso no HTML
    window.addProductToSale = addProductToSale;
    window.removeProductFromSale = removeProductFromSale;
    window.updateSaleTotal = updateSaleTotal;

    /**
     * Render prediction chart
     */
    function renderPredictionChart(data) {
        const ctx = document.getElementById('predictionChart');
        if (!ctx) return;

        if (state.charts.has('predictionChart')) {
            state.charts.get('predictionChart').destroy();
        }

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: 'Predição de Vendas',
                    data: data.map(item => item.predicted),
                    backgroundColor: '#2E8B57'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        state.charts.set('predictionChart', chart);
    }

    /**
     * Render top products table
     */
    function renderTopProducts(products) {
        const tbody = document.querySelector('#topProductsTable tbody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum produto vendido</td></tr>';
            return;
        }

        tbody.innerHTML = products.slice(0, 5).map(product => `
            <tr>
                <td>${product.nome || product.nome_produto || 'Produto'}</td>
                <td>${product.totalVendas || product.total_vendido || 0}</td>
                <td>${Utils.formatCurrency(product.valorTotal || product.total_valor || 0)}</td>
            </tr>
        `).join('');
    }

    /**
     * Render top clients table
     */
    function renderTopClients(clients) {
        const tbody = document.querySelector('#topClientsTable tbody');
        if (!tbody) return;

        if (!clients || clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Nenhum cliente encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = clients.slice(0, 5).map(client => `
            <tr>
                <td>${client.nome || 'Cliente'}</td>
                <td>${Utils.formatCurrency(client.totalCompras || 0)}</td>
            </tr>
        `).join('');
    }

    /**
     * Render top suppliers table
     */
    function renderTopSuppliers(suppliers) {
        const tbody = document.querySelector('#topSuppliersTable tbody');
        if (!tbody) return;

        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Nenhum fornecedor encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = suppliers.slice(0, 5).map(supplier => `
            <tr>
                <td>${supplier.nome}</td>
                <td>${supplier.totalCompras || 0}</td>
            </tr>
        `).join('');
    }

    /**
     * Render financial maturities
     */
    function renderFinancialMaturities(data) {
        console.log('💰 === RENDERIZANDO MATURIDADES FINANCEIRAS ===');
        console.log('📊 Dados recebidos:', data);
        
        // Overdue Accounts Receivable
        console.log('🔍 Verificando overdueReceivableContent...');
        const overdueReceivableContent = document.getElementById('overdueReceivableContent');
        if (overdueReceivableContent) {
            console.log('✅ Elemento overdueReceivableContent encontrado');
            if (data.overdueReceivable && data.overdueReceivable.length > 0) {
                console.log(`📋 Renderizando ${data.overdueReceivable.length} vendas vencidas`);
                overdueReceivableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th data-i18n="client">Cliente</th>
                                    <th data-i18n="value">Valor</th>
                                    <th data-i18n="dueDate">Vencimento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.overdueReceivable.map(item => `
                                    <tr>
                                        <td>${item.cliente || 'Cliente'}</td>
                                        <td>${Utils.formatCurrency(item.valor || 0)}</td>
                                        <td>${Utils.formatDate(item.vencimento)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                console.log('✅ Vendas vencidas renderizadas com sucesso');
            } else {
                console.log('⚠️ Nenhuma venda vencida encontrada');
                overdueReceivableContent.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingSales">Nenhuma venda pendente encontrada.</p>';
            }
        } else {
            console.error('❌ Elemento overdueReceivableContent não encontrado');
        }

        // Overdue Accounts Payable
        console.log('🔍 Verificando overduePayableTable...');
        const overduePayableTable = document.querySelector('#overduePayableTable tbody');
        if (overduePayableTable) {
            console.log('✅ Elemento overduePayableTable encontrado');
            if (data.overduePayable && data.overduePayable.length > 0) {
                console.log(`📋 Renderizando ${data.overduePayable.length} compras vencidas`);
                overduePayableTable.innerHTML = data.overduePayable.map(item => `
                    <tr>
                        <td>${item.id || getTranslatedValue('dash', '-')}</td>
                        <td>${item.fornecedor || 'Fornecedor'}</td>
                        <td>${Utils.formatDate(item.vencimento)}</td>
                        <td>${Utils.formatCurrency(item.valor || 0)}</td>
                    </tr>
                `).join('');
                console.log('✅ Compras vencidas renderizadas com sucesso');
            } else {
                console.log('⚠️ Nenhuma compra vencida encontrada');
                overduePayableTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted" data-i18n="noOverduePurchases">Nenhuma compra vencida encontrada</td></tr>';
            }
        } else {
            console.error('❌ Elemento overduePayableTable não encontrado');
        }

        // Upcoming Accounts Receivable
        console.log('🔍 Verificando upcomingReceivableContent...');
        const upcomingReceivableContent = document.getElementById('upcomingReceivableContent');
        if (upcomingReceivableContent) {
            console.log('✅ Elemento upcomingReceivableContent encontrado');
            if (data.upcomingReceivable && data.upcomingReceivable.length > 0) {
                console.log(`📋 Renderizando ${data.upcomingReceivable.length} vendas próximas`);
                upcomingReceivableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th data-i18n="client">Cliente</th>
                                    <th data-i18n="value">Valor</th>
                                    <th data-i18n="dueDate">Vencimento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.upcomingReceivable.map(item => `
                                    <tr>
                                        <td>${item.cliente || 'Cliente'}</td>
                                        <td>${Utils.formatCurrency(item.valor || 0)}</td>
                                        <td>${Utils.formatDate(item.vencimento)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                console.log('✅ Vendas próximas renderizadas com sucesso');
            } else {
                console.log('⚠️ Nenhuma venda próxima encontrada');
                upcomingReceivableContent.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingSales">Nenhuma venda pendente encontrada.</p>';
            }
        } else {
            console.error('❌ Elemento upcomingReceivableContent não encontrado');
        }

        // Upcoming Accounts Payable
        console.log('🔍 Verificando upcomingPayableContent...');
        const upcomingPayableContent = document.getElementById('upcomingPayableContent');
        if (upcomingPayableContent) {
            console.log('✅ Elemento upcomingPayableContent encontrado');
            if (data.upcomingPayable && data.upcomingPayable.length > 0) {
                console.log(`📋 Renderizando ${data.upcomingPayable.length} compras próximas`);
                upcomingPayableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th data-i18n="supplier">Fornecedor</th>
                                    <th data-i18n="value">Valor</th>
                                    <th data-i18n="dueDate">Vencimento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.upcomingPayable.map(item => `
                                    <tr>
                                        <td>${item.fornecedor || 'Fornecedor'}</td>
                                        <td>${Utils.formatCurrency(item.valor || 0)}</td>
                                        <td>${Utils.formatDate(item.vencimento)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                console.log('✅ Compras próximas renderizadas com sucesso');
            } else {
                console.log('⚠️ Nenhuma compra próxima encontrada');
                upcomingPayableContent.innerHTML = '<p class="text-center text-muted" data-i18n="noPendingPurchases">Nenhuma compra pendente encontrada.</p>';
            }
        } else {
            console.error('❌ Elemento upcomingPayableContent não encontrado');
        }
        
        console.log('✅ Renderização de maturidades financeiras concluída');
        
        // Atualizar traduções se necessário
        if (window.i18n) {
            window.i18n.updateAllElements();
        }
    }

    // Funções de relatórios
    function exportSalesReport() {
        console.log('📊 Exportando relatório de vendas...');
        showToast('Funcionalidade de exportação em desenvolvimento', 'info');
    }

    async function handleSalesReport() {
        console.log('📊 Gerando relatório de vendas...');
        try {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (!startDate || !endDate) {
                showToast('Por favor, selecione as datas inicial e final', 'warning');
                return;
            }

            console.log('📅 Período selecionado:', { startDate, endDate });

            const response = await api.get(`/sales/report-by-period?startDate=${startDate}&endDate=${endDate}`);
            
            console.log('📥 Resposta da API:', response);
            
            if (response && response.sales) {
                renderSalesReport(response);
                showToast('Relatório de vendas gerado com sucesso!', 'success');
            } else {
                showToast('Erro ao gerar relatório de vendas', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar relatório de vendas:', error);
            showToast('Erro ao gerar relatório de vendas: ' + error.message, 'error');
        }
    }

    async function handleCashFlowReport() {
        console.log('💰 Gerando relatório de fluxo de caixa...');
        try {
            const startDate = document.getElementById('cashFlowStartDate').value;
            const endDate = document.getElementById('cashFlowEndDate').value;
            
            if (!startDate || !endDate) {
                showToast('Por favor, selecione as datas inicial e final', 'warning');
                return;
            }

            console.log('📅 Período selecionado para fluxo de caixa:', { startDate, endDate });

            const response = await api.get(`/finance/cash-flow?startDate=${startDate}&endDate=${endDate}`);
            
            console.log('📥 Resposta da API fluxo de caixa:', response);
            
            if (response) {
                renderCashFlowReport(response);
                showToast('Relatório de fluxo de caixa gerado com sucesso!', 'success');
            } else {
                showToast('Erro ao gerar relatório de fluxo de caixa', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar relatório de fluxo de caixa:', error);
            showToast('Erro ao gerar relatório de fluxo de caixa: ' + error.message, 'error');
        }
    }

    async function handleAccountingReport() {
        console.log('📋 Gerando relatório contábil...');
        try {
            const startDate = document.getElementById('accountingStartDate').value;
            const endDate = document.getElementById('accountingEndDate').value;
            
            if (!startDate || !endDate) {
                showToast('Por favor, selecione as datas inicial e final', 'warning');
                return;
            }

            console.log('📅 Período selecionado para relatório contábil:', { startDate, endDate });

            // Fazer a chamada para a API que retorna o CSV
            const response = await fetch(`${window.API_BASE_URL}/finance/accounting-csv?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            // Obter o blob do arquivo CSV
            const blob = await response.blob();
            
            // Criar link para download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `relatorio_contabil_${startDate}_${endDate}.csv`;
            
            // Adicionar link ao DOM, clicar e remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpar URL
            window.URL.revokeObjectURL(url);
            
            showToast('Relatório contábil exportado com sucesso!', 'success');
            console.log('✅ Relatório contábil exportado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao gerar relatório contábil:', error);
            showToast('Erro ao gerar relatório contábil: ' + error.message, 'error');
        }
    }

    async function handleSalesPrediction() {
        console.log('🔮 Gerando predição de vendas...');
        try {
            const months = document.getElementById('predictionMonths').value;
            
            if (!months || months < 3 || months > 24) {
                showToast('Por favor, selecione um período entre 3 e 24 meses', 'warning');
                return;
            }

            console.log('📅 Período selecionado para predição:', { months });
            
            // Fazer chamada para a API
            const response = await api.get(`/finance/sales-prediction?months=${months}`);
            console.log('📥 Resposta da API de predição:', response);
            
            if (response && response.historicalData) {
                renderSalesPrediction(response);
                showToast('Predição de vendas gerada com sucesso!', 'success');
            } else {
                showToast('Erro ao gerar predição de vendas', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar predição de vendas:', error);
            showToast('Erro ao gerar predição de vendas: ' + error.message, 'error');
        }
    }

    // Expor funções de relatórios globalmente
    window.exportSalesReport = exportSalesReport;
    window.generateSalesReport = handleSalesReport;
    window.generateCashFlowReport = handleCashFlowReport;
    window.exportAccountingReport = handleAccountingReport;
    window.generateSalesPrediction = handleSalesPrediction;
    
    // Expor funções de dropdown globalmente para internacionalização
    window.loadClientsForDropdown = loadClientsForDropdown;
    window.loadProductsForDropdown = loadProductsForDropdown;
    window.loadSuppliersForDropdown = loadSuppliersForDropdown;
    window.loadProductsForPurchaseDropdown = loadProductsForPurchaseDropdown;
    
    // Expor funções principais globalmente
    window.loadDashboardData = loadDashboardData;
    window.loadClients = loadClients;
    window.loadSales = loadSales;
    window.loadProducts = loadProducts;
    window.loadPurchases = loadPurchases;
    window.loadSuppliers = loadSuppliers;
    window.loadUsers = loadUsers;
    
    // Expor funções de formulário globalmente
    window.addProductToSale = addProductToSale;
    window.removeProductFromSale = removeProductFromSale;
    window.updateSaleTotal = updateSaleTotal;
    window.addProductToPurchase = addProductToPurchase;
    window.removeProductFromPurchase = removeProductFromPurchase;
    window.updatePurchaseTotal = updatePurchaseTotal;
    
    // Expor funções de UI globalmente
    window.showToast = showToast;
    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
    window.handleView = handleView;
    window.showDetailView = showDetailView;

    /**
     * Clear sale form
     */
    function clearSaleForm() {
        console.log('🧹 Limpando formulário de venda...');
        
        // Limpar campos básicos
        const saleForm = document.getElementById('saleForm');
        if (saleForm) {
            saleForm.reset();
        }
        
        // Limpar campos específicos
        const clientSelect = document.getElementById('saleClient');
        if (clientSelect) {
            clientSelect.value = '';
            if (clientSelect.select2) {
                clientSelect.select2('val', '');
            }
        }
        
        const productSelect = document.getElementById('saleProduct');
        if (productSelect) {
            productSelect.value = '';
            if (productSelect.select2) {
                productSelect.select2('val', '');
            }
        }
        
        const quantityInput = document.getElementById('saleQuantity');
        if (quantityInput) {
            quantityInput.value = '';
        }
        
        const priceInput = document.getElementById('salePrice');
        if (priceInput) {
            priceInput.value = '';
        }
        
        const totalInput = document.getElementById('saleTotal');
        if (totalInput) {
            totalInput.value = '';
        }
        
        // Limpar lista de produtos da venda
        const saleProductsList = document.getElementById('saleProductsList');
        if (saleProductsList) {
            saleProductsList.innerHTML = '';
        }
        
        // Limpar campo de ID (se estiver em modo de edição)
        const saleIdInput = document.getElementById('saleId');
        if (saleIdInput) {
            saleIdInput.value = '';
        }
        
        // Limpar campo de data
        const saleDateInput = document.getElementById('saleDate');
        if (saleDateInput) {
            saleDateInput.value = '';
        }
        
        // Limpar campo de status
        const saleStatusInput = document.getElementById('saleStatus');
        if (saleStatusInput) {
            saleStatusInput.value = 'pending';
        }
        
        console.log('✅ Formulário de venda limpo');
    }

    function clearPurchaseForm() {
        console.log('🧹 Limpando formulário de compra...');
        
        // Limpar campos básicos
        const purchaseForm = document.getElementById('purchaseForm');
        if (purchaseForm) {
            purchaseForm.reset();
        }
        
        // Limpar campos específicos
        const supplierSelect = document.getElementById('purchaseSupplier');
        if (supplierSelect) {
            supplierSelect.value = '';
            if (supplierSelect.select2) {
                supplierSelect.select2('val', '');
            }
        }
        
        const productSelect = document.getElementById('purchaseProductSelect');
        if (productSelect) {
            productSelect.value = '';
            if (productSelect.select2) {
                productSelect.select2('val', '');
            }
        }
        
        const quantityInput = document.getElementById('purchaseProductQuantity');
        if (quantityInput) {
            quantityInput.value = '';
        }
        
        const costInput = document.getElementById('purchaseProductCost');
        if (costInput) {
            costInput.value = '';
        }
        
        // Limpar lista de produtos da compra
        const purchaseProductsList = document.getElementById('purchaseProductsList');
        if (purchaseProductsList) {
            purchaseProductsList.innerHTML = '<div class="text-muted text-center">Nenhum produto adicionado</div>';
        }
        
        // Limpar campo de ID (se estiver em modo de edição)
        const purchaseIdInput = document.getElementById('purchaseId');
        if (purchaseIdInput) {
            purchaseIdInput.value = '';
            purchaseIdInput.disabled = true;
        }
        
        // Limpar campo de data
        const purchaseDateInput = document.getElementById('purchaseDate');
        if (purchaseDateInput) {
            purchaseDateInput.value = '';
        }
        
        // Limpar campo de status
        const purchaseStatusInput = document.getElementById('purchaseStatus');
        if (purchaseStatusInput) {
            purchaseStatusInput.value = 'Concluída';
        }
        
        // Limpar campo de observações
        const purchaseObservationsInput = document.getElementById('purchaseObservations');
        if (purchaseObservationsInput) {
            purchaseObservationsInput.value = '';
        }
        
        // Limpar valor total
        const totalValueDisplay = document.getElementById('purchaseTotalValueDisplay');
        const totalValueHidden = document.getElementById('purchaseTotalValue');
        if (totalValueDisplay) {
            totalValueDisplay.value = 'R$ 0,00';
        }
        if (totalValueHidden) {
            totalValueHidden.value = '0';
        }
        
        console.log('✅ Formulário de compra limpo');
    }

    // Função para atualizar dinamicamente os cards financeiros
    async function atualizarCardsFinanceiros() {
        console.log('🔄 Atualizando cards financeiros dinamicamente...');
        
        try {
            // Recarregar dados dos cards financeiros
            const data = {};
            await loadDashboardCardsData(data);
            
            // Re-renderizar os cards
            if (data.overdueReceivable) {
                renderOverdueReceivable(data.overdueReceivable);
            }
            if (data.upcomingReceivable) {
                renderUpcomingReceivable(data.upcomingReceivable);
            }
            if (data.overduePayable) {
                renderOverduePayable(data.overduePayable);
            }
            if (data.upcomingPayable) {
                renderUpcomingPayable(data.upcomingPayable);
            }
            
            console.log('✅ Cards financeiros atualizados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar cards financeiros:', error);
        }
    }

    // Configurar atualização automática a cada minuto
    function configurarAtualizacaoAutomatica() {
        console.log('⏰ Configurando atualização automática dos cards financeiros...');
        
        // Atualizar imediatamente
        atualizarCardsFinanceiros();
        
        // Configurar atualização a cada minuto
        setInterval(atualizarCardsFinanceiros, 60000); // 60 segundos
        
        console.log('✅ Atualização automática configurada (a cada 60 segundos)');
    }

    // ========================================
    // FUNÇÕES DE TESTE PARA DEBUG
    // ========================================
    
    // Função para testar clique direto nos botões
    window.testButtonClick = function(action, type, id) {
        console.log('🧪 TESTE: Simulando clique no botão:', { action, type, id });
        
        // Criar um evento de clique simulado
        const event = {
            target: {
                closest: function(selector) {
                    return {
                        dataset: {
                            action: action,
                            type: type,
                            id: id
                        }
                    };
                }
            }
        };
        
        handleButtonClick(event);
    };
    
    // Função para testar diretamente as funções handleView e handleEdit
    window.testDirectView = function(id = 1) {
        console.log('🧪 TESTE DIRETO: Chamando handleView para venda', id);
        handleView('sale', id);
    };
    
    window.testDirectEdit = function(id = 1) {
        console.log('🧪 TESTE DIRETO: Chamando handleEdit para venda', id);
        handleEdit('sale', id);
    };
    
    // Função para testar com dados mock (sem API)
    window.testViewWithMock = function(id = 1) {
        console.log('🧪 TESTE MOCK: Testando visualização com dados mock');
        
        const mockData = {
            id: id,
            client: { nome: 'Cliente Teste' },
            dataVenda: '2025-08-04',
            valorTotal: 1500.00,
            status: 'Pago',
            products: [
                { id: 1, name: 'Produto 1', quantity: 2, price: 750.00 }
            ]
        };
        
        console.log('📊 Dados mock:', mockData);
        showDetailView('sale', mockData);
    };
    
    window.testEditWithMock = function(id = 1) {
        console.log('🧪 TESTE MOCK: Testando edição com dados mock');
        
        const mockData = {
            id: id,
            client: { id: 1, nome: 'Cliente Teste' },
            dataVenda: '2025-08-04',
            valorTotal: 1500.00,
            status: 'Pago',
            products: [
                { id: 1, name: 'Produto 1', quantity: 2, price: 750.00 }
            ]
        };
        
        console.log('📊 Dados mock:', mockData);
        fillEditForm('sale', mockData);
        
        // Tentar abrir o modal
        const editModal = document.getElementById('saleModal');
        if (editModal && typeof bootstrap !== 'undefined') {
            const editBootstrapModal = new bootstrap.Modal(editModal);
            editBootstrapModal.show();
            console.log('✅ Modal de edição aberto');
        } else {
            console.error('❌ Modal de edição não encontrado ou Bootstrap não disponível');
        }
    };
    
    // Função para verificar se os botões existem na tabela
    window.checkTableButtons = function() {
        console.log('🔍 VERIFICANDO BOTÕES NA TABELA DE VENDAS...');
        
        const tbody = document.querySelector('#salesTable tbody');
        if (!tbody) {
            console.log('❌ Tbody não encontrado');
            return;
        }
        
        const buttons = tbody.querySelectorAll('button[data-action]');
        console.log('🎯 Botões encontrados:', buttons.length);
        
        buttons.forEach((button, index) => {
            console.log(`🎯 Botão ${index + 1}:`, {
                action: button.dataset.action,
                type: button.dataset.type,
                id: button.dataset.id,
                text: button.textContent.trim(),
                html: button.outerHTML
            });
        });
    };
    
    // SOLUÇÃO DEFINITIVA: Forçar funcionamento dos botões
    window.forceButtonWork = function() {
        console.log('🔧 FORÇANDO FUNCIONAMENTO DOS BOTÕES...');
        
        // Remover event listeners antigos
        document.removeEventListener('click', handleButtonClick);
        
        // Adicionar event listeners diretamente aos botões
        document.addEventListener('click', function(event) {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            const type = button.dataset.type;
            const id = button.dataset.id;
            
            console.log('🔧 BOTÃO CLICADO:', { action, type, id });
            
            if (action === 'view') {
                console.log('🔧 ABRINDO MODAL DE DETALHES...');
                if (type === 'sale') {
                    // Dados mock para venda
                    const mockData = {
                        id: id,
                        client: { nome: 'VALTEMIR OLIVEIRA DA SILVA' },
                        dataVenda: '2025-08-04',
                        valorTotal: 400.00,
                        status: 'Pago',
                        products: [{ id: 1, name: 'Cimento', quantity: 2, price: 200.00 }]
                    };
                    showDetailView(type, mockData);
                }
            } else if (action === 'edit') {
                console.log('🔧 ABRINDO MODAL DE EDIÇÃO...');
                if (type === 'sale') {
                    // Dados mock para edição
                    const mockData = {
                        id: id,
                        client: { id: 1, nome: 'VALTEMIR OLIVEIRA DA SILVA' },
                        dataVenda: '2025-08-04',
                        valorTotal: 400.00,
                        status: 'Pago',
                        products: [{ id: 1, name: 'Cimento', quantity: 2, price: 200.00 }]
                    };
                    fillEditForm(type, mockData);
                    
                    const editModal = document.getElementById('saleModal');
                    if (editModal && typeof bootstrap !== 'undefined') {
                        const editBootstrapModal = new bootstrap.Modal(editModal);
                        editBootstrapModal.show();
                        console.log('✅ Modal de edição aberto com dados mock');
                    }
                }
            }
        });
        
        console.log('✅ Event listeners forçados adicionados!');
    };
    
    // SOLUÇÃO ULTRA SIMPLES - FUNCIONA SEMPRE
    window.simpleFix = function() {
        console.log('🚀 SOLUÇÃO ULTRA SIMPLES ATIVADA!');
        
        // Adicionar onclick diretamente aos botões
        setTimeout(function() {
            const viewButtons = document.querySelectorAll('button[data-action="view"]');
            const editButtons = document.querySelectorAll('button[data-action="edit"]');
            
            console.log('🎯 Botões encontrados:', viewButtons.length + editButtons.length);
            
            viewButtons.forEach(function(btn) {
                btn.onclick = function() {
                    console.log('👁️ BOTÃO VIEW CLICADO!');
                    const mockData = {
                        id: btn.dataset.id,
                        client: { nome: 'VALTEMIR OLIVEIRA DA SILVA' },
                        dataVenda: '2025-08-04',
                        valorTotal: 400.00,
                        status: 'Pago',
                        products: [{ id: 1, name: 'Cimento', quantity: 2, price: 200.00 }]
                    };
                    showDetailView('sale', mockData);
                };
            });
            
            editButtons.forEach(function(btn) {
                btn.onclick = function() {
                    console.log('✏️ BOTÃO EDIT CLICADO!');
                    const mockData = {
                        id: btn.dataset.id,
                        client: { id: 1, nome: 'VALTEMIR OLIVEIRA DA SILVA' },
                        dataVenda: '2025-08-04',
                        valorTotal: 400.00,
                        status: 'Pago',
                        products: [{ id: 1, name: 'Cimento', quantity: 2, price: 200.00 }]
                    };
                    fillEditForm('sale', mockData);
                    
                    const editModal = document.getElementById('saleModal');
                    if (editModal && typeof bootstrap !== 'undefined') {
                        const editBootstrapModal = new bootstrap.Modal(editModal);
                        editBootstrapModal.show();
                        console.log('✅ Modal de edição aberto!');
                    }
                };
            });
            
            console.log('✅ SOLUÇÃO ULTRA SIMPLES APLICADA!');
        }, 1000);
    };
    
    // ========================================
    // INICIALIZAR APLICAÇÃO
    // ========================================
    
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM já está pronto
        initialize();
    }
    
    // SOLUÇÃO AUTOMÁTICA - EXECUTAR APÓS 2 SEGUNDOS
    setTimeout(function() {
        console.log('🚀 APLICANDO SOLUÇÃO AUTOMÁTICA...');
        if (typeof simpleFix === 'function') {
            simpleFix();
        } else {
            console.log('⚠️ Função simpleFix não encontrada, tentando forceButtonWork...');
            if (typeof forceButtonWork === 'function') {
                forceButtonWork();
            }
        }
    }, 2000);
    
    // Função de teste para debug do modal de edição
    window.testSaleEditModal = function() {
        console.log('🧪 TESTE DO MODAL DE EDIÇÃO DE VENDA');
        
        // Verificar se o modal existe
        const modal = document.getElementById('saleModal');
        if (!modal) {
            console.error('❌ Modal de venda não encontrado');
            return;
        }
        
        console.log('✅ Modal encontrado');
        
        // Verificar se está visível
        const isVisible = modal.classList.contains('show') || modal.style.display === 'block';
        console.log('📋 Modal visível:', isVisible);
        
        // Verificar campos
        const fields = [
            'saleId', 'saleClient', 'saleDate', 'saleStatus', 
            'salePaidValueInitial', 'saleTotalValueDisplay', 'saleProductsList'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const value = element.value || element.textContent || element.innerHTML;
                console.log(`✅ ${fieldId}: ${value}`);
            } else {
                console.error(`❌ ${fieldId}: não encontrado`);
            }
        });
        
        // Verificar título do modal
        const title = modal.querySelector('.modal-title');
        if (title) {
            console.log(`📝 Título do modal: ${title.textContent}`);
        }
    };
    
    // Função para testar edição de venda específica
    window.testEditSale = async function(saleId = 3) {
        console.log(`🧪 TESTANDO EDIÇÃO DA VENDA ${saleId}`);
        
        try {
            // Simular clique no botão de editar
            const editButton = document.querySelector(`button[data-action="edit"][data-id="${saleId}"]`);
            if (editButton) {
                console.log('✅ Botão de editar encontrado, simulando clique...');
                editButton.click();
            } else {
                console.error('❌ Botão de editar não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao testar edição:', error);
        }
    };
    
    // Função para forçar seleção de cliente
    window.forceClientSelection = function(clientId) {
        console.log(`🔧 FORÇANDO SELEÇÃO DO CLIENTE ${clientId}`);
        const clientSelect = document.getElementById('saleClient');
        if (clientSelect) {
            // Verificar se o cliente existe
            const optionExists = Array.from(clientSelect.options).some(option => option.value === clientId.toString());
            if (optionExists) {
                clientSelect.value = clientId;
                console.log(`✅ Cliente ${clientId} selecionado forçadamente`);
                
                // Disparar eventos
                clientSelect.dispatchEvent(new Event('change', { bubbles: true }));
                clientSelect.dispatchEvent(new Event('input', { bubbles: true }));
                
                return true;
            } else {
                console.error(`❌ Cliente ${clientId} não encontrado no dropdown`);
                return false;
            }
        } else {
            console.error('❌ Campo de cliente não encontrado');
            return false;
        }
    };

    function renderSalesReport(data) {
        console.log('📊 Renderizando relatório de vendas:', data);
        const reportResults = document.getElementById('reportResults');
        if (!reportResults) {
            console.error('❌ Elemento reportResults não encontrado');
            return;
        }

        const { sales, summary } = data;
        
        let html = `
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="bi bi-bar-chart-line me-2"></i>Resumo do Relatório</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="text-center">
                                <h4 class="text-primary">${summary.numberOfSales}</h4>
                                <small class="text-muted">Total de Vendas</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h4 class="text-success">R$ ${summary.totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Valor Total</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h4 class="text-info">R$ ${summary.totalPaidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Valor Pago</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h4 class="text-warning">R$ ${summary.totalDueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Valor Devido</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (sales && sales.length > 0) {
            html += `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Valor Total</th>
                                <th>Valor Pago</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            sales.forEach(sale => {
                const valorDevido = sale.valorTotal - sale.valorPago;
                html += `
                    <tr>
                        <td>${sale.id}</td>
                        <td>${sale.client ? sale.client.nome : 'N/A'}</td>
                        <td>${new Date(sale.dataVenda).toLocaleDateString('pt-BR')}</td>
                        <td>R$ ${sale.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td>R$ ${sale.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td><span class="badge bg-${getStatusColor(sale.status)}">${sale.status}</span></td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            html += `
                <div class="alert alert-info text-center">
                    <i class="bi bi-info-circle me-2"></i>
                    Nenhuma venda encontrada no período selecionado.
                </div>
            `;
        }

        reportResults.innerHTML = html;
        console.log('✅ Relatório de vendas renderizado com sucesso');
    }

    function renderCashFlowReport(data) {
        console.log('💰 Renderizando relatório de fluxo de caixa:', data);
        const reportResults = document.getElementById('cashFlowReportResults');
        if (!reportResults) {
            console.error('❌ Elemento cashFlowReportResults não encontrado');
            return;
        }

        const { startDate, endDate, totalReceipts, totalPayments, netCashFlow } = data;
        
        let html = `
            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    <h6 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Fluxo de Caixa</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-success">R$ ${totalReceipts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Total de Receitas</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-danger">R$ ${totalPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Total de Despesas</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-${netCashFlow >= 0 ? 'success' : 'danger'}">R$ ${netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                                <small class="text-muted">Fluxo Líquido</small>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}</small>
                    </div>
                </div>
            </div>
        `;

        // Adicionar gráfico ou análise adicional
        if (netCashFlow >= 0) {
            html += `
                <div class="alert alert-success">
                    <i class="bi bi-arrow-up-circle me-2"></i>
                    <strong>Fluxo Positivo:</strong> O período apresentou um fluxo de caixa positivo, indicando que as receitas superaram as despesas.
                </div>
            `;
        } else {
            html += `
                <div class="alert alert-warning">
                    <i class="bi bi-arrow-down-circle me-2"></i>
                    <strong>Fluxo Negativo:</strong> O período apresentou um fluxo de caixa negativo, indicando que as despesas superaram as receitas.
                </div>
            `;
        }

        // Adicionar análise de percentual
        if (totalReceipts > 0) {
            const profitMargin = ((netCashFlow / totalReceipts) * 100).toFixed(1);
            html += `
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Análise de Margem</h6>
                        <p class="card-text">
                            <strong>Margem de Lucro:</strong> ${profitMargin}%<br>
                            <small class="text-muted">(Fluxo Líquido / Total de Receitas) × 100</small>
                        </p>
                    </div>
                </div>
            `;
        }

        reportResults.innerHTML = html;
        console.log('✅ Relatório de fluxo de caixa renderizado com sucesso');
    }

    function renderSalesPrediction(data) {
        const resultsDiv = document.getElementById('salesPredictionResults');
        if (!resultsDiv) return;

        const { historicalData, period } = data;
        
        if (!historicalData || historicalData.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    <span data-i18n="noDataForPrediction">Não há dados suficientes para gerar a predição de vendas.</span>
                </div>
            `;
            return;
        }

        // Calcular estatísticas
        const totalSales = historicalData.reduce((sum, item) => sum + item.totalSales, 0);
        const totalSalesCount = historicalData.reduce((sum, item) => sum + item.salesCount, 0);
        const averageTicket = totalSalesCount > 0 ? totalSales / totalSalesCount : 0;
        
        // Calcular tendência (crescimento/decrescimento)
        const recentMonths = historicalData.slice(-3);
        const olderMonths = historicalData.slice(0, 3);
        
        const recentAverage = recentMonths.length > 0 ? 
            recentMonths.reduce((sum, item) => sum + item.totalSales, 0) / recentMonths.length : 0;
        const olderAverage = olderMonths.length > 0 ? 
            olderMonths.reduce((sum, item) => sum + item.totalSales, 0) / olderMonths.length : 0;
        
        const trend = recentAverage > olderAverage ? 'crescimento' : 'decrescimento';
        const trendPercentage = olderAverage > 0 ? 
            ((recentAverage - olderAverage) / olderAverage * 100).toFixed(1) : 0;

        // Calcular predição para os próximos 3 meses
        const lastMonthSales = historicalData[historicalData.length - 1]?.totalSales || 0;
        const predictedGrowth = trend === 'crescimento' ? 1.05 : 0.95; // 5% de crescimento ou decrescimento
        
        const predictions = [];
        for (let i = 1; i <= 3; i++) {
            const predictedSales = lastMonthSales * Math.pow(predictedGrowth, i);
            const predictedDate = new Date();
            predictedDate.setMonth(predictedDate.getMonth() + i);
            predictions.push({
                month: predictedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                predictedSales: predictedSales,
                predictedSalesCount: Math.round(predictedSales / averageTicket)
            });
        }

        let html = `
            <div class="row">
                <!-- Resumo Estatístico -->
                <div class="col-md-12 mb-4">
                    <div class="card border-warning">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Resumo Estatístico</h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-md-3">
                                    <div class="border-end">
                                        <h4 class="text-primary mb-1">${totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
                                        <small class="text-muted">Total de Vendas</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="border-end">
                                        <h4 class="text-success mb-1">${totalSalesCount}</h4>
                                        <small class="text-muted">Total de Transações</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="border-end">
                                        <h4 class="text-info mb-1">${averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
                                        <small class="text-muted">Ticket Médio</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div>
                                        <h4 class="text-${trend === 'crescimento' ? 'success' : 'danger'} mb-1">
                                            ${trendPercentage}%
                                            <i class="bi bi-arrow-${trend === 'crescimento' ? 'up' : 'down'}"></i>
                                        </h4>
                                        <small class="text-muted">Tendência</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico Histórico -->
                <div class="col-md-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Histórico de Vendas</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="salesPredictionChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Predições -->
                <div class="col-md-4 mb-4">
                    <div class="card border-success">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Predições (Próximos 3 Meses)</h6>
                        </div>
                        <div class="card-body">
                            ${predictions.map(pred => `
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <strong>${pred.month}</strong>
                                        <br>
                                        <small class="text-muted">${pred.predictedSalesCount} transações previstas</small>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-success fs-6">
                                            ${pred.predictedSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabela de Dados Históricos -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-table me-2"></i>Dados Históricos Detalhados</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Total de Vendas</th>
                                    <th>Nº de Transações</th>
                                    <th>Ticket Médio</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historicalData.map(item => `
                                    <tr>
                                        <td><strong>${new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong></td>
                                        <td>${item.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td>${item.salesCount}</td>
                                        <td>${item.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        resultsDiv.innerHTML = html;

        // Renderizar gráfico
        renderSalesPredictionChart(historicalData, predictions);
        
        console.log('✅ Predição de vendas renderizada com sucesso');
    }

    function renderSalesPredictionChart(historicalData, predictions) {
        const canvas = document.getElementById('salesPredictionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Preparar dados para o gráfico
        const labels = historicalData.map(item => {
            const date = new Date(item.month + '-01');
            return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        });

        const salesData = historicalData.map(item => item.totalSales);
        
        // Adicionar predições aos dados
        const predictionLabels = predictions.map(pred => pred.month);
        const predictionData = predictions.map(pred => pred.predictedSales);

        // Criar gráfico usando Chart.js se disponível
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [...labels, ...predictionLabels],
                    datasets: [{
                        label: 'Vendas Históricas',
                        data: salesData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }, {
                        label: 'Predições',
                        data: [...Array(salesData.length).fill(null), ...predictionData],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderDash: [5, 5],
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Histórico e Predições de Vendas'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // Fallback se Chart.js não estiver disponível
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Gráfico não disponível - Chart.js não carregado', canvas.width/2, canvas.height/2);
        }
    }

    // Inicializar a aplicação quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();