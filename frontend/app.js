'use strict';
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO E ESTADO ---
    const API_BASE = 'http://localhost:5000/api';
    const state = {
        bootstrapClientModal: new bootstrap.Modal(document.getElementById('clientModal')),
        bootstrapSaleModal: new bootstrap.Modal(document.getElementById('saleModal')),
        bootstrapConfirmModal: new bootstrap.Modal(document.getElementById('confirmModal')),
        bootstrapProductModal: new bootstrap.Modal(document.getElementById('productModal')),
        chartInstance: null,
        confirmAction: null,
        userRole: null, // Adicionado para armazenar a função do usuário logado
        clients: {
            page: 1,
            query: '',
            limit: 10,
            data: [],
            total: 0,
            loaded: false
        },
        sales: {
            page: 1,
            query: '',
            limit: 10,
            data: [],
            total: 0,
            loaded: false
        },
        salesReport: {
            startDate: null,
            endDate: null,
            data: [],
            summary: null,
        },
        products: {
            page: 1,
            query: '',
            limit: 10,
            data: [],
            total: 0,
            loaded: false
        },
        selectedSaleProducts: [],
        availableProducts: [],
        currentSelectedProduct: null,
    };

    // --- DOM SELECTORS ---
    const dom = {
        navLinks: document.querySelectorAll('.sidebar .nav-link'),
        clientForm: document.getElementById('clientForm'),
        saleForm: document.getElementById('saleForm'),
        confirmModalButton: document.getElementById('confirmModalButton'),
        confirmModalMessage: document.getElementById('confirmModalMessage'),
        logoutButton: document.getElementById('logoutButton'),
        reportPeriodForm: document.getElementById('reportPeriodForm'),
        reportResults: document.getElementById('reportResults'),
        startDateInput: document.getElementById('startDate'),
        endDateInput: document.getElementById('endDate'),
        productForm: document.getElementById('productForm'),
        
        productSelect: $('#productSelect'),
        productQuantityInput: document.getElementById('productQuantity'),
        productUnitPriceInput: document.getElementById('productUnitPrice'),
        btnAddProduct: document.getElementById('btnAddProduct'),
        saleProductsList: document.getElementById('saleProductsList'),
        saleTotalValueDisplay: document.getElementById('saleTotalValueDisplay'),
        saleTotalValueHidden: document.getElementById('saleTotalValue'),
        productDetailsDisplay: document.getElementById('productDetailsDisplay'),

        paymentFormaSelect: document.getElementById('paymentForma'),
        paymentParcelasField: document.getElementById('parcelasField'),
        paymentParcelasInput: document.getElementById('paymentParcelas'),
        paymentBandeiraCartaoField: document.getElementById('bandeiraCartaoField'),
        paymentBandeiraCartaoInput: document.getElementById('paymentBandeiraCartao'),
        paymentBancoCrediarioField: document.getElementById('bancoCrediarioField'),
        paymentBancoCrediarioInput: document.getElementById('paymentBancoCrediario'),
        salePaidValueInitialInput: document.getElementById('salePaidValueInitial'),
        
        sidebar: document.querySelector('.sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        mainContent: document.getElementById('mainContent'),
    };

    // --- UTILITY FUNCTIONS ---
    const utils = {
        formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
        formatDate: (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
        showToast: (message, type = 'success') => {
            Toastify({ text: message, duration: 3000, gravity: "top", position: "right", style: { background: type === 'success' ? '#4f46e5' : '#ef4444' } }).showToast();
        },
        showConfirm: (message, onConfirm) => {
            dom.confirmModalMessage.textContent = message;
            state.confirmAction = onConfirm;
            state.bootstrapConfirmModal.show();
        },
        getToken: () => localStorage.getItem('jwtToken'),
        // NOVO: Função para obter a role do usuário a partir do token
        getUserRole: () => {
            const token = utils.getToken();
            if (!token) return null;
            try {
                // Decodifica o token (apenas a parte do payload)
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.role;
            } catch (error) {
                console.error('Erro ao descodificar token JWT:', error);
                return null;
            }
        },
        logout: (message = 'Sessão expirada ou inválida. Faça login novamente.') => {
            localStorage.removeItem('jwtToken');
            state.userRole = null; // Limpa a role no estado
            utils.showToast(message, 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000); 
        },
        downloadFile: (response) => {
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'download.csv';
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (filenameMatch && filenameMatch.length > 1) { // Fixed length check
                    filename = filenameMatch[1];
                }
            }
            response.blob().then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
        },
        calculateSaleTotal: () => {
            let total = 0;
            state.selectedSaleProducts.forEach(item => {
                total += item.precoUnitario * item.quantidade;
            });
            return total;
        },
        renderSelectedProductsList: () => {
            if (state.selectedSaleProducts.length === 0) {
                dom.saleProductsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
                dom.saleTotalValueDisplay.value = utils.formatCurrency(0);
                dom.saleTotalValueHidden.value = 0;
                return;
            }

            let listHtml = `<ul class="list-group list-group-flush">`;
            state.selectedSaleProducts.forEach((item, index) => {
                listHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-1 ps-2 pe-1">
                        <span>${item.nome} (${item.quantidade}x) - ${utils.formatCurrency(item.precoUnitario)} cada</span>
                        <span>
                            ${utils.formatCurrency(item.precoUnitario * item.quantidade)}
                            <button type="button" class="btn btn-sm btn-outline-danger ms-2 btn-remove-product" data-index="${index}"><i class="bi bi-x-lg"></i></button>
                        </span>
                    </li>
                `;
            });
            listHtml += `</ul>`;
            dom.saleProductsList.innerHTML = listHtml;

            const total = utils.calculateSaleTotal();
            dom.saleTotalValueDisplay.value = utils.formatCurrency(total);
            dom.saleTotalValueHidden.value = total;
        },
        togglePaymentFields: (formaPagamentoSelect, parcelasField, bandeiraCartaoField, bancoCrediarioField, parcelasInput, bandeiraCartaoInput, bancoCrediarioInput) => {
            const formaPagamento = formaPagamentoSelect.value;
            if (parcelasField) parcelasField.style.display = 'none';
            if (bandeiraCartaoField) bandeiraCartaoField.style.display = 'none';
            if (bancoCrediarioField) bancoCrediarioField.style.display = 'none';
            if (parcelasInput) parcelasInput.value = '1';
            if (bandeiraCartaoInput) bandeiraCartaoInput.value = '';
            if (bancoCrediarioInput) bancoCrediarioInput.value = '';

            if (formaPagamento === 'Cartão de Crédito') {
                if (parcelasField) parcelasField.style.display = 'block';
                if (bandeiraCartaoField) bandeiraCartaoField.style.display = 'block';
            } else if (formaPagamento === 'Crediário') {
                if (parcelasField) parcelasField.style.display = 'block';
                if (bancoCrediarioField) bancoCrediarioField.style.display = 'block';
            }
        },
        generateSaleMessage: (sale) => {
            const clientName = sale.client?.nome || 'Cliente';
            const saleDate = utils.formatDate(sale.dataVenda);
            const totalValue = utils.formatCurrency(sale.valorTotal);
            const paidValue = utils.formatCurrency(sale.valorPago);
            const dueValue = utils.formatCurrency(sale.valorTotal - sale.valorPago);

            let message = `Olá, ${clientName}! Detalhes da sua compra no Gestor PRO (ID: #${sale.id}):\n`;
            message += `Data da Compra: ${saleDate}\n`;
            message += `Valor Total: ${totalValue}\n`;
            message += `Valor Pago: ${paidValue}\n`;
            message += `Valor Devido: ${dueValue}\n\n`;

            if (sale.products && sale.products.length > 0) {
                message += 'Itens Comprados:\n';
                sale.products.forEach(item => {
                    message += `- ${item.SaleProduct.quantidade}x ${item.nome} (${utils.formatCurrency(item.SaleProduct.precoUnitario)} cada)\n`;
                });
                message += '\n';
            }

            if (sale.payments && sale.payments.length > 0) {
                message += 'Histórico de Pagamentos:\n';
                sale.payments.forEach(p => {
                    message += `- ${utils.formatCurrency(p.valor)} em ${utils.formatDate(p.dataPagamento)} via ${p.formaPagamento}`;
                    if (p.parcelas && p.parcelas > 1) message += ` (${p.parcelas}x)`;
                    if (p.bandeiraCartao) message += ` (${p.bandeiraCartao})`;
                    if (p.bancoCrediario) message += ` (${p.bancoCrediario})`;
                    message += '\n';
                });
                message += '\n';
            }

            message += `Status da Venda: ${sale.status}\n`;
            message += `Obrigado(a) pela preferência!`;

            return message;
        },
        generatePrintContent: (sale) => {
            const companyName = "Gestor PRO";
            const companyAddress = "Rua Exemplo, 123 - Cidade, Estado";
            const companyPhone = "(XX) XXXX-XXXX";
            const companyEmail = "contato@gestorpro.com";

            const clientName = sale.client?.nome || 'N/A';
            const clientPhone = sale.client?.telefone || 'N/A';
            const clientEmail = sale.client?.email || 'N/A';
            const saleDate = utils.formatDate(sale.dataVenda);
            const totalValue = utils.formatCurrency(sale.valorTotal);
            const paidValue = utils.formatCurrency(sale.valorPago);
            const valorDevidoCalculado = sale.valorTotal - sale.valorPago;
            const dueValue = utils.formatCurrency(valorDevidoCalculado);

            let productsHtml = '';
            if (sale.products && sale.products.length > 0) {
                productsHtml = `
                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th class="text-end">Qtd</th>
                                <th class="text-end">Preço Unit.</th>
                                <th class="text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.products.map(item => `
                                <tr>
                                    <td>${item.nome}</td>
                                    <td class="text-end">${item.SaleProduct.quantidade}</td>
                                    <td class="text-end">${utils.formatCurrency(item.SaleProduct.precoUnitario)}</td>
                                    <td class="text-end">${utils.formatCurrency(item.SaleProduct.quantidade * item.SaleProduct.precoUnitario)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                productsHtml = `<p>Nenhum produto associado.</p>`;
            }

            let paymentsHtml = '';
            if (sale.payments && sale.payments.length > 0) {
                paymentsHtml = `
                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Data Pagamento</th>
                                <th>Forma</th>
                                <th>Detalhes</th>
                                <th class="text-end">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.payments.map(p => `
                                <tr>
                                    <td>${utils.formatDate(p.dataPagamento)}</td>
                                    <td>${p.formaPagamento}</td>
                                    <td>
                                        ${p.parcelas && p.parcelas > 1 ? `${p.parcelas}x ` : ''}
                                        ${p.bandeiraCartao || p.bancoCrediario || ''}
                                    </td>
                                    <td class="text-end">${utils.formatCurrency(p.valor)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                paymentsHtml = `<p>Nenhum pagamento registrado.</p>`;
            }

            const printHtml = `
                <html>
                <head>
                    <title>Recibo de Venda #${sale.id}</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        .print-header { text-align: center; margin-bottom: 30px; }
                        .print-header h1 { margin: 0; font-size: 1.8em; }
                        .print-header p { margin: 5px 0; font-size: 0.9em; color: #555; }
                        .section-title { font-size: 1.2em; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; margin-bottom: 15px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                        .info-item strong { display: block; margin-bottom: 3px; color: #333; }
                        .print-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.9em; }
                        .print-table th { background-color: #f2f2f2; }
                        .text-end { text-align: right; }
                        .summary-totals { text-align: right; margin-top: 20px; }
                        .summary-totals div { margin-bottom: 5px; }
                        .summary-totals strong { font-size: 1.1em; }
                        .footer-message { text-align: center; margin-top: 40px; font-size: 0.9em; color: #777; }
                        @media print {
                            body { margin: 0; }
                            .print-header, .section-title, .info-grid, .print-table, .summary-totals, .footer-message {
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1>${companyName}</h1>
                        <p>${companyAddress}</p>
                        <p>Telefone: ${companyPhone} | Email: ${companyEmail}</p>
                        <hr>
                        <h2>RECIBO DE VENDA #${sale.id}</h2>
                    </div>

                    <div class="section-title">Dados do Cliente</div>
                    <div class="info-grid">
                        <div><strong>Nome:</strong> ${clientName}</div>
                        <div><strong>Telefone:</strong> ${clientPhone}</div>
                        <div><strong>Email:</strong> ${clientEmail}</div>
                        <div><strong>Data da Compra:</strong> ${saleDate}</div>
                    </div>

                    <div class="section-title">Itens da Venda</div>
                    ${productsHtml}

                    <div class="section-title">Histórico de Pagamentos</div>
                    ${paymentsHtml}

                    <div class="summary-totals">
                        <div>Valor Total: <strong>${totalValue}</strong></div>
                        <div>Valor Pago: <strong>${paidValue}</strong></div>
                        <div>Valor Devido: <strong style="color: ${valorDevidoCalculado > 0 ? '#dc3545' : '#28a745'}">${dueValue}</strong></div>
                        <div>Status: <span class="badge bg-secondary">${sale.status}</span></div>
                    </div>

                    <div class="footer-message">
                        <p>Agradecemos a sua preferência!</p>
                        <p>Este documento não é fiscal.</p>
                    </div>
                </body>
                </html>
            `;
            return printHtml;
        }
    };

    // --- API LOGIC ---
    const api = {
        async request(endpoint, options = {}) {
            const token = utils.getToken();
            const headers = {
                ...(options.headers || {}), 
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            if (options.isFileDownload) {
                delete headers['Content-Type'];
            } else if (!headers['Content-Type']) {
                    headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE}${endpoint}`, { headers, ...options });

            if (response.status === 401 || response.status === 403) {
                // Se o backend retornou 401/403, é um erro de autenticação/autorização
                // O utils.logout já mostra um toast e redireciona.
                utils.logout(response.status === 401 ? 
                    'Sessão expirada ou inválida. Por favor, faça login novamente.' : 
                    'Você não tem permissão para realizar esta ação.');
                throw new Error('Não autorizado ou sessão expirada.'); 
            }

            if (!response.ok) {
                if (!options.isFileDownload && response.headers.get('content-type')?.includes('application/json')) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro na requisição.');
                } else {
                    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
                }
            }
            if (options.isFileDownload) {
                return response;
            }
            return response.status === 204 ? null : response.json();
        },
        getDashboardStats: () => api.request('/dashboard/stats'),
        getLowStockProducts: () => api.request('/products/low-stock'),
        getClients: (page = 1, q = '', limit = 10) => api.request(`/clients?page=${page}&q=${q}&limit=${limit}`),
        getClientById: (id) => api.request(`/clients/${id}`),
        createClient: (data) => api.request('/clients', { method: 'POST', body: JSON.stringify(data) }),
        updateClient: (id, data) => api.request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteClient: (id) => api.request(`/clients/${id}`, { method: 'DELETE' }),
        exportClientsCsv: () => api.request('/clients/export-csv', { isFileDownload: true }),
        getSales: (page = 1, q = '', limit = 10) => api.request(`/sales?page=${page}&q=${q}&limit=${limit}`),
        getSaleById: (id) => api.request(`/sales/${id}`),
        createSale: (data) => api.request('/sales', { method: 'POST', body: JSON.stringify(data) }),
        updateSale: (id, data) => api.request(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSale: (id) => api.request(`/sales/${id}`, { method: 'DELETE' }),
        exportSalesCsv: () => api.request('/sales/export-csv', { isFileDownload: true }),
        getSalesByPeriod: (startDate, endDate) => api.request(`/sales/report-by-period?startDate=${startDate}&endDate=${endDate}`),
        exportSalesByPeriodCsv: (startDate, endDate) => api.request(`/sales/report-by-period?startDate=${startDate}&endDate=${endDate}&format=csv`, { isFileDownload: true }),
        createPayment: (saleId, data) => api.request(`/sales/${saleId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
        getProducts: (page = 1, q = '', limit = 10) => api.request(`/products?page=${page}&q=${q}&limit=${limit}`),
        getProductById: (id) => api.request(`/products/${id}`),
        createProduct: (data) => api.request('/products', { method: 'POST', body: JSON.stringify(data) }),
        updateProduct: (id, data) => api.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteProduct: (id) => api.request(`/products/${id}`, { method: 'DELETE' }),
        getRankingsProdutos: () => api.request('/rankings/produtos'),
        getRankingsClientes: () => api.request('/rankings/clientes'),
        // NOVO: Adiciona a chamada à API para rankings de vendedores
        getRankingsVendedores: () => api.request('/rankings/vendedores'), 
    };

    // --- UI AND RENDERING LOGIC ---
    const ui = {
        showSection: (sectionId) => {
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';

            // Atualiza os links de navegação para refletir a seção ativa
            dom.navLinks.forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (navLink) navLink.classList.add('active');

            // NOVO: Esconde/mostra links da sidebar com base na role
            ui.updateSidebarVisibility();
        },
        // NOVO: Função para atualizar a visibilidade dos itens da sidebar
        updateSidebarVisibility: () => {
            const userRole = state.userRole;
            dom.navLinks.forEach(link => {
                const sectionId = link.dataset.section;
                // Por padrão, todos visíveis para admin e gerente. Vendedor tem restrições.
                let isVisible = true; 
                switch (sectionId) {
                    case 'productsSection':
                        // Vendedores podem VER produtos (rota GET permitida), mas não criar/editar/excluir (controlado por botões e handlers)
                        // O link da sidebar pode ser visível.
                        break;
                    case 'reportsSection':
                        // Relatórios são visíveis para todos
                        break;
                    case 'clientsSection':
                    case 'salesSection':
                    case 'dashboardSection':
                        // Dashboard, Clientes e Vendas são visíveis para todos por enquanto.
                        break;
                }
                // Aplica a visibilidade
                link.style.display = isVisible ? '' : 'none';
            });

            // Exemplo de como ocultar/mostrar elementos globais se necessário
            // if (userRole !== 'admin') { document.getElementById('someAdminButton').style.display = 'none'; }
        },
        renderDashboard: ({ totalClients, salesThisMonth, totalReceivable, overdueSales, salesByMonth, lowStockProducts, salesToday, averageTicket }) => {
            const section = document.getElementById('dashboardSection');
            
            let lowStockAlertHtml = '';
            if (lowStockProducts && lowStockProducts.length > 0) {
                const productItems = lowStockProducts.map(p =>
                    `<li class="list-group-item d-flex justify-content-between align-items-center">
                        ${p.nome} (SKU: ${p.sku || 'N/A'})
                        <span class="badge bg-danger rounded-pill">${p.estoque}</span>
                    </li>`
                ).join('');
                lowStockAlertHtml = `
                    <div class="alert alert-warning mb-4" role="alert">
                        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>Alerta: Estoque Baixo</h4>
                        <p>Os seguintes produtos precisam de reposição urgente.</p>
                        <hr>
                        <ul class="list-group">
                            ${productItems}
                        </ul>
                    </div>
                `;
            }

            section.innerHTML = `
                <h3>Dashboard</h3>
                ${lowStockAlertHtml}
                <div class="row g-4 mb-4">
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3"><h6>Clientes</h6><p class="fs-2 fw-bold">${totalClients}</p></div></div>
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3"><h6>Vendas Hoje</h6><p class="fs-2 fw-bold">${utils.formatCurrency(salesToday)}</p></div></div>
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3"><h6>Vendas Mês</h6><p class="fs-2 fw-bold">${utils.formatCurrency(salesThisMonth)}</p></div></div>
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3"><h6>Ticket Médio</h6><p class="fs-2 fw-bold">${utils.formatCurrency(averageTicket)}</p></div></div>
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3"><h6>A Receber</h6><p class="fs-2 fw-bold">${utils.formatCurrency(totalReceivable)}</p></div></div>
                    <div class="col-lg-2 col-md-4 col-sm-6"><div class="card p-3 bg-danger text-white"><h6>Vencido</h6><p class="fs-2 fw-bold">${utils.formatCurrency(overdueSales)}</p></div></div>
                </div>
                <div class="card p-3 mb-4"><canvas id="salesChart"></canvas></div>
                <!-- Seção de rankings abaixo do gráfico -->
                <div class="row g-4 mt-4">
                    <div class="col-md-4">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <i class="bi bi-box-seam me-2"></i>Top 5 Produtos Mais Vendidos
                            </div>
                            <ul class="list-group list-group-flush" id="produtosMaisVendidos">
                                <li class="list-group-item text-center text-muted">Carregando...</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm">
                            <div class="card-header bg-success text-white">
                                <i class="bi bi-people-fill me-2"></i>Top 5 Clientes com Mais Compras
                            </div>
                            <ul class="list-group list-group-flush" id="clientesMaisCompraram">
                                <li class="list-group-item text-center text-muted">Carregando...</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-4" id="rankingVendedoresCard"> <!-- NOVO: Card para ranking de vendedores -->
                        <div class="card shadow-sm">
                            <div class="card-header bg-info text-white">
                                <i class="bi bi-person-badge me-2"></i>Top 5 Vendedores
                            </div>
                            <ul class="list-group list-group-flush" id="vendedoresMaisVenderam">
                                <li class="list-group-item text-center text-muted">Carregando...</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            const ctx = document.getElementById('salesChart').getContext('2d');
            if (state.chartInstance) state.chartInstance.destroy();
            state.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: salesByMonth.map(item => item.month),
                    datasets: [{ label: 'Vendas por Mês', data: salesByMonth.map(item => item.total), backgroundColor: 'rgba(79, 70, 229, 0.8)' }]
                },
                options: { 
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } } 
                }
            });
            // NOVO: Ajusta a visibilidade do card de vendedores após renderizar o dashboard
            if (!['admin', 'gerente'].includes(state.userRole)) {
                const rankingVendedoresCard = document.getElementById('rankingVendedoresCard');
                if (rankingVendedoresCard) {
                    rankingVendedoresCard.style.display = 'none'; // Oculta o card inteiro
                }
            } else {
                const rankingVendedoresCard = document.getElementById('rankingVendedoresCard');
                if (rankingVendedoresCard) {
                    rankingVendedoresCard.style.display = 'block'; // Garante que seja visível para admin/gerente
                }
            }
        },
        renderClients: () => {
            const { data, total } = state.clients; 
            const section = document.getElementById('clientsSection');
            const tableRows = data.map(client => `
                <tr>
                    <td>${client.id}</td><td><strong>${client.nome}</strong></td><td>${client.email || 'N/A'}</td><td>${client.telefone || 'N/A'}</td>
                    <td>
                        ${(state.userRole === 'admin' || state.userRole === 'gerente' || state.userRole === 'vendedor') ? // Vendedor pode editar clientes
                            `<button class="btn btn-sm btn-outline-primary action-edit" data-type="client" data-id="${client.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                        ${(state.userRole === 'admin' || state.userRole === 'gerente') ? // Apenas admin e gerente podem excluir
                            `<button class="btn btn-sm btn-outline-danger action-delete" data-type="client" data-id="${client.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                </tr>`).join('');
            
            // Botões de ação na seção Clientes (Novo Cliente, Exportar CSV)
            let actionButtonsHtml = '';
            if (state.userRole === 'admin' || state.userRole === 'gerente' || state.userRole === 'vendedor') { // Todos podem exportar e criar
                actionButtonsHtml += `<button class="btn btn-outline-success me-2" id="btnExportClientsCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar CSV</button>`;
                actionButtonsHtml += `<button class="btn btn-primary" id="btnNewClient"><i class="bi bi-plus-circle me-2"></i>Novo Cliente</button>`;
            }

            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-people-fill me-2"></i>Clientes (${total})</h3>
                    <div>
                        ${actionButtonsHtml}
                    </div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control search-input" data-type="clients" placeholder="Buscar por nome..." value="${state.clients.query}">
                </div>
                <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>
                    ${data.length > 0 ? tableRows : '<tr><td colspan="5" class="text-center">Nenhum cliente encontrado.</td></tr>'}
                </tbody></table></div>
                <div id="paginationClients"></div>`;
            
            ui.renderPagination('clients', total, state.clients.page, state.clients.limit);
        },
        renderSales: () => {
            const { data, total } = state.sales; 
            const section = document.getElementById('salesSection');
            const tableRows = data.map(sale => {
                const valorDevido = sale.valorTotal - sale.valorPago;
                const statusClass = valorDevido > 0 ? 'text-danger' : 'text-success'; // Defined statusClass
                return `
                <tr>
                    <td>${sale.id}</td><td><strong>${sale.client?.nome || 'N/A'}</strong></td><td>${utils.formatDate(sale.dataVenda)}</td><td class="${statusClass}"><strong>${utils.formatCurrency(valorDevido)}</strong></td><td><span class="badge bg-primary">${sale.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-info action-detail" data-type="sale" data-id="${sale.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
                        ${(state.userRole === 'admin' || state.userRole === 'gerente') ? 
                            `<button class="btn btn-sm btn-outline-danger action-delete" data-type="sale" data-id="${sale.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                </tr>`;
            }).join('');
            // Botões de ação na seção Vendas (Nova Venda, Exportar CSV)
            let actionButtonsHtml = '';
            if (state.userRole === 'admin' || state.userRole === 'gerente' || state.userRole === 'vendedor') { // Todos podem exportar e criar vendas
                actionButtonsHtml += `<button class="btn btn-outline-success me-2" id="btnExportSalesCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar CSV</button>`;
                actionButtonsHtml += `<button class="btn btn-primary" id="btnNewSale"><i class="bi bi-plus-circle me-2"></i>Nova Venda</button>`;
            }

            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-cart-check-fill me-2"></i>Vendas (${total})</h3> 
                    <div>
                        ${actionButtonsHtml}
                    </div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control search-input" data-type="sales" placeholder="Buscar por nome do cliente..." value="${state.sales.query}">
                </div>
                <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Valor Devido</th><th>Status</th><th>Ações</th></tr></thead><tbody>
                    ${data.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center">Nenhuma venda encontrada.</td></tr>'}
                </tbody></table></div>
                <div id="paginationSales"></div>`;
            ui.renderPagination('sales', total, state.sales.page, state.sales.limit);
        },
        renderPagination: (type, totalItems, currentPage, limit) => {
            const totalPages = Math.ceil(totalItems / limit);
            const container = document.getElementById(`pagination${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (!container || totalPages <= 1) {
                if(container) container.innerHTML = '';
                return;
            }

            let paginationHTML = '<nav><ul class="pagination justify-content-end">';
            
            paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}" data-type="${type}">Anterior</a></li>`;

            const maxPagesToShow = 5;
            let startPage, endPage;

            if (totalPages <= maxPagesToShow) {
                startPage = 1;
                endPage = totalPages;
            } else {
                const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
                const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

                if (currentPage <= maxPagesBeforeCurrentPage) {
                    startPage = 1;
                    endPage = maxPagesToShow;
                } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                    startPage = totalPages - maxPagesToShow + 1;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - maxPagesBeforeCurrentPage;
                    endPage = currentPage + maxPagesAfterCurrentPage;
                }
            }

            if (startPage > 1) {
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1" data-type="${type}">1</a></li>`;
                if (startPage > 2) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}" data-type="${type}">${i}</a></li>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}" data-type="${type}">${totalPages}</a></li>`;
            }

            paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}" data-type="${type}">Próximo</a></li>`;
            container.innerHTML = paginationHTML;
        },
        renderSalesByPeriod: ({ sales, summary }) => {
            const reportResultsDiv = dom.reportResults;
            let resultsHtml = '';

            if (sales.length === 0) {
                resultsHtml = `<div class="alert alert-info text-center" role="alert">Nenhuma venda encontrada para o período selecionado.</div>`;
            } else {
                // Botão de Exportar CSV para relatórios de período - visível para todos com acesso a relatórios
                let exportButtonHtml = '';
                if (['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                     exportButtonHtml = `
                        <div class="d-flex justify-content-end mb-3">
                            <button class="btn btn-success" id="btnExportPeriodReportCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar Relatório CSV</button>
                        </div>
                    `;
                }

                resultsHtml += `
                    <div class="row g-3 mb-4">
                        <div class="col-md-3"><div class="card p-3"><h6>Total de Vendas</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalSalesAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3"><h6>Total Pago</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalPaidAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3 bg-danger text-white"><h6>Total Devido</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalDueAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3"><h6>Qtd. de Vendas</h6><p class="fs-4 fw-bold">${summary.numberOfSales}</p></div></div>
                    </div>
                    ${exportButtonHtml}
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
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
                                ${sales.map(sale => `
                                    <tr>
                                        <td>${sale.id}</td>
                                        <td>${sale.client?.nome || 'N/A'}</td>
                                        <td>${utils.formatDate(sale.dataVenda)}</td>
                                        <td>${utils.formatCurrency(sale.valorTotal)}</td>
                                        <td>${utils.formatCurrency(sale.valorPago)}</td>
                                        <td class="text-danger">${utils.formatCurrency(sale.valorTotal - sale.valorPago)}</td>
                                        <td><span class="badge bg-secondary">${sale.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            reportResultsDiv.innerHTML = resultsHtml;
        },
        renderSaleDetail: (sale) => {
            const section = document.getElementById('saleDetailSection');
            const valorDevido = sale.valorTotal - sale.valorPago;
            let productsHtml = '';
            if (sale.products && sale.products.length > 0) {
                productsHtml = `
                    <h6>Itens da Venda:</h6>
                    <ul class="list-group mb-3">
                        ${sale.products.map(item => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <span>${item.SaleProduct.quantidade}x ${item.nome}</span>
                                <span class="fw-bold">${utils.formatCurrency(item.SaleProduct.quantidade * item.SaleProduct.precoUnitario)}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            } else {
                productsHtml = `<p>Nenhum produto associado a esta venda.</p>`;
            }

            let paymentsHTML = '';
            if (sale.payments && sale.payments.length > 0) {
                paymentsHTML = `
                    <ul class="list-group">
                        ${sale.payments.map(p => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    Pagamento de ${utils.formatCurrency(p.valor)} em ${utils.formatDate(p.dataPagamento)} 
                                    <span class="badge bg-info ms-2">${p.formaPagamento}</span>
                                    ${p.parcelas && p.parcelas > 1 ? `<span class="badge bg-secondary ms-1">${p.parcelas}x</span>` : ''}
                                    ${p.bandeiraCartao ? `<span class="badge bg-secondary ms-1">${p.bandeiraCartao}</span>` : ''}
                                    ${p.bancoCrediario ? `<span class="badge bg-secondary ms-1">${p.bancoCrediario}</span>` : ''}
                                </div>
                                <span class="badge bg-success rounded-pill">${utils.formatCurrency(p.valor)}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            } else {
                paymentsHTML = `<p>Nenhum pagamento registrado.</p>`;
            }
            // Botões de ação do detalhe da venda (Whatsapp, Email, Imprimir)
            let detailActionButtonsHtml = '';
            if (['admin', 'gerente', 'vendedor'].includes(state.userRole)) { // Todos podem compartilhar e imprimir
                detailActionButtonsHtml = `
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-sm btn-outline-success me-2" id="btnShareWhatsapp" data-sale-id="${sale.id}" title="Compartilhar no WhatsApp"><i class="bi bi-whatsapp"></i></button>
                        <button class="btn btn-sm btn-outline-info me-2" id="btnShareEmail" data-sale-id="${sale.id}" title="Compartilhar por E-mail"><i class="bi bi-envelope"></i></button>
                        <button class="btn btn-sm btn-outline-primary" id="btnPrintSale" data-sale-id="${sale.id}" title="Imprimir Venda"><i class="bi bi-printer"></i></button>
                    </div>
                `;
            }

            // Formulário de registro de pagamento - visível para todos que podem criar/editar vendas
            let paymentFormHtml = '';
            if (['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                paymentFormHtml = `
                    <div class="card">
                        <div class="card-header">
                            <h5>Registrar Pagamento</h5>
                            ${detailActionButtonsHtml}
                        </div>
                        <div class="card-body">
                            <form id="paymentForm" data-sale-id="${sale.id}">
                                <div class="mb-3">
                                    <label for="paymentValue" class="form-label">Valor</label>
                                    <input type="number" step="0.01" class="form-control" id="paymentValue" required>
                                </div>
                                <div class="mb-3">
                                    <label for="paymentFormaNew" class="form-label">Forma de Pagamento</label>
                                    <select class="form-select" id="paymentFormaNew">
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                                        <option value="Crediário">Crediário</option>
                                        <option value="PIX">PIX</option>
                                    </select>
                                </div>
                                <div class="row" id="newPaymentDetailsFields">
                                    <div class="col-md-6 mb-3" id="newParcelasField" style="display: none;">
                                        <label for="newPaymentParcelas" class="form-label">Parcelas</label>
                                        <input type="number" class="form-control" id="newPaymentParcelas" value="1" min="1">
                                    </div>
                                    <div class="col-md-6 mb-3" id="newBandeiraCartaoField" style="display: none;">
                                        <label for="newPaymentBandeiraCartao" class="form-label">Bandeira Cartão</label>
                                        <input type="text" class="form-control" id="newPaymentBandeiraCartao" placeholder="Ex: Visa, Mastercard">
                                    </div>
                                    <div class="col-md-12 mb-3" id="newBancoCrediarioField" style="display: none;">
                                        <label for="newPaymentBancoCrediario" class="form-label">Banco/Instituição Crediário</label>
                                        <input type="text" class="form-control" id="newPaymentBancoCrediario" placeholder="Ex: Banco X, Financeira Y">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-success w-100">Registrar</button>
                            </form>
                        </div>
                    </div>
                `;
            }


            section.innerHTML = `
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#" class="nav-back" data-section="salesSection">Vendas</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Detalhes da Venda #${sale.id}</li>
                    </ol>
                </nav>
                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header"><h4>Itens da Venda</h4></div>
                            <div class="card-body">
                                ${productsHtml}
                            </div>
                        </div>
                        <div class="card mb-4">
                            <div class="card-header"><h4>Histórico de Pagamentos</h4></div>
                            <div class="card-body">
                                ${paymentsHTML}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card mb-4"><div class="card-header"><h5>Resumo da Venda</h5></div>
                            <div class="card-body">
                                <p><strong>Cliente:</strong> ${sale.client.nome}</p>
                                <p><strong>Valor Total:</strong> ${utils.formatCurrency(sale.valorTotal)}</p>
                                <p><strong>Total Pago:</strong> ${utils.formatCurrency(sale.valorPago)}</p>
                                <p class="fs-5"><strong>Valor Devido: <span class="text-danger">${utils.formatCurrency(valorDevido)}</span></strong></p>
                            </div>
                        </div>
                        ${paymentFormHtml}
                    </div>
                </div>
            `;
        },
        renderProducts: () => {
            const { data, total } = state.products;
            const section = document.getElementById('productsSection');
            const tableRows = data.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td><strong>${product.nome}</strong></td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>${utils.formatCurrency(product.precoVenda)}</td>
                    <td>${product.estoque}</td>
                    <td>
                        ${(state.userRole === 'admin' || state.userRole === 'gerente') ? // Apenas admin e gerente podem editar
                            `<button class="btn btn-sm btn-outline-primary action-edit" data-type="product" data-id="${product.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                        ${(state.userRole === 'admin' || state.userRole === 'gerente') ? // Apenas admin e gerente podem excluir
                            `<button class="btn btn-sm btn-outline-danger action-delete" data-type="product" data-id="${product.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                </tr>`).join('');
            
            // Botão de "Novo Produto" - visível apenas para admin e gerente
            let newProductButtonHtml = '';
            if (state.userRole === 'admin' || state.userRole === 'gerente') {
                newProductButtonHtml = `<button class="btn btn-primary" id="btnNewProduct"><i class="bi bi-plus-circle me-2"></i>Novo Produto</button>`;
            }

            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-box-seam me-2"></i>Produtos (${total})</h3>
                    <div>
                        ${newProductButtonHtml}
                    </div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control search-input" data-type="products" placeholder="Buscar por nome ou SKU..." value="${state.products.query}">
                </div>
                <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Nome</th><th>SKU</th><th>Preço Venda</th><th>Estoque</th><th>Ações</th></tr></thead><tbody>
                    ${data.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center">Nenhum produto encontrado.</td></tr>'}
                </tbody></table></div>
                <div id="paginationProducts"></div>`;
            
            ui.renderPagination('products', total, state.products.page, state.products.limit);
        }
    };

    // --- EVENT HANDLERS ---
    const handlers = {
        loadDashboard: async () => {
            try {
                const dashboardData = await api.getDashboardStats();
                const lowStockProducts = await api.getLowStockProducts();
                ui.renderDashboard({ ...dashboardData, lowStockProducts });
                ui.showSection('dashboardSection');
                handlers.loadRankings(); 
            } catch (error) { 
                utils.showToast(error.message, 'error'); 
            }
        },
        loadRankings: async () => {
            try {
                const ulProdutos = document.getElementById('produtosMaisVendidos');
                const ulClientes = document.getElementById('clientesMaisCompraram');
                const ulVendedores = document.getElementById('vendedoresMaisVenderam');
        
                // Always try to load product and client rankings
                const produtos = await api.getRankingsProdutos();
                const clientes = await api.getRankingsClientes();
        
                if (produtos && produtos.length > 0) {
                    ulProdutos.innerHTML = produtos.map(p => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${p.nome} 
                            <span class="badge bg-primary rounded-pill">${p.totalQuantidadeVendida} un</span>
                        </li>
                    `).join('');
                } else {
                    ulProdutos.innerHTML = '<li class="list-group-item text-center text-muted">Nenhum produto vendido.</li>'; 
                }
        
                if (clientes && clientes.length > 0) {
                    ulClientes.innerHTML = clientes.map(c => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${c.nome} 
                            <span class="badge bg-success rounded-pill">${utils.formatCurrency(c.valorTotalVendido)}</span> 
                        </li>
                    `).join('');
                } else {
                    ulClientes.innerHTML = '<li class="list-group-item text-center text-muted">Nenhum cliente com compras.</li>'; 
                }
        
                // NOVO: Condição para carregar e renderizar o ranking de vendedores
                // Apenas para Admin e Gerente
                if (['admin', 'gerente'].includes(state.userRole)) {
                    const vendedores = await api.getRankingsVendedores(); 
                    if (vendedores && vendedores.length > 0) {
                        ulVendedores.innerHTML = vendedores.map(v => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${v.username} 
                                <span class="badge bg-info rounded-pill">${utils.formatCurrency(v.valorTotalVendido)}</span>
                            </li>
                        `).join('');
                    } else {
                        ulVendedores.innerHTML = '<li class="list-group-item text-center text-muted">Nenhum vendedor com vendas registradas.</li>';
                    }
                } else { 
                    // Se não for admin/gerente, exibir acesso restrito ou limpar o conteúdo
                    if (ulVendedores) ulVendedores.innerHTML = '<li class="list-group-item text-center text-muted">Acesso restrito.</li>';
                }
        
            } catch (error) {
                console.error('Erro ao carregar rankings:', error);
                const ulProdutos = document.getElementById('produtosMaisVendidos');
                if (ulProdutos) ulProdutos.innerHTML = '<li class="list-group-item text-center text-danger">Erro ao carregar.</li>';
                const ulClientes = document.getElementById('clientesMaisCompraram');
                if (ulClientes) ulClientes.innerHTML = '<li class="list-group-item text-center text-danger">Erro ao carregar.</li>';
                const ulVendedores = document.getElementById('vendedoresMaisVenderam');
                if (ulVendedores) ulVendedores.innerHTML = '<li class="list-group-item text-center text-danger">Erro ao carregar.</li>';
            }
        },        
        loadClients: async (force = false) => {
            if (state.clients.loaded && !force) {
                ui.renderClients();
                return;
            }
            try {
                const { page, query, limit } = state.clients;
                const apiData = await api.getClients(page, query, limit);
                state.clients.data = apiData.data;
                state.clients.total = apiData.total;
                state.clients.loaded = true;
                ui.renderClients();
            } catch (error) { utils.showToast(error.message, 'error'); }
        },
        handleExportClientsCsv: async () => {
            utils.showToast('Gerando relatório CSV de clientes...', 'info');
            try {
                const response = await api.exportClientsCsv();
                utils.downloadFile(response);
                utils.showToast('Relatório CSV exportado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao exportar CSV:', error);
                utils.showToast(error.message || 'Falha ao exportar relatório CSV.', 'error');
            }
        },
        loadSales: async (force = false) => {
            if (state.sales.loaded && !force) {
                ui.renderSales();
                return;
            }
            try {
                const { page, query, limit } = state.sales;
                const apiData = await api.getSales(page, query, limit);
                state.sales.data = apiData.data;
                state.sales.total = apiData.total; 
                state.sales.loaded = true;
                ui.renderSales();
            } catch (error) { utils.showToast(error.message, 'error'); }
        },
        handleExportSalesCsv: async () => {
            utils.showToast('Gerando relatório CSV de vendas...', 'info');
            try {
                const response = await api.exportSalesCsv();
                utils.downloadFile(response);
                utils.showToast('Relatório CSV de vendas exportado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao exportar CSV de vendas:', error);
                utils.showToast(error.message || 'Falha ao exportar relatório CSV de vendas.', 'error');
            }
        },
        handleGenerateSalesReport: async (e) => {
            e.preventDefault();
            const startDate = dom.startDateInput.value;
            const endDate = dom.endDateInput.value;

            if (!startDate || !endDate) {
                utils.showToast('Por favor, selecione as datas inicial e final para o relatório.', 'error');
                return;
            }
            if (new Date(startDate) > new Date(endDate)) {
                utils.showToast('A data inicial não pode ser maior que a data final.', 'error');
                return;
            }

            utils.showToast('Gerando relatório de vendas...', 'info');
            try {
                const reportData = await api.getSalesByPeriod(startDate, endDate);
                state.salesReport.startDate = startDate;
                state.salesReport.endDate = endDate;
                state.salesReport.data = reportData.sales;
                state.salesReport.summary = reportData.summary;
                ui.renderSalesByPeriod(reportData);
                utils.showToast('Relatório de vendas gerado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao gerar relatório de vendas:', error);
                utils.showToast(error.message || 'Falha ao gerar relatório de vendas.', 'error');
            }
        },
        handleExportPeriodReportCsv: async () => {
            if (!state.salesReport.startDate || !state.salesReport.endDate) {
                utils.showToast('Nenhum período selecionado para exportar.', 'error');
                return;
            }
            utils.showToast('Exportando relatório de vendas por período para CSV...', 'info');
            try {
                const response = await api.exportSalesByPeriodCsv(state.salesReport.startDate, state.salesReport.endDate);
                utils.downloadFile(response);
                utils.showToast('Relatório de vendas por período exportado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao exportar relatório de vendas por período:', error);
                utils.showToast(error.message || 'Falha ao exportar relatório CSV de vendas.', 'error');
            }
        },
        handleSearch: (type, query) => {
            state[type].query = query;
            state[type].page = 1;
            if (type === 'clients') handlers.loadClients(true);
            if (type === 'sales') handlers.loadSales(true);
            if (type === 'products') handlers.loadProducts(true);
        },
        handlePageChange: (type, newPage) => {
            state[type].page = newPage;
            if (type === 'clients') handlers.loadClients(true);
            if (type === 'sales') handlers.loadSales(true);
            if (type === 'products') handlers.loadProducts(true);
        },
        openClientModal: async (clientId = null) => {
            // Apenas admin e gerente podem editar, mas vendedor pode criar
            if (clientId && !['admin', 'gerente'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para editar clientes.', 'error');
                return;
            }
            if (!clientId && !['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para criar clientes.', 'error');
                return;
            }

            dom.clientForm.reset();
            document.getElementById('clientId').value = '';
            const modalLabel = document.getElementById('clientModalLabel');
            if (clientId) {
                modalLabel.textContent = 'Editar Cliente';
                try {
                    const client = await api.getClientById(clientId);
                    document.getElementById('clientId').value = client.id;
                    document.getElementById('clientName').value = client.nome;
                    document.getElementById('clientEmail').value = client.email;
                    document.getElementById('clientPhone').value = client.telefone;
                } catch (error) {
                    utils.showToast(error.message, 'error');
                    return;
                }
            } else {
                modalLabel.textContent = 'Novo Cliente';
            }
            state.bootstrapClientModal.show();
        },
        handleSaveClient: async (e) => {
            e.preventDefault();
            const id = document.getElementById('clientId').value;
            const data = {
                nome: document.getElementById('clientName').value,
                email: document.getElementById('clientEmail').value,
                telefone: document.getElementById('clientPhone').value,
            };
            try {
                if (id) {
                    await api.updateClient(id, data);
                    utils.showToast('Cliente atualizado!', 'success');
                } else {
                    await api.createClient(data);
                    utils.showToast('Cliente criado!', 'success');
                }
                state.bootstrapClientModal.hide();
                handlers.loadClients(true);
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleDeleteClient: async (clientId) => {
            if (!['admin', 'gerente'].includes(state.userRole)) { // Apenas admin e gerente podem deletar
                utils.showToast('Você não tem permissão para excluir clientes.', 'error');
                return;
            }
            utils.showConfirm('Deseja realmente excluir este cliente?', async () => {
                try {
                    await api.deleteClient(clientId);
                    utils.showToast('Cliente excluído!', 'success');
                    handlers.loadClients(true);
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
        openSaleModal: async (saleId = null) => {
            // Apenas admin, gerente e vendedor podem criar/editar vendas
            if (saleId && !['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para editar vendas.', 'error');
                return;
            }
            if (!saleId && !['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para criar vendas.', 'error');
                return;
            }

            dom.saleForm.reset();
            document.getElementById('saleId').value = '';
            state.selectedSaleProducts = [];
            utils.renderSelectedProductsList();

            const modalLabel = document.getElementById('saleModalLabel');
            const clientSelect = document.getElementById('saleClient');
            clientSelect.innerHTML = '<option value="">Carregando clientes...</option>';
            
            dom.productSelect.empty().append($('<option value="">Selecione um produto</option>')).select2({
                placeholder: "Buscar produto...",
                dropdownParent: $('#saleModal'),
                templateResult: (product) => {
                    if (!product.id) { return product.text; }
                    const p = state.availableProducts.find(item => String(item.id) === String(product.id));
                    if (!p) return product.text;
                    return $(`<span>${p.nome} (Estoque: ${p.estoque}, R$ ${p.precoVenda.toFixed(2)})</span>`);
                },
                templateSelection: (product) => {
                    if (!product.id) { return product.text; }
                    const p = state.availableProducts.find(item => String(item.id) === String(product.id));
                    if (!p) return product.text;
                    return p.nome;
                },
                data: [],
            });

            try {
                // Fetch clients, filtered by userId for 'vendedor' role
                const { data: clients } = await api.getClients(1, '', 1000); // This now respects userId filter in backend for vendedores
                clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
                clients.forEach(c => clientSelect.add(new Option(c.nome, c.id)));
                
                const { data: products } = await api.getProducts(1, '', 1000);
                state.availableProducts = products;
                dom.productSelect.empty().append($('<option value="">Selecione um produto</option>')).select2({
                    data: state.availableProducts.map(p => ({ id: String(p.id), text: p.nome })),
                    placeholder: "Buscar produto...",
                    dropdownParent: $('#saleModal'),
                    templateResult: (productData) => {
                        if (!productData.id) { return productData.text; }
                        const product = state.availableProducts.find(item => String(item.id) === String(productData.id));
                        if (!product) return productData.text;
                        return $(`<span>${product.nome} (Estoque: ${product.estoque}, R$ ${product.precoVenda.toFixed(2)})</span>`);
                    },
                    templateSelection: (productData) => {
                        if (!productData.id) { return productData.text; }
                        const product = state.availableProducts.find(item => String(item.id) === String(productData.id));
                        if (!product) return productData.text;
                        return product.nome;
                    }
                });
                dom.productSelect.off('select2:select').on('select2:select', (e) => {
                    const productId = String(e.params.data.id);
                    const product = state.availableProducts.find(p => String(p.id) === productId);
                    if (product) {
                        state.currentSelectedProduct = product;
                        dom.productDetailsDisplay.innerHTML = `Estoque: ${product.estoque}, Preço: ${utils.formatCurrency(product.precoVenda)}`;
                        dom.productUnitPriceInput.value = product.precoVenda.toFixed(2);
                        dom.productQuantityInput.value = '1';
                    } else {
                        state.currentSelectedProduct = null;
                        dom.productDetailsDisplay.innerHTML = '';
                        dom.productUnitPriceInput.value = '';
                    }
                });
                dom.productSelect.off('select2:unselect').on('select2:unselect', (e) => {
                    state.currentSelectedProduct = null;
                    dom.productDetailsDisplay.innerHTML = '';
                    dom.productUnitPriceInput.value = '';
                });

                dom.paymentFormaSelect.value = 'Dinheiro';
                utils.togglePaymentFields(dom.paymentFormaSelect, dom.paymentParcelasField, dom.paymentBandeiraCartaoField, dom.paymentBancoCrediarioField, dom.paymentParcelasInput, dom.paymentBandeiraCartaoInput, dom.paymentBancoCrediarioInput);
                dom.salePaidValueInitialInput.value = '0';

                modalLabel.textContent = 'Nova Venda';
                if (saleId) {
                    modalLabel.textContent = 'Editar Venda';
                    const sale = await api.getSaleById(saleId);
                    document.getElementById('saleId').value = sale.id;
                    document.getElementById('saleClient').value = sale.clientId;
                    document.getElementById('saleDueDate').value = sale.dataVencimento.split('T')[0]; // Apenas a data
                    
                    if (sale.products && sale.products.length > 0) {
                        state.selectedSaleProducts = sale.products.map(p => ({
                            id: p.id,
                            nome: p.nome,
                            precoVenda: p.precoVenda,
                            precoUnitario: p.SaleProduct.precoUnitario,
                            quantidade: p.SaleProduct.quantidade
                        }));
                        utils.renderSelectedProductsList();
                    }
                }
                
                state.bootstrapSaleModal.show();
            } catch(error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleAddProductToSale: () => {
            // Apenas admin, gerente e vendedor podem adicionar produtos à venda
            if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para adicionar produtos a vendas.', 'error');
                return;
            }

            const productId = dom.productSelect.val();
            const quantity = parseInt(dom.productQuantityInput.value);
            const unitPrice = parseFloat(dom.productUnitPriceInput.value);

            if (!productId) {
                utils.showToast('Selecione um produto.', 'error');
                return;
            }
            if (isNaN(quantity) || quantity <= 0) {
                utils.showToast('Quantidade inválida.', 'error');
                return;
            }
            if (isNaN(unitPrice) || unitPrice < 0) {
                utils.showToast('Preço unitário inválido.', 'error');
                return;
            }

            const product = state.availableProducts.find(p => String(p.id) === productId);
            if (!product) {
                utils.showToast('Produto não encontrado.', 'error');
                return;
            }
            const existingItemInCart = state.selectedSaleProducts.find(item => String(item.id) === productId);
            const currentQuantityInCart = existingItemInCart ? existingItemInCart.quantidade : 0;

            if (product.estoque < (currentQuantityInCart + quantity)) {
                utils.showToast(`Estoque insuficiente para ${product.nome}. Disponível: ${product.estoque}, já no carrinho: ${currentQuantityInCart}, solicitado: ${quantity}.`, 'error');
                return;
            }

            if (existingItemInCart) {
                existingItemInCart.quantidade += quantity;
                existingItemInCart.precoUnitario = unitPrice;
            } else {
                state.selectedSaleProducts.push({
                    id: product.id,
                    nome: product.nome,
                    precoVenda: product.precoVenda,
                    precoUnitario: unitPrice,
                    quantidade: quantity,
                });
            }
            utils.renderSelectedProductsList();
            dom.productSelect.val(null).trigger('change');
            dom.productQuantityInput.value = '1';
            dom.productUnitPriceInput.value = '';
            dom.productDetailsDisplay.innerHTML = '';
            state.currentSelectedProduct = null;
        },
        handleRemoveProductFromSale: (index) => {
            // Apenas admin, gerente e vendedor podem remover produtos da venda
            if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para remover produtos de vendas.', 'error');
                return;
            }
            state.selectedSaleProducts.splice(index, 1);
            utils.renderSelectedProductsList();
        },
        handleSaveSale: async (e) => {
            e.preventDefault();
            // Apenas admin, gerente e vendedor podem salvar vendas
            if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para salvar vendas.', 'error');
                return;
            }

            const id = document.getElementById('saleId').value;
            const clientId = document.getElementById('saleClient').value;
            const dataVencimento = document.getElementById('saleDueDate').value;
            const valorTotal = utils.calculateSaleTotal();
            const valorPagoInitial = parseFloat(dom.salePaidValueInitialInput.value) || 0;
            const formaPagamento = dom.paymentFormaSelect.value;
            const parcelas = parseInt(dom.paymentParcelasInput.value) || 1;
            const bandeiraCartao = dom.paymentBandeiraCartaoInput.value || null;
            const bancoCrediario = dom.paymentBancoCrediarioInput.value || null;
            
            if (state.selectedSaleProducts.length === 0) {
                utils.showToast('Adicione pelo menos um produto à venda.', 'error');
                return;
            }
            if (!clientId) {
                utils.showToast('Selecione um cliente para a venda.', 'error');
                return;
            }
            if (valorPagoInitial > valorTotal) {
                utils.showToast('Valor pago inicial não pode ser maior que o valor total da venda.', 'error');
                return;
            }
            if (['Cartão de Crédito', 'Crediário'].includes(formaPagamento) && parcelas < 1) {
                utils.showToast('Número de parcelas inválido para a forma de pagamento selecionada.', 'error');
                return;
            }
            if (formaPagamento === 'Cartão de Crédito' && !bandeiraCartao) {
                utils.showToast('Bandeira do cartão é obrigatória para Cartão de Crédito.', 'error');
                return;
            }
            if (formaPagamento === 'Crediário' && !bancoCrediario) {
                utils.showToast('Banco/Instituição do crediário é obrigatória para Crediário.', 'error');
                return;
            }

            const saleData = {
                clientId: clientId,
                dataVencimento: dataVencimento || null,
                valorTotal: valorTotal,
                products: state.selectedSaleProducts.map(item => ({
                    productId: item.id,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario
                }))
            };

            if (valorPagoInitial > 0) {
                saleData.initialPayment = {
                    valor: valorPagoInitial,
                    formaPagamento: formaPagamento,
                    parcelas: parcelas,
                    bandeiraCartao: bandeiraCartao,
                    bancoCrediario: bancoCrediario
                };
            }

            try {
                if (id) {
                    await api.updateSale(id, saleData);
                    utils.showToast('Venda atualizada!', 'info');
                } else {
                    await api.createSale(saleData);
                    utils.showToast('Venda registrada com sucesso!', 'success');
                }
                state.bootstrapSaleModal.hide();
                handlers.loadSales(true);
                handlers.loadDashboard(); 
                handlers.loadProducts(true); 
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleDeleteSale: async (saleId) => {
            if (!['admin', 'gerente'].includes(state.userRole)) { // Apenas admin e gerente podem deletar
                utils.showToast('Você não tem permissão para excluir vendas.', 'error');
                return;
            }
            utils.showConfirm('Deseja realmente excluir esta venda? O estoque dos produtos será revertido.', async () => {
                try {
                    await api.deleteSale(saleId);
                    utils.showToast('Venda excluída e estoque revertido!', 'success');
                    handlers.loadSales(true);
                    handlers.loadDashboard(); 
                    handlers.loadProducts(true); 
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
        loadSaleDetail: async (saleId) => {
            try {
                const sale = await api.getSaleById(saleId);
                ui.renderSaleDetail(sale);
                ui.showSection('saleDetailSection');
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleSavePayment: async (e) => {
            e.preventDefault();
            // Apenas admin, gerente e vendedor podem registrar pagamentos
            if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para registrar pagamentos.', 'error');
                return;
            }

            const saleId = e.target.dataset.saleId;
            const valor = document.getElementById('paymentValue').value;
            const formaPagamentoElement = document.getElementById('paymentFormaNew');
            const parcelasElement = document.getElementById('newPaymentParcelas');
            // Corrected: get the value from the input field directly, not the field container
            const bancoCrediarioInputElement = document.getElementById('newPaymentBancoCrediario'); 

            const formaPagamento = formaPagamentoElement ? formaPagamentoElement.value : 'Dinheiro';
            const parcelas = parcelasElement ? parseInt(parcelasElement.value) || 1 : 1;
            const bandeiraCartao = document.getElementById('newPaymentBandeiraCartao') ? document.getElementById('newPaymentBandeiraCartao').value || null : null;
            const bancoCrediario = bancoCrediarioInputElement ? bancoCrediarioInputElement.value || null : null; // Get value from input

            if (!valor || parseFloat(valor) <= 0) {
                utils.showToast('Valor do pagamento inválido.', 'error');
                return;
            }
            if (['Cartão de Crédito', 'Crediário'].includes(formaPagamento) && parcelas < 1) {
                utils.showToast('Número de parcelas inválido para a forma de pagamento selecionada.', 'error');
                return;
            }
            if (formaPagamento === 'Cartão de Crédito' && !bandeiraCartao) {
                utils.showToast('Bandeira do cartão é obrigatória para Cartão de Crédito.', 'error');
                return;
            }
            if (formaPagamento === 'Crediário' && !bancoCrediario) {
                utils.showToast('Banco/Instituição do crediário é obrigatória para Crediário.', 'error');
                return;
            }

            try {
                await api.createPayment(saleId, { 
                    valor, 
                    formaPagamento, 
                    parcelas, 
                    bandeiraCartao: bandeiraCartao,
                    bancoCrediario 
                });
                utils.showToast('Pagamento registrado!', 'success');
                handlers.loadSaleDetail(saleId);
                handlers.loadDashboard(); 
                handlers.loadSales(true); 
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        loadProducts: async (force = false) => {
            if (state.products.loaded && !force) {
                ui.renderProducts();
                return;
            }
            try {
                const { page, query, limit } = state.products;
                const apiData = await api.getProducts(page, query, limit);
                state.products.data = apiData.data;
                state.products.total = apiData.total;
                state.products.loaded = true;
                ui.renderProducts();
            } catch (error) { utils.showToast(error.message, 'error'); }
        },
        openProductModal: async (productId = null) => {
            // Apenas admin e gerente podem criar/editar produtos
            if (productId && !['admin', 'gerente'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para editar produtos.', 'error');
                return;
            }
            if (!productId && !['admin', 'gerente'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para criar produtos.', 'error');
                return;
            }
            dom.productForm.reset();
            document.getElementById('productId').value = '';
            const modalLabel = document.getElementById('productModalLabel');
            if (productId) {
                modalLabel.textContent = 'Editar Produto';
                try {
                    const product = await api.getProductById(productId);
                    document.getElementById('productId').value = product.id;
                    document.getElementById('productName').value = product.nome;
                    document.getElementById('productDescription').value = product.descricao;
                    document.getElementById('productPrice').value = product.precoVenda;
                    document.getElementById('productCost').value = product.precoCusto;
                    document.getElementById('productStock').value = product.estoque;
                    document.getElementById('productSku').value = product.sku;
                } catch (error) {
                    utils.showToast(error.message, 'error');
                    return;
                }
            } else {
                modalLabel.textContent = 'Novo Produto';
            }
            state.bootstrapProductModal.show();
        },
        handleSaveProduct: async (e) => {
            e.preventDefault();
            // Apenas admin e gerente podem salvar produtos
            if (!['admin', 'gerente'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para salvar produtos.', 'error');
                return;
            }

            const id = document.getElementById('productId').value;
            const data = {
                nome: document.getElementById('productName').value,
                descricao: document.getElementById('productDescription').value,
                precoVenda: parseFloat(document.getElementById('productPrice').value),
                precoCusto: parseFloat(document.getElementById('productCost').value),
                estoque: parseInt(document.getElementById('productStock').value),
                sku: document.getElementById('productSku').value,
            };
            try {
                if (id) {
                    await api.updateProduct(id, data);
                    utils.showToast('Produto atualizado!', 'success');
                } else {
                    await api.createProduct(data);
                    utils.showToast('Produto criado!', 'success');
                }
                state.bootstrapProductModal.hide();
                handlers.loadProducts(true);
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleDeleteProduct: async (productId) => {
            if (!['admin', 'gerente'].includes(state.userRole)) { // Apenas admin e gerente podem deletar
                utils.showToast('Você não tem permissão para excluir produtos.', 'error');
                return;
            }
            utils.showConfirm('Deseja realmente excluir este produto?', async () => {
                try {
                    await api.deleteProduct(productId);
                    utils.showToast('Produto excluído!', 'success');
                    handlers.loadProducts(true);
                }
                catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
        handlePrintSale: (sale) => {
            // Todos que podem ver detalhes da venda podem imprimir
            if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                utils.showToast('Você não tem permissão para imprimir vendas.', 'error');
                return;
            }
            const printContent = utils.generatePrintContent(sale);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    // --- INITIALIZATION ---
    function initialize() {
        // Obter a role do usuário imediatamente após a inicialização
        state.userRole = utils.getUserRole();
        if (!state.userRole) { // Se não há token ou role, redireciona para o login
            utils.logout('Você precisa estar logado para acessar esta página.');
            return;
        }

        // Ajuste da sidebar e mainContent para telas maiores
        if (window.innerWidth >= 992) {
            dom.sidebar.classList.remove('collapsed');
            dom.sidebar.classList.add('active');
            dom.sidebarOverlay.classList.remove('active');
            dom.mainContent.style.marginLeft = '280px'; 
        } else {
            dom.sidebar.classList.add('collapsed');
            dom.sidebar.classList.remove('active');
            dom.sidebarOverlay.classList.remove('active');
            dom.mainContent.style.marginLeft = '0px'; 
        }
        
        // NOVO: Atualiza a visibilidade da sidebar com base na role ao carregar a página
        ui.updateSidebarVisibility();

        dom.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const sectionId = e.currentTarget.dataset.section;
                // NOVO: Verificação de permissão para navegação na sidebar
                let hasPermission = true;
                switch (sectionId) {
                    case 'productsSection':
                        if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) hasPermission = false;
                        break;
                    case 'reportsSection':
                        if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) hasPermission = false;
                        break;
                    case 'clientsSection':
                    case 'salesSection':
                    case 'dashboardSection':
                        // Todos podem acessar
                        break;
                    default:
                        hasPermission = false; // Se uma nova seção for adicionada e não tiver permissão definida
                }

                if (!hasPermission) {
                    utils.showToast('Você não tem permissão para acessar esta seção.', 'error');
                    return;
                }

                ui.showSection(sectionId);
                if (window.innerWidth < 992) {
                    dom.sidebar.classList.remove('active');
                    dom.sidebarOverlay.classList.remove('active');
                }
                if (sectionId === 'dashboardSection') handlers.loadDashboard();
                if (sectionId === 'clientsSection') handlers.loadClients();
                if (sectionId === 'salesSection') handlers.loadSales();
                if (sectionId === 'reportsSection') {
                    dom.reportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Relatório" para ver os resultados.</p>';
                }
                if (sectionId === 'productsSection') handlers.loadProducts();
            });
        });

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                // Adicione verificações de permissão aos handlers chamados pelos botões
                if (button.id === 'btnNewClient') handlers.openClientModal();
                if (button.id === 'btnNewSale') handlers.openSaleModal();
                if (button.id === 'btnExportClientsCsv') handlers.handleExportClientsCsv();
                if (button.id === 'btnExportSalesCsv') handlers.handleExportSalesCsv();
                if (button.id === 'btnExportPeriodReportCsv') handlers.handleExportPeriodReportCsv();
                if (button.id === 'btnNewProduct') handlers.openProductModal();
                if (button.id === 'btnAddProduct') handlers.handleAddProductToSale();
                if (button.classList.contains('btn-remove-product')) {
                    const index = parseInt(button.dataset.index);
                    handlers.handleRemoveProductFromSale(index);
                }
                if (button.id === 'btnShareWhatsapp') {
                    const saleId = button.dataset.saleId;
                    api.getSaleById(saleId).then(sale => {
                        // Verificação de permissão para compartilhar/imprimir
                        if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                            utils.showToast('Você não tem permissão para compartilhar detalhes de vendas.', 'error');
                            return;
                        }
                        const message = utils.generateSaleMessage(sale);
                        const clientPhone = sale.client?.telefone?.replace(/\D/g, '') || '';
                        const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    }).catch(error => utils.showToast(error.message, 'error'));
                }
                if (button.id === 'btnShareEmail') {
                    const saleId = button.dataset.saleId;
                    api.getSaleById(saleId).then(sale => {
                         // Verificação de permissão para compartilhar/imprimir
                        if (!['admin', 'gerente', 'vendedor'].includes(state.userRole)) {
                            utils.showToast('Você não tem permissão para compartilhar detalhes de vendas.', 'error');
                            return;
                        }
                        const subject = encodeURIComponent(`Detalhes da sua compra #${sale.id} no Gestor PRO`);
                        const body = encodeURIComponent(utils.generateSaleMessage(sale));
                        const clientEmail = sale.client?.email || '';
                        const mailtoUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
                        window.open(mailtoUrl, '_blank');
                    }).catch(error => utils.showToast(error.message, 'error'));
                }
                if (button.id === 'btnPrintSale') {
                    const saleId = button.dataset.saleId;
                    api.getSaleById(saleId).then(sale => {
                        // A função handlePrintSale já tem a verificação
                        handlers.handlePrintSale(sale);
                    }).catch(error => utils.showToast(error.message, 'error'));
                }
                if (button.id === 'sidebarToggle') {
                    dom.sidebar.classList.toggle('active');
                    dom.sidebarOverlay.classList.toggle('active');
                }

                const { type, id } = button.dataset;
                if (button.classList.contains('action-delete')) {
                    // A verificação de permissão está dentro dos handlers handleDeleteClient/Sale/Product
                    if (type === 'client') handlers.handleDeleteClient(id);
                    if (type === 'sale') handlers.handleDeleteSale(id);
                    if (type === 'product') handlers.handleDeleteProduct(id);
                }
                if (button.classList.contains('action-detail')) {
                    if (type === 'sale') handlers.loadSaleDetail(id);
                }
                if(button.classList.contains('action-edit')) {
                    // A verificação de permissão está dentro dos handlers openClientModal/openProductModal
                    if (type === 'client') handlers.openClientModal(id);
                    if (type === 'product') handlers.openProductModal(id);
                }
            }

            const pageLink = e.target.closest('a.page-link');
            if (pageLink) {
                e.preventDefault();
                if (pageLink.parentElement.classList.contains('disabled')) return;
                const { type, page } = pageLink.dataset;
                handlers.handlePageChange(type, parseInt(page));
            }
            
            const backLink = e.target.closest('.nav-back');
            if (backLink) {
                e.preventDefault();
                ui.showSection(backLink.dataset.section);
            }
        });

        if (dom.reportPeriodForm) {
            dom.reportPeriodForm.addEventListener('submit', handlers.handleGenerateSalesReport);
        }
        
        if (dom.paymentFormaSelect) {
            dom.paymentFormaSelect.addEventListener('change', () => {
                utils.togglePaymentFields(dom.paymentFormaSelect, dom.paymentParcelasField, dom.paymentBandeiraCartaoField, dom.paymentBancoCrediarioField, dom.paymentParcelasInput, dom.paymentBandeiraCartaoInput, dom.paymentBancoCrediarioInput);
            });
        }
        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'paymentFormaNew') {
                const newPaymentFormaSelectElement = document.getElementById('paymentFormaNew');
                const newParcelasFieldElement = document.getElementById('newParcelasField');
                const newBandeiraCartaoFieldElement = document.getElementById('newBandeiraCartaoField');
                const newBancoCrediarioFieldElement = document.getElementById('newBancoCrediarioField'); // This is the div, not the input
                const newPaymentParcelasInputElement = document.getElementById('newPaymentParcelas');
                const newPaymentBandeiraCartaoInputElement = document.getElementById('newPaymentBandeiraCartao');
                const newPaymentBancoCrediarioInputElement = document.getElementById('newPaymentBancoCrediario');

                utils.togglePaymentFields(newPaymentFormaSelectElement, newParcelasFieldElement, newBandeiraCartaoFieldElement, newBancoCrediarioFieldElement, newPaymentParcelasInputElement, newPaymentBandeiraCartaoInputElement, newPaymentBancoCrediarioInputElement);
            }
        });

        if (dom.sidebarOverlay) {
            dom.sidebarOverlay.addEventListener('click', () => {
                dom.sidebar.classList.remove('active');
                dom.sidebarOverlay.classList.remove('active');
            });
        }

        let searchTimeout;
        document.body.addEventListener('input', e => {
            if (e.target.classList.contains('search-input')) {
                clearTimeout(searchTimeout);
                const { type } = e.target.dataset;
                const query = e.target.value;
                searchTimeout = setTimeout(() => {
                    handlers.handleSearch(type, query);
                }, 300);
            }
        });

        dom.clientForm.addEventListener('submit', handlers.handleSaveClient);
        dom.saleForm.addEventListener('submit', handlers.handleSaveSale);
        if (dom.productForm) {
            dom.productForm.addEventListener('submit', handlers.handleSaveProduct);
        }

        document.body.addEventListener('submit', e => {
            if (e.target.id === 'paymentForm') handlers.handleSavePayment(e);
        });
        if (dom.confirmModalButton) {
            dom.confirmModalButton.addEventListener('click', () => {
                if (state.confirmAction) state.confirmAction();
                state.bootstrapConfirmModal.hide(); 
            });
        }

        if (dom.logoutButton) {
            dom.logoutButton.addEventListener('click', () => {
                utils.logout('Você foi desconectado.');
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) {
                dom.sidebar.classList.remove('active');
                dom.sidebar.classList.remove('collapsed');
                dom.sidebarOverlay.classList.remove('active');
                dom.mainContent.style.marginLeft = '280px';
            } else {
                if (!dom.sidebar.classList.contains('active')) {
                    dom.sidebar.classList.add('collapsed');
                }
                dom.mainContent.style.marginLeft = '0px';
            }
        });

        // Inicia o carregamento do dashboard APÓS a role ser definida
        handlers.loadDashboard();
    }

    initialize();
});
