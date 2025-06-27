'use strict';
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO E ESTADO ---
    const API_BASE = 'http://localhost:5000/api';
    const state = {
        bootstrapClientModal: new bootstrap.Modal(document.getElementById('clientModal')),
        bootstrapSaleModal: new bootstrap.Modal(document.getElementById('saleModal')),
        bootstrapConfirmModal: new bootstrap.Modal(document.getElementById('confirmModal')),
        bootstrapProductModal: new bootstrap.Modal(document.getElementById('productModal')),
        bootstrapUserModal: new bootstrap.Modal(document.getElementById('userModal')),
        bootstrapSupplierModal: new bootstrap.Modal(document.getElementById('supplierModal')),
        bootstrapPurchaseModal: new bootstrap.Modal(document.getElementById('purchaseModal')),
        chartInstance: null,
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
        availableProductsForPurchase: [],
        currentSelectedProductForPurchase: null,
        availableSuppliers: [],
    };

    // --- DOM SELECTORS (Alguns serão acessados dentro das funções para evitar nulls em modais) ---
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

        // Estes Select2 são instanciados por jQuery, então a referência pode ser mantida
        productSelect: $('#productSelect'),
        purchaseSupplierSelect: $('#purchaseSupplier'),
        purchaseProductSelect: $('#purchaseProductSelect'),

        // Estes elementos estão sempre presentes no DOM principal ou são acessados no momento de uso
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
        userModalLabel: document.getElementById('userModalLabel'),

        supplierForm: document.getElementById('supplierForm'),
        supplierIdInput: document.getElementById('supplierId'),
        supplierNameInput: document.getElementById('supplierName'),
        supplierContactInput: document.getElementById('supplierContact'),
        supplierEmailInput: document.getElementById('supplierEmail'),
        supplierCnpjInput: document.getElementById('supplierCnpj'),
        supplierAddressInput: document.getElementById('supplierAddress'),
        supplierModalLabel: document.getElementById('supplierModalLabel'),

        purchaseForm: document.getElementById('purchaseForm'),
        purchaseIdInput: document.getElementById('purchaseId'),
        purchaseDateInput: document.getElementById('purchaseDate'),
        purchaseProductsList: document.getElementById('purchaseProductsList'),
        purchaseProductQuantityInput: document.getElementById('purchaseProductQuantity'),
        purchaseProductCostInput: document.getElementById('purchaseProductCost'),
        btnAddPurchaseProduct: document.getElementById('btnAddPurchaseProduct'),
        purchaseProductDetailsDisplay: document.getElementById('purchaseProductDetailsDisplay'),
        purchaseTotalValueDisplay: document.getElementById('purchaseTotalValueDisplay'),
        purchaseTotalValueHidden: document.getElementById('purchaseTotalValue'),
        purchaseStatusSelect: document.getElementById('purchaseStatus'),
        purchaseObservationsInput: document.getElementById('purchaseObservations'),
        purchaseModalLabel: document.getElementById('purchaseModalLabel'),

        overdueReceivablesSection: document.getElementById('overdueReceivablesSection'),
        upcomingReceivablesSection: document.getElementById('upcomingReceivablesSection'),
        overduePayablesSection: document.getElementById('overduePayablesSection'),
        upcomingPayablesSection: document.getElementById('upcomingPayablesSection'),

        accountingReportForm: document.getElementById('accountingReportForm'),
        accountingStartDateInput: document.getElementById('accountingStartDate'),
        accountingEndDateInput: document.getElementById('accountingEndDate'),
        btnExportAccountingCsv: document.getElementById('btnExportAccountingCsv'),
    };

    // --- UTILITY FUNCTIONS ---
    const utils = {
        formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
        formatDate: (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
        showToast: (message, type = 'success') => {
            Toastify({ text: message, duration: 3000, gravity: "top", position: "right", style: { background: type === 'success' ? 'var(--primary-color)' : 'var(--danger-color)' } }).showToast();
        },
        showConfirm: (message, onConfirm) => {
            dom.confirmModalMessage.textContent = message;
            state.confirmAction = onConfirm;
            state.bootstrapConfirmModal.show();
        },
        getToken: () => localStorage.getItem('jwtToken'),
        getUserRole: () => {
            const token = utils.getToken();
            if (!token) return null;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.role;
            } catch (error) {
                console.error('Erro ao descodificar token JWT:', error);
                return null;
            }
        },
        hasPermission: (allowedRoles) => {
            return allowedRoles.includes(state.userRole);
        },
        logout: (message = 'Sessão expirada ou inválida. Faça login novamente.') => {
            localStorage.removeItem('jwtToken');
            state.userRole = null;
            state.user = null;
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
        // NOVO: API para obter o CSV contábil consolidado
        exportAccountingCsv: (startDate, endDate) => api.request(`/finance/accounting-csv?startDate=${startDate}&endDate=${endDate}`, { isFileDownload: true }),
    };

    // --- UI AND RENDERING LOGIC ---
    const ui = {
        showSection: (sectionId) => {
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';

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
                        if (!utils.hasPermission(['admin', 'gerente'])) {
                            isVisible = false;
                        }
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
        // FUNÇÃO ATUALIZADA: renderDashboard
        renderDashboard: ({ totalClients, salesThisMonth, totalReceivable, overdueSales, salesByMonth, lowStockProducts, salesToday, averageTicket, totalAccountsPayable, overdueAccountsPayable }) => {
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

            let accountsPayableHtml = '';
            // Usa classes CSS customizadas para os cartões KPI de contas a pagar
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
            state.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: salesByMonth.map(item => item.month),
                    datasets: [{ label: 'Vendas por Mês', data: salesByMonth.map(item => item.total), backgroundColor: 'var(--primary-color)' }] // Usa variável CSS
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
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
                        ${(utils.hasPermission(['admin', 'gerente']) || (utils.hasPermission(['vendedor']) && client.userId === state.user.id)) ?
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
                        ${(utils.hasPermission(['admin', 'gerente']) || (utils.hasPermission(['vendedor']) && sale.userId === state.user.id)) ?
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
                let exportButtonHtml = '';
                if (utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
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
            // Render Contas a Receber Vencidas
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

            // Render Contas a Pagar Vencidas/Próximas
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
        }
    };

    // --- EVENT HANDLERS ---
    const handlers = {
        loadDashboard: async () => {
            try {
                const dashboardData = await api.getDashboardStats();
                const lowStockProducts = await api.getLowStockProducts();
                const dueDatesData = await api.getDueDates();

                ui.renderDashboard({ ...dashboardData, lowStockProducts });
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
        handleExportPeriodReportCsv: async () => {
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
        // NOVO: Handler para exportar o CSV contábil
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
            if (clientId && !utils.hasPermission(['admin', 'gerente'])) {
                utils.showToast('Você não tem permissão para editar clientes.', 'error');
                return;
            }
            if (!clientId && !utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
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
            if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                utils.showToast('Você não tem permissão para salvar clientes.', 'error');
                return;
            }
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
                const { data: clients } = await api.getClients(1, '', 1000);
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

                // Acessar elementos do modal de venda diretamente na função
                const paymentFormaSelect = document.getElementById('paymentForma');
                const paymentParcelasField = document.getElementById('parcelasField');
                const paymentBandeiraCartaoField = document.getElementById('bandeiraCartaoField');
                const paymentBancoCrediarioField = document.getElementById('bancoCrediarioField');
                const paymentParcelasInput = document.getElementById('paymentParcelas');
                const paymentBandeiraCartaoInput = document.getElementById('paymentBandeiraCartao');
                const paymentBancoCrediarioInput = document.getElementById('paymentBancoCrediario');

                if (paymentFormaSelect) paymentFormaSelect.value = 'Dinheiro';
                utils.togglePaymentFields(paymentFormaSelect, paymentParcelasField, paymentBandeiraCartaoField, paymentBancoCrediarioField, paymentParcelasInput, paymentBandeiraCartaoInput, paymentBancoCrediarioInput);
                if (document.getElementById('salePaidValueInitial')) { // Check if element exists before accessing
                    document.getElementById('salePaidValueInitial').value = '0';
                }


                modalLabel.textContent = 'Nova Venda';
                if (saleId) {
                    modalLabel.textContent = 'Editar Venda';
                    const sale = await api.getSaleById(saleId);

                    if (!utils.hasPermission(['admin', 'gerente'])) {
                        if (utils.hasPermission(['vendedor']) && sale.userId !== state.user.id) {
                            utils.showToast('Você não tem permissão para editar esta venda.', 'error');
                            return;
                        } else if (!utils.hasPermission(['vendedor'])) {
                            utils.showToast('Você não tem permissão para editar vendas.', 'error');
                            return;
                        }
                    }

                    document.getElementById('saleId').value = sale.id;
                    document.getElementById('saleDueDate').value = sale.dataVencimento ? sale.dataVencimento.split('T')[0] : '';

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
                    $('#saleClient').val(sale.clientId).trigger('change');
                } else {
                    if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                        utils.showToast('Você não tem permissão para criar vendas.', 'error');
                        return;
                    }
                }

                state.bootstrapSaleModal.show();
            } catch(error) {
                utils.showToast(error.message, 'error');
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
            if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                utils.showToast('Você não tem permissão para remover produtos de vendas.', 'error');
                return;
            }
            state.selectedSaleProducts.splice(index, 1);
            utils.renderSelectedProductsList();
        },
        handleSaveSale: async (e) => {
            e.preventDefault();
            if (!utils.hasPermission(['admin', 'gerente', 'vendedor'])) {
                utils.showToast('Você não tem permissão para salvar vendas.', 'error');
                return;
            }

            const id = document.getElementById('saleId').value;
            const clientId = document.getElementById('saleClient').value;
            const dataVencimento = document.getElementById('saleDueDate').value;
            const valorTotal = utils.calculateSaleTotal();

            // Acessar elementos do modal de venda diretamente na função
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
                const sale = await api.getSaleById(saleId);
                ui.renderSaleDetail(sale);
                ui.showSection('saleDetailSection');
            } catch (error) {
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
            if (!utils.hasPermission(['admin', 'gerente'])) {
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

            if (userId) {
                dom.userModalLabel.textContent = 'Editar Usuário';
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
                dom.userModalLabel.textContent = 'Novo Usuário';
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
            if (userId === state.user.id) {
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

            if (supplierId) {
                dom.supplierModalLabel.textContent = 'Editar Fornecedor';
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
            } else {
                dom.supplierModalLabel.textContent = 'Novo Fornecedor';
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
                contact: dom.supplierContactInput.value || null,
                email: dom.supplierEmailInput.value || null,
                cnpj: dom.supplierCnpjInput.value || null,
                address: dom.supplierAddressInput.value || null,
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
        openPurchaseModal: async (purchaseId = null) => {
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
            const supplierSelect = dom.purchaseSupplierSelect;
            supplierSelect.empty().append($('<option value="">Selecione um fornecedor</option>')).select2({
                placeholder: "Buscar fornecedor...",
                dropdownParent: $('#purchaseModal'),
                data: [],
            });

            const productSelect = dom.purchaseProductSelect;
            productSelect.empty().append($('<option value="">Selecione um produto</option>')).select2({
                placeholder: "Buscar produto...",
                dropdownParent: $('#purchaseModal'),
                templateResult: (product) => {
                    if (!product.id) { return product.text; }
                    const p = state.availableProductsForPurchase.find(item => String(item.id) === String(product.id));
                    if (!p) return product.text;
                    return $(`<span>${p.nome} (Estoque atual: ${p.estoque}, Preço venda: ${utils.formatCurrency(p.precoVenda)})</span>`);
                },
                templateSelection: (product) => {
                    if (!product.id) { return product.text; }
                    const p = state.availableProductsForPurchase.find(item => String(item.id) === String(product.id));
                    if (!p) return product.text;
                    return p.nome;
                },
                data: [],
            });

            try {
                const { data: suppliers } = await api.getSuppliers(1, '', 1000);
                state.availableSuppliers = suppliers;
                supplierSelect.empty().append($('<option value="">Selecione um fornecedor</option>')).select2({
                    data: state.availableSuppliers.map(s => ({ id: String(s.id), text: s.nome })),
                    placeholder: "Buscar fornecedor...",
                    dropdownParent: $('#purchaseModal'),
                });

                const { data: products } = await api.getProducts(1, '', 1000);
                state.availableProductsForPurchase = products;
                productSelect.empty().append($('<option value="">Selecione um produto</option>')).select2({
                    data: state.availableProductsForPurchase.map(p => ({ id: String(p.id), text: p.nome })),
                    placeholder: "Buscar produto...",
                    dropdownParent: $('#purchaseModal'),
                    templateResult: (productData) => {
                        if (!productData.id) { return productData.text; }
                        const product = state.availableProductsForPurchase.find(item => String(item.id) === String(productData.id));
                        if (!product) return productData.text;
                        return $(`<span>${product.nome} (Estoque atual: ${product.estoque}, Preço venda: ${utils.formatCurrency(product.precoVenda)})</span>`);
                    },
                    templateSelection: (productData) => {
                        if (!productData.id) { return productData.text; }
                        const product = state.availableProductsForPurchase.find(item => String(item.id) === String(productData.id));
                        if (!product) return productData.text;
                        return product.nome;
                    }
                });

                productSelect.off('select2:select').on('select2:select', (e) => {
                    const productId = String(e.params.data.id);
                    const product = state.availableProductsForPurchase.find(p => String(p.id) === productId);
                    if (product) {
                        state.currentSelectedProductForPurchase = product;
                        dom.purchaseProductDetailsDisplay.innerHTML = `Estoque atual: ${product.estoque}, Preço de Venda: ${utils.formatCurrency(product.precoVenda)}`;
                        dom.purchaseProductCostInput.value = product.precoCusto ? product.precoCusto.toFixed(2) : product.precoVenda.toFixed(2);
                        dom.purchaseProductQuantityInput.value = '1';
                    } else {
                        state.currentSelectedProductForPurchase = null;
                        dom.purchaseProductDetailsDisplay.innerHTML = '';
                        dom.purchaseProductCostInput.value = '';
                    }
                });
                productSelect.off('select2:unselect').on('select2:unselect', () => {
                    state.currentSelectedProductForPurchase = null;
                    dom.purchaseProductDetailsDisplay.innerHTML = '';
                    dom.purchaseProductCostInput.value = '';
                });


                modalLabel.textContent = 'Nova Compra';
                if (purchaseId) {
                    modalLabel.textContent = 'Editar Compra';
                    const purchase = await api.getPurchaseById(purchaseId);

                    if (!utils.hasPermission(['admin', 'gerente'])) {
                        utils.showToast('Você não tem permissão para editar esta compra.', 'error');
                        return;
                    }

                    dom.purchaseIdInput.value = purchase.id;
                    dom.purchaseDateInput.value = purchase.dataCompra ? new Date(purchase.dataCompra).toISOString().split('T')[0] : '';
                    dom.purchaseStatusSelect.value = purchase.status;
                    dom.purchaseObservationsInput.value = purchase.observacoes || '';
                    supplierSelect.val(purchase.supplierId).trigger('change');

                    if (purchase.products && purchase.products.length > 0) {
                        state.selectedPurchaseProducts = purchase.products.map(p => ({
                            id: p.id,
                            nome: p.nome,
                            precoCustoUnitario: p.PurchaseProduct.precoCustoUnitario,
                            quantidade: p.PurchaseProduct.quantidade,
                        }));
                        utils.renderSelectedPurchaseProductsList();
                    }
                } else {
                    dom.purchaseDateInput.valueAsDate = new Date();
                }

                state.bootstrapPurchaseModal.show();
            } catch(error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleAddPurchaseProduct: () => {
            if (!utils.hasPermission(['admin', 'gerente'])) {
                utils.showToast('Você não tem permissão para adicionar produtos a compras.', 'error');
                return;
            }

            const productId = dom.purchaseProductSelect.val();
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
            dom.purchaseProductSelect.val(null).trigger('change');
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
            const supplierId = dom.purchaseSupplierSelect.val();
            const dataCompra = dom.purchaseDateInput.value;
            const valorTotal = utils.calculatePurchaseTotal();
            const status = dom.purchaseStatusSelect.value;
            const observacoes = dom.purchaseObservationsInput.value;

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
            utils.showConfirm('Deseja realmente excluir esta compra? O estoque dos produtos será revertido.', async () => {
                try {
                    await api.deletePurchase(purchaseId);
                    utils.showToast('Compra excluída e estoque revertido!', 'success');
                    setTimeout(() => {
                        handlers.loadPurchases(true);
                        handlers.loadProducts(true);
                        handlers.loadDashboard();
                    }, 50);
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
    };

    // --- INITIALIZATION ---
    function initialize() {
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

                ui.showSection(sectionId);
                if (window.innerWidth < 992) {
                    dom.sidebar.classList.remove('active');
                    dom.sidebarOverlay.classList.remove('active');
                }
                if (sectionId === 'dashboardSection') handlers.loadDashboard();
                if (sectionId === 'clientsSection') handlers.loadClients();
                if (sectionId === 'salesSection') handlers.loadSales();
                if (sectionId === 'reportsSection') {
                    // Limpa e exibe o placeholder para ambos os relatórios
                    dom.reportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Relatório" para ver os resultados.</p>';
                    dom.cashFlowReportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Fluxo" para ver o fluxo de caixa.</p>';
                }
                if (sectionId === 'productsSection') handlers.loadProducts();
                if (sectionId === 'usersSection') handlers.loadUsers();
                if (sectionId === 'suppliersSection') handlers.loadSuppliers();
                if (sectionId === 'purchasesSection') handlers.loadPurchases();
            });
        });

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
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
                if (button.classList.contains('btn-remove-purchase-product')) {
                    const index = parseInt(button.dataset.index);
                    handlers.handleRemovePurchaseProduct(index);
                }
                if (button.id === 'btnShareWhatsapp') {
                    const saleId = button.dataset.saleId;
                    api.getSaleById(saleId).then(sale => {
                        if (!utils.hasPermission(['admin', 'gerente']) && (utils.hasPermission(['vendedor']) && sale.userId !== state.user.id)) {
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
                        if (!utils.hasPermission(['admin', 'gerente']) && (utils.hasPermission(['vendedor']) && sale.userId !== state.user.id)) {
                            utils.showToast('Você não tem permissão para compartilhar detalhes desta venda.', 'error');
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
                        if (!utils.hasPermission(['admin', 'gerente']) && (utils.hasPermission(['vendedor']) && sale.userId !== state.user.id)) {
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
                    if (type === 'sale') handlers.loadSaleDetail(id);
                }
                if(button.classList.contains('action-edit')) {
                    if (type === 'client') handlers.openClientModal(id);
                    if (type === 'product') handlers.openProductModal(id);
                    if (type === 'sale') handlers.openSaleModal(id);
                    if (type === 'user') handlers.openUserModal(id);
                    if (type === 'supplier') handlers.openSupplierModal(id);
                    if (type === 'purchase') handlers.openPurchaseModal(id);
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

        dom.clientForm.addEventListener('submit', handlers.handleSaveClient);
        dom.saleForm.addEventListener('submit', handlers.handleSaveSale);
        if (dom.productForm) {
            dom.productForm.addEventListener('submit', handlers.handleSaveProduct);
        }
        if (dom.userForm) {
            dom.userForm.addEventListener('submit', handlers.handleSaveUser);
        }
        if (dom.supplierForm) {
            dom.supplierForm.addEventListener('submit', handlers.handleSaveSupplier);
        }
        if (dom.purchaseForm) {
            dom.purchaseForm.addEventListener('submit', handlers.handleSavePurchase);
        }

        if (dom.reportPeriodForm) {
            dom.reportPeriodForm.addEventListener('submit', handlers.handleGenerateSalesReport);
        }
        if (dom.cashFlowReportForm) {
            dom.cashFlowReportForm.addEventListener('submit', handlers.handleGenerateCashFlowReport);
        }
        // NOVO: Event listener para o formulário de Relatório Contábil
        if (dom.accountingReportForm) {
            dom.accountingReportForm.addEventListener('submit', handlers.handleExportAccountingCsv);
        }

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