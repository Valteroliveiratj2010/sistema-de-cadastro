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
        data: {
            clients: { page: 1, data: [], total: 0, loaded: false },
            sales: { page: 1, data: [], total: 0, loaded: false },
            products: { page: 1, data: [], total: 0, loaded: false },
            purchases: { page: 1, data: [], total: 0, loaded: false },
            suppliers: { page: 1, data: [], total: 0, loaded: false },
            users: { page: 1, data: [], total: 0, loaded: false }
        }
    };

    /**
     * Helper function to show toast notifications
     */
    function showToast(message, type = 'info', duration = 5000) {
        if (ui && ui.showToast) {
            ui.showToast(message, type, duration);
        } else if (Utils && Utils.showToast) {
            Utils.showToast(message, type, duration);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Initialize application
     */
    function initialize() {
        // Check authentication
        if (!auth.isAuthenticated) {
            window.location.href = '/login.html';
            return;
        }

        // Setup UI
        setupUI();
        
        // Load initial data
        loadInitialData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup form events
        setupSaleFormEvents();
        setupPurchaseFormEvents();
        setupReportFormEvents();
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
        // Section load events
        document.addEventListener('sectionLoad', handleSectionLoad);
        
        // Form submissions
        document.addEventListener('submit', handleFormSubmit);
        
        // Button clicks
        document.addEventListener('click', handleButtonClick);
        
        // Search inputs
        document.addEventListener('input', Utils.debounce(handleSearch, 300));
        
        // Pagination
        document.addEventListener('click', handlePagination);
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
                    
                    // Extrair quantidade e preço do texto
                    // Formato esperado: "Qtd: 2 x R$ 50,00 = R$ 100,00"
                    const quantityMatch = text.match(/Qtd: (\d+)/);
                    const priceMatch = text.match(/x R\$ ([\d,]+\.?\d*)/);
                    
                    if (quantityMatch && priceMatch) {
                        const quantity = parseInt(quantityMatch[1]);
                        const price = parseFloat(priceMatch[1].replace(',', '.'));
                        
                        products.push({
                            productId: parseInt(productId),
                            quantidade: quantity,
                            precoUnitario: price
                        });
                    } else {
                        console.error('Erro ao extrair dados do produto:', text);
                        console.log('   Quantity match:', quantityMatch);
                        console.log('   Price match:', priceMatch);
                    }
                });

                console.log('Produtos coletados:', products);
                data.products = products;

                // Coletar dados do pagamento inicial
                const paidValue = parseFloat(document.getElementById('salePaidValueInitial').value) || 0;
                const paymentForm = document.getElementById('paymentForma').value;
                
                if (paidValue > 0) {
                    data.initialPayment = {
                        valor: paidValue,
                        formaPagamento: paymentForm,
                        parcelas: parseInt(document.getElementById('paymentParcelas').value) || 1,
                        bandeiraCartao: document.getElementById('paymentBandeiraCartao').value || null,
                        bancoCrediario: document.getElementById('paymentBancoCrediario').value || null
                    };
                }

                // Adicionar data de venda se não fornecida
                if (!data.dataVenda) {
                    data.dataVenda = new Date().toISOString().split('T')[0];
                }

                // Adicionar clientId se não estiver presente
                const clientSelect = document.getElementById('saleClient');
                if (clientSelect && clientSelect.value) {
                    data.clientId = parseInt(clientSelect.value);
                }
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
            const createFunction = window[action];
            console.log('🔍 Função encontrada:', createFunction);
            console.log('🔍 Tipo da função:', typeof createFunction);
            
            if (createFunction && typeof createFunction === 'function') {
                console.log('✅ Chamando função createClient...');
                try {
                    await createFunction(data);
                    console.log('✅ Função createClient executada com sucesso');
                } catch (error) {
                    console.error('❌ Erro na função createClient:', error);
                    throw error;
                }
            } else {
                console.error('❌ Função não encontrada:', action);
                console.error('❌ window[action]:', window[action]);
                console.error('❌ typeof window[action]:', typeof window[action]);
                if (ui && ui.showToast) {
                    ui.showToast('Erro interno: função não encontrada', 'error');
                } else if (Utils && Utils.showToast) {
                    Utils.showToast('Erro interno: função não encontrada', 'error');
                } else {
                    alert('Erro interno: função não encontrada');
                }
            }

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
        const button = event.target.closest('[data-action]');
        if (!button) return;
        
        const action = button.dataset.action;
        const id = button.dataset.id;
        
        try {
            switch (action) {
                case 'edit':
                    await handleEdit(button.dataset.type, id);
                    break;
                case 'delete':
                    await handleDelete(button.dataset.type, id);
                    break;
                case 'view':
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
                renderDashboard(data);
            } else {
                console.log('❌ Resposta inválida do dashboard:', response);
                // Renderizar dashboard com dados vazios
                renderDashboard({});
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            // Renderizar dashboard com dados vazios em caso de erro
            renderDashboard({});
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
            const response = await api.get('/sales', { page, limit: 10 });
            if (response.success || Array.isArray(response) || (response.sales && Array.isArray(response.sales)) || (response.data && Array.isArray(response.data))) {
                const sales = response.sales || response.data || response;
                state.data.sales = sales;
                renderSales(response); // Passar o response completo
            }
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
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
            
            clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';

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
                option.textContent = 'Nenhum cliente cadastrado';
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
                clientSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
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
            
            productSelect.innerHTML = '<option value="">Selecione um produto</option>';

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
                option.textContent = 'Nenhum produto cadastrado';
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
                productSelect.innerHTML = '<option value="">Erro ao carregar produtos</option>';
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
            supplierSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';

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
                option.textContent = 'Nenhum fornecedor cadastrado';
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
                supplierSelect.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
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
            
            productSelect.innerHTML = '<option value="">Selecione um produto</option>';

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
                option.textContent = 'Nenhum produto cadastrado';
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
                productSelect.innerHTML = '<option value="">Erro ao carregar produtos</option>';
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
                console.log('🎯 Modal de venda aberto, carregando dropdowns...');
                await loadClientsForDropdown();
                await loadProductsForDropdown();
                console.log('✅ Dropdowns de venda carregados');
            });
        } else {
            console.log('❌ Modal de venda não encontrado');
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
            btnAddProduct.addEventListener('click', addProductToSale);
        }
        
        console.log('✅ Eventos do formulário de venda configurados');
    }

    /**
     * Add product to sale list
     */
    function addProductToSale() {
        const productSelect = document.getElementById('productSelect');
        const quantityInput = document.getElementById('productQuantity');
        const priceInput = document.getElementById('productUnitPrice');
        const productsList = document.getElementById('saleProductsList');

        if (!productSelect.value) {
            showToast('Selecione um produto', 'warning');
            return;
        }

        if (!quantityInput.value || quantityInput.value <= 0) {
            showToast('Informe uma quantidade válida', 'warning');
            return;
        }

        if (!priceInput.value || priceInput.value <= 0) {
            showToast('Informe um preço válido', 'warning');
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = productSelect.value;
        const productName = selectedOption.textContent.split(' - ')[0];
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(priceInput.value);
        const total = quantity * price;

        // Verificar se o produto já foi adicionado
        const existingProduct = productsList.querySelector(`[data-product-id="${productId}"]`);
        if (existingProduct) {
            showToast('Este produto já foi adicionado à venda', 'warning');
            return;
        }

        // Criar elemento do produto
        const productElement = document.createElement('div');
        productElement.className = 'd-flex justify-content-between align-items-center p-2 border rounded mb-2';
        productElement.dataset.productId = productId;
        productElement.innerHTML = `
            <div>
                <strong>${productName}</strong><br>
                <small class="text-muted">Qtd: ${quantity} x R$ ${price.toFixed(2).replace('.', ',')} = R$ ${total.toFixed(2).replace('.', ',')}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeProductFromSale('${productId}')">
                <i class="bi bi-trash"></i>
            </button>
        `;

        // Adicionar à lista
        if (productsList.querySelector('.text-muted.text-center')) {
            productsList.innerHTML = '';
        }
        productsList.appendChild(productElement);

        // Limpar campos
        productSelect.value = '';
        quantityInput.value = '1';
        priceInput.value = '';

        // Atualizar valor total
        updateSaleTotal();
    }

    /**
     * Remove product from sale list
     */
    function removeProductFromSale(productId) {
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            productElement.remove();
            updateSaleTotal();
        }

        // Se não há mais produtos, mostrar mensagem
        const productsList = document.getElementById('saleProductsList');
        if (productsList.children.length === 0) {
            productsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
        }
    }

    /**
     * Update sale total
     */
    function updateSaleTotal() {
        const productsList = document.getElementById('saleProductsList');
        const totalDisplay = document.getElementById('saleTotalValueDisplay');
        const totalHidden = document.getElementById('saleTotalValue');

        let total = 0;
        const productElements = productsList.querySelectorAll('[data-product-id]');
        
        productElements.forEach(element => {
            const text = element.querySelector('small').textContent;
            const totalMatch = text.match(/R\$ ([\d,]+\.?\d*)/);
            if (totalMatch) {
                const productTotal = parseFloat(totalMatch[1].replace(',', ''));
                total += productTotal;
            }
        });

        totalDisplay.value = `R$ ${Utils.formatCurrency(total)}`;
        totalHidden.value = total;
    }

    /**
     * Setup purchase form events
     */
    function setupPurchaseFormEvents() {
        // Carregar dados quando o modal de compra for aberto
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal) {
            purchaseModal.addEventListener('show.bs.modal', async () => {
                await loadSuppliersForDropdown();
                await loadProductsForPurchaseDropdown();
            });
        }

        // Atualizar detalhes do produto quando selecionado
        const productSelect = document.getElementById('purchaseProductSelect');
        if (productSelect) {
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
        }

        // Adicionar produto à lista de compra
        const btnAddPurchaseProduct = document.getElementById('btnAddPurchaseProduct');
        if (btnAddPurchaseProduct) {
            btnAddPurchaseProduct.addEventListener('click', addProductToPurchase);
        }
    }

    /**
     * Add product to purchase list
     */
    function addProductToPurchase() {
        const productSelect = document.getElementById('purchaseProductSelect');
        const quantityInput = document.getElementById('purchaseProductQuantity');
        const costInput = document.getElementById('purchaseProductCost');
        const productsList = document.getElementById('purchaseProductsList');

        if (!productSelect.value) {
            showToast('Selecione um produto', 'warning');
            return;
        }

        if (!quantityInput.value || quantityInput.value <= 0) {
            showToast('Informe uma quantidade válida', 'warning');
            return;
        }

        if (!costInput.value || costInput.value <= 0) {
            showToast('Informe um preço de custo válido', 'warning');
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = productSelect.value;
        const productName = selectedOption.textContent.split(' - ')[0];
        const quantity = parseInt(quantityInput.value);
        const cost = parseFloat(costInput.value);
        const total = quantity * cost;

        // Verificar se o produto já foi adicionado
        const existingProduct = productsList.querySelector(`[data-product-id="${productId}"]`);
        if (existingProduct) {
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

        // Adicionar à lista
        if (productsList.querySelector('.text-muted.text-center')) {
            productsList.innerHTML = '';
        }
        productsList.appendChild(productElement);

        // Limpar campos
        productSelect.value = '';
        quantityInput.value = '1';
        costInput.value = '';
        document.getElementById('purchaseProductDetailsDisplay').textContent = '';

        // Atualizar valor total
        updatePurchaseTotal();
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
        console.log('🎯 Renderizando dashboard com dados:', data);
        
        // Só atualizar os KPI cards se houver dados reais da API
        if (data && Object.keys(data).length > 0) {
            updateKPICard('totalClients', data.totalClients || 0);
            updateKPICard('salesThisMonth', Utils.formatCurrency(data.salesThisMonth || 0));
            updateKPICard('totalReceivable', Utils.formatCurrency(data.totalReceivable || 0));
            updateKPICard('totalAccountsPayable', Utils.formatCurrency(data.totalAccountsPayable || 0));
            updateKPICard('overdueSales', Utils.formatCurrency(data.overdueSales || 0));
            updateKPICard('orderValue', Utils.formatCurrency(data.orderValue || 0));
            updateKPICard('averageTicket', Utils.formatCurrency(data.averageTicket || 0));
            
            // Calcular lucro (vendas - contas a pagar)
            const profit = (data.salesThisMonth || 0) - (data.totalAccountsPayable || 0);
            updateKPICard('profit', Utils.formatCurrency(profit));
        }

        // Render sales chart (sempre com dados mock para manter o layout da imagem)
        renderSalesChart(data.salesByMonth || []);

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
    }

    /**
     * Update KPI card
     */
    function updateKPICard(id, value) {
        const card = document.getElementById(id);
        if (card) {
            const valueElement = card.querySelector('.fs-2');
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
    }

    /**
     * Render sales chart
     */
    function renderSalesChart(data) {
        const ctx = document.getElementById('salesChart');
        if (!ctx) {
            console.log('❌ Elemento salesChart não encontrado');
            return;
        }

        // Destroy existing chart if it exists
        if (state.charts.has('salesChart')) {
            state.charts.get('salesChart').destroy();
        }

        // Dados mock para simular o gráfico da imagem
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        // Dados de vendas 2023 (azul primário)
        const sales2023 = [5, 8, 12, 15, 18, 22, 25, 28, 30, 35, 40, 45];
        
        // Dados de vendas 2024 (azul claro)
        const sales2024 = [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 48];

        console.log('📊 Renderizando gráfico de vendas comparativo');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Vendas 2023 (R$)',
                    data: sales2023,
                    backgroundColor: '#1D4E89',
                    borderColor: '#1D4E89',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }, {
                    label: 'Vendas 2024 (R$)',
                    data: sales2024,
                    backgroundColor: '#2A6FA8',
                    borderColor: '#2A6FA8',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
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
                                size: 11
                            }
                        }
                    }
                }
            }
        });

        state.charts.set('salesChart', chart);
        console.log('✅ Gráfico de vendas comparativo renderizado com sucesso');
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

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Vendas 2023 (R$)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#1D4E89',
                    borderColor: '#1D4E89',
                    borderWidth: 1
                }, {
                    label: 'Vendas 2024 (R$)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#6C757D',
                    borderColor: '#6C757D',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        state.charts.set('salesChart', chart);
    }

    /**
     * Render top products
     */
    function renderTopProducts(products) {
        const tbody = document.querySelector('#topProductsTable tbody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Nenhum produto vendido</td></tr>';
            return;
        }

        tbody.innerHTML = products.slice(0, 5).map(product => `
            <tr>
                <td>${product.nome}</td>
                <td>${product.totalVendas || 0}</td>
            </tr>
        `).join('');
    }

    /**
     * Render top clients
     */
    function renderTopClients(clients) {
        const tbody = document.querySelector('#topClientsTable tbody');
        if (!tbody) return;

        // Se não há dados da API, manter o cliente da imagem
        if (!clients || clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td>Dayse Oliveira</td>
                    <td>R$ 10,00</td>
                </tr>
            `;
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
     * Render top suppliers
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
     * Render overdue receivable
     */
    function renderOverdueReceivable(receivables) {
        const content = document.getElementById('overdueReceivableContent');
        if (!content) return;

        if (receivables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted">Nenhuma venda pendente encontrada.</p>';
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
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
    }

    /**
     * Render overdue payable
     */
    function renderOverduePayable(payables) {
        const tbody = document.querySelector('#overduePayableTable tbody');
        if (!tbody) return;

        if (payables.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma compra vencida encontrada</td></tr>';
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
    }

    /**
     * Render upcoming receivable
     */
    function renderUpcomingReceivable(receivables) {
        const content = document.getElementById('upcomingReceivableContent');
        if (!content) return;

        if (receivables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted">Nenhuma venda pendente encontrada.</p>';
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
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
    }

    /**
     * Render upcoming payable
     */
    function renderUpcomingPayable(payables) {
        const content = document.getElementById('upcomingPayableContent');
        if (!content) return;

        if (payables.length === 0) {
            content.innerHTML = '<p class="text-center text-muted">Nenhuma compra pendente encontrada.</p>';
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Fornecedor</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
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
        const tbody = document.querySelector('#salesTable tbody');
        if (!tbody) return;

        // Verificar se data é um array ou tem a propriedade sales/data
        const sales = Array.isArray(data) ? data : (data.sales || data.data || []);
        
        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma venda encontrada</td></tr>';
            return;
        }

        tbody.innerHTML = sales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${Utils.sanitizeHTML(sale.client?.nome || sale.cliente?.nome || 'N/A')}</td>
                <td>${Utils.formatCurrency(sale.valorTotal)}</td>
                <td>${Utils.formatDate(sale.dataVenda)}</td>
                <td><span class="badge bg-${getStatusColor(sale.status)}">${sale.status}</span></td>
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
        `).join('');

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
                <td>${purchase.id || 'N/A'}</td>
                <td>${Utils.sanitizeHTML(purchase.supplier?.nome || purchase.fornecedor?.nome || 'N/A')}</td>
                <td>${Utils.formatCurrency(purchase.valorTotal || 0)}</td>
                <td>${Utils.formatDate(purchase.dataCompra) || 'N/A'}</td>
                <td><span class="badge bg-${getStatusColor(purchase.status)}">${purchase.status || 'N/A'}</span></td>
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
                <td>${Utils.sanitizeHTML(supplier.nome || 'N/A')}</td>
                <td>${Utils.formatDocument(supplier.cnpj || 'N/A')}</td>
                <td>${Utils.formatPhone(supplier.telefone || 'N/A')}</td>
                <td>${Utils.sanitizeHTML(supplier.email || 'N/A')}</td>
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
                <td>${Utils.sanitizeHTML(user.username || 'N/A')}</td>
                <td>${Utils.sanitizeHTML(user.email || 'N/A')}</td>
                <td><span class="badge bg-primary">${auth.getRoleDisplayName(user.role) || 'N/A'}</span></td>
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
            'Atrasado': 'danger'
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
                showToast(response.message || 'Erro ao criar cliente', 'error');
            }
        } catch (error) {
            console.error('❌ Erro na função createClient:', error);
            showToast('Erro ao criar cliente: ' + error.message, 'error');
        }
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
            const response = await api.post('/products', data);
            console.log('📥 Resposta da API createProduct:', response);
            
            if (response.success || response.id) {
                console.log('✅ Produto criado com sucesso, recarregando lista...');
                showToast('Produto criado com sucesso!', 'success');
                ui.hideModal('productModal');
                
                // Recarregar lista de produtos
                await loadProducts();
                
                // Recarregar dropdowns que usam produtos
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de produtos...');
                    await loadProductsForDropdown();
                    await loadProductsForPurchaseDropdown();
                }, 500);
            } else {
                console.log('❌ Erro na resposta da API:', response);
                showToast(response.message || 'Erro ao criar produto', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao criar produto:', error);
            showToast('Erro ao criar produto', 'error');
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
            const response = await api.put(`/sales/${data.id}`, data);
            console.log('📥 Resposta da API updateSale:', response);
            
            if (response.success || response.id) {
                console.log('✅ Venda atualizada com sucesso, recarregando lista...');
                showToast('Venda atualizada com sucesso!', 'success');
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
                showToast(response.message || 'Erro ao atualizar venda', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar venda:', error);
            showToast('Erro ao atualizar venda', 'error');
        }
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
                ui.hideModal('productModal');
                
                // Recarregar lista de produtos
                await loadProducts();
                
                // Recarregar dropdowns que usam produtos
                setTimeout(async () => {
                    console.log('🔄 Recarregando dropdowns de produtos...');
                    await loadProductsForDropdown();
                    await loadProductsForPurchaseDropdown();
                }, 500);
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
            showToast('Erro ao carregar dados', 'error');
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
        try {
            console.log('🎯 handleView chamado para:', type, id);
            const response = await api.get(`/${type}s/${id}`);
            console.log('📥 Resposta da API:', response);
            
            // Verificar se a resposta tem success ou se é o objeto diretamente
            if (response && (response.success || response.id || response.nome || response.username)) {
                const data = response.data || response;
                console.log('✅ Dados carregados para visualização:', data);
                showDetailView(type, data);
            } else {
                console.log('❌ Erro na resposta:', response);
                showToast('Erro ao carregar dados', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar dados para visualização:', error);
            if (error.message.includes('404')) {
                showToast('Item não encontrado', 'warning');
            } else {
                showToast('Erro ao carregar dados', 'error');
            }
        }
    }

    /**
     * Show detail view
     */
    function showDetailView(type, data) {
        console.log('showDetailView chamada com:', type, data);
        
        if (type === 'client') {
            try {
                // Preencher modal de detalhes do cliente
                const elements = {
                    'detailClientName': data.nome || '-',
                    'detailClientEmail': data.email || '-',
                    'detailClientPhone': Utils.formatPhone(data.telefone) || '-',
                    'detailClientCpfCnpj': Utils.formatDocument(data.cpfCnpj) || '-',
                    'detailClientAddress': data.endereco || 'Não informado',
                    'detailClientId': data.id || '-',
                    'detailClientCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailClientUpdated': Utils.formatDate(data.updatedAt) || '-'
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
            // Lógica para vendas (já existente)
            try {
                // Preencher modal de detalhes da venda
                document.getElementById('detailSaleId').textContent = data.id || '-';
                document.getElementById('detailSaleClient').textContent = data.client?.nome || data.cliente?.nome || 'N/A';
                document.getElementById('detailSaleDate').textContent = Utils.formatDate(data.dataVenda) || '-';
                document.getElementById('detailSaleTotal').textContent = Utils.formatCurrency(data.valorTotal) || '-';
                document.getElementById('detailSaleStatus').textContent = data.status || '-';
                
                // Mostrar o modal
                const modal = document.getElementById('saleDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                }
            } catch (error) {
                console.error('Erro ao mostrar detalhes da venda:', error);
                showToast('Erro ao mostrar detalhes da venda', 'error');
            }
        } else if (type === 'purchase') {
            // Lógica para compras (já existente)
            try {
                // Preencher modal de detalhes da compra
                document.getElementById('detailPurchaseId').textContent = data.id || '-';
                document.getElementById('detailPurchaseSupplier').textContent = data.supplier?.nome || data.fornecedor?.nome || 'N/A';
                document.getElementById('detailPurchaseDate').textContent = Utils.formatDate(data.dataCompra) || '-';
                document.getElementById('detailPurchaseTotal').textContent = Utils.formatCurrency(data.valorTotal) || '-';
                document.getElementById('detailPurchaseStatus').textContent = data.status || '-';
                
                // Mostrar o modal
                const modal = document.getElementById('purchaseDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
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
                    'detailSupplierName': data.nome || '-',
                    'detailSupplierEmail': data.email || '-',
                    'detailSupplierPhone': Utils.formatPhone(data.telefone) || '-',
                    'detailSupplierCnpj': Utils.formatDocument(data.cnpj) || '-',
                    'detailSupplierAddress': data.endereco || 'Não informado',
                    'detailSupplierId': data.id || '-',
                    'detailSupplierCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailSupplierUpdated': Utils.formatDate(data.updatedAt) || '-'
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
                    'detailUserName': data.username || '-',
                    'detailUserEmail': data.email || '-',
                    'detailUserRole': auth.getRoleDisplayName(data.role) || '-',
                    'detailUserId': data.id || '-',
                    'detailUserCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailUserUpdated': Utils.formatDate(data.updatedAt) || '-'
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
     * Handle export action
     */
    async function handleExport(type) {
        try {
            const response = await api.get(`/${type}s/export`);
            if (response.success) {
                Utils.downloadFile(response.data, `${type}s.csv`);
                showToast('Exportação realizada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro na exportação:', error);
            showToast('Erro na exportação', 'error');
        }
    }

    /**
     * Handle print action
     */
    function handlePrint(type) {
        window.print();
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
                    'detailClientName': data.nome || '-',
                    'detailClientEmail': data.email || '-',
                    'detailClientPhone': Utils.formatPhone(data.telefone) || '-',
                    'detailClientCpfCnpj': Utils.formatDocument(data.cpfCnpj) || '-',
                    'detailClientAddress': data.endereco || 'Não informado',
                    'detailClientId': data.id || '-',
                    'detailClientCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailClientUpdated': Utils.formatDate(data.updatedAt) || '-'
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
            // Lógica para vendas (já existente)
            try {
                // Preencher modal de detalhes da venda
                document.getElementById('detailSaleId').textContent = data.id || '-';
                document.getElementById('detailSaleClient').textContent = data.client?.nome || data.cliente?.nome || 'N/A';
                document.getElementById('detailSaleDate').textContent = Utils.formatDate(data.dataVenda) || '-';
                document.getElementById('detailSaleTotal').textContent = Utils.formatCurrency(data.valorTotal) || '-';
                document.getElementById('detailSaleStatus').textContent = data.status || '-';
                
                // Mostrar o modal
                const modal = document.getElementById('saleDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                }
            } catch (error) {
                console.error('Erro ao mostrar detalhes da venda:', error);
                showToast('Erro ao mostrar detalhes da venda', 'error');
            }
        } else if (type === 'purchase') {
            // Lógica para compras (já existente)
            try {
                // Preencher modal de detalhes da compra
                document.getElementById('detailPurchaseId').textContent = data.id || '-';
                document.getElementById('detailPurchaseSupplier').textContent = data.supplier?.nome || data.fornecedor?.nome || 'N/A';
                document.getElementById('detailPurchaseDate').textContent = Utils.formatDate(data.dataCompra) || '-';
                document.getElementById('detailPurchaseTotal').textContent = Utils.formatCurrency(data.valorTotal) || '-';
                document.getElementById('detailPurchaseStatus').textContent = data.status || '-';
                
                // Mostrar o modal
                const modal = document.getElementById('purchaseDetailModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
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
                    'detailSupplierName': data.nome || '-',
                    'detailSupplierEmail': data.email || '-',
                    'detailSupplierPhone': Utils.formatPhone(data.telefone) || '-',
                    'detailSupplierCnpj': Utils.formatDocument(data.cnpj) || '-',
                    'detailSupplierAddress': data.endereco || 'Não informado',
                    'detailSupplierId': data.id || '-',
                    'detailSupplierCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailSupplierUpdated': Utils.formatDate(data.updatedAt) || '-'
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
                    'detailUserName': data.username || '-',
                    'detailUserEmail': data.email || '-',
                    'detailUserRole': auth.getRoleDisplayName(data.role) || '-',
                    'detailUserId': data.id || '-',
                    'detailUserCreated': Utils.formatDate(data.createdAt) || '-',
                    'detailUserUpdated': Utils.formatDate(data.updatedAt) || '-'
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
        const form = document.querySelector(`#${type}Modal form`);
        if (!form) return;

        // Clear form first
        form.reset();

        // Fill form fields
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });

        // Add ID for update
        const idField = form.querySelector('[name="id"]');
        if (idField) {
            idField.value = data.id;
            idField.disabled = false; // Habilitar campo ID para edição
        }

        // Set action to update
        form.dataset.action = `update${type.charAt(0).toUpperCase() + type.slice(1)}`;

        // Update modal title
        const modal = form.closest('.modal');
        if (modal) {
            const title = modal.querySelector('.modal-title');
            if (title) {
                title.textContent = `Editar ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            }
        }

        console.log(`Formulário configurado para edição de ${type} com ID: ${data.id}`);
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
        
        // Update modal title
        const modal = form.closest('.modal');
        if (modal) {
            const title = modal.querySelector('.modal-title');
            if (title) {
                title.textContent = `Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            }
        }
        
        // Setup specific form events
        if (type === 'sale') {
            setupSaleFormEvents();
        } else if (type === 'purchase') {
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
    
    // Initialize the application
    initialize();

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
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Nenhum produto vendido</td></tr>';
            return;
        }

        tbody.innerHTML = products.slice(0, 5).map(product => `
            <tr>
                <td>${product.nome || 'Produto'}</td>
                <td>${product.totalVendas || 0}</td>
            </tr>
        `).join('');
    }

    /**
     * Render top clients table
     */
    function renderTopClients(clients) {
        const tbody = document.querySelector('#topClientsTable tbody');
        if (!tbody) return;

        // Se não há dados da API, manter o cliente da imagem
        if (!clients || clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td>Dayse Oliveira</td>
                    <td>R$ 10,00</td>
                </tr>
            `;
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
        // Overdue Accounts Receivable
        const overdueReceivableContent = document.getElementById('overdueReceivableContent');
        if (overdueReceivableContent) {
            if (data.overdueReceivable && data.overdueReceivable.length > 0) {
                overdueReceivableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
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
            } else {
                overdueReceivableContent.innerHTML = '<p class="text-center text-muted">Nenhuma venda pendente encontrada.</p>';
            }
        }

        // Overdue Accounts Payable
        const overduePayableTable = document.querySelector('#overduePayableTable tbody');
        if (overduePayableTable) {
            if (data.overduePayable && data.overduePayable.length > 0) {
                overduePayableTable.innerHTML = data.overduePayable.map(item => `
                    <tr>
                        <td>${item.id || '-'}</td>
                        <td>${item.fornecedor || 'Fornecedor'}</td>
                        <td>${Utils.formatDate(item.vencimento)}</td>
                        <td>${Utils.formatCurrency(item.valor || 0)}</td>
                    </tr>
                `).join('');
            } else {
                overduePayableTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma compra vencida encontrada</td></tr>';
            }
        }

        // Upcoming Accounts Receivable
        const upcomingReceivableContent = document.getElementById('upcomingReceivableContent');
        if (upcomingReceivableContent) {
            if (data.upcomingReceivable && data.upcomingReceivable.length > 0) {
                upcomingReceivableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
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
            } else {
                upcomingReceivableContent.innerHTML = '<p class="text-center text-muted">Nenhuma venda pendente encontrada.</p>';
            }
        }

        // Upcoming Accounts Payable
        const upcomingPayableContent = document.getElementById('upcomingPayableContent');
        if (upcomingPayableContent) {
            if (data.upcomingPayable && data.upcomingPayable.length > 0) {
                upcomingPayableContent.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Fornecedor</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
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
            } else {
                upcomingPayableContent.innerHTML = '<p class="text-center text-muted">Nenhuma compra pendente encontrada.</p>';
            }
        }
    }

    // Expor funções globalmente para uso em onclick
    window.loadDashboardData = loadDashboardData;
    window.loadSuppliers = loadSuppliers;
    window.loadUsers = loadUsers;
    window.initialize = initialize;
    
    // Expor funções de criação e atualização
    window.createClient = createClient;
    window.updateClient = updateClient;
    window.createSale = createSale;
    window.updateSale = updateSale;
    window.createProduct = createProduct;
    window.updateProduct = updateProduct;
    window.createPurchase = createPurchase;
    window.updatePurchase = updatePurchase;
    window.createSupplier = createSupplier;
    window.updateSupplier = updateSupplier;
    window.createUser = createUser;
    window.updateUser = updateUser;

    // ===== FUNÇÕES DE RELATÓRIOS =====

    /**
     * Setup report form events
     */
    function setupReportFormEvents() {
        console.log('📊 Configurando eventos de relatórios...');
        console.log('✅ Eventos de relatórios configurados (usando handleFormSubmit)');
    }

    /**
     * Handle sales report generation
     */
    async function handleSalesReport(data) {
        console.log('📊 Gerando relatório de vendas...');

        const startDate = data.startDate || document.getElementById('startDate').value;
        const endDate = data.endDate || document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            showToast('Selecione as datas inicial e final', 'warning');
            return;
        }

        try {
            const response = await api.get('/reports/sales', { startDate, endDate });
            console.log('📥 Resposta do relatório de vendas:', response);

            if (response && response.sales) {
                renderSalesReport(response);
            } else {
                showToast('Erro ao gerar relatório de vendas', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar relatório de vendas:', error);
            showToast('Erro ao gerar relatório de vendas', 'error');
        }
    }

    /**
     * Render sales report
     */
    function renderSalesReport(data) {
        const resultsDiv = document.getElementById('reportResults');
        if (!resultsDiv) return;

        const { sales, summary, period } = data;

        // Criar cards de resumo
        const summaryCards = `
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total de Vendas</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.totalSales)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total Pago</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.totalPaid)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total Devido</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.totalDue)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Qtd. de Vendas</h5>
                            <h4 class="mb-0">${summary.salesCount}</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Criar botão de exportação
        const exportButton = `
            <div class="mb-3">
                <button type="button" class="btn btn-success" onclick="exportSalesReport('${period.startDate}', '${period.endDate}')">
                    <i class="bi bi-download me-2"></i>Exportar Relatório CSV
                </button>
            </div>
        `;

        // Criar tabela de vendas
        let tableContent = '';
        if (sales.length === 0) {
            tableContent = '<tr><td colspan="7" class="text-center text-muted">Nenhuma venda encontrada no período</td></tr>';
        } else {
            tableContent = sales.map(sale => `
                <tr>
                    <td>${sale.id}</td>
                    <td>${Utils.sanitizeHTML(sale.clientName)}</td>
                    <td>${Utils.formatDate(sale.saleDate)}</td>
                    <td>R$ ${Utils.formatCurrency(sale.totalValue)}</td>
                    <td>R$ ${Utils.formatCurrency(sale.paidValue)}</td>
                    <td class="${sale.dueValue > 0 ? 'text-danger' : 'text-success'}">R$ ${Utils.formatCurrency(sale.dueValue)}</td>
                    <td><span class="badge bg-${getStatusColor(sale.status)}">${sale.status}</span></td>
                </tr>
            `).join('');
        }

        const table = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Data Venda</th>
                            <th>Valor Total</th>
                            <th>Valor Pago</th>
                            <th>Valor Devido</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
            </div>
        `;

        resultsDiv.innerHTML = summaryCards + exportButton + table;
        console.log('✅ Relatório de vendas renderizado');
    }

    /**
     * Export sales report to CSV
     */
    async function exportSalesReport(startDate, endDate) {
        try {
            console.log('📤 Exportando relatório de vendas...');
            
            // Criar URL para download
            const token = localStorage.getItem('authToken');
            const url = `${api.baseURL}/reports/sales/export?startDate=${startDate}&endDate=${endDate}`;
            
            // Fazer download do arquivo
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao exportar relatório');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `relatorio_vendas_${startDate}_${endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            showToast('Relatório exportado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao exportar relatório:', error);
            showToast('Erro ao exportar relatório', 'error');
        }
    }

    /**
     * Handle cash flow report generation
     */
    async function handleCashFlowReport(data) {
        console.log('💰 Gerando relatório de fluxo de caixa...');

        const startDate = data.cashFlowStartDate || document.getElementById('cashFlowStartDate').value;
        const endDate = data.cashFlowEndDate || document.getElementById('cashFlowEndDate').value;

        if (!startDate || !endDate) {
            showToast('Selecione as datas inicial e final', 'warning');
            return;
        }

        try {
            const response = await api.get('/reports/cash-flow', { startDate, endDate });
            console.log('📥 Resposta do relatório de fluxo de caixa:', response);

            if (response && response.transactions) {
                renderCashFlowReport(response);
            } else {
                showToast('Erro ao gerar relatório de fluxo de caixa', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar relatório de fluxo de caixa:', error);
            showToast('Erro ao gerar relatório de fluxo de caixa', 'error');
        }
    }

    /**
     * Render cash flow report
     */
    function renderCashFlowReport(data) {
        const resultsDiv = document.getElementById('cashFlowReportResults');
        if (!resultsDiv) return;

        const { transactions, summary, period } = data;

        // Criar cards de resumo
        const summaryCards = `
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total Entradas</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.totalInflows)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Total Saídas</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.totalOutflows)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card ${summary.netFlow >= 0 ? 'bg-primary' : 'bg-warning'} text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Fluxo Líquido</h5>
                            <h4 class="mb-0">R$ ${Utils.formatCurrency(summary.netFlow)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">Transações</h5>
                            <h4 class="mb-0">${summary.transactionCount}</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Criar tabela de transações
        let tableContent = '';
        if (transactions.length === 0) {
            tableContent = '<tr><td colspan="6" class="text-center text-muted">Nenhuma transação encontrada no período</td></tr>';
        } else {
            tableContent = transactions.map(transaction => `
                <tr>
                    <td>${Utils.formatDate(transaction.date)}</td>
                    <td><span class="badge bg-${transaction.type === 'ENTRADA' ? 'success' : 'danger'}">${transaction.type}</span></td>
                    <td>${Utils.sanitizeHTML(transaction.description)}</td>
                    <td class="${transaction.type === 'ENTRADA' ? 'text-success' : 'text-danger'}">R$ ${Utils.formatCurrency(transaction.amount)}</td>
                    <td>${Utils.sanitizeHTML(transaction.entity)}</td>
                    <td>${Utils.sanitizeHTML(transaction.paymentMethod)}</td>
                </tr>
            `).join('');
        }

        const table = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-success">
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Origem/Destino</th>
                            <th>Forma Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
            </div>
        `;

        resultsDiv.innerHTML = summaryCards + table;
        console.log('✅ Relatório de fluxo de caixa renderizado');
    }

    /**
     * Handle accounting report export
     */
    async function handleAccountingReport(data) {
        console.log('📊 Exportando relatório contábil...');

        const startDate = data.accountingStartDate || document.getElementById('accountingStartDate').value;
        const endDate = data.accountingEndDate || document.getElementById('accountingEndDate').value;

        if (!startDate || !endDate) {
            showToast('Selecione as datas inicial e final', 'warning');
            return;
        }

        try {
            // Criar URL para download
            const token = localStorage.getItem('authToken');
            const url = `${api.baseURL}/finance/accounting-csv?startDate=${startDate}&endDate=${endDate}`;
            
            // Fazer download do arquivo
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao exportar relatório contábil');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `relatorio_contabil_${startDate}_${endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            showToast('Relatório contábil exportado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao exportar relatório contábil:', error);
            showToast('Erro ao exportar relatório contábil', 'error');
        }
    }

    /**
     * Handle sales prediction
     */
    async function handleSalesPrediction(data) {
        console.log('🔮 Gerando análise preditiva de vendas...');

        const months = data.predictionMonths || document.getElementById('predictionMonths').value;

        if (!months || months < 3 || months > 24) {
            showToast('Selecione um período entre 3 e 24 meses', 'warning');
            return;
        }

        try {
            const response = await api.get('/finance/sales-prediction', { months });
            console.log('📥 Resposta da análise preditiva:', response);

            if (response && response.historicalData) {
                renderSalesPrediction(response);
            } else {
                showToast('Erro ao gerar análise preditiva', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar análise preditiva:', error);
            showToast('Erro ao gerar análise preditiva', 'error');
        }
    }

    /**
     * Render sales prediction
     */
    function renderSalesPrediction(data) {
        const resultsDiv = document.getElementById('salesPredictionResults');
        if (!resultsDiv) return;

        const { historicalData, period } = data;

        // Criar gráfico de tendência
        const chartCanvas = document.createElement('canvas');
        chartCanvas.id = 'salesPredictionChart';
        chartCanvas.style.maxHeight = '400px';

        const chartContainer = `
            <div class="mb-4">
                <h6>Histórico de Vendas (${period.months} meses)</h6>
                <div class="chart-container" style="position: relative; height:400px;">
                    ${chartCanvas.outerHTML}
                </div>
            </div>
        `;

        // Criar tabela de dados históricos
        let tableContent = '';
        if (historicalData.length === 0) {
            tableContent = '<tr><td colspan="4" class="text-center text-muted">Nenhum dado histórico encontrado</td></tr>';
        } else {
            tableContent = historicalData.map(item => `
                <tr>
                    <td>${item.month}</td>
                    <td>R$ ${Utils.formatCurrency(item.totalSales)}</td>
                    <td>${item.salesCount}</td>
                    <td>R$ ${Utils.formatCurrency(item.averageTicket)}</td>
                </tr>
            `).join('');
        }

        const table = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-warning">
                        <tr>
                            <th>Mês</th>
                            <th>Total de Vendas</th>
                            <th>Quantidade de Vendas</th>
                            <th>Ticket Médio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
            </div>
        `;

        resultsDiv.innerHTML = chartContainer + table;

        // Renderizar gráfico
        setTimeout(() => {
            renderPredictionChart(data);
        }, 100);

        console.log('✅ Análise preditiva renderizada');
    }

    // Expor funções de relatórios globalmente
    window.exportSalesReport = exportSalesReport;
    window.generateSalesReport = handleSalesReport;
    window.generateCashFlowReport = handleCashFlowReport;
    window.exportAccountingReport = handleAccountingReport;
    window.generateSalesPrediction = handleSalesPrediction;
})();