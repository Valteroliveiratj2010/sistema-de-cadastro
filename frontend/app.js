'use strict';
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO E ESTADO ---
    const API_BASE = 'http://localhost:5000/api';
    const state = {
        bootstrapClientModal: new bootstrap.Modal(document.getElementById('clientModal')),
        bootstrapSaleModal: new bootstrap.Modal(document.getElementById('saleModal')),
        bootstrapConfirmModal: new bootstrap.Modal(document.getElementById('confirmModal')),
        // NOVO: Modal de Produto
        bootstrapProductModal: new bootstrap.Modal(document.getElementById('productModal')),
        chartInstance: null,
        confirmAction: null,
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
        // NOVO: Estado para produtos
        products: {
            page: 1,
            query: '',
            limit: 10,
            data: [],
            total: 0,
            loaded: false // Flag para o cache
        }
    };

    // --- SELETORES DOM ---
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
        // NOVO: Seletores para Produto
        productForm: document.getElementById('productForm'),
    };

    // --- FUNÇÕES DE UTILIDADE ---
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
        logout: (message = 'Sessão expirada ou inválida. Faça login novamente.') => {
            localStorage.removeItem('jwtToken');
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
            });
        }
    };

    // --- LÓGICA DE API (ATUALIZADA) ---
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
                utils.logout('Sessão expirada ou inválida. Por favor, faça login novamente.');
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
        // NOVO: Métodos de API para Produtos
        getProducts: (page = 1, q = '', limit = 10) => api.request(`/products?page=${page}&q=${q}&limit=${limit}`),
        getProductById: (id) => api.request(`/products/${id}`),
        createProduct: (data) => api.request('/products', { method: 'POST', body: JSON.stringify(data) }),
        updateProduct: (id, data) => api.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteProduct: (id) => api.request(`/products/${id}`, { method: 'DELETE' }),
    };

    // --- LÓGICA DE UI E RENDERIZAÇÃO (ATUALIZADA) ---
    const ui = {
        showSection: (sectionId) => {
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';

            dom.navLinks.forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (navLink) navLink.classList.add('active');
        },
        renderDashboard: ({ totalClients, salesThisMonth, totalReceivable, overdueSales, salesByMonth }) => {
            const section = document.getElementById('dashboardSection');
            section.innerHTML = `
                <h3>Dashboard</h3>
                <div class="row g-4 mb-4">
                    <div class="col-md-3"><div class="card p-3"><h6>Total de Clientes</h6><p class="fs-2 fw-bold">${totalClients}</p></div></div>
                    <div class="col-md-3"><div class="card p-3"><h6>Vendas este Mês</h6><p class="fs-2 fw-bold">${utils.formatCurrency(salesThisMonth)}</p></div></div>
                    <div class="col-md-3"><div class="card p-3"><h6>A Receber</h6><p class="fs-2 fw-bold">${utils.formatCurrency(totalReceivable)}</p></div></div>
                    <div class="col-md-3"><div class="card p-3 bg-danger text-white"><h6>Vencido</h6><p class="fs-2 fw-bold">${utils.formatCurrency(overdueSales)}</p></div></div>
                </div>
                <div class="card p-3"><canvas id="salesChart"></canvas></div>`;
            
            const ctx = document.getElementById('salesChart').getContext('2d');
            if (state.chartInstance) state.chartInstance.destroy();
            state.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: salesByMonth.map(item => item.month),
                    datasets: [{ label: 'Vendas por Mês', data: salesByMonth.map(item => item.total), backgroundColor: 'rgba(79, 70, 229, 0.8)' }]
                },
                options: { scales: { y: { beginAtZero: true } } }
            });
        },
        renderClients: () => {
            const { data, total } = state.clients;
            const section = document.getElementById('clientsSection');
            const tableRows = data.map(client => `
                <tr>
                    <td>${client.id}</td><td><strong>${client.nome}</strong></td><td>${client.email || 'N/A'}</td><td>${client.telefone || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary action-edit" data-type="client" data-id="${client.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger action-delete" data-type="client" data-id="${client.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`).join('');
            
            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-people-fill me-2"></i>Clientes (${total})</h3>
                    <div>
                        <button class="btn btn-outline-success me-2" id="btnExportClientsCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar CSV</button>
                        <button class="btn btn-primary" id="btnNewClient"><i class="bi bi-plus-circle me-2"></i>Novo Cliente</button>
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
                const statusClass = valorDevido <= 0 ? 'text-success' : 'text-danger';
                return `
                <tr>
                    <td>${sale.id}</td><td><strong>${sale.client?.nome || 'N/A'}</strong></td><td>${utils.formatDate(sale.dataVenda)}</td><td class="${statusClass}"><strong>${utils.formatCurrency(valorDevido)}</strong></td><td><span class="badge bg-primary">${sale.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-info action-detail" data-type="sale" data-id="${sale.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-danger action-delete" data-type="sale" data-id="${sale.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
             section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-cart-check-fill me-2"></i>Vendas (${total})</h3>
                    <div>
                        <button class="btn btn-outline-success me-2" id="btnExportSalesCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar CSV</button>
                        <button class="btn btn-primary" id="btnNewSale"><i class="bi bi-plus-circle me-2"></i>Nova Venda</button>
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
            
            if (!container || totalPages === 0) {
                container.innerHTML = '';
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
            paginationHTML += '</ul></nav>';
            container.innerHTML = paginationHTML;
        },
        renderSalesByPeriod: ({ sales, summary }) => {
            const reportResultsDiv = dom.reportResults;
            let resultsHtml = '';

            if (sales.length === 0) {
                resultsHtml = `<div class="alert alert-info text-center" role="alert">Nenhuma venda encontrada para o período selecionado.</div>`;
            } else {
                // Resumo do relatório
                resultsHtml += `
                    <div class="row g-3 mb-4">
                        <div class="col-md-3"><div class="card p-3"><h6>Total de Vendas</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalSalesAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3"><h6>Total Pago</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalPaidAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3 bg-danger text-white"><h6>Total Devido</h6><p class="fs-4 fw-bold">${utils.formatCurrency(summary.totalDueAmount)}</p></div></div>
                        <div class="col-md-3"><div class="card p-3"><h6>Qtd. de Vendas</h6><p class="fs-4 fw-bold">${summary.numberOfSales}</p></div></div>
                    </div>
                    <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-success" id="btnExportPeriodReportCsv"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Exportar Relatório CSV</button>
                    </div>
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
                                ${sales.map(sale => {
                                    const valorDevido = sale.valorTotal - sale.valorPago;
                                    const statusClass = valorDevido <= 0 ? 'text-success' : 'text-danger';
                                    return `
                                        <tr>
                                            <td>${sale.id}</td>
                                            <td>${sale.client?.nome || 'N/A'}</td>
                                            <td>${utils.formatDate(sale.dataVenda)}</td>
                                            <td>${utils.formatCurrency(sale.valorTotal)}</td>
                                            <td>${utils.formatCurrency(sale.valorPago)}</td>
                                            <td class="${statusClass}">${utils.formatCurrency(valorDevido)}</td>
                                            <td><span class="badge bg-secondary">${sale.status}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
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
            const paymentsHTML = sale.payments.map(p => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Pagamento recebido em ${utils.formatDate(p.dataPagamento)}
                    <span class="badge bg-success rounded-pill">${utils.formatCurrency(p.valor)}</span>
                </li>
            `).join('');
            section.innerHTML = `
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#" class="nav-back" data-section="salesSection">Vendas</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Detalhes da Venda #${sale.id}</li>
                    </ol>
                </nav>
                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4"><div class="card-header"><h4>Histórico de Pagamentos</h4></div>
                            <div class="card-body">
                                ${sale.payments.length > 0 ? `<ul class="list-group">${paymentsHTML}</ul>` : '<p>Nenhum pagamento registrado.</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card mb-4"><div class="card-header"><h5>Resumo</h5></div>
                            <div class="card-body">
                                <p><strong>Cliente:</strong> ${sale.client.nome}</p>
                                <p><strong>Valor Total:</strong> ${utils.formatCurrency(sale.valorTotal)}</p>
                                <p><strong>Total Pago:</strong> ${utils.formatCurrency(sale.valorPago)}</p>
                                <p class="fs-5"><strong>Valor Devido: <span class="text-danger">${utils.formatCurrency(valorDevido)}</span></strong></p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header"><h5>Registrar Pagamento</h5></div>
                            <div class="card-body">
                                <form id="paymentForm" data-sale-id="${sale.id}">
                                    <div class="mb-3">
                                        <label for="paymentValue" class="form-label">Valor</label>
                                        <input type="number" step="0.01" class="form-control" id="paymentValue" required>
                                    </div>
                                    <button type="submit" class="btn btn-success w-100">Registrar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        // NOVO: Função para renderizar a lista de produtos
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
                        <button class="btn btn-sm btn-outline-primary action-edit" data-type="product" data-id="${product.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger action-delete" data-type="product" data-id="${product.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`).join('');
            
            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3><i class="bi bi-box-seam me-2"></i>Produtos (${total})</h3>
                    <div>
                        <button class="btn btn-primary" id="btnNewProduct"><i class="bi bi-plus-circle me-2"></i>Novo Produto</button>
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

    // --- HANDLERS DE EVENTOS (ATUALIZADO) ---
    const handlers = {
        loadDashboard: async () => {
            try {
                const stats = await api.getDashboardStats();
                ui.renderDashboard(stats);
                ui.showSection('dashboardSection');
            } catch (error) { utils.showToast(error.message, 'error'); }
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
                utils.showToast(error.message || 'Falha ao exportar relatório de vendas por período.', 'error');
            }
        },
        handleSearch: (type, query) => {
            state[type].query = query;
            state[type].page = 1;
            if (type === 'clients') handlers.loadClients(true);
            if (type === 'sales') handlers.loadSales(true);
            if (type === 'products') handlers.loadProducts(true); // NOVO
        },
        handlePageChange: (type, newPage) => {
            state[type].page = newPage;
            if (type === 'clients') handlers.loadClients(true);
            if (type === 'sales') handlers.loadSales(true);
            if (type === 'products') handlers.loadProducts(true); // NOVO
        },
        openClientModal: async (clientId = null) => {
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
                    utils.showToast('Cliente atualizado!');
                } else {
                    await api.createClient(data);
                    utils.showToast('Cliente criado!');
                }
                state.bootstrapClientModal.hide();
                handlers.loadClients(true);
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleDeleteClient: async (clientId) => {
            utils.showConfirm('Deseja realmente excluir este cliente?', async () => {
                try {
                    await api.deleteClient(clientId);
                    utils.showToast('Cliente excluído!');
                    handlers.loadClients(true);
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
        openSaleModal: async (saleId = null) => {
            dom.saleForm.reset();
            document.getElementById('saleId').value = '';
            const modalLabel = document.getElementById('saleModalLabel');
            const clientSelect = document.getElementById('saleClient');
            clientSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                const { data: clients } = await api.getClients(1, '', 1000);
                clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
                clients.forEach(c => clientSelect.add(new Option(c.nome, c.id)));
                modalLabel.textContent = 'Nova Venda';
                state.bootstrapSaleModal.show();
            } catch(error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleSaveSale: async (e) => {
            e.preventDefault();
            const data = {
                clientId: document.getElementById('saleClient').value,
                valorTotal: document.getElementById('saleTotalValue').value,
                valorPago: document.getElementById('salePaidValue').value,
                dataVencimento: document.getElementById('saleDueDate').value || null
            };
            try {
                await api.createSale(data);
                utils.showToast('Venda registrada!');
                state.bootstrapSaleModal.hide();
                handlers.loadSales(true);
                handlers.loadDashboard();
            } catch (error) {
                 utils.showToast(error.message, 'error');
            }
        },
        handleDeleteSale: async (saleId) => {
            utils.showConfirm('Deseja realmente excluir esta venda?', async () => {
                try {
                    await api.deleteSale(saleId);
                    utils.showToast('Venda excluída!');
                    handlers.loadSales(true);
                    handlers.loadDashboard();
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
            const saleId = e.target.dataset.saleId;
            const valor = document.getElementById('paymentValue').value;
            try {
                await api.createPayment(saleId, { valor });
                utils.showToast('Pagamento registrado!');
                handlers.loadSaleDetail(saleId);
                handlers.loadDashboard();
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        // NOVO: Handlers para Produtos
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
                    utils.showToast('Produto atualizado!');
                } else {
                    await api.createProduct(data);
                    utils.showToast('Produto criado!');
                }
                state.bootstrapProductModal.hide();
                handlers.loadProducts(true); // Força o recarregamento da lista
            } catch (error) {
                utils.showToast(error.message, 'error');
            }
        },
        handleDeleteProduct: async (productId) => {
            utils.showConfirm('Deseja realmente excluir este produto?', async () => {
                try {
                    await api.deleteProduct(productId);
                    utils.showToast('Produto excluído!');
                    handlers.loadProducts(true); // Força o recarregamento
                } catch (error) {
                    utils.showToast(error.message, 'error');
                }
            });
        },
    };

    // --- INICIALIZAÇÃO (ATUALIZADA) ---
    function initialize() {
        if (!utils.getToken()) {
            utils.logout('Você precisa estar logado para acessar esta página.');
            return;
        }

        // Navegação
        dom.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const sectionId = e.currentTarget.dataset.section;
                ui.showSection(sectionId);
                if (sectionId === 'dashboardSection') handlers.loadDashboard();
                if (sectionId === 'clientsSection') handlers.loadClients();
                if (sectionId === 'salesSection') handlers.loadSales();
                if (sectionId === 'reportsSection') {
                    dom.reportResults.innerHTML = '<p class="text-center text-muted">Selecione um período e clique em "Gerar Relatório" para ver os resultados.</p>';
                }
                if (sectionId === 'productsSection') handlers.loadProducts(); // NOVO: Carrega a seção de produtos
            });
        });

        // Delegação de eventos ATUALIZADA
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                if (button.id === 'btnNewClient') handlers.openClientModal();
                if (button.id === 'btnNewSale') handlers.openSaleModal();
                if (button.id === 'btnExportClientsCsv') handlers.handleExportClientsCsv();
                if (button.id === 'btnExportSalesCsv') handlers.handleExportSalesCsv();
                if (button.id === 'btnExportPeriodReportCsv') handlers.handleExportPeriodReportCsv();
                // NOVO: Listener para o botão de novo produto
                if (button.id === 'btnNewProduct') handlers.openProductModal();


                const { type, id } = button.dataset;
                if (button.classList.contains('action-delete')) {
                    if (type === 'client') handlers.handleDeleteClient(id);
                    if (type === 'sale') handlers.handleDeleteSale(id);
                    if (type === 'product') handlers.handleDeleteProduct(id); // NOVO
                }
                if (button.classList.contains('action-detail')) {
                    if (type === 'sale') handlers.loadSaleDetail(id);
                }
                if(button.classList.contains('action-edit')) {
                    if (type === 'client') handlers.openClientModal(id);
                    if (type === 'product') handlers.openProductModal(id); // NOVO
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

        // Event listener para o formulário de relatório por período
        if (dom.reportPeriodForm) {
            dom.reportPeriodForm.addEventListener('submit', handlers.handleGenerateSalesReport);
        }
        
        // Evento para busca (agora também para produtos)
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

        // Formulários
        dom.clientForm.addEventListener('submit', handlers.handleSaveClient);
        dom.saleForm.addEventListener('submit', handlers.handleSaveSale);
        // NOVO: Listener para o formulário de produto
        if (dom.productForm) {
            dom.productForm.addEventListener('submit', handlers.handleSaveProduct);
        }

        document.body.addEventListener('submit', e => {
            if (e.target.id === 'paymentForm') handlers.handleSavePayment(e);
        });
        dom.confirmModalButton.addEventListener('click', () => {
            if (state.confirmAction) state.confirmAction();
            state.bootstrapConfirmModal.hide();
        });

        if (dom.logoutButton) {
            dom.logoutButton.addEventListener('click', () => {
                utils.logout('Você foi desconectado.');
            });
        }

        handlers.loadDashboard();
    }

    initialize();
});
