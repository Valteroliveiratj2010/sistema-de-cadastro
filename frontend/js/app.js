(() => { // IIFE para encapsular todo o script e evitar conflitos de escopo
    'use strict';

    // --- VERIFICAÇÃO DE CONFIGURAÇÃO DA API ---
    if (!window.API_BASE_URL) {
        // Se apiConfig.js não foi carregado, configurar manualmente
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname === '';
        
        if (isLocalhost) {
            window.API_BASE_URL = 'http://localhost:8080/api';
            console.log('🌐 Ambiente: DESENVOLVIMENTO LOCAL (configurado manualmente)');
        } else {
            window.API_BASE_URL = 'https://sistema-de-cadastro-backend.onrender.com/api';
            console.log('🌐 Ambiente: PRODUÇÃO (configurado manualmente)');
        }
        console.log('🔗 API URL:', window.API_BASE_URL);
    }

    // console.log para verificar o carregamento do arquivo app.js
    // Mude o valor de 'v' (versão) para a data e hora atual (AAAA-MM-DD-HHMMSS)
    // para garantir que o navegador sempre carregue a versão mais recente.
    const APP_VERSION = "2025-01-07-120000"; // ATUALIZE ESTE NÚMERO SEMPRE QUE QUISER FORÇAR O CACHE
    console.log(`APP.JS CARREGADO - Versão: ${APP_VERSION}`);

    document.addEventListener('DOMContentLoaded', () => {

        // --- ADICIONEI ESTES CONSOLE.LOGS AQUI PARA DEBUG DE MODAL ---
        console.log('[DEBUG APP.JS] Verificando objeto Bootstrap:', typeof bootstrap);
        console.log('[DEBUG APP.JS] Verificando Bootstrap.Modal:', typeof bootstrap.Modal);
        // --- FIM DOS CONSOLE.LOGS ---

        // --- CONFIGURAÇÃO E ESTADO ---
        const API_BASE = window.API_BASE_URL || 'http://localhost:8080/api';
        const state = {
            bootstrapClientModal: null,
            bootstrapSaleModal: null,
            bootstrapConfirmModal: null,
            bootstrapProductModal: null,
            bootstrapUserModal: null,
            bootstrapSupplierModal: null,
            bootstrapPurchaseModal: null,
            chartInstance: null, // Instância do gráfico de vendas mensais no Dashboard
            predictionChartInstance: null, // Instância do gráfico de predição de vendas
            confirmAction: null,
            userRole: null,
            user: null,
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
            cashFlowReport: {
                startDate: null,
                endDate: null,
                data: null,
            },
            dueDates: {
                overdueReceivables: [],
                upcomingReceivables: [],
                overduePayables: [],
                upcomingPayables: [],
            },
            salesPrediction: {
                historicalData: [],
                predictionData: [],
                period: {
                    startDate: null,
                    endDate: null,
                    months: 12
                }
            },
            products: {
                page: 1,
                query: '',
                limit: 10,
                data: [],
                total: 0,
                loaded: false
            },
            users: {
                page: 1,
                query: '',
                limit: 10,
                data: [],
                total: 0,
                loaded: false
            },
            suppliers: {
                page: 1,
                query: '',
                limit: 10,
                data: [],
                total: 0,
                loaded: false
            },
            purchases: {
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
            selectedPurchaseProducts: [],
            availableProductsForPurchase: null,
            currentSelectedProductForPurchase: null,
            availableSuppliers: [],
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
            cashFlowReportForm: document.getElementById('cashFlowReportForm'),
            cashFlowStartDateInput: document.getElementById('cashFlowStartDate'),
            cashFlowEndDateInput: document.getElementById('cashFlowEndDate'),
            cashFlowReportResults: document.getElementById('cashFlowReportResults'),
            productForm: document.getElementById('productForm'),

            productSelect: $('#productSelect'),
            purchaseSupplierSelect: $('#purchaseSupplier'),
            purchaseProductSelect: $('#purchaseProductSelect'),

            productQuantityInput: document.getElementById('productQuantity'),
            productUnitPriceInput: document.getElementById('productUnitPrice'),
            btnAddProduct: document.getElementById('btnAddProduct'),
            saleProductsList: document.getElementById('saleProductsList'),
            saleTotalValueDisplay: document.getElementById('saleTotalValueDisplay'),
            saleTotalValueHidden: document.getElementById('saleTotalValue'),
            productDetailsDisplay: document.getElementById('productDetailsDisplay'),

            sidebar: document.querySelector('.sidebar'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            mainContent: document.getElementById('mainContent'),

            userForm: document.getElementById('userForm'),
            userIdInput: document.getElementById('userId'),
            userNameInput: document.getElementById('userName'),
            userEmailInput: document.getElementById('userEmail'),
            userPasswordInput: document.getElementById('userPassword'),
            userRoleSelect: document.getElementById('userRole'),

            supplierForm: document.getElementById('supplierForm'),
            supplierIdInput: document.getElementById('supplierId'),
            supplierNameInput: document.getElementById('supplierName'),
            supplierContactInput: document.getElementById('supplierContact'),
            supplierEmailInput: document.getElementById('supplierEmail'),
            supplierCnpjInput: document.getElementById('supplierCnpj'),
            supplierAddressInput: document.getElementById('supplierAddress'),

            purchaseForm: document.getElementById('purchaseForm'),
            purchaseIdInput: document.getElementById('purchaseId'),
            purchaseSupplier: document.getElementById('purchaseSupplier'),
            purchaseDate: document.getElementById('purchaseDate'),
            purchaseDateInput: document.getElementById('purchaseDate'),
            purchaseProductsList: document.getElementById('purchaseProductsList'),
            purchaseProductSelect: document.getElementById('purchaseProductSelect'),
            purchaseProductQuantityInput: document.getElementById('purchaseProductQuantity'),
            purchaseProductCostInput: document.getElementById('purchaseProductCost'),
            btnAddPurchaseProduct: document.getElementById('btnAddPurchaseProduct'),
            purchaseProductDetailsDisplay: document.getElementById('purchaseProductDetailsDisplay'),
            purchaseTotalValueDisplay: document.getElementById('purchaseTotalValueDisplay'),
            purchaseTotalValueHidden: document.getElementById('purchaseTotalValue'),
            purchaseStatus: document.getElementById('purchaseStatus'),
            purchaseStatusSelect: document.getElementById('purchaseStatus'),
            purchaseObservations: document.getElementById('purchaseObservations'),
            purchaseObservationsInput: document.getElementById('purchaseObservations'),
            
            accountingReportForm: document.getElementById('accountingReportForm'),
            accountingStartDateInput: document.getElementById('accountingStartDate'),
            accountingEndDateInput: document.getElementById('accountingEndDate'),
            salesPredictionForm: document.getElementById('salesPredictionForm'),
            predictionMonthsInput: document.getElementById('predictionMonths'),
            salesPredictionResults: document.getElementById('salesPredictionResults'),
        };

        // --- UTILITY FUNCTIONS ---
        const utils = {
            formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
            formatDate: (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                if (dateString.includes('T00:00:00.000Z') || /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    date.setUTCDate(date.getUTCDate() + 1);
                }
                return date.toLocaleDateString('pt-BR');
            },
            showToast: (message, type = 'success') => {
                Toastify({ text: message, duration: 3000, gravity: "top", position: "right", style: { background: type === 'success' ? 'var(--primary-color)' : 'var(--danger-color)' } }).showToast();
            },
            showConfirm: (message, onConfirm) => {
                dom.confirmModalMessage.textContent = message;
                state.confirmAction = onConfirm;
                state.bootstrapConfirmModal.show();
            },
            getToken: () => localStorage.getItem('token') || localStorage.getItem('jwtToken'),
            getUserRole: () => {
                const token = utils.getToken();
                if (!token) return null;
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.role;
                }
                catch (error) {
                    console.error('Erro ao descodificar token JWT:', error);
                    return null;
                }
            },
            hasPermission: (allowedRoles) => {
                return allowedRoles.includes(state.userRole);
            },
            logout: (message = 'Sessão expirada ou inválida. Faça login novamente.') => {
                // Limpar todos os dados do localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                
                // Limpar tudo por segurança
                localStorage.clear();
                
                // Limpar estado
                state.userRole = null;
                state.user = null;
                
                // Mostrar mensagem
                utils.showToast(message, 'error');
                
                // Redirecionar após 1 segundo
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            },
            downloadFile: (response) => {
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'download.csv';
                if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                    if (filenameMatch && filenameMatch.length > 1) {
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
            calculatePurchaseTotal: () => {
                let total = 0;
                state.selectedPurchaseProducts.forEach(item => {
                    total += item.precoCustoUnitario * item.quantidade;
                });
                return total;
            },
            renderSelectedPurchaseProductsList: () => {
                if (state.selectedPurchaseProducts.length === 0) {
                    dom.purchaseProductsList.innerHTML = '<p class="text-muted text-center m-0">Nenhum produto adicionado.</p>';
                    dom.purchaseTotalValueDisplay.value = utils.formatCurrency(0);
                    dom.purchaseTotalValueHidden.value = 0;
                    return;
                }

                let listHtml = `<ul class="list-group list-group-flush">`;
                state.selectedPurchaseProducts.forEach((item, index) => {
                    listHtml += `
                        <li class="list-group-item d-flex justify-content-between align-items-center py-1 ps-2 pe-1">
                            <span>${item.nome} (${item.quantidade}x) - ${utils.formatCurrency(item.precoCustoUnitario)} cada</span>
                            <span>
                                ${utils.formatCurrency(item.precoCustoUnitario * item.quantidade)}
                                <button type="button" class="btn btn-sm btn-outline-danger ms-2 btn-remove-purchase-product" data-index="${index}"><i class="bi bi-x-lg"></i></button>
                            </span>
                        </li>
                    `;
                });
                listHtml += `</ul>`;
                dom.purchaseProductsList.innerHTML = listHtml;

                const total = utils.calculatePurchaseTotal();
                dom.purchaseTotalValueDisplay.value = utils.formatCurrency(total);
                dom.purchaseTotalValueHidden.value = total;
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
                            <h2>RECIBO DE Venda #${sale.id}</h2>
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
                    utils.logout(response.status === 401 ?
                        'Sessão expirada ou inválida. Por favor, faça login novamente.' :
                        'Você não tem permissão para realizar esta ação.');
                    throw new Error('Não autorizado ou sessão expirada.');
                }

                if (!response.ok) {
                    if (!options.isFileDownload && response.headers.get('content-type')?.includes('application/json')) {
                        const error = await response.json();
                        // Fix: Changed `new new Error` to `new Error`
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
            getRankingsVendedores: () => api.request('/rankings/vendedores'),
            getUsers: (page = 1, q = '', limit = 10) => api.request(`/users?page=${page}&q=${q}&limit=${limit}`),
            getUserById: (id) => api.request(`/users/${id}`),
            createUser: (data) => api.request('/users', { method: 'POST', body: JSON.stringify(data) }),
            updateUser: (id, data) => api.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            deleteUser: (id) => api.request(`/users/${id}`, { method: 'DELETE' }),
            getSuppliers: (page = 1, q = '', limit = 10) => api.request(`/suppliers?page=${page}&q=${q}&limit=${limit}`),
            getSupplierById: (id) => api.request(`/suppliers/${id}`),
            createSupplier: (data) => api.request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
            updateSupplier: (id, data) => api.request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            deleteSupplier: (id) => api.request(`/suppliers/${id}`, { method: 'DELETE' }),
            getPurchases: (page = 1, q = '', limit = 10) => api.request(`/purchases?page=${page}&q=${q}&limit=${limit}`),
            getPurchaseById: (id) => api.request(`/purchases/${id}`),
            createPurchase: (data) => api.request('/purchases', { method: 'POST', body: JSON.stringify(data) }),
            updatePurchase: (id, data) => api.request(`/purchases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            deletePurchase: (id) => api.request(`/purchases/${id}`, { method: 'DELETE' }),
            getCashFlow: (startDate, endDate) => api.request(`/finance/cash-flow?startDate=${startDate}&endDate=${endDate}`),
            getDueDates: () => api.request('/dashboard/due-dates'),
            exportAccountingCsv: (startDate, endDate) => api.request(`/finance/accounting-csv?startDate=${startDate}&endDate=${endDate}`, { isFileDownload: true }),
            getSalesPredictionData: (months) => api.request(`/finance/sales-prediction?months=${months}`),
        };

        // --- UI AND RENDERING LOGIC ---
        const ui = {
            showSection: (sectionId) => {
                    console.log('🔄 showSection chamada com:', sectionId);
                    
                    // Limpar seções de detalhes se existirem
                    const saleDetailSection = document.getElementById('saleDetailSection');
                    if (saleDetailSection && sectionId !== 'saleDetailSection') {
                        saleDetailSection.remove();
                        console.log('✅ Seção de detalhes de venda removida');
                    }
                    
                    const purchaseDetailSection = document.getElementById('purchaseDetailSection');
                    if (purchaseDetailSection && sectionId !== 'purchaseDetailSection') {
                        purchaseDetailSection.style.display = 'none';
                        console.log('✅ Seção de detalhes de compra ocultada');
                    }
                    
                    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
                    const section = document.getElementById(sectionId);
                    console.log('📍 Seção encontrada:', section);
                    
                    if (section) {
                        section.style.display = 'block';
                        console.log('✅ Seção exibida:', sectionId);
                    } else {
                        console.error('❌ Seção não encontrada:', sectionId);
                    }

                    dom.navLinks.forEach(l => l.classList.remove('active'));
                    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
                    if (navLink) navLink.classList.add('active');

                    ui.updateSidebarVisibility();
                },
            updateSidebarVisibility: () => {
                const userRole = state.userRole;
                dom.navLinks.forEach(link => {
                    const sectionId = link.dataset.section;
                    let isVisible = true;

                    switch (sectionId) {
                        case 'productsSection':
                        case 'reportsSection':
                        case 'clientsSection':
                        case 'salesSection':
                        case 'dashboardSection':
                            break;
                        case 'usersSection':
                            if (!utils.hasPermission(['admin'])) {
                                isVisible = false;
                            }
                            break;
                        case 'suppliersSection':
                        case 'purchasesSection':
                            if (!utils.hasPermission(['admin', 'gerente'])) hasPermission = false;
                            break;
                        case 'logoutSection':
                            isVisible = true;
                            break;
                        default:
                            isVisible = false;
                            break;
                    }
                    link.style.display = isVisible ? '' : 'none';
                });
            },
            renderDashboard: ({ totalClients, salesThisMonth, totalReceivable, overdueSales, salesByMonth, lowStockProducts, salesToday, averageTicket, totalAccountsPayable, overdueAccountsPayable, salesLastYearSameMonth }) => {
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

   
                        </div>
                    `;
                }

                let accountsPayableHtml = '';
                if (utils.hasPermission(['admin', 'gerente'])) {
                    accountsPayableHtml = `
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>A Pagar</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(totalAccountsPayable)}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card kpi-warning">
                                <h6>Contas Pagar Venc.</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(overdueAccountsPayable)}</p>
                            </div>
                        </div>
                    `;
                }

                section.innerHTML = `
                    <h3>Dashboard</h3>
                    ${lowStockAlertHtml}
                    <div class="row g-4 mb-4">
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>Clientes</h6>
                                <p class="fs-2 fw-bold">${totalClients}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>Vendas Hoje</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(salesToday)}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>Vendas Mês</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(salesThisMonth)}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>Ticket Médio</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(averageTicket)}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card">
                                <h6>A Receber</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(totalReceivable)}</p>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6">
                            <div class="kpi-card kpi-danger">
                                <h6>Vencido</h6>
                                <p class="fs-2 fw-bold">${utils.formatCurrency(overdueSales)}</p>
                            </div>
                        </div>
                        ${accountsPayableHtml}
                    </div>
                    <div class="card p-3 mb-4"><canvas id="salesChart"></canvas></div>
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
                        <div class="col-md-4" id="rankingVendedoresCard">
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
                    <hr class="my-5">
                    <h4><i class="bi bi-calendar-x-fill me-2"></i>Vencimentos Financeiros</h4>
                    <div class="row g-4 mt-4">
                        <div class="col-md-6">
                            <div class="card shadow-sm">
                                <div class="card-header bg-danger text-white">
                                    <h5 class="mb-0"><i class="bi bi-arrow-down-circle me-2"></i>Contas a Receber Vencidas</h5>
                                </div>
                                <div class="card-body" id="overdueReceivablesList">
                                    <p class="text-center text-muted">Carregando...</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card shadow-sm">
                                <div class="card-header bg-warning text-dark">
                                    <h5 class="mb-0"><i class="bi bi-arrow-down-right-circle me-2"></i>Contas a Receber Próximas (30 dias)</h5>
                                </div>
                                <div class="card-body" id="upcomingReceivablesList">
                                    <p class="text-center text-muted">Carregando...</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6" id="overduePayablesCard">
                            <div class="card shadow-sm">
                                <div class="card-header bg-danger text-white">
                                    <h5 class="mb-0"><i class="bi bi-arrow-up-circle me-2"></i>Contas a Pagar Vencidas</h5>
                                </div>
                                <div class="card-body" id="overduePayablesList">
                                    <p class="text-center text-muted">Carregando...</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6" id="upcomingPayablesCard">
                            <div class="card shadow-sm">
                                <div class="card-header bg-warning text-dark">
                                    <h5 class="mb-0"><i class="bi bi-arrow-up-right-circle me-2"></i>Contas a Pagar Próximas (30 dias)</h5>
                                </div>
                                <div class="card-body" id="upcomingPayablesList">
                                    <p class="text-center text-muted">Carregando...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                const ctx = document.getElementById('salesChart').getContext('2d');
                if (state.chartInstance) state.chartInstance.destroy();

                const rootStyles = getComputedStyle(document.documentElement);
                const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
                const primaryDark = rootStyles.getPropertyValue('--primary-dark').trim();
                const secondaryColor = rootStyles.getPropertyValue('--secondary-color').trim();
                const secondaryDark = rootStyles.getPropertyValue('--secondary-dark').trim();

                const currentYear = new Date().getFullYear();
                const salesCurrentYear = [];
                const salesPreviousYear = [];
                const labels = [];

                const salesDataMap = new Map(salesByMonth.map(item => [item.month, item]));

                for (let i = 11; i >= 0; i--) {
                    const date = new Date(currentYear, new Date().getMonth() - i, 1);
                    const monthKeyCurrentYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const monthKeyPreviousYear = `${date.getFullYear() - 1}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    labels.push(`${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`);

                    const currentMonthData = salesDataMap.get(monthKeyCurrentYear);
                    const previousMonthData = salesDataMap.get(monthKeyPreviousYear);

                    salesCurrentYear.push(currentMonthData ? currentMonthData.total : 0);
                    salesPreviousYear.push(previousMonthData ? previousMonthData.total : 0);
                }

                state.chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: `Vendas ${currentYear} (R$)`,
                                data: salesCurrentYear,
                                backgroundColor: primaryColor,
                                borderColor: primaryDark,
                                borderWidth: 1
                            },
                            {
                                label: `Vendas ${currentYear - 1} (R$)`,
                                data: salesPreviousYear,
                                backgroundColor: secondaryColor,
                                borderColor: secondaryDark,
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Valor (R$)'
                                },
                                ticks: {
                                    callback: function (value, index, ticks) {
                                        return utils.formatCurrency(value);
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Mês/Ano'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Vendas Mensais (Comparativo Anual)',
                                font: { size: 16, family: 'var(--font-heading)' }
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        const monthLabel = context[0].label;
                                        return `Mês: ${monthLabel}`;
                                    },
                                    label: function (context) {
                                        const datasetLabel = context.dataset.label;
                                        const [labelMonth, labelYear] = context.label.split('/').map(Number);
                                        const searchYear = datasetLabel.includes(`${currentYear - 1}`) ? labelYear - 1 : labelYear;

                                        const currentMonthData = salesByMonth.find(item => {
                                            const [itemYear, itemMonth] = item.month.split('-');
                                            return parseInt(itemYear) === searchYear && parseInt(itemMonth) === labelMonth;
                                        });

                                        let label = `${datasetLabel}: ${utils.formatCurrency(context.raw)}`;

                                        if (currentMonthData) {
                                            label += `\nQuantidade de Vendas: ${currentMonthData.count}`;
                                            label += `\nTicket Médio: ${utils.formatCurrency(currentMonthData.averageTicket)}`;
                                        }

                                        if (datasetLabel.includes(`${currentYear}`)) {
                                            const correspondingPrevYearData = salesByMonth.find(item => {
                                                const [itemYear, itemMonth] = item.month.split('-');
                                                return parseInt(itemYear) === (labelYear - 1) && parseInt(itemMonth) === labelMonth;
                                            });

                                            if (correspondingPrevYearData && correspondingPrevYearData.total > 0) {
                                                const percentageChange = ((context.raw - correspondingPrevYearData.total) / correspondingPrevYearData.total) * 100;
                                                label += `\nComparado ao Ano Anterior: ${percentageChange.toFixed(2)}%`;
                                            } else if (context.raw > 0 && !correspondingPrevYearData) {
                                                label += `\nComparado ao Ano Anterior: N/A (sem vendas no ano anterior)`;
                                            }
                                        }

                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    const rankingVendedoresCard = document.getElementById('rankingVendedoresCard');
                    if (rankingVendedoresCard) {
                        rankingVendedoresCard.style.display = 'none';
                    }
                    document.getElementById('overduePayablesCard').style.display = 'none';
                    document.getElementById('upcomingPayablesCard').style.display = 'none';
                } else {
                    const rankingVendedoresCard = document.getElementById('rankingVendedoresCard');
                    if (rankingVendedoresCard) {
                        rankingVendedoresCard.style.display = 'block';
                    }
                    document.getElementById('overduePayablesCard').style.display = 'block';
                    document.getElementById('upcomingPayablesCard').style.display = 'block';
                }
            },
            renderClients: () => {
                const { data, total } = state.clients;
                const section = document.getElementById('clientsSection');
                const tableRows = data.map(client => `
                    <tr>
                        <td>${client.id}</td><td><strong>${client.nome}</strong></td><td>${client.email || 'N/A'}</td><td>${client.telefone || 'N/A'}</td>
                        <td>
                            ${(utils.hasPermission(['admin', 'gerente']) || (utils.hasPermission(['vendedor']) && state.user && client.userId === state.user.id)) ?
                        `<button class="btn btn-sm btn-outline-primary action-edit" data-type="client" data-id="${client.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-danger action-delete" data-type="client" data-id="${client.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                        </td>
                    </tr>`).join('');

                let actionButtonsHtml = '';
                if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
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
                    const statusClass = valorDevido > 0 ? 'text-danger' : 'text-success';

                    return `
                            <tr>
                                <td>${sale.id}</td><td><strong>${sale.client?.nome || 'N/A'}</strong></td><td>${utils.formatDate(sale.dataVenda)}</td><td class="${statusClass}"><strong>${utils.formatCurrency(valorDevido)}</strong></td><td><span class="badge bg-primary">${sale.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info action-detail" data-type="sale" data-id="${sale.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
                                    ${(utils.hasPermission(['admin', 'gerente']) || (utils.hasPermission(['vendedor']) && state.user && sale.userId === state.user.id)) ?
                            `<button class="btn btn-sm btn-outline-primary action-edit" data-type="sale" data-id="${sale.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                                    ${utils.hasPermission(['admin', 'gerente']) ?
                            `<button class="btn btn-sm btn-outline-danger action-delete" data-type="sale" data-id="${sale.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                                </td>
                            </tr>`;
                }).join('');

                let actionButtonsHtml = '';
                if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
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
                    if (container) container.innerHTML = '';
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
                console.log('📊 Dados do relatório recebidos:', { sales, summary });
                
                const reportResultsDiv = dom.reportResults;
                let resultsHtml = '';

                if (sales.length === 0) {
                    resultsHtml = `<div class="alert alert-info text-center" role="alert">Nenhuma venda encontrada para o período selecionado.</div>`;
                } else {
                    let exportButtonHtml = '';
                    if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                        exportButtonHtml = `
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-success" id="btnExportPeriodReportCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar Relatório CSV</button>
                            </div>
                        `;
                    }

                    // Garantir que os valores sejam números
                    const totalSalesAmount = parseFloat(summary.totalSalesAmount) || 0;
                    const totalPaidAmount = parseFloat(summary.totalPaidAmount) || 0;
                    const totalDueAmount = parseFloat(summary.totalDueAmount) || 0;
                    const numberOfSales = parseInt(summary.numberOfSales) || 0;

                    console.log('💰 Valores processados:', {
                        totalSalesAmount,
                        totalPaidAmount,
                        totalDueAmount,
                        numberOfSales
                    });

                    resultsHtml += `
                        <div class="row g-3 mb-4">
                            <div class="col-md-3"><div class="card p-3"><h6>Total de Vendas</h6><p class="fs-4 fw-bold">${utils.formatCurrency(totalSalesAmount)}</p></div></div>
                            <div class="col-md-3"><div class="card p-3"><h6>Total Pago</h6><p class="fs-4 fw-bold">${utils.formatCurrency(totalPaidAmount)}</p></div></div>
                            <div class="col-md-3"><div class="card p-3 bg-danger text-white"><h6>Total Devido</h6><p class="fs-4 fw-bold">${utils.formatCurrency(totalDueAmount)}</p></div></div>
                            <div class="col-md-3"><div class="card p-3"><h6>Qtd. de Vendas</h6><p class="fs-4 fw-bold">${numberOfSales}</p></div></div>
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
            renderCashFlowReport: ({ startDate, endDate, totalReceipts, totalPayments, netCashFlow }) => {
                const cashFlowResultsDiv = dom.cashFlowReportResults;
                let resultsHtml = '';

                if (totalReceipts === 0 && totalPayments === 0) {
                    resultsHtml = `<div class="alert alert-info text-center" role="alert">Nenhum dado de fluxo de caixa encontrado para o período de ${utils.formatDate(startDate)} a ${utils.formatDate(endDate)}.</div>`;
                } else {
                    const netCashFlowClass = netCashFlow >= 0 ? 'text-success' : 'text-danger';
                    resultsHtml = `
                        <div class="card shadow-sm mb-4">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="bi bi-bar-chart-fill me-2"></i>Resumo do Fluxo de Caixa</h5>
                            </div>
                            <div class="card-body">
                                <p>Período: <strong>${utils.formatDate(startDate)}</strong> a <strong>${utils.formatDate(endDate)}</strong></p>
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="card p-3 bg-success text-white">
                                            <h6>Entradas (Recebimentos)</h6>
                                            <p class="fs-4 fw-bold">${utils.formatCurrency(totalReceipts)}</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card p-3 bg-danger text-white">
                                            <h6>Saídas (Pagamentos)</h6>
                                            <p class="fs-4 fw-bold">${utils.formatCurrency(totalPayments)}</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card p-3 ${netCashFlowClass} bg-light">
                                            <h6>Fluxo de Caixa Líquido</h6>
                                            <p class="fs-4 fw-bold">${utils.formatCurrency(netCashFlow)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                cashFlowResultsDiv.innerHTML = resultsHtml;
            },
            renderDetailedDueDates: ({ overdueReceivables, upcomingReceivables, overduePayables, upcomingPayables }) => {
                const renderReceivablesTable = (data, elementId) => {
                    const listEl = document.getElementById(elementId);
                    if (data.length === 0) {
                        listEl.innerHTML = '<p class="text-center text-muted m-0">Nenhuma venda pendente encontrada.</p>';
                        return;
                    }
                    const tableRows = data.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.client?.nome || 'N/A'}</td>
                            <td class="text-danger">${utils.formatDate(item.dataVencimento)}</td>
                            <td>${utils.formatCurrency(item.valorTotal - item.valorPago)}</td>
                        </tr>
                    `).join('');
                    listEl.innerHTML = `
                        <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                            <table class="table table-sm table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRows}</tbody>
                            </table>
                        </div>
                    `;
                };

                const renderPayablesTable = (data, elementId) => {
                    const listEl = document.getElementById(elementId);
                    if (data.length === 0) {
                        listEl.innerHTML = '<p class="text-center text-muted m-0">Nenhuma compra pendente encontrada.</p>';
                        return;
                    }
                    const tableRows = data.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.supplier?.nome || 'N/A'}</td>
                            <td class="text-danger">${utils.formatDate(item.dataCompra)}</td>
                            <td>${utils.formatCurrency(item.valorTotal)}</td>
                        </tr>
                    `).join('');
                    listEl.innerHTML = `
                        <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                            <table class="table table-sm table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fornecedor</th>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRows}</tbody>
                            </table>
                        </div>
                    `;
                };

                renderReceivablesTable(overdueReceivables, 'overdueReceivablesList');
                renderReceivablesTable(upcomingReceivables, 'upcomingReceivablesList');

                if (utils.hasPermission(['admin', 'gerente'])) {
                    renderPayablesTable(overduePayables, 'overduePayablesList');
                    renderPayablesTable(upcomingPayables, 'upcomingPayablesList');
                } else {
                    document.getElementById('overduePayablesList').innerHTML = '<p class="text-center text-muted m-0">Acesso restrito.</p>';
                    document.getElementById('upcomingPayablesList').innerHTML = '<p class="text-center text-muted m-0">Acesso restrito.</p>';
                }
            },
            renderSaleDetail: (sale) => {
                console.log('🎨 renderSaleDetail iniciada');
                
                // Remover a seção original se existir
                const oldSection = document.getElementById('saleDetailSection');
                if (oldSection) {
                    oldSection.remove();
                }
                
                // Criar uma nova seção que funciona
                const newSection = document.createElement('section');
                newSection.id = 'saleDetailSection';
                newSection.className = 'content-section';
                newSection.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 280px;
                    right: 0;
                    bottom: 0;
                    background-color: #ffffff;
                    padding: 20px;
                    overflow-y: auto;
                    z-index: 1000;
                `;
                
                const valorDevido = sale.valorTotal - sale.valorPago;
                console.log('💰 Valor devido:', valorDevido);
                
                let productsHtml = '';
                if (sale.saleProducts && sale.saleProducts.length > 0) {
                    console.log('📦 Produtos encontrados:', sale.saleProducts.length);
                    productsHtml = `
                        <h6>Itens da Venda:</h6>
                        <ul class="list-group mb-3">
                            ${sale.saleProducts.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>${item.Product ? item.Product.nome : 'Produto não encontrado'} (${item.quantidade}x)</span>
                                    <span class="fw-bold">${utils.formatCurrency(item.quantidade * item.precoUnitario)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                } else {
                    console.log('❌ Nenhum produto encontrado na venda');
                    productsHtml = `<p>Nenhum produto associado.</p>`;
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
                let detailActionButtonsHtml = '';
                if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    detailActionButtonsHtml = `
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn btn-sm btn-outline-success me-2" id="btnShareWhatsapp" data-sale-id="${sale.id}" title="Compartilhar no WhatsApp"><i class="bi bi-whatsapp"></i></button>
                            <button class="btn btn-sm btn-outline-info me-2" id="btnShareEmail" data-sale-id="${sale.id}" title="Compartilhar por E-mail"><i class="bi bi-envelope"></i></button>
                            <button class="btn btn-sm btn-outline-primary" id="btnPrintSale" data-sale-id="${sale.id}" title="Imprimir Venda"><i class="bi bi-printer"></i></button>
                        </div>
                    `;
                }

                let paymentFormHtml = '';
                if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    paymentFormHtml = `
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="bi bi-plus-circle me-2"></i>Registrar Pagamento</h5>
                                ${detailActionButtonsHtml}
                            </div>
                            <div class="card-body">
                                <form id="paymentForm" data-sale-id="${sale.id}">
                                    <div class="mb-3">
                                        <label for="paymentValue" class="form-label">
                                            <i class="bi bi-currency-dollar me-1"></i>Valor
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text">R$</span>
                                            <input type="number" step="0.01" class="form-control" id="paymentValue" 
                                                   placeholder="0,00" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="paymentFormaNew" class="form-label">
                                            <i class="bi bi-credit-card me-1"></i>Forma de Pagamento
                                        </label>
                                        <select class="form-select" id="paymentFormaNew">
                                            <option value="Dinheiro">💵 Dinheiro</option>
                                            <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                                            <option value="Crediário">🏦 Crediário</option>
                                            <option value="PIX">📱 PIX</option>
                                        </select>
                                    </div>
                                    <div class="row" id="newPaymentDetailsFields">
                                        <div class="col-md-6 mb-3" id="newParcelasField" style="display: none;">
                                            <label for="newPaymentParcelas" class="form-label">
                                                <i class="bi bi-calendar-check me-1"></i>Parcelas
                                            </label>
                                            <input type="number" class="form-control" id="newPaymentParcelas" 
                                                   value="1" min="1" placeholder="1">
                                        </div>
                                        <div class="col-md-6 mb-3" id="newBandeiraCartaoField" style="display: none;">
                                            <label for="newPaymentBandeiraCartao" class="form-label">
                                                <i class="bi bi-credit-card me-1"></i>Bandeira
                                            </label>
                                            <input type="text" class="form-control" id="newPaymentBandeiraCartao" 
                                                   placeholder="Ex: Visa, Mastercard">
                                        </div>
                                        <div class="col-md-6 mb-3" id="newBancoCrediarioField" style="display: none;">
                                            <label for="newPaymentBancoCrediario" class="form-label">
                                                <i class="bi bi-bank me-1"></i>Banco/Instituição
                                            </label>
                                            <input type="text" class="form-control" id="newPaymentBancoCrediario" 
                                                   placeholder="Ex: Banco X, Financeira Y">
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-success w-100">
                                        <i class="bi bi-check-circle me-2"></i>Registrar Pagamento
                                    </button>
                                </form>
                            </div>
                        </div>
                    `;
                }

                newSection.innerHTML = `
                    <div class="container-fluid h-100">
                        <!-- Breadcrumb Profissional -->
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item">
                                    <a href="#" class="nav-back" data-section="salesSection">
                                        <i class="bi bi-house-door"></i> Vendas
                                    </a>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    <i class="bi bi-receipt"></i> Detalhes da Venda #${sale.id}
                                </li>
                            </ol>
                        </nav>

                        <!-- Header Principal -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3><i class="bi bi-receipt me-2"></i>Detalhes da Venda #${sale.id}</h3>
                                <p class="text-muted mb-0">
                                    <i class="bi bi-calendar3 me-1"></i>
                                    Criada em ${utils.formatDate(sale.createdAt || new Date())}
                                </p>
                            </div>
                            <button class="btn btn-outline-secondary nav-back" data-section="salesSection">
                                <i class="bi bi-arrow-left me-2"></i> Voltar para Vendas
                            </button>
                        </div>

                        <!-- Conteúdo Principal -->
                        <div class="row g-4">
                            <!-- Coluna Esquerda - Itens e Pagamentos -->
                            <div class="col-lg-8">
                                <!-- Card de Itens da Venda -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h4><i class="bi bi-box me-2"></i>Itens da Venda</h4>
                                        <span class="badge bg-primary fs-6">${sale.saleProducts?.length || 0} item(s)</span>
                                    </div>
                                    <div class="card-body">
                                        ${productsHtml}
                                    </div>
                                </div>

                                <!-- Card de Histórico de Pagamentos -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h4><i class="bi bi-credit-card me-2"></i>Histórico de Pagamentos</h4>
                                        <span class="badge bg-success fs-6">${sale.payments?.length || 0} pagamento(s)</span>
                                    </div>
                                    <div class="card-body">
                                        ${paymentsHTML}
                                    </div>
                                </div>
                            </div>

                            <!-- Coluna Direita - Resumo e Ações -->
                            <div class="col-lg-4">
                                <!-- Card de Resumo da Venda -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5><i class="bi bi-graph-up me-2"></i>Resumo da Venda</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-person me-2"></i><strong>Cliente:</strong></span>
                                                    <span class="fw-bold">${sale.client?.nome || 'Cliente não informado'}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-currency-dollar me-2"></i><strong>Valor Total:</strong></span>
                                                    <span class="fw-bold text-primary">${utils.formatCurrency(sale.valorTotal)}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-check-circle me-2"></i><strong>Total Pago:</strong></span>
                                                    <span class="fw-bold text-success">${utils.formatCurrency(sale.valorPago)}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 ${valorDevido > 0 ? 'bg-warning' : 'bg-success'} rounded">
                                                    <span><i class="bi bi-exclamation-triangle me-2"></i><strong>Valor Devido:</strong></span>
                                                    <span class="fw-bold ${valorDevido > 0 ? 'text-warning' : 'text-success'}">${utils.formatCurrency(valorDevido)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Card de Ações -->
                                ${paymentFormHtml}
                            </div>
                        </div>
                    </div>
                `;
                console.log('✅ HTML definido na seção');
                console.log('📄 Tamanho do HTML:', newSection.innerHTML.length, 'caracteres');
                console.log('📄 Primeiros 200 caracteres:', newSection.innerHTML.substring(0, 200));
                console.log('🔍 Verificando se o botão está no HTML...');
                console.log('🔍 HTML contém "Voltar para Vendas":', newSection.innerHTML.includes('Voltar para Vendas'));

                // Adicionar a nova seção ao body
                document.body.appendChild(newSection);
            },
            // Adicionado: Função para renderizar detalhes da compra
            renderPurchaseDetail: (purchase) => {
                console.log("🎨 renderPurchaseDetail iniciada");
                
                // Remover a seção original se existir
                const oldSection = document.getElementById('purchaseDetailSection');
                if (oldSection) {
                    oldSection.remove();
                }
                
                // Criar uma nova seção que funciona
                const newSection = document.createElement('section');
                newSection.id = 'purchaseDetailSection';
                newSection.className = 'content-section';
                newSection.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 280px;
                    right: 0;
                    bottom: 0;
                    background-color: #ffffff;
                    padding: 20px;
                    overflow-y: auto;
                    z-index: 1000;
                `;

                let productsHtml = '';
                if (purchase.purchaseProducts && purchase.purchaseProducts.length > 0) {
                    console.log('📦 Produtos encontrados:', purchase.purchaseProducts.length);
                    productsHtml = `
                        <h6>Itens da Compra:</h6>
                        <ul class="list-group mb-3">
                            ${purchase.purchaseProducts.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>${item.product.nome} (${item.quantidade}x)</span>
                                    <span class="fw-bold">${utils.formatCurrency(item.quantidade * item.precoCustoUnitario)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                } else {
                    console.log('❌ Nenhum produto encontrado na compra');
                    productsHtml = `<p>Nenhum produto associado.</p>`;
                }

                newSection.innerHTML = `
                    <div class="container-fluid h-100">
                        <!-- Breadcrumb Profissional -->
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item">
                                    <a href="#" class="nav-back" data-section="purchasesSection">
                                        <i class="bi bi-house-door"></i> Compras
                                    </a>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    <i class="bi bi-cart-check"></i> Detalhes da Compra #${purchase.id}
                                </li>
                            </ol>
                        </nav>

                        <!-- Header Principal -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3><i class="bi bi-cart-check me-2"></i>Detalhes da Compra #${purchase.id}</h3>
                                <p class="text-muted mb-0">
                                    <i class="bi bi-calendar3 me-1"></i>
                                    Realizada em ${utils.formatDate(purchase.dataCompra)}
                                </p>
                            </div>
                            <button class="btn btn-outline-secondary nav-back" data-section="purchasesSection">
                                <i class="bi bi-arrow-left me-2"></i> Voltar para Compras
                            </button>
                        </div>

                        <!-- Conteúdo Principal -->
                        <div class="row g-4">
                            <!-- Coluna Esquerda - Itens da Compra -->
                            <div class="col-lg-8">
                                <!-- Card de Itens da Compra -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h4><i class="bi bi-box me-2"></i>Itens da Compra</h4>
                                        <span class="badge bg-primary fs-6">${purchase.purchaseProducts?.length || 0} item(s)</span>
                                    </div>
                                    <div class="card-body">
                                        ${productsHtml}
                                    </div>
                                </div>
                            </div>

                            <!-- Coluna Direita - Resumo da Compra -->
                            <div class="col-lg-4">
                                <!-- Card de Resumo da Compra -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5><i class="bi bi-graph-up me-2"></i>Resumo da Compra</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-building me-2"></i><strong>Fornecedor:</strong></span>
                                                    <span class="fw-bold">${purchase.supplier?.nome || 'Fornecedor não informado'}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-calendar3 me-2"></i><strong>Data da Compra:</strong></span>
                                                    <span class="fw-bold">${utils.formatDate(purchase.dataCompra)}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-currency-dollar me-2"></i><strong>Valor Total:</strong></span>
                                                    <span class="fw-bold text-primary">${utils.formatCurrency(purchase.valorTotal)}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-info-circle me-2"></i><strong>Status:</strong></span>
                                                    <span class="badge bg-secondary fs-6">${purchase.status}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                                    <span><i class="bi bi-chat-text me-2"></i><strong>Observações:</strong></span>
                                                    <span class="fw-bold">${purchase.observacoes || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                console.log('✅ HTML definido na seção');
                console.log('📄 Tamanho do HTML:', newSection.innerHTML.length, 'caracteres');
                console.log('📄 Primeiros 200 caracteres:', newSection.innerHTML.substring(0, 200));
                console.log('🔍 Verificando se o botão está no HTML...');
                console.log('🔍 HTML contém "Voltar para Compras":', newSection.innerHTML.includes('Voltar para Compras'));

                // Adicionar a nova seção ao body
                document.body.appendChild(newSection);
            },
            renderProducts: () => {
                const { data, total } = state.products;
                const section = document.getElementById('productsSection');
                const tableRows = data.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td><strong>${product.nome}</strong></td>
                        <td>${product.sku || 'N/A'}</td>
                        <td>${utils.formatCurrency(product.preco)}</td>
                        <td>${product.estoque}</td>
                        <td>
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-primary action-edit" data-type="product" data-id="${product.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-danger action-delete" data-type="product" data-id="${product.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                        </td>
                    </tr>`).join('');

                let newProductButtonHtml = '';
                if (utils.hasPermission(['admin', 'gerente'])) {
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
            },
            renderUsers: () => {
                const { data, total } = state.users;
                const section = document.getElementById('usersSection');
                const tableRows = data.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td><strong>${user.username}</strong></td>
                        <td>${user.email}</td>
                        <td><span class="badge bg-secondary">${user.role}</span></td>
                        <td>
                            ${utils.hasPermission(['admin']) ?
                        `<button class="btn btn-sm btn-outline-primary action-edit" data-type="user" data-id="${user.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                            ${(utils.hasPermission(['admin']) && user.id !== state.user.id) ?
                        `<button class="btn btn-sm btn-outline-danger action-delete" data-type="user" data-id="${user.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                        </td>
                    </tr>`).join('');

                let newUsersButtonHtml = '';
                if (utils.hasPermission(['admin'])) {
                    newUsersButtonHtml = `<button class="btn btn-primary" id="btnNewUser"><i class="bi bi-plus-circle me-2"></i>Novo Usuário</button>`;
                }

                section.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-people-fill me-2"></i>Utilizadores (${total})</h3>
                        <div>
                            ${newUsersButtonHtml}
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control search-input" data-type="users" placeholder="Buscar por nome de usuário ou email..." value="${state.users.query}">
                    </div>
                    <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Nome de Usuário</th><th>Email</th><th>Função</th><th>Ações</th></tr></thead><tbody>
                        ${data.length > 0 ? tableRows : '<tr><td colspan="5" class="text-center">Nenhum usuário encontrado.</td></tr>'}
                    </tbody></table></div>
                    <div id="paginationUsers"></div>`;

                ui.renderPagination('users', total, state.users.page, state.users.limit);
            },
            renderSuppliers: () => {
                const { data, total } = state.suppliers;
                const section = document.getElementById('suppliersSection');
                const tableRows = data.map(supplier => `
                    <tr>
                        <td>${supplier.id}</td>
                        <td><strong>${supplier.nome}</strong></td>
                        <td>${supplier.contato || 'N/A'}</td>
                        <td>${supplier.email || 'N/A'}</td>
                        <td>${supplier.cnpj || 'N/A'}</td>
                        <td>${supplier.endereco || 'N/A'}</td>
                        <td>
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-primary action-edit" data-type="supplier" data-id="${supplier.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-danger action-delete" data-type="supplier" data-id="${supplier.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                        </td>
                    </tr>`).join('');

                let newSupplierButtonHtml = '';
                if (utils.hasPermission(['admin', 'gerente'])) {
                    newSupplierButtonHtml = `<button class="btn btn-primary" id="btnNewSupplier"><i class="bi bi-plus-circle me-2"></i>Novo Fornecedor</button>`;
                }

                section.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-truck me-2"></i>Fornecedores (${total})</h3>
                        <div>
                            ${newSupplierButtonHtml}
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control search-input" data-type="suppliers" placeholder="Buscar por nome, contato, email ou CNPJ..." value="${state.suppliers.query}">
                    </div>
                    <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Nome</th><th>Contato</th><th>Email</th><th>CNPJ</th><th>Endereço</th><th>Ações</th></tr></thead><tbody>
                        ${data.length > 0 ? tableRows : '<tr><td colspan="7" class="text-center">Nenhum fornecedor encontrado.</td></tr>'}
                    </tbody></table></div>
                    <div id="paginationSuppliers"></div>`;

                ui.renderPagination('suppliers', total, state.suppliers.page, state.suppliers.limit);
            },
            renderPurchases: () => {
                const { data, total } = state.purchases;
                const section = document.getElementById('purchasesSection');
                const tableRows = data.map(purchase => `
                    <tr>
                        <td>${purchase.id}</td>
                        <td><strong>${purchase.supplier?.nome || 'N/A'}</strong></td>
                        <td>${utils.formatDate(purchase.dataCompra)}</td>
                        <td>${utils.formatCurrency(purchase.valorTotal)}</td>
                        <td><span class="badge bg-secondary">${purchase.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-info action-detail" data-type="purchase" data-id="${purchase.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-primary action-edit" data-type="purchase" data-id="${purchase.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
                            ${utils.hasPermission(['admin', 'gerente']) ?
                        `<button class="btn btn-sm btn-outline-danger action-delete" data-type="purchase" data-id="${purchase.id}" title="Excluir"><i class="bi bi-trash"></i></button>` : ''}
                        </td>
                    </tr>`).join('');

                let newPurchaseButtonHtml = '';
                if (utils.hasPermission(['admin', 'gerente'])) {
                    newPurchaseButtonHtml = `<button class="btn btn-primary" id="btnNewPurchase"><i class="bi bi-plus-circle me-2"></i>Nova Compra</button>`;
                }

                section.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-bag me-2"></i>Compras (${total})</h3>
                        <div>
                            ${newPurchaseButtonHtml}
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control search-input" data-type="purchases" placeholder="Buscar por nome do fornecedor..." value="${state.purchases.query}">
                    </div>
                    <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Fornecedor</th><th>Data Compra</th><th>Valor Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>
                        ${data.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center">Nenhuma compra encontrada.</td></tr>'}
                    </tbody></table></div>
                    <div id="paginationPurchases"></div>`;

                ui.renderPagination('purchases', total, state.purchases.page, state.purchases.limit);
            },
            renderSalesPredictionChart: ({ historicalData, period }) => {
                const predictionResultsDiv = dom.salesPredictionResults;
                if (!predictionResultsDiv) return;
                predictionResultsDiv.innerHTML = '<canvas id="salesPredictionChart"></canvas>';

                const ctx = document.getElementById('salesPredictionChart').getContext('2d');
                if (state.predictionChartInstance) state.predictionChartInstance.destroy();

                const labels = historicalData.map(d => {
                    const [year, month] = d.month.split('-');
                    return `${month}/${year}`;
                });

                const futureMonthsCount = 3;
                const lastMonthHistorical = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].month + '-02') : new Date();
                for (let i = 1; i <= futureMonthsCount; i++) {
                    const futureDate = new Date(lastMonthHistorical);
                    futureDate.setMonth(futureDate.getMonth() + i);
                    labels.push(`${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`);
                }

                const historicalSales = historicalData.map(d => d.totalSales);

                let predictedSales = [];
                if (historicalSales.length >= 3) {
                    const lastThreeMonthsAverage = (historicalSales[historicalSales.length - 1] + historicalSales[historicalSales.length - 2] + historicalSales[historicalSales.length - 3]) / 3;
                    for (let i = 0; i < futureMonthsCount; i++) {
                        predictedSales.push(lastThreeMonthsAverage);
                    }
                } else {
                    const lastKnownSale = historicalSales.length > 0 ? historicalSales[historicalSales.length - 1] : 0;
                    for (let i = 0; i < futureMonthsCount; i++) {
                        predictedSales.push(lastKnownSale);
                    }
                }

                state.predictionChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Vendas Históricas',
                                data: historicalSales.concat(Array(futureMonthsCount).fill(null)),
                                borderColor: 'var(--primary-color)',
                                backgroundColor: 'rgba(29, 78, 137, 0.2)',
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Projeção (Próximos ' + futureMonthsCount + ' meses)',
                                data: Array(historicalData.length - 1).fill(null).concat([historicalSales[historicalSales.length - 1]], predictedSales),
                                borderColor: 'var(--secondary-color)',
                                backgroundColor: 'transparent',
                                borderDash: [5, 5],
                                pointRadius: 5,
                                pointBackgroundColor: 'var(--secondary-color)',
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Valor das Vendas (R$)'
                                },
                                ticks: {
                                    callback: function (value) {
                                        return utils.formatCurrency(value);
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Mês/Ano'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: `Projeção de Vendas Baseada nos Últimos ${period.months} Meses`,
                                font: { size: 16, family: 'var(--font-heading)' }
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        const dataIndex = context[0].dataIndex;
                                        if (dataIndex < historicalData.length) {
                                            const currentMonthData = historicalData[dataIndex];
                                            return `Mês: ${currentMonthData.month.split('-')[1]}/${currentMonthData.month.split('-')[0]}`;
                                        }
                                        return `Mês: ${context[0].label}`;
                                    },
                                    label: function (context) {
                                        let label = context.dataset.label + ': ' + utils.formatCurrency(context.raw);

                                        if (context.datasetIndex === 0) {
                                            const dataIndex = context.dataIndex;
                                            const currentMonthData = historicalData[dataIndex];
                                            if (currentMonthData) {
                                                label += `\nTotal de Vendas: ${currentMonthData.salesCount}`;
                                                label += `\nTicket Médio: ${utils.formatCurrency(currentMonthData.averageTicket)}`;
                                            }
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };

        // --- EVENT HANDLERS ---
        const handlers = {
            loadDashboard: async () => {
                try {
                    const dashboardData = await api.getDashboardStats();
                    const lowStockProducts = await api.getLowStockProducts();
                    const dueDatesData = await api.getDueDates();

                    ui.renderDashboard({
                        ...dashboardData,
                        lowStockProducts,
                        salesByMonth: dashboardData.salesByMonth || [],
                        salesLastYearSameMonth: dashboardData.salesLastYearSameMonth
                    });
                    ui.renderDetailedDueDates(dueDatesData);

                    ui.showSection('dashboardSection');
                    handlers.loadRankings();
                } catch (error) { utils.showToast(error.message, 'error'); }
            },
            loadRankings: async () => {
                try {
                    const ulProdutos = document.getElementById('produtosMaisVendidos');
                    const ulClientes = document.getElementById('clientesMaisCompraram');
                    const ulVendedores = document.getElementById('vendedoresMaisVenderam');

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

                    if (utils.hasPermission(['admin', 'gerente'])) {
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
                        if (ulVendedores) ulVendedores.innerHTML = '<li class="list-group-item text-center text-muted">Acesso restrito.</li>';
                    }
                }
                catch (error) {
                    console.error('Erro ao carregar rankings:', error);
                    utils.showToast(error.message, 'error');
                    ['produtosMaisVendidos', 'clientesMaisCompraram', 'vendedoresMaisVenderam'].forEach(id => {
                        const ul = document.getElementById(id);
                        if (ul) ul.innerHTML = '<li class="list-group-item text-center text-danger">Erro ao carregar.</li>';
                    });
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
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para exportar clientes.', 'error');
                    return;
                }
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
                console.log('🚀 loadSales iniciada, force:', force);
                if (state.sales.loaded && !force) {
                    console.log('✅ Vendas já carregadas, renderizando...');
                    ui.renderSales();
                    return;
                }
                try {
                    console.log('🔄 Carregando vendas da API...');
                    const { page, query, limit } = state.sales;
                    const apiData = await api.getSales(page, query, limit);
                    console.log('✅ Dados recebidos da API:', apiData);
                    state.sales.data = apiData.data;
                    state.sales.total = apiData.total;
                    state.sales.loaded = true;
                    ui.renderSales();
                    console.log('✅ Vendas renderizadas');
                } catch (error) { 
                    console.error('❌ Erro ao carregar vendas:', error);
                    utils.showToast(error.message, 'error'); 
                }
            },
            handleExportSalesCsv: async () => {
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para exportar vendas.', 'error');
                    return;
                }
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
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para gerar relatórios de vendas.', 'error');
                    return;
                }
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
                    ui.showSection('reportsSection');
                    utils.showToast('Relatório de vendas gerado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao gerar relatório de vendas:', error);
                    utils.showToast(error.message || 'Falha ao gerar relatório de vendas.', 'error');
                }
            },
            handleGenerateCashFlowReport: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para gerar relatórios de fluxo de caixa.', 'error');
                    return;
                }
                const startDate = dom.cashFlowStartDateInput.value;
                const endDate = dom.cashFlowEndDateInput.value;

                if (!startDate || !endDate) {
                    utils.showToast('Por favor, selecione as datas inicial e final para o relatório de fluxo de caixa.', 'error');
                    return;
                }
                if (new Date(startDate) > new Date(endDate)) {
                    utils.showToast('A data inicial não pode ser maior que a data final para o fluxo de caixa.', 'error');
                    return;
                }

                utils.showToast('Gerando relatório de fluxo de caixa...', 'info');
                try {
                    const reportData = await api.getCashFlow(startDate, endDate);
                    state.cashFlowReport.startDate = startDate;
                    state.cashFlowReport.endDate = endDate;
                    state.cashFlowReport.data = reportData;
                    ui.renderCashFlowReport(reportData);
                    ui.showSection('reportsSection');
                    utils.showToast('Relatório de fluxo de caixa gerado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
                    utils.showToast(error.message || 'Falha ao gerar relatório de fluxo de caixa.', 'error');
                }
            },
            handleExportPeriodReportCsv: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para exportar relatórios por período.', 'error');
                    return;
                }
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
            handleExportAccountingCsv: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para exportar o relatório contábil.', 'error');
                    return;
                }

                const startDate = dom.accountingStartDateInput.value;
                const endDate = dom.accountingEndDateInput.value;

                if (!startDate || !endDate) {
                    utils.showToast('Por favor, selecione as datas inicial e final para o relatório contábil.', 'error');
                    return;
                }
                if (new Date(startDate) > new Date(endDate)) {
                    utils.showToast('A data inicial não pode ser maior que a data final para o relatório contábil.', 'error');
                    return;
                }

                utils.showToast('Gerando relatório CSV contábil...', 'info');
                try {
                    const response = await api.exportAccountingCsv(startDate, endDate);
                    utils.downloadFile(response);
                    utils.showToast('Relatório CSV contábil exportado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao exportar CSV contábil:', error);
                    utils.showToast(error.message || 'Falha ao exportar relatório CSV contábil.', 'error');
                }
            },
            handleGenerateSalesPrediction: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para gerar análises preditivas.', 'error');
                    return;
                }

                const months = parseInt(dom.predictionMonthsInput.value);

                if (isNaN(months) || months < 3 || months > 24) {
                    utils.showToast('O número de meses para a análise deve ser entre 3 e 24.', 'error');
                    return;
                }

                utils.showToast(`Gerando projeção de vendas com histórico de ${months} meses...`, 'info');
                try {
                    const predictionData = await api.getSalesPredictionData(months);
                    state.salesPrediction.historicalData = predictionData.historicalData;
                    state.salesPrediction.period = predictionData.period;

                    ui.renderSalesPredictionChart(state.salesPrediction);
                    utils.showToast('Análise preditiva de vendas gerada com sucesso!', 'success');

                } catch (error) {
                    console.error('❌ ERRO AO GERAR ANÁLISE PREDITIVA:', error);
                    utils.showToast(error.message || 'Falha ao gerar análise preditiva de vendas.', 'error');
                }
            },
            handleSearch: (type, query) => {
                state[type].query = query;
                state[type].page = 1;
                if (type === 'clients') handlers.loadClients(true);
                if (type === 'sales') handlers.loadSales(true);
                if (type === 'products') handlers.loadProducts(true);
                if (type === 'users') handlers.loadUsers(true);
                if (type === 'suppliers') handlers.loadSuppliers(true);
                if (type === 'purchases') handlers.loadPurchases(true);
            },
            handlePageChange: (type, newPage) => {
                state[type].page = newPage;
                if (type === 'clients') handlers.loadClients(true);
                if (type === 'sales') handlers.loadSales(true);
                if (type === 'products') handlers.loadProducts(true);
                if (type === 'users') handlers.loadUsers(true);
                if (type === 'suppliers') handlers.loadSuppliers(true);
                if (type === 'purchases') handlers.loadPurchases(true);
            },
            openClientModal: async (clientId = null) => {
                const client = clientId ? state.clients.data.find(c => String(c.id) === String(clientId)) : null;
                if (clientId) {
                    if (!utils.hasPermission(['admin', 'gerente'])) {
                        if (!(utils.hasPermission(['vendedor']) && state.user && client && client.userId === state.user.id)) {
                            utils.showToast('Você não tem permissão para editar este cliente.', 'error');
                            return;
                        }
                    }
                } else {
                    if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                        utils.showToast('Você não tem permissão para criar clientes.', 'error');
                        return;
                    }
                }

                dom.clientForm.reset();
                document.getElementById('clientId').value = '';
                const modalLabel = document.getElementById('clientModalLabel');
                if (modalLabel) {
                    modalLabel.textContent = clientId ? 'Editar Cliente' : 'Novo Cliente';
                }

                if (clientId) {
                    try {
                        const clientData = await api.getClientById(clientId);
                        document.getElementById('clientId').value = clientData.id;
                        document.getElementById('clientName').value = clientData.nome;
                        document.getElementById('clientEmail').value = clientData.email;
                        document.getElementById('clientPhone').value = clientData.telefone;
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                        return;
                    }
                }
                state.bootstrapClientModal.show();
            },
            handleSaveClient: async (e) => {
                e.preventDefault();
                const id = document.getElementById('clientId').value;
                const client = state.clients.data.find(c => String(c.id) === String(id));

                if (id) {
                    if (!utils.hasPermission(['admin', 'gerente'])) {
                        if (!(utils.hasPermission(['vendedor']) && state.user && client && client.userId === state.user.id)) {
                            utils.showToast('Você não tem permissão para editar este cliente.', 'error');
                            return;
                        }
                    }
                } else {
                    if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                        utils.showToast('Você não tem permissão para salvar clientes.', 'error');
                        return;
                    }
                }

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
                }
                catch (error) {
                    utils.showToast(error.message, 'error');
                }
            },
            handleDeleteClient: async (clientId) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
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
                console.log('🔍 openSaleModal chamada com saleId:', saleId);
                
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para criar vendas.', 'error');
                    return;
                }

                try {
                    console.log('🔄 Iniciando carregamento do modal de venda...');
                    
                    const modalLabel = document.getElementById('saleModalLabel');
                    const clientSelect = document.getElementById('saleClient');
                    const productSelect = document.getElementById('productSelect');

                    console.log('📋 Elementos encontrados:', {
                        modalLabel: !!modalLabel,
                        clientSelect: !!clientSelect,
                        productSelect: !!productSelect
                    });

                    // Reset do formulário
                    document.getElementById('saleForm').reset();
                    document.getElementById('saleId').value = '';
                    state.selectedSaleProducts = [];
                    state.currentSelectedProduct = null;
                    utils.renderSelectedProductsList();

                    // Carregar dados da venda se for edição
                    if (saleId) {
                        console.log('🔄 Carregando dados da venda para edição...');
                        try {
                            const sale = await api.getSaleById(saleId);
                            console.log('✅ Dados da venda carregados:', sale);
                            
                            // Preencher o formulário com os dados da venda
                            document.getElementById('saleId').value = sale.id;
                            document.getElementById('saleClient').value = sale.clientId || '';
                            
                            // Carregar produtos da venda
                            if (sale.saleProducts && sale.saleProducts.length > 0) {
                                state.selectedSaleProducts = sale.saleProducts.map(item => ({
                                    id: item.Product.id,
                                    nome: item.Product.nome,
                                    quantidade: item.quantidade,
                                    precoUnitario: item.precoUnitario,
                                    total: item.quantidade * item.precoUnitario
                                }));
                                utils.renderSelectedProductsList();
                            }
                            
                            // Atualizar label do modal
                            if (modalLabel) {
                                modalLabel.textContent = `Editar Venda #${sale.id}`;
                            }
                            
                        } catch (error) {
                            console.error('❌ Erro ao carregar dados da venda:', error);
                            utils.showToast('Erro ao carregar dados da venda para edição.', 'error');
                            return;
                        }
                    } else {
                        // Nova venda - atualizar label do modal
                        if (modalLabel) {
                            modalLabel.textContent = 'Nova Venda';
                        }
                    }

                    // SOLUÇÃO ALTERNATIVA: Usar selects HTML nativos primeiro
                    console.log('🔄 Carregando clientes...');
                    const { data: clients } = await api.getClients(1, '', 1000);
                    console.log('✅ Clientes carregados:', clients.length);

                    // Popular select de clientes de forma simples
                    clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
                    clients.forEach(client => {
                        const option = document.createElement('option');
                        option.value = client.id;
                        option.textContent = client.nome;
                        clientSelect.appendChild(option);
                    });
                    console.log('✅ Select de clientes populado com', clients.length, 'clientes');

                    console.log('🔄 Carregando produtos...');
                    const { data: products } = await api.getProducts(1, '', 1000);
                    state.availableProducts = products;
                    console.log('✅ Produtos carregados:', products.length);

                    // Popular select de produtos de forma simples
                    productSelect.innerHTML = '<option value="">Selecione um produto</option>';
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        const preco = parseFloat(product.preco) || 0;
                        option.textContent = `${product.nome} - R$ ${preco.toFixed(2)}`;
                        productSelect.appendChild(option);
                    });
                    console.log('✅ Select de produtos populado com', products.length, 'produtos');

                    // Adicionar event listeners para os selects
                    clientSelect.addEventListener('change', function() {
                        console.log('Cliente selecionado:', this.value);
                    });

                    productSelect.addEventListener('change', function() {
                        const productId = this.value;
                        const product = state.availableProducts.find(p => String(p.id) === productId);
                        if (product) {
                            state.currentSelectedProduct = product;
                            const preco = parseFloat(product.preco) || 0;
                            dom.productDetailsDisplay.innerHTML = `Estoque: ${product.estoque || 0}, Preço: ${utils.formatCurrency(preco)}`;
                            dom.productUnitPriceInput.value = preco.toFixed(2);
                            dom.productQuantityInput.value = '1';
                            console.log('Produto selecionado:', product.nome);
                        } else {
                            state.currentSelectedProduct = null;
                            dom.productDetailsDisplay.innerHTML = '';
                            dom.productUnitPriceInput.value = '';
                        }
                    });
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
                
                // Abrir o modal de venda
                if (state.bootstrapSaleModal) {
                    state.bootstrapSaleModal.show();
                } else {
                    console.log('❌ Modal de venda não inicializado');
                }
            },
            handleAddProductToSale: () => {
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
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
                        precoVenda: product.preco,
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
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para remover produtos de vendas.', 'error');
                    return;
                }
                state.selectedSaleProducts.splice(index, 1);
                utils.renderSelectedProductsList();
            },
            handleSaveSale: async (e) => {
                e.preventDefault();
                const id = document.getElementById('saleId').value;
                if (id) {
                    const sale = state.sales.data.find(s => String(s.id) === String(id));
                    if (!utils.hasPermission(['admin', 'gerente'])) {
                        if (!(utils.hasPermission(['vendedor']) && state.user && sale.userId === state.user.id)) {
                            utils.showToast('Você não tem permissão para editar esta venda.', 'error');
                            return;
                        }
                    }
                } else {
                    if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                        utils.showToast('Você não tem permissão para salvar vendas.', 'error');
                        return;
                    }
                }

                const clientId = document.getElementById('saleClient').value;
                const dataVencimento = document.getElementById('saleDueDate').value;
                const valorTotal = utils.calculateSaleTotal();

                const salePaidValueInitialInput = document.getElementById('salePaidValueInitial');
                const paymentFormaSelect = document.getElementById('paymentForma');
                const paymentParcelasInput = document.getElementById('paymentParcelas');
                const paymentBandeiraCartaoInput = document.getElementById('paymentBandeiraCartao');
                const paymentBancoCrediarioInput = document.getElementById('paymentBancoCrediario');

                const valorPagoInitial = parseFloat(salePaidValueInitialInput?.value || '0') || 0;
                const formaPagamento = paymentFormaSelect?.value || 'Dinheiro';
                const parcelas = parseInt(paymentParcelasInput?.value || '1') || 1;
                const bandeiraCartao = paymentBandeiraCartaoInput?.value || null;
                const bancoCrediario = paymentBancoCrediarioInput?.value || null;

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
                if (!utils.hasPermission(['admin', 'gerente'])) {
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
                    console.log('🚀 loadSaleDetail iniciada');
                    const sale = await api.getSaleById(saleId);
                    console.log('✅ Dados recebidos da API');
                    
                    // Primeiro renderizar o conteúdo (isso cria a seção)
                    ui.renderSaleDetail(sale);
                    console.log('✅ renderSaleDetail executada');
                    
                    // Depois mostrar a seção
                    ui.showSection('saleDetailSection');
                    console.log('✅ Seção exibida');
                } catch (error) {
                    console.error("Falha ao carregar detalhes da venda:", error);
                    utils.showToast(error.message, 'error');
                }
            },
            handleSavePayment: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para registrar pagamentos.', 'error');
                    return;
                }

                const saleId = e.target.dataset.saleId;
                const valor = document.getElementById('paymentValue').value;
                const formaPagamentoElement = document.getElementById('paymentFormaNew');
                const parcelasElement = document.getElementById('newPaymentParcelas');
                const bandeiraCartaoElement = document.getElementById('newPaymentBandeiraCartao');
                const bancoCrediarioInputElement = document.getElementById('newPaymentBancoCrediario');

                const formaPagamento = formaPagamentoElement ? formaPagamentoElement.value : 'Dinheiro';
                const parcelas = parcelasElement ? parseInt(parcelasElement.value) || 1 : 1;
                const bandeiraCartao = bandeiraCartaoElement ? bandeiraCartaoElement.value || null : null;
                const bancoCrediario = bancoCrediarioInputElement ? bancoCrediarioInputElement.value || null : null;

                if (!valor || parseFloat(valor) <= 0) {
                    utils.showToast('Valor do pagamento inválido.', 'error');
                    return;
                }
                if (['Cartão de Crédito', 'Crediário'].includes(formaPagamento) && parcelas < 1) {
                    utils.showToast('Número de parcelas inválido para a forma de pagamento selecionado.', 'error');
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
                }
                catch (error) {
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
                if (productId && !utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para editar produtos.', 'error');
                    return;
                }
                if (!productId && !utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para criar produtos.', 'error');
                    return;
                }

                dom.productForm.reset();
                document.getElementById('productId').value = '';
                const modalLabel = document.getElementById('productModalLabel');
                if (modalLabel) {
                    modalLabel.textContent = productId ? 'Editar Produto' : 'Novo Produto';
                }

                if (productId) {
                    try {
                        const product = await api.getProductById(productId);
                        document.getElementById('productId').value = product.id;
                        document.getElementById('productName').value = product.nome;
                        document.getElementById('productDescription').value = product.descricao;
                        document.getElementById('productPrice').value = product.preco;
                        document.getElementById('productCost').value = product.custo;
                        document.getElementById('productStock').value = product.estoque;
                        document.getElementById('productSku').value = product.sku;
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                        return;
                    }
                }
                state.bootstrapProductModal.show();
            },
            handleSaveProduct: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para salvar produtos.', 'error');
                    return;
                }

                const id = document.getElementById('productId').value;
                const data = {
                    nome: document.getElementById('productName').value,
                    descricao: document.getElementById('productDescription').value,
                    preco: parseFloat(document.getElementById('productPrice').value),
                    custo: parseFloat(document.getElementById('productCost').value),
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
                if (!utils.hasPermission(['admin', 'gerente'])) {
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
                if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                    utils.showToast('Você não tem permissão para imprimir vendas.', 'error');
                    return;
                }
                const printContent = utils.generatePrintContent(sale);
                const printWindow = window.open('', '_blank');
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            },
            loadUsers: async (force = false) => {
                if (!utils.hasPermission(['admin'])) {
                    utils.showToast('Você não tem permissão para ver os usuários.', 'error');
                    document.getElementById('usersSection').innerHTML = `
                        <div class="alert alert-danger text-center" role="alert">
                            <i class="bi bi-lock-fill me-2"></i>Acesso Negado: Você não tem permissão para visualizar esta seção.
                        </div>
                    `;
                    return;
                }
                if (state.users.loaded && !force) {
                    ui.renderUsers();
                    return;
                }
                try {
                    const { page, query, limit } = state.users;
                    const apiData = await api.getUsers(page, query, limit);
                    state.users.data = apiData.data;
                    state.users.total = apiData.total;
                    state.users.loaded = true;
                    ui.renderUsers();
                } catch (error) { utils.showToast(error.message, 'error'); }
            },
            openUserModal: async (userId = null) => {
                if (!utils.hasPermission(['admin'])) {
                    utils.showToast('Você não tem permissão para gerenciar usuários.', 'error');
                    return;
                }
                dom.userForm.reset();
                dom.userIdInput.value = '';
                dom.userPasswordInput.required = true;
                dom.userPasswordInput.placeholder = 'Senha';

                const modalLabel = document.getElementById('userModalLabel');

                if (userId) {
                    if (modalLabel) modalLabel.textContent = 'Editar Usuário';
                    dom.userPasswordInput.required = false;
                    dom.userPasswordInput.placeholder = 'Deixe em branco para não alterar';
                    try {
                        const user = await api.getUserById(userId);
                        dom.userIdInput.value = user.id;
                        dom.userNameInput.value = user.username;
                        dom.userEmailInput.value = user.email;
                        dom.userRoleSelect.value = user.role;
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                        return;
                    }
                } else {
                    if (modalLabel) modalLabel.textContent = 'Novo Usuário';
                    dom.userPasswordInput.required = true;
                    dom.userPasswordInput.placeholder = 'Senha';
                }
                state.bootstrapUserModal.show();
            },
            handleSaveUser: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin'])) {
                    utils.showToast('Você não tem permissão para salvar usuários.', 'error');
                    return;
                }

                const id = dom.userIdInput.value;
                const data = {
                    username: dom.userNameInput.value,
                    email: dom.userEmailInput.value,
                    role: dom.userRoleSelect.value,
                };

                if (dom.userPasswordInput.value) {
                    data.password = dom.userPasswordInput.value;
                } else if (!id) {
                    utils.showToast('A senha é obrigatória para novos usuários.', 'error');
                    return;
                }

                try {
                    if (id) {
                        await api.updateUser(id, data);
                        utils.showToast('Usuário atualizado!', 'success');
                    } else {
                        await api.createUser(data);
                        utils.showToast('Usuário criado!', 'success');
                    }
                    state.bootstrapUserModal.hide();
                    handlers.loadUsers(true);
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            },
            handleDeleteUser: async (userId) => {
                if (!utils.hasPermission(['admin'])) {
                    utils.showToast('Você não tem permissão para excluir usuários.', 'error');
                    return;
                }
                if (String(userId) === String(state.user.id)) {
                    utils.showToast('Você não pode excluir sua própria conta!', 'error');
                    return;
                }
                utils.showConfirm('Deseja realmente excluir este usuário? Esta ação é irreversível.', async () => {
                    try {
                        await api.deleteUser(userId);
                        utils.showToast('Usuário excluído!', 'success');
                        setTimeout(() => {
                            handlers.loadUsers(true);
                        }, 50);
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                    }
                });
            },
            loadSuppliers: async (force = false) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para ver os fornecedores.', 'error');
                    document.getElementById('suppliersSection').innerHTML = `
                        <div class="alert alert-danger text-center" role="alert">
                            <i class="bi bi-lock-fill me-2"></i>Acesso Negado: Você não tem permissão para visualizar esta seção.
                        </div>
                    `;
                    return;
                }
                if (state.suppliers.loaded && !force) {
                    ui.renderSuppliers();
                    return;
                }
                try {
                    const { page, query, limit } = state.suppliers;
                    const apiData = await api.getSuppliers(page, query, limit);
                    state.suppliers.data = apiData.data;
                    state.suppliers.total = apiData.total;
                    state.suppliers.loaded = true;
                    ui.renderSuppliers();
                } catch (error) { utils.showToast(error.message, 'error'); }
            },
            openSupplierModal: async (supplierId = null) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para gerenciar fornecedores.', 'error');
                    return;
                }
                dom.supplierForm.reset();
                dom.supplierIdInput.value = '';
                dom.supplierEmailInput.removeAttribute('required');

                const modalLabel = document.getElementById('supplierModalLabel');
                if (modalLabel) {
                    modalLabel.textContent = supplierId ? 'Editar Fornecedor' : 'Novo Fornecedor';
                }

                if (supplierId) {
                    try {
                        const supplier = await api.getSupplierById(supplierId);
                        dom.supplierIdInput.value = supplier.id;
                        dom.supplierNameInput.value = supplier.nome;
                        dom.supplierContactInput.value = supplier.contato || '';
                        dom.supplierEmailInput.value = supplier.email || '';
                        dom.supplierCnpjInput.value = supplier.cnpj || '';
                        dom.supplierAddressInput.value = supplier.endereco || '';
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                        return;
                    }
                }
                state.bootstrapSupplierModal.show();
            },
            handleSaveSupplier: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para salvar fornecedores.', 'error');
                    return;
                }

                const id = dom.supplierIdInput.value;
                const data = {
                    nome: dom.supplierNameInput.value,
                    contato: dom.supplierContactInput.value || null,
                    email: dom.supplierEmailInput.value || null,
                    cnpj: dom.supplierCnpjInput.value || null,
                    endereco: dom.supplierAddressInput.value || null,
                };

                try {
                    if (id) {
                        await api.updateSupplier(id, data);
                        utils.showToast('Fornecedor atualizado!', 'success');
                    } else {
                        await api.createSupplier(data);
                        utils.showToast('Fornecedor criado!', 'success');
                    }
                    state.bootstrapSupplierModal.hide();
                    handlers.loadSuppliers(true);
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            },
            handleDeleteSupplier: async (supplierId) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para excluir fornecedores.', 'error');
                    return;
                }
                utils.showConfirm('Deseja realmente excluir este fornecedor?', async () => {
                    try {
                        await api.deleteSupplier(supplierId);
                        utils.showToast('Fornecedor excluído!', 'success');
                        setTimeout(() => {
                            handlers.loadSuppliers(true);
                        }, 50);
                    } catch (error) {
                        utils.showToast(error.message, 'error');
                    }
                });
            },
            loadPurchases: async (force = false) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para ver as compras.', 'error');
                    document.getElementById('purchasesSection').innerHTML = `
                        <div class="alert alert-danger text-center" role="alert">
                            <i class="bi bi-lock-fill me-2"></i>Acesso Negado: Você não tem permissão para visualizar esta seção.
                        </div>
                    `;
                    return;
                }
                if (state.purchases.loaded && !force) {
                    ui.renderPurchases();
                    return;
                }
                try {
                    const { page, query, limit } = state.purchases;
                    const apiData = await api.getPurchases(page, query, limit);
                    state.purchases.data = apiData.data;
                    state.purchases.total = apiData.total;
                    state.purchases.loaded = true;
                    ui.renderPurchases();
                } catch (error) { utils.showToast(error.message, 'error'); }
            },
            // Dentro do seu arquivo frontend/js/app.js, localize o objeto 'handlers'
            // e adicione esta função DENTRO dele, por exemplo, após 'loadPurchases'.

            loadPurchaseDetail: async (purchaseId) => {
                // console.log para verificar se loadPurchaseDetail está sendo chamada
                console.log("Chamado: handlers.loadPurchaseDetail para ID:", purchaseId);

                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para ver os detalhes das compras.', 'error');
                    return;
                }
                
                // Verificar token
                const token = localStorage.getItem('token');
                console.log('🔑 Token disponível:', !!token);
                
                try {
                    console.log('🔄 Fazendo chamada para API getPurchaseById com ID:', purchaseId);
                    const purchase = await api.getPurchaseById(purchaseId);
                    console.log('✅ Resposta da API recebida:', purchase);
                    
                    if (!purchase) {
                        throw new Error('Nenhum dado recebido da API');
                    }
                    
                    // A seção será criada pela função renderPurchaseDetail
                    console.log('🔧 Preparando para renderizar detalhes da compra');
                    
                    // Renderizar o conteúdo (isso cria a seção)
                    ui.renderPurchaseDetail(purchase);
                    
                    // Mostrar a seção
                    ui.showSection('purchaseDetailSection');
                    
                    console.log('✅ Seção de detalhes da compra exibida');
                } catch (error) {
                    console.error("❌ Falha ao carregar detalhes da compra:", error);
                    console.error("   - Mensagem:", error.message);
                    console.error("   - Stack:", error.stack);
                    utils.showToast(error.message, 'error');
                }
            },
            openPurchaseModal: async (purchaseId = null) => {
                console.log('🔍 openPurchaseModal chamada com purchaseId:', purchaseId);
                
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para gerenciar compras.', 'error');
                    return;
                }
                
                dom.purchaseForm.reset();
                dom.purchaseIdInput.value = '';
                state.selectedPurchaseProducts = [];
                utils.renderSelectedPurchaseProductsList();
                dom.purchaseProductDetailsDisplay.innerHTML = '';
                dom.purchaseProductQuantityInput.value = '1';
                dom.purchaseProductCostInput.value = '';

                const modalLabel = document.getElementById('purchaseModalLabel');
                if (modalLabel) {
                    modalLabel.textContent = purchaseId ? 'Editar Compra' : 'Nova Compra';
                }

                try {
                    console.log('🔄 Carregando fornecedores...');
                    const { data: suppliers } = await api.getSuppliers(1, '', 1000);
                    state.availableSuppliers = suppliers;
                    console.log('✅ Fornecedores carregados:', suppliers.length);

                    // Popular select de fornecedores de forma simples
                    const supplierSelect = document.getElementById('purchaseSupplier');
                    supplierSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
                    suppliers.forEach(supplier => {
                        const option = document.createElement('option');
                        option.value = supplier.id;
                        option.textContent = supplier.nome;
                        supplierSelect.appendChild(option);
                    });
                    console.log('✅ Select de fornecedores populado com', suppliers.length, 'fornecedores');

                    console.log('🔄 Carregando produtos...');
                    const { data: products } = await api.getProducts(1, '', 1000);
                    state.availableProductsForPurchase = products;
                    console.log('✅ Produtos carregados:', products.length);

                    // Popular select de produtos de forma simples
                    const productSelect = document.getElementById('purchaseProductSelect');
                    productSelect.innerHTML = '<option value="">Selecione um produto</option>';
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        const preco = parseFloat(product.preco) || 0;
                        option.textContent = `${product.nome} - R$ ${preco.toFixed(2)}`;
                        productSelect.appendChild(option);
                    });
                    console.log('✅ Select de produtos populado com', products.length, 'produtos');

                    // Adicionar event listener para seleção de produto
                    productSelect.addEventListener('change', function() {
                        const productId = this.value;
                        const product = state.availableProductsForPurchase.find(p => String(p.id) === productId);
                        if (product) {
                            state.currentSelectedProductForPurchase = product;
                            dom.purchaseProductDetailsDisplay.innerHTML = `Estoque atual: ${product.estoque || 0}, Preço de Venda: ${utils.formatCurrency(product.preco || 0)}`;
                            dom.purchaseProductCostInput.value = product.custo ? (parseFloat(product.custo) || 0).toFixed(2) : (parseFloat(product.preco) || 0).toFixed(2);
                            dom.purchaseProductQuantityInput.value = '1';
                            console.log('Produto selecionado para compra:', product.nome);
                        } else {
                            state.currentSelectedProductForPurchase = null;
                            dom.purchaseProductDetailsDisplay.innerHTML = '';
                            dom.purchaseProductCostInput.value = '';
                        }
                    });

                    // Se purchaseId foi fornecido, carregar dados da compra existente
                    if (purchaseId) {
                        console.log('🔄 Carregando dados da compra existente...');
                        const purchase = await api.getPurchaseById(purchaseId);
                        console.log('✅ Dados da compra carregados:', purchase);
                        
                        // Preencher campos do formulário
                        dom.purchaseIdInput.value = purchase.id;
                        dom.purchaseSupplier.value = purchase.supplierId;
                        dom.purchaseDate.value = purchase.dataCompra;
                        dom.purchaseTotalValueDisplay.value = utils.formatCurrency(purchase.valorTotal);
                        dom.purchaseTotalValueHidden.value = purchase.valorTotal;
                        dom.purchaseStatus.value = purchase.status;
                        dom.purchaseObservations.value = purchase.observacoes || '';
                        
                        // Carregar produtos da compra
                        if (purchase.purchaseProducts && purchase.purchaseProducts.length > 0) {
                            state.selectedPurchaseProducts = purchase.purchaseProducts.map(item => ({
                                id: item.product.id,
                                nome: item.product.nome,
                                quantidade: item.quantidade,
                                precoCustoUnitario: item.precoCustoUnitario,
                                precoTotal: item.quantidade * item.precoCustoUnitario
                            }));
                            utils.renderSelectedPurchaseProductsList();
                        }
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar dados:', error);
                    utils.showToast(error.message, 'error');
                }
                
                // Abrir o modal de compra
                if (state.bootstrapPurchaseModal) {
                    console.log('✅ Modal de compra inicializado, chamando show()...');
                    state.bootstrapPurchaseModal.show();
                    console.log('✅ show() executado');
                } else {
                    console.log('❌ Modal de compra não inicializado');
                }
            },
            handleAddPurchaseProduct: () => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para adicionar produtos a compras.', 'error');
                    return;
                }

                const productId = dom.purchaseProductSelect.value;
                const quantity = parseInt(dom.purchaseProductQuantityInput.value);
                const unitCost = parseFloat(dom.purchaseProductCostInput.value);

                if (!productId) {
                    utils.showToast('Selecione um produto.', 'error');
                    return;
                }
                if (isNaN(quantity) || quantity <= 0) {
                    utils.showToast('Quantidade inválida.', 'error');
                    return;
                }
                if (isNaN(unitCost) || unitCost < 0) {
                    utils.showToast('Preço de custo unitário inválido.', 'error');
                    return;
                }

                const product = state.availableProductsForPurchase.find(p => String(p.id) === productId);
                if (!product) {
                    utils.showToast('Produto não encontrado.', 'error');
                    return;
                }

                const existingItem = state.selectedPurchaseProducts.find(item => String(item.id) === productId);
                if (existingItem) {
                    existingItem.quantidade += quantity;
                    existingItem.precoCustoUnitario = unitCost;
                } else {
                    state.selectedPurchaseProducts.push({
                        id: product.id,
                        nome: product.nome,
                        precoCustoUnitario: unitCost,
                        quantidade: quantity,
                    });
                }
                utils.renderSelectedPurchaseProductsList();
                dom.purchaseProductSelect.value = '';
                dom.purchaseProductQuantityInput.value = '1';
                dom.purchaseProductCostInput.value = '';
                dom.purchaseProductDetailsDisplay.innerHTML = '';
                state.currentSelectedProductForPurchase = null;
            },
            handleRemovePurchaseProduct: (index) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para remover produtos de compras.', 'error');
                    return;
                }
                state.selectedPurchaseProducts.splice(index, 1);
                utils.renderSelectedPurchaseProductsList();
            },
            handleSavePurchase: async (e) => {
                e.preventDefault();
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para salvar compras.', 'error');
                    return;
                }

                const id = dom.purchaseIdInput.value;
                const supplierId = dom.purchaseSupplier.value;
                const dataCompra = dom.purchaseDate.value;
                const valorTotal = utils.calculatePurchaseTotal();
                const status = dom.purchaseStatus.value;
                const observacoes = dom.purchaseObservations.value;

                if (!supplierId) {
                    utils.showToast('Selecione um fornecedor para a compra.', 'error');
                    return;
                }
                if (state.selectedPurchaseProducts.length === 0) {
                    utils.showToast('Adicione pelo menos um produto à compra.', 'error');
                    return;
                }

                const purchaseData = {
                    supplierId: supplierId,
                    dataCompra: dataCompra,
                    valorTotal: valorTotal,
                    status: status,
                    observacoes: observacoes,
                    products: state.selectedPurchaseProducts.map(item => ({
                        productId: item.id,
                        quantidade: item.quantidade,
                        precoCustoUnitario: item.precoCustoUnitario
                    }))
                };

                try {
                    if (id) {
                        await api.updatePurchase(id, purchaseData);
                        utils.showToast('Compra atualizada!', 'success');
                    } else {
                        await api.createPurchase(purchaseData);
                        utils.showToast('Compra registrada com sucesso!', 'success');
                    }
                    state.bootstrapPurchaseModal.hide();
                    handlers.loadPurchases(true);
                    handlers.loadProducts(true);
                    handlers.loadDashboard();
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            },
            handleDeletePurchase: async (purchaseId) => {
                if (!utils.hasPermission(['admin', 'gerente'])) {
                    utils.showToast('Você não tem permissão para excluir compras.', 'error');
                    return;
                }
                utils.showConfirm('Deseja realmente excluir esta compra? Esta ação não pode ser desfeita.', async () => {
                    try {
                        await api.deletePurchase(purchaseId);
                        utils.showToast('Compra excluída com sucesso!', 'success');
                        setTimeout(() => {
                            handlers.loadPurchases(true);
                            handlers.loadProducts(true);
                            handlers.loadDashboard();
                        }, 50);
                    } catch (error) {
                        // CORREÇÃO: Adicionado console.error para melhor depuração do erro 500.
                        console.error("Falha ao deletar compra:", error);
                        utils.showToast(error.message, 'error');
                    }
                });
            },
            removeSaleDetailSection: () => {
                const saleDetailSection = document.getElementById('saleDetailSection');
                if (saleDetailSection) {
                    saleDetailSection.remove();
                }
            }
        };

        // --- INITIALIZATION ---
        function initialize() {
            // Inicializar modais Bootstrap
            state.bootstrapClientModal = new bootstrap.Modal(document.getElementById('clientModal'));
            state.bootstrapSaleModal = new bootstrap.Modal(document.getElementById('saleModal'));
            state.bootstrapConfirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
            state.bootstrapProductModal = new bootstrap.Modal(document.getElementById('productModal'));
            state.bootstrapUserModal = new bootstrap.Modal(document.getElementById('userModal'));
            state.bootstrapSupplierModal = new bootstrap.Modal(document.getElementById('supplierModal'));
            state.bootstrapPurchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
            
            console.log('✅ Modais Bootstrap inicializados');
            
            state.userRole = utils.getUserRole();
            const token = utils.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    state.user = { id: payload.id, username: payload.username, role: payload.role };
                } catch (error) {
                    console.error("Erro ao parsear token na inicialização:", error);
                    utils.logout('Token de usuário inválido.');
                    return;
                }
            }

            if (!state.userRole) {
                utils.logout('Você precisa estar logado para acessar esta página.');
                return;
            }

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

            ui.updateSidebarVisibility();

            dom.navLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const sectionId = e.currentTarget.dataset.section;
                    console.log('🖱️ Link clicado:', sectionId);
                    let hasPermission = true;
                    switch (sectionId) {
                        case 'productsSection':
                        case 'reportsSection':
                        case 'clientsSection':
                        case 'salesSection':
                        case 'dashboardSection':
                            break;
                        case 'usersSection':
                            if (!utils.hasPermission(['admin'])) hasPermission = false;
                            break;
                        case 'suppliersSection':
                        case 'purchasesSection':
                            if (!utils.hasPermission(['admin', 'gerente'])) hasPermission = false;
                            break;
                        case 'logoutSection':
                            break;
                        default:
                            hasPermission = false;
                    }

                    if (!hasPermission) {
                        utils.showToast('Você não tem permissão para acessar esta seção.', 'error');
                        return;
                    }

                    console.log('✅ Permissão concedida, mostrando seção:', sectionId);
                    ui.showSection(sectionId);
                    
                    // Fechar sidebar automaticamente em mobile/tablet
                    if (window.responsiveManager && (window.responsiveManager.isMobile() || window.responsiveManager.isTablet())) {
                        window.responsiveManager.closeSidebarAfterNavigation();
                        console.log('📱 Sidebar será fechada automaticamente após navegação');
                    }
                    if (sectionId === 'dashboardSection') handlers.loadDashboard();
                    if (sectionId === 'clientsSection') handlers.loadClients();
                    if (sectionId === 'salesSection') {
                        console.log('🚀 Chamando handlers.loadSales()');
                        handlers.loadSales();
                    }
                    if (sectionId === 'reportsSection') {
                        dom.reportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Relatório" para ver os resultados.</p>';
                        dom.cashFlowReportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Relatório" para ver o fluxo de caixa.</p>';
                        if (dom.salesPredictionResults) dom.salesPredictionResults.innerHTML = '<p class="text-center text-muted">Selecione o histórico de meses e clique em "Gerar Projeção" para ver a análise.</p>';
                        if (state.predictionChartInstance) {
                            state.predictionChartInstance.destroy();
                            state.predictionChartInstance = null;
                        }
                    }
                    if (sectionId === 'productsSection') handlers.loadProducts();
                    if (sectionId === 'usersSection') handlers.loadUsers();
                    if (sectionId === 'suppliersSection') handlers.loadSuppliers();
                    if (sectionId === 'purchasesSection') handlers.loadPurchases();
                });
            });

            document.body.addEventListener('click', (e) => {
                // Só executa se for realmente um clique do usuário
                if (!e.isTrusted) return;
                
                const button = e.target.closest('button');
                if (button) {
                    console.log('🖱️ Botão clicado:', button.id || button.className);
                    
                    if (button.id === 'btnNewClient') handlers.openClientModal();
                    if (button.id === 'btnNewSale') handlers.openSaleModal();
                    if (button.id === 'btnExportClientsCsv') handlers.handleExportClientsCsv();
                    if (button.id === 'btnExportSalesCsv') handlers.handleExportSalesCsv();
                    if (button.id === 'btnExportPeriodReportCsv') handlers.handleExportPeriodReportCsv(e);
                    if (button.id === 'btnNewProduct') handlers.openProductModal();
                    if (button.id === 'btnAddProduct') handlers.handleAddProductToSale();
                    if (button.classList.contains('btn-remove-product')) {
                        const index = parseInt(button.dataset.index);
                        handlers.handleRemoveProductFromSale(index);
                    }
                    if (button.classList.contains('btn-remove-purchase-product')) {
                        const index = parseInt(button.dataset.index);
                        handlers.handleRemovePurchaseProduct(index);
                    }
                    if (button.id === 'btnShareWhatsapp') {
                        const saleId = button.dataset.saleId;
                        api.getSaleById(saleId).then(sale => {
                            if (!utils.hasPermission(['admin', 'gerente']) && !(utils.hasPermission(['vendedor']) && state.user && sale.userId === state.user.id)) {
                                utils.showToast('Você não tem permissão para compartilhar detalhes desta venda.', 'error');
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
                            if (!utils.hasPermission(['admin', 'gerente']) && !(utils.hasPermission(['vendedor']) && state.user && sale.userId === state.user.id)) {
                                utils.showToast('Você não tem permissão para compartilhar detalhes desta venda.', 'error');
                                return;
                            }
                            const message = utils.generateSaleMessage(sale);
                            const subject = encodeURIComponent(`Detalhes da sua compra #${sale.id} no Gestor PRO`);
                            const body = encodeURIComponent(message);
                            const clientEmail = sale.client?.email || '';
                            const mailtoUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
                            window.open(mailtoUrl, '_blank');
                        }).catch(error => utils.showToast(error.message, 'error'));
                    }
                    if (button.id === 'btnPrintSale') {
                        const saleId = button.dataset.saleId;
                        api.getSaleById(saleId).then(sale => {
                            if (!utils.hasPermission(['admin', 'gerente']) && !(utils.hasPermission(['vendedor']) && state.user && sale.userId === state.user.id)) {
                                utils.showToast('Você não tem permissão para imprimir detalhes desta venda.', 'error');
                                return;
                            }
                            handlers.handlePrintSale(sale);
                        }).catch(error => utils.showToast(error.message, 'error'));
                    }
                    if (button.id === 'sidebarToggle') {
                        dom.sidebar.classList.toggle('active');
                        dom.sidebarOverlay.classList.toggle('active');
                    }

                    if (button.id === 'btnNewUser') handlers.openUserModal();
                    if (button.id === 'btnNewSupplier') handlers.openSupplierModal();
                    if (button.id === 'btnNewPurchase') handlers.openPurchaseModal();
                    if (button.id === 'btnAddPurchaseProduct') handlers.handleAddPurchaseProduct();

                    const { type, id } = button.dataset;
                    if (button.classList.contains('action-delete')) {
                        if (type === 'client') handlers.handleDeleteClient(id);
                        if (type === 'sale') handlers.handleDeleteSale(id);
                        if (type === 'product') handlers.handleDeleteProduct(id);
                        if (type === 'user') handlers.handleDeleteUser(id);
                        if (type === 'supplier') handlers.handleDeleteSupplier(id);
                        if (type === 'purchase') handlers.handleDeletePurchase(id);
                    }
                    if (button.classList.contains('action-detail')) {
                        console.log('🔍 Botão action-detail clicado, type:', type, 'id:', id);
                        if (type === 'sale') {
                            console.log('🚀 Chamando loadSaleDetail para venda ID:', id);
                            handlers.loadSaleDetail(id);
                        }
                        if (type === 'purchase') handlers.loadPurchaseDetail(id);
                    }
                    if (button.classList.contains('action-edit')) {
                        console.log('🔧 Botão action-edit clicado, type:', type, 'id:', id);
                        if (type === 'client') handlers.openClientModal(id);
                        if (type === 'product') handlers.openProductModal(id);
                        if (type === 'sale') handlers.openSaleModal(id);
                        if (type === 'user') handlers.openUserModal(id);
                        if (type === 'supplier') handlers.openSupplierModal(id);
                        if (type === 'purchase') {
                            console.log('🛒 Chamando openPurchaseModal para compra ID:', id);
                            handlers.openPurchaseModal(id);
                        }
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
                    const sectionId = backLink.dataset.section;
                    console.log('🔙 Nav-back clicado, seção:', sectionId);
                    
                    // Remover seção de detalhes se existir
                    handlers.removeSaleDetailSection();
                    
                    // Mostrar a seção solicitada
                    ui.showSection(sectionId);
                    
                    // Carregar dados se necessário
                    if (sectionId === 'salesSection') {
                        console.log('🚀 Carregando vendas após nav-back');
                        handlers.loadSales();
                    }
                }
            });

            if (dom.clientForm) dom.clientForm.addEventListener('submit', handlers.handleSaveClient);
            if (dom.saleForm) dom.saleForm.addEventListener('submit', handlers.handleSaveSale);
            if (dom.productForm) dom.productForm.addEventListener('submit', handlers.handleSaveProduct);
            if (dom.userForm) dom.userForm.addEventListener('submit', handlers.handleSaveUser);
            if (dom.supplierForm) dom.supplierForm.addEventListener('submit', handlers.handleSaveSupplier);
            if (dom.purchaseForm) dom.purchaseForm.addEventListener('submit', handlers.handleSavePurchase);
            if (dom.reportPeriodForm) dom.reportPeriodForm.addEventListener('submit', handlers.handleGenerateSalesReport);
            if (dom.cashFlowReportForm) dom.cashFlowReportForm.addEventListener('submit', handlers.handleGenerateCashFlowReport);
            if (dom.accountingReportForm) dom.accountingReportForm.addEventListener('submit', handlers.handleExportAccountingCsv);
            if (dom.salesPredictionForm) dom.salesPredictionForm.addEventListener('submit', handlers.handleGenerateSalesPrediction);

            document.body.addEventListener('submit', e => {
                if (e.target.id === 'paymentForm') handlers.handleSavePayment(e);
            });

            const paymentFormaSelectInitial = document.getElementById('paymentForma');
            if (paymentFormaSelectInitial) {
                paymentFormaSelectInitial.addEventListener('change', () => {
                    const paymentParcelasField = document.getElementById('parcelasField');
                    const paymentBandeiraCartaoField = document.getElementById('bandeiraCartaoField');
                    const paymentBancoCrediarioField = document.getElementById('bancoCrediarioField');
                    const paymentParcelasInput = document.getElementById('paymentParcelas');
                    const paymentBandeiraCartaoInput = document.getElementById('paymentBandeiraCartao');
                    const paymentBancoCrediarioInput = document.getElementById('paymentBancoCrediario');

                    utils.togglePaymentFields(paymentFormaSelectInitial, paymentParcelasField, paymentBandeiraCartaoField, paymentBancoCrediarioField, paymentParcelasInput, paymentBandeiraCartaoInput, paymentBancoCrediarioInput);
                });
            }

            document.body.addEventListener('change', (e) => {
                if (e.target.id === 'paymentFormaNew') {
                    const newPaymentFormaSelectElement = document.getElementById('paymentFormaNew');
                    const newParcelasFieldElement = document.getElementById('newParcelasField');
                    const newBandeiraCartaoFieldElement = document.getElementById('newBandeiraCartaoField');
                    const newBancoCrediarioFieldElement = document.getElementById('newBancoCrediarioField');
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

            if (dom.confirmModalButton) {
                dom.confirmModalButton.addEventListener('click', () => {
                    if (state.confirmAction) state.confirmAction();
                    setTimeout(() => {
                        state.bootstrapConfirmModal.hide();
                    }, 50);
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

            handlers.loadDashboard();
        }

        initialize();
    });

    // CORREÇÃO FORÇADA PARA TAMANHO DOS MODAIS DE VENDA E COMPRA
    document.addEventListener('DOMContentLoaded', function() {
        // Função para corrigir tamanho dos modais
        function fixModalSize(modalId) {
            const modal = document.getElementById(modalId);
            const modalDialog = modal.querySelector('.modal-dialog');
            
            if (modalDialog) {
                const screenWidth = window.innerWidth;
                
                // Desktop (telas grandes)
                if (screenWidth >= 1025) {
                    modalDialog.style.maxWidth = '600px';
                    modalDialog.style.width = '600px';
                    modalDialog.style.margin = '1.75rem auto';
                    // Centralizar melhor considerando a sidebar
                    modalDialog.style.marginLeft = 'calc(280px + 50px)';
                    modalDialog.style.marginRight = '50px';
                }
                // Tablet (telas médias)
                else if (screenWidth >= 769 && screenWidth <= 1024) {
                    modalDialog.style.maxWidth = '650px';
                    modalDialog.style.width = '650px';
                    modalDialog.style.margin = '1.75rem auto';
                    // Centralizar melhor
                    modalDialog.style.marginLeft = 'calc(280px + 30px)';
                    modalDialog.style.marginRight = '30px';
                }
                // Mobile (telas pequenas)
                else {
                    modalDialog.style.maxWidth = '95%';
                    modalDialog.style.width = '95%';
                    modalDialog.style.margin = '0.5rem auto';
                    // Em mobile, manter centralizado
                    modalDialog.style.marginLeft = 'auto';
                    modalDialog.style.marginRight = 'auto';
                }
                
                // Remover overflow desnecessário
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.style.maxHeight = '70vh';
                    modalBody.style.overflowY = 'auto';
                }
                
                console.log(`🔧 Modal ${modalId} corrigido para tela ${screenWidth}px - margin-left: ${modalDialog.style.marginLeft}`);
            }
        }
        
        // Aplicar correção quando os modais são abertos
        const saleModal = document.getElementById('saleModal');
        const purchaseModal = document.getElementById('purchaseModal');
        
        if (saleModal) {
            saleModal.addEventListener('show.bs.modal', function() {
                setTimeout(() => fixModalSize('saleModal'), 10);
            });
        }
        
        if (purchaseModal) {
            purchaseModal.addEventListener('show.bs.modal', function() {
                setTimeout(() => fixModalSize('purchaseModal'), 10);
            });
        }
        
        // Aplicar correção também no resize da janela
        window.addEventListener('resize', function() {
            if (saleModal && saleModal.classList.contains('show')) {
                fixModalSize('saleModal');
            }
            if (purchaseModal && purchaseModal.classList.contains('show')) {
                fixModalSize('purchaseModal');
            }
        });
        
        // Aplicar correção imediatamente se os modais já estiverem abertos
        if (saleModal && saleModal.classList.contains('show')) {
            fixModalSize('saleModal');
        }
        if (purchaseModal && purchaseModal.classList.contains('show')) {
            fixModalSize('purchaseModal');
        }
    });

    document.body.addEventListener('mousedown', (e) => {
        // Só executa se for realmente um clique do usuário
        if (!e.isTrusted || e.detail === 0) return;
        
        const button = e.target.closest('button');
        if (button) {
            console.log('🖱️ Botão clicado:', button.id || button.className);
        }
    });
})();