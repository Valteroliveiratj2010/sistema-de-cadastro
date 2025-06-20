'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO E ESTADO ---
    const API_BASE = 'http://localhost:5000/api';
    const state = {
        bootstrapClientModal: new bootstrap.Modal(document.getElementById('clientModal')),
        bootstrapSaleModal: new bootstrap.Modal(document.getElementById('saleModal')),
        bootstrapConfirmModal: new bootstrap.Modal(document.getElementById('confirmModal')),
        chartInstance: null,
        confirmAction: null, 
    };

    // --- SELETORES DOM ---
    const dom = {
        navLinks: document.querySelectorAll('.sidebar .nav-link'),
        clientForm: document.getElementById('clientForm'),
        saleForm: document.getElementById('saleForm'),
        confirmModalButton: document.getElementById('confirmModalButton'),
        confirmModalMessage: document.getElementById('confirmModalMessage'),
    };

    // --- FUNÇÕES DE UTILIDADE ---
    const utils = {
        formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
        formatDate: (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
        showToast: (message, type = 'success') => {
            Toastify({ text: message, duration: 3000, gravity: "top", position: "right", backgroundColor: type === 'success' ? '#4f46e5' : '#ef4444' }).showToast();
        },
        showConfirm: (message, onConfirm) => {
            dom.confirmModalMessage.textContent = message;
            state.confirmAction = onConfirm;
            state.bootstrapConfirmModal.show();
        }
    };

    // --- LÓGICA DE API ---
    const api = {
        async request(endpoint, options = {}) {
            const response = await fetch(`${API_BASE}${endpoint}`, { headers: { 'Content-Type': 'application/json' }, ...options });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro na requisição.');
            }
            return response.status === 204 ? null : response.json();
        },
        getDashboardStats: () => api.request('/dashboard/stats'),
        getClients: (page = 1, q = '') => api.request(`/clients?page=${page}&q=${q}`),
        getClientById: (id) => api.request(`/clients/${id}`),
        createClient: (data) => api.request('/clients', { method: 'POST', body: JSON.stringify(data) }),
        updateClient: (id, data) => api.request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteClient: (id) => api.request(`/clients/${id}`, { method: 'DELETE' }),
        getSales: (page = 1, q = '') => api.request(`/sales?page=${page}&q=${q}`),
        getSaleById: (id) => api.request(`/sales/${id}`),
        createSale: (data) => api.request('/sales', { method: 'POST', body: JSON.stringify(data) }),
        updateSale: (id, data) => api.request(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSale: (id) => api.request(`/sales/${id}`, { method: 'DELETE' }),
        createPayment: (saleId, data) => api.request(`/sales/${saleId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
    };

    // --- LÓGICA DE UI E RENDERIZAÇÃO ---
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
        renderClients: ({ data }) => {
            const section = document.getElementById('clientsSection');
            const tableRows = data.map(client => `
                <tr>
                    <td>${client.id}</td><td><strong>${client.nome}</strong></td><td>${client.email}</td><td>${client.telefone}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary action-edit" data-type="client" data-id="${client.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger action-delete" data-type="client" data-id="${client.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`).join('');
            section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3"><h3><i class="bi bi-people-fill me-2"></i>Clientes</h3><button class="btn btn-primary" id="btnNewClient"><i class="bi bi-plus-circle me-2"></i>Novo Cliente</button></div>
                <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>${tableRows}</tbody></table></div>`;
        },
        renderSales: ({ data }) => {
            const section = document.getElementById('salesSection');
            const tableRows = data.map(sale => {
                const valorDevido = sale.valorTotal - sale.valorPago;
                const statusClass = valorDevido <= 0 ? 'text-success' : 'text-danger';
                return `
                <tr>
                    <td>${sale.id}</td>
                    <td><strong>${sale.client?.nome || 'N/A'}</strong></td>
                    <td>${utils.formatDate(sale.dataVenda)}</td>
                    <td class="${statusClass}"><strong>${utils.formatCurrency(valorDevido)}</strong></td>
                    <td><span class="badge bg-primary">${sale.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-info action-detail" data-type="sale" data-id="${sale.id}" title="Detalhes"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-primary action-edit" data-type="sale" data-id="${sale.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger action-delete" data-type="sale" data-id="${sale.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
             section.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3"><h3><i class="bi bi-cart-check-fill me-2"></i>Vendas</h3><button class="btn btn-primary" id="btnNewSale"><i class="bi bi-plus-circle me-2"></i>Nova Venda</button></div>
                <div class="table-responsive"><table class="table table-hover"><thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Valor Devido</th><th>Status</th><th>Ações</th></tr></thead><tbody>${tableRows}</tbody></table></div>`;
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
        }
    };

    // --- HANDLERS DE EVENTOS ---
    const handlers = {
        loadDashboard: async () => {
            try {
                const stats = await api.getDashboardStats();
                ui.renderDashboard(stats);
                ui.showSection('dashboardSection'); // <-- A CORREÇÃO ESTÁ AQUI
            } catch (error) { utils.showToast(error.message, 'error'); }
        },
        loadClients: async () => { try { const data = await api.getClients(); ui.renderClients(data); } catch (e) { utils.showToast(e.message, 'error'); } },
        loadSales: async () => { try { const data = await api.getSales(); ui.renderSales(data); } catch (e) { utils.showToast(e.message, 'error'); } },
        
        openClientModal: async (clientId = null) => { dom.clientForm.reset(); document.getElementById('clientId').value = ''; const modalLabel = document.getElementById('clientModalLabel'); if (clientId) { modalLabel.textContent = 'Editar Cliente'; try { const client = await api.getClientById(clientId); document.getElementById('clientId').value = client.id; document.getElementById('clientName').value = client.nome; document.getElementById('clientEmail').value = client.email; document.getElementById('clientPhone').value = client.telefone; } catch (error) { utils.showToast(error.message, 'error'); return; } } else { modalLabel.textContent = 'Novo Cliente'; } state.bootstrapClientModal.show(); },
        handleSaveClient: async (e) => { e.preventDefault(); const id = document.getElementById('clientId').value; const data = { nome: document.getElementById('clientName').value, email: document.getElementById('clientEmail').value, telefone: document.getElementById('clientPhone').value, }; try { if (id) { await api.updateClient(id, data); utils.showToast('Cliente atualizado!'); } else { await api.createClient(data); utils.showToast('Cliente criado!'); } state.bootstrapClientModal.hide(); handlers.loadClients(); } catch (error) { utils.showToast(error.message, 'error'); } },
        handleDeleteClient: async (clientId) => { utils.showConfirm('Deseja realmente excluir este cliente?', async () => { try { await api.deleteClient(clientId); utils.showToast('Cliente excluído!'); handlers.loadClients(); } catch (error) { utils.showToast(error.message, 'error'); } }); },

        openSaleModal: async (saleId = null) => { dom.saleForm.reset(); document.getElementById('saleId').value = ''; const modalLabel = document.getElementById('saleModalLabel'); const clientSelect = document.getElementById('saleClient'); clientSelect.innerHTML = '<option value="">Carregando...</option>'; try { const { data: clients } = await api.getClients(1, ''); clientSelect.innerHTML = '<option value="">Selecione um cliente</option>'; clients.forEach(c => clientSelect.add(new Option(c.nome, c.id))); modalLabel.textContent = 'Nova Venda'; state.bootstrapSaleModal.show(); } catch(error) { utils.showToast(error.message, 'error'); } },
        handleSaveSale: async (e) => { e.preventDefault(); const data = { clientId: document.getElementById('saleClient').value, valorTotal: document.getElementById('saleTotalValue').value, valorPago: document.getElementById('salePaidValue').value, dataVencimento: document.getElementById('saleDueDate').value || null }; try { await api.createSale(data); utils.showToast('Venda registrada!'); state.bootstrapSaleModal.hide(); handlers.loadSales(); handlers.loadDashboard(); } catch (error) { utils.showToast(error.message, 'error'); } },
        handleDeleteSale: async (saleId) => { utils.showConfirm('Deseja realmente excluir esta venda?', async () => { try { await api.deleteSale(saleId); utils.showToast('Venda excluída!'); handlers.loadSales(); handlers.loadDashboard(); } catch (error) { utils.showToast(error.message, 'error'); } }); },
        
        loadSaleDetail: async (saleId) => { try { const sale = await api.getSaleById(saleId); ui.renderSaleDetail(sale); ui.showSection('saleDetailSection'); } catch (error) { utils.showToast(error.message, 'error'); } },
        handleSavePayment: async (e) => { e.preventDefault(); const saleId = e.target.dataset.saleId; const valor = document.getElementById('paymentValue').value; try { await api.createPayment(saleId, { valor }); utils.showToast('Pagamento registrado!'); handlers.loadSaleDetail(saleId); handlers.loadDashboard(); } catch (error) { utils.showToast(error.message, 'error'); } },
    };

    // --- INICIALIZAÇÃO ---
    function initialize() {
        // Navegação
        dom.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const sectionId = e.currentTarget.dataset.section;
                ui.showSection(sectionId);
                if (sectionId === 'dashboardSection') handlers.loadDashboard();
                if (sectionId === 'clientsSection') handlers.loadClients();
                if (sectionId === 'salesSection') handlers.loadSales();
            });
        });

        // Delegação de eventos
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.id === 'btnNewClient') handlers.openClientModal();
            if (button.id === 'btnNewSale') handlers.openSaleModal();

            const { type, id } = button.dataset;

            if (button.classList.contains('action-delete')) {
                if (type === 'client') handlers.handleDeleteClient(id);
                if (type === 'sale') handlers.handleDeleteSale(id);
            }
            if (button.classList.contains('action-detail')) {
                if (type === 'sale') handlers.loadSaleDetail(id);
            }
            
            const backLink = e.target.closest('.nav-back');
            if (backLink) {
                 e.preventDefault();
                 ui.showSection(backLink.dataset.section);
            }
        });

        // Formulários
        dom.clientForm.addEventListener('submit', handlers.handleSaveClient);
        dom.saleForm.addEventListener('submit', handlers.handleSaveSale);
        document.body.addEventListener('submit', e => {
            if (e.target.id === 'paymentForm') handlers.handleSavePayment(e);
        });
        dom.confirmModalButton.addEventListener('click', () => {
            if (state.confirmAction) state.confirmAction();
            state.bootstrapConfirmModal.hide();
        });

        handlers.loadDashboard();
    }

    initialize();
});