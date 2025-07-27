// Script de Debug para Modal de Venda
console.log('🔍 Iniciando debug do modal de venda...');

// Função para verificar se os dados estão sendo carregados
async function debugSaleModal() {
    console.log('=== DEBUG MODAL DE VENDA ===');
    
    try {
        // Verificar se a API está funcionando
        console.log('📡 Testando API de clientes...');
        const clientsResponse = await fetch('https://sistema-de-cadastro-backend.onrender.com/api/clients?page=1&q=&limit=10', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (clientsResponse.ok) {
            const clientsData = await clientsResponse.json();
            console.log('✅ Clientes carregados:', clientsData);
            console.log('📊 Número de clientes:', clientsData.data ? clientsData.data.length : 0);
        } else {
            console.log('❌ Erro ao carregar clientes:', clientsResponse.status, clientsResponse.statusText);
        }
        
        // Verificar produtos
        console.log('📡 Testando API de produtos...');
        const productsResponse = await fetch('https://sistema-de-cadastro-backend.onrender.com/api/products?page=1&q=&limit=10', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log('✅ Produtos carregados:', productsData);
            console.log('📊 Número de produtos:', productsData.data ? productsData.data.length : 0);
        } else {
            console.log('❌ Erro ao carregar produtos:', productsResponse.status, productsResponse.statusText);
        }
        
        // Verificar elementos do DOM
        console.log('🔍 Verificando elementos do DOM...');
        const saleClient = document.getElementById('saleClient');
        const productSelect = document.getElementById('productSelect');
        
        console.log('  • saleClient existe:', !!saleClient);
        console.log('  • productSelect existe:', !!productSelect);
        
        if (saleClient) {
            console.log('  • saleClient options:', saleClient.options.length);
            console.log('  • saleClient value:', saleClient.value);
        }
        
        if (productSelect) {
            console.log('  • productSelect options:', productSelect.options.length);
            console.log('  • productSelect value:', productSelect.value);
        }
        
        // Verificar se Select2 está inicializado
        if (typeof $ !== 'undefined') {
            const saleClientSelect2 = $('#saleClient');
            const productSelectSelect2 = $('#productSelect');
            
            console.log('  • saleClient Select2 inicializado:', saleClientSelect2.hasClass('select2-hidden-accessible'));
            console.log('  • productSelect Select2 inicializado:', productSelectSelect2.hasClass('select2-hidden-accessible'));
            
            if (saleClientSelect2.hasClass('select2-hidden-accessible')) {
                console.log('  • saleClient Select2 data:', saleClientSelect2.select2('data'));
            }
            
            if (productSelectSelect2.hasClass('select2-hidden-accessible')) {
                console.log('  • productSelect Select2 data:', productSelectSelect2.select2('data'));
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
    }
}

// Função para testar abertura do modal
function testModalOpening() {
    console.log('\n🧪 Testando abertura do modal...');
    
    const saleModal = document.getElementById('saleModal');
    if (saleModal) {
        console.log('📋 Modal de venda encontrado');
        
        // Simular abertura
        const event = new Event('show.bs.modal');
        saleModal.dispatchEvent(event);
        
        // Verificar se o modal tem Bootstrap
        if (typeof bootstrap !== 'undefined') {
            const bsModal = new bootstrap.Modal(saleModal);
            console.log('✅ Bootstrap Modal criado');
        }
    } else {
        console.log('❌ Modal de venda não encontrado');
    }
}

// Função para verificar token
function checkToken() {
    console.log('\n🔑 Verificando token...');
    const token = localStorage.getItem('token');
    console.log('  • Token existe:', !!token);
    if (token) {
        console.log('  • Token length:', token.length);
        console.log('  • Token preview:', token.substring(0, 20) + '...');
    }
}

// Executar debug quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM carregado, executando debug...');
        setTimeout(() => {
            checkToken();
            debugSaleModal();
            testModalOpening();
        }, 2000);
    });
} else {
    console.log('🚀 DOM já carregado, executando debug imediatamente...');
    setTimeout(() => {
        checkToken();
        debugSaleModal();
        testModalOpening();
    }, 2000);
}

// Monitorar quando o modal é aberto
document.addEventListener('DOMContentLoaded', function() {
    const saleModal = document.getElementById('saleModal');
    if (saleModal) {
        saleModal.addEventListener('shown.bs.modal', function() {
            console.log('🎉 Modal de venda foi aberto!');
            setTimeout(debugSaleModal, 1000);
        });
    }
});

console.log('✅ Script de debug carregado. Abra o console e teste o modal de venda.'); 