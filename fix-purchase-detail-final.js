// Script final para corrigir a seção de detalhes da compra
console.log('🔧 Aplicando correções finais na seção de detalhes da compra...');

// 1. Remover seção atual
const currentSection = document.getElementById('purchaseDetailSection');
if (currentSection) {
    currentSection.remove();
    console.log('✅ Seção atual removida');
}

// 2. Criar nova seção seguindo o padrão de vendas
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

// 3. Simular dados da compra (você pode ajustar conforme necessário)
const purchase = {
    id: 12,
    supplier: { nome: 'eletrosistem' },
    dataCompra: '2025-07-27',
    valorTotal: 830,
    status: 'Pendente',
    observacoes: 'N/A',
    purchaseProducts: [
        {
            product: { nome: 'Tablet' },
            quantidade: 1,
            precoCustoUnitario: 830
        }
    ]
};

// 4. Criar HTML seguindo o padrão de vendas
let productsHtml = '';
if (purchase.purchaseProducts && purchase.purchaseProducts.length > 0) {
    productsHtml = `
        <h6>Itens da Compra:</h6>
        <ul class="list-group mb-3">
            ${purchase.purchaseProducts.map(item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${item.product.nome} (${item.quantidade}x)</span>
                    <span class="fw-bold">R$ ${(item.quantidade * item.precoCustoUnitario).toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
    `;
} else {
    productsHtml = `<p>Nenhum produto associado.</p>`;
}

newSection.innerHTML = `
    <div class="container-fluid h-100">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#" class="nav-back" data-section="purchasesSection">Compras</a></li>
                <li class="breadcrumb-item active" aria-current="page">Detalhes da Compra #${purchase.id}</li>
            </ol>
        </nav>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Detalhes da Compra #${purchase.id}</h3>
            <button class="btn btn-outline-secondary nav-back" data-section="purchasesSection">
                <i class="bi bi-arrow-left"></i> Voltar para Compras
            </button>
        </div>
        <div class="row">
            <div class="col-lg-8">
                <div class="card mb-4">
                    <div class="card-header">
                        <h4>Itens da Compra</h4>
                    </div>
                    <div class="card-body">
                        ${productsHtml}
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5>Resumo da Compra</h5>
                    </div>
                    <div class="card-body">
                        <p><strong>Fornecedor:</strong> ${purchase.supplier?.nome || 'Fornecedor não informado'}</p>
                        <p><strong>Data da Compra:</strong> ${purchase.dataCompra}</p>
                        <p><strong>Valor Total:</strong> R$ ${purchase.valorTotal.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span class="badge bg-secondary">${purchase.status}</span></p>
                        <p><strong>Observações:</strong> ${purchase.observacoes || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// 5. Adicionar ao body
document.body.appendChild(newSection);

console.log('✅ Nova seção criada seguindo o padrão de vendas');
console.log('✅ Sem borda vermelha ou fundo amarelo');
console.log('✅ Sem rolagem vertical desnecessária');
console.log('✅ Layout centralizado e organizado');
console.log('✅ Botão "Voltar para Compras" adicionado'); 