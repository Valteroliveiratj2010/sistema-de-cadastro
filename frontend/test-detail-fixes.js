/**
 * Teste das Correções dos Modais de Detalhes
 * Verifica se os problemas foram resolvidos
 */

console.log('🔧 Testando correções dos modais de detalhes...');

function testDetailFixes() {
    console.log('🚀 Executando teste das correções...\n');
    
    // 1. Verificar se as seções existem
    checkDetailSections();
    
    // 2. Testar carregamento de detalhes de venda
    setTimeout(() => {
        testSaleDetailLoading();
    }, 1000);
    
    // 3. Testar carregamento de detalhes de compra
    setTimeout(() => {
        testPurchaseDetailLoading();
    }, 2000);
    
    // 4. Verificar estilos dos card-headers
    setTimeout(() => {
        testCardHeaderStyles();
    }, 3000);
}

function checkDetailSections() {
    console.log('📋 Verificando seções de detalhes...');
    
    const saleDetailSection = document.getElementById('saleDetailSection');
    const purchaseDetailSection = document.getElementById('purchaseDetailSection');
    
    console.log(`  - saleDetailSection: ${saleDetailSection ? 'Encontrada' : 'Não encontrada'}`);
    console.log(`  - purchaseDetailSection: ${purchaseDetailSection ? 'Encontrada' : 'Não encontrada'}`);
    
    if (saleDetailSection) {
        console.log(`    - Display: ${saleDetailSection.style.display}`);
        console.log(`    - Classes: ${saleDetailSection.className}`);
    }
    
    if (purchaseDetailSection) {
        console.log(`    - Display: ${purchaseDetailSection.style.display}`);
        console.log(`    - Classes: ${purchaseDetailSection.className}`);
    }
}

function testSaleDetailLoading() {
    console.log('\n📊 Testando carregamento de detalhes de venda...');
    
    // Verificar se a função existe
    if (window.handlers && window.handlers.loadSaleDetail) {
        console.log('  ✅ Função loadSaleDetail encontrada');
        
        // Verificar se há vendas disponíveis para testar
        const salesTable = document.querySelector('#salesSection .table tbody');
        if (salesTable && salesTable.children.length > 0) {
            console.log('  ✅ Tabela de vendas encontrada com dados');
            
            // Encontrar um botão de detalhes
            const detailButton = salesTable.querySelector('.btn-outline-info');
            if (detailButton) {
                console.log('  ✅ Botão de detalhes encontrado');
                console.log('  💡 Clique no botão de detalhes para testar');
            } else {
                console.log('  ❌ Botão de detalhes não encontrado');
            }
        } else {
            console.log('  ⚠️ Tabela de vendas vazia ou não encontrada');
        }
    } else {
        console.log('  ❌ Função loadSaleDetail não encontrada');
    }
}

function testPurchaseDetailLoading() {
    console.log('\n📦 Testando carregamento de detalhes de compra...');
    
    // Verificar se a função existe
    if (window.handlers && window.handlers.loadPurchaseDetail) {
        console.log('  ✅ Função loadPurchaseDetail encontrada');
        
        // Verificar se há compras disponíveis para testar
        const purchasesTable = document.querySelector('#purchasesSection .table tbody');
        if (purchasesTable && purchasesTable.children.length > 0) {
            console.log('  ✅ Tabela de compras encontrada com dados');
            
            // Encontrar um botão de detalhes
            const detailButton = purchasesTable.querySelector('.btn-outline-info');
            if (detailButton) {
                console.log('  ✅ Botão de detalhes encontrado');
                console.log('  💡 Clique no botão de detalhes para testar');
            } else {
                console.log('  ❌ Botão de detalhes não encontrado');
            }
        } else {
            console.log('  ⚠️ Tabela de compras vazia ou não encontrada');
        }
    } else {
        console.log('  ❌ Função loadPurchaseDetail não encontrada');
    }
}

function testCardHeaderStyles() {
    console.log('\n🎨 Testando estilos dos card-headers...');
    
    // Verificar se há seções de detalhes ativas
    const saleDetailSection = document.getElementById('saleDetailSection');
    const purchaseDetailSection = document.getElementById('purchaseDetailSection');
    
    if (saleDetailSection && saleDetailSection.style.display !== 'none') {
        console.log('  📊 Verificando card-headers da seção de venda...');
        
        const cardHeaders = saleDetailSection.querySelectorAll('.card-header');
        cardHeaders.forEach((header, index) => {
            const hasBgPrimary = header.classList.contains('bg-primary');
            const hasTextWhite = header.classList.contains('text-white');
            const title = header.querySelector('h4, h5');
            const titleHasTextWhite = title && title.classList.contains('text-white');
            
            console.log(`    Card ${index + 1}:`);
            console.log(`      - bg-primary: ${hasBgPrimary}`);
            console.log(`      - text-white: ${hasTextWhite}`);
            console.log(`      - título com text-white: ${titleHasTextWhite}`);
            
            if (hasBgPrimary && hasTextWhite && titleHasTextWhite) {
                console.log(`      ✅ Estilo correto`);
            } else {
                console.log(`      ❌ Estilo incorreto`);
            }
        });
    }
    
    if (purchaseDetailSection && purchaseDetailSection.style.display !== 'none') {
        console.log('  📦 Verificando card-headers da seção de compra...');
        
        const cardHeaders = purchaseDetailSection.querySelectorAll('.card-header');
        cardHeaders.forEach((header, index) => {
            const hasBgPrimary = header.classList.contains('bg-primary');
            const hasTextWhite = header.classList.contains('text-white');
            const title = header.querySelector('h4, h5');
            const titleHasTextWhite = title && title.classList.contains('text-white');
            
            console.log(`    Card ${index + 1}:`);
            console.log(`      - bg-primary: ${hasBgPrimary}`);
            console.log(`      - text-white: ${hasTextWhite}`);
            console.log(`      - título com text-white: ${titleHasTextWhite}`);
            
            if (hasBgPrimary && hasTextWhite && titleHasTextWhite) {
                console.log(`      ✅ Estilo correto`);
            } else {
                console.log(`      ❌ Estilo incorreto`);
            }
        });
    }
    
    if (!saleDetailSection && !purchaseDetailSection) {
        console.log('  ⚠️ Nenhuma seção de detalhes ativa encontrada');
        console.log('  💡 Navegue para uma seção de detalhes para testar os estilos');
    }
}

function forceCreateDetailSections() {
    console.log('\n🔧 Forçando criação das seções de detalhes...');
    
    // Criar seção de detalhes de venda se não existir
    if (!document.getElementById('saleDetailSection')) {
        const saleSection = document.createElement('section');
        saleSection.id = 'saleDetailSection';
        saleSection.className = 'content-section';
        saleSection.style.display = 'none';
        document.body.appendChild(saleSection);
        console.log('  ✅ Seção saleDetailSection criada');
    }
    
    // Criar seção de detalhes de compra se não existir
    if (!document.getElementById('purchaseDetailSection')) {
        const purchaseSection = document.createElement('section');
        purchaseSection.id = 'purchaseDetailSection';
        purchaseSection.className = 'content-section';
        purchaseSection.style.display = 'none';
        document.body.appendChild(purchaseSection);
        console.log('  ✅ Seção purchaseDetailSection criada');
    }
}

function simulateDetailLoading() {
    console.log('\n🎭 Simulando carregamento de detalhes...');
    
    // Simular dados de venda
    const mockSale = {
        id: 999,
        client: { nome: 'Cliente Teste' },
        valorTotal: 1000,
        valorPago: 500,
        saleProducts: [
            { Product: { nome: 'Produto Teste' }, quantidade: 1, precoUnitario: 1000 }
        ],
        payments: [
            { valor: 500, dataPagamento: new Date(), formaPagamento: 'Dinheiro', parcelas: 1 }
        ]
    };
    
    // Simular dados de compra
    const mockPurchase = {
        id: 888,
        supplier: { nome: 'Fornecedor Teste' },
        dataCompra: new Date(),
        valorTotal: 800,
        status: 'Concluída',
        observacoes: 'Teste',
        purchaseProducts: [
            { product: { nome: 'Produto Teste' }, quantidade: 1, precoCustoUnitario: 800 }
        ]
    };
    
    // Testar renderização
    if (window.ui && window.ui.renderSaleDetail) {
        console.log('  📊 Testando renderSaleDetail...');
        window.ui.renderSaleDetail(mockSale);
        console.log('  ✅ renderSaleDetail executada');
    }
    
    if (window.ui && window.ui.renderPurchaseDetail) {
        console.log('  📦 Testando renderPurchaseDetail...');
        window.ui.renderPurchaseDetail(mockPurchase);
        console.log('  ✅ renderPurchaseDetail executada');
    }
}

// Exportar funções
window.testDetailFixes = testDetailFixes;
window.forceCreateDetailSections = forceCreateDetailSections;
window.simulateDetailLoading = simulateDetailLoading;

// Executar teste automático se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('test=detail-fixes')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testDetailFixes, 1000);
    });
}

console.log('✅ Script de teste dos detalhes carregado!');
console.log('💡 Use testDetailFixes() para executar teste completo');
console.log('💡 Use forceCreateDetailSections() para criar seções');
console.log('💡 Use simulateDetailLoading() para simular carregamento'); 