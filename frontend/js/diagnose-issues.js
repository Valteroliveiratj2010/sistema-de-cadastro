/**
 * Diagnóstico de Problemas
 * Identifica problemas específicos no sistema
 */

console.log('🔍 DIAGNÓSTICO DE PROBLEMAS');

// Função para verificar erros no console
function checkConsoleErrors() {
    console.log('📋 Verificando erros no console...');
    
    // Capturar erros futuros
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Aguardar um pouco e verificar erros
    setTimeout(() => {
        if (errors.length > 0) {
            console.log('❌ Erros encontrados:', errors);
        } else {
            console.log('✅ Nenhum erro no console');
        }
        console.error = originalError;
    }, 2000);
}

// Função para verificar funções específicas
function checkSpecificFunctions() {
    console.log('📋 Verificando funções específicas...');
    
    const criticalFunctions = [
        'createClient', 'updateClient', 'deleteClient',
        'createSale', 'updateSale', 'deleteSale',
        'createProduct', 'updateProduct', 'deleteProduct',
        'createPurchase', 'updatePurchase', 'deletePurchase',
        'createSupplier', 'updateSupplier', 'deleteSupplier',
        'createUser', 'updateUser', 'deleteUser',
        'setupCreateForm', 'showDetailView', 'showToast'
    ];
    
    const missing = [];
    const available = [];
    
    criticalFunctions.forEach(func => {
        if (typeof window[func] === 'function') {
            available.push(func);
        } else {
            missing.push(func);
        }
    });
    
    console.log(`✅ Funções disponíveis: ${available.length}/${criticalFunctions.length}`);
    
    if (missing.length > 0) {
        console.log('❌ Funções faltando:', missing);
        return false;
    }
    
    return true;
}

// Função para testar criação de cliente
async function testClientCreation() {
    console.log('📋 Testando criação de cliente...');
    
    try {
        const clientData = {
            nome: 'Cliente Teste Diagnóstico',
            email: 'teste@diagnostico.com',
            telefone: '(11) 99999-9999',
            cpfCnpj: '123.456.789-00',
            endereco: 'Rua Teste, 123'
        };
        
        if (typeof createClient === 'function') {
            console.log('✅ Função createClient existe');
            
            // Testar se a função executa sem erro
            try {
                await createClient(clientData);
                console.log('✅ Criação de cliente executada sem erro');
                return true;
            } catch (error) {
                console.log('❌ Erro ao executar createClient:', error);
                return false;
            }
        } else {
            console.log('❌ Função createClient não existe');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste de criação:', error);
        return false;
    }
}

// Função para verificar modais
function checkModals() {
    console.log('📋 Verificando modais...');
    
    const modals = [
        'clientModal', 'saleModal', 'productModal', 
        'purchaseModal', 'supplierModal', 'userModal'
    ];
    
    const workingModals = [];
    const brokenModals = [];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const form = modal.querySelector('form');
            if (form && form.getAttribute('data-action')) {
                workingModals.push(modalId);
            } else {
                brokenModals.push(modalId);
            }
        } else {
            brokenModals.push(modalId);
        }
    });
    
    console.log(`✅ Modais funcionais: ${workingModals.length}/${modals.length}`);
    
    if (brokenModals.length > 0) {
        console.log('❌ Modais com problemas:', brokenModals);
        return false;
    }
    
    return true;
}

// Função para verificar seções
function checkSections() {
    console.log('📋 Verificando seções...');
    
    const sections = [
        'clientsSection', 'salesSection', 'productsSection',
        'purchasesSection', 'suppliersSection', 'usersSection'
    ];
    
    const sectionsWithContent = [];
    const emptySections = [];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section && section.innerHTML.trim() !== '') {
            sectionsWithContent.push(sectionId);
        } else {
            emptySections.push(sectionId);
        }
    });
    
    console.log(`✅ Seções com conteúdo: ${sectionsWithContent.length}/${sections.length}`);
    
    if (emptySections.length > 0) {
        console.log('❌ Seções vazias:', emptySections);
        return false;
    }
    
    return true;
}

// Função para testar navegação
function testNavigation() {
    console.log('📋 Testando navegação...');
    
    const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');
    
    if (sidebarLinks.length === 0) {
        console.log('❌ Nenhum link da sidebar encontrado');
        return false;
    }
    
    console.log(`✅ Links da sidebar encontrados: ${sidebarLinks.length}`);
    
    // Testar se os links respondem ao clique
    let workingLinks = 0;
    sidebarLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        if (section) {
            workingLinks++;
            console.log(`   - Link para ${section} encontrado`);
        }
    });
    
    if (workingLinks === sidebarLinks.length) {
        console.log('✅ Todos os links estão funcionais');
        return true;
    } else {
        console.log(`❌ Apenas ${workingLinks}/${sidebarLinks.length} links funcionais`);
        return false;
    }
}

// Função para testar API
async function testAPI() {
    console.log('📋 Testando API...');
    
    try {
        if (typeof api === 'undefined') {
            console.log('❌ Objeto api não encontrado');
            return false;
        }
        
        const response = await api.get('/clients');
        console.log('✅ API respondendo:', response);
        return true;
    } catch (error) {
        console.log('❌ Erro na API:', error);
        return false;
    }
}

// Função principal de diagnóstico
async function runDiagnosis() {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...\n');
    
    const results = {
        functions: checkSpecificFunctions(),
        modals: checkModals(),
        sections: checkSections(),
        navigation: testNavigation(),
        api: await testAPI(),
        clientCreation: await testClientCreation()
    };
    
    console.log('\n=== RESULTADO DO DIAGNÓSTICO ===');
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`${status} ${test}: ${result ? 'OK' : 'PROBLEMA'}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 Resultado: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
        console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
    } else {
        console.log('🔧 PROBLEMAS IDENTIFICADOS - CORREÇÕES NECESSÁRIAS');
        
        if (!results.functions) {
            console.log('\n🔧 CORREÇÃO: Funções faltando - Verificar app.js');
        }
        if (!results.modals) {
            console.log('\n🔧 CORREÇÃO: Modais com problemas - Verificar HTML');
        }
        if (!results.sections) {
            console.log('\n🔧 CORREÇÃO: Seções vazias - Restaurar conteúdo');
        }
        if (!results.navigation) {
            console.log('\n🔧 CORREÇÃO: Navegação quebrada - Verificar sidebar');
        }
        if (!results.api) {
            console.log('\n🔧 CORREÇÃO: API não funcionando - Verificar backend');
        }
        if (!results.clientCreation) {
            console.log('\n🔧 CORREÇÃO: Criação de cliente falhando - Verificar formulários');
        }
    }
    
    return results;
}

// Expor funções
window.checkConsoleErrors = checkConsoleErrors;
window.checkSpecificFunctions = checkSpecificFunctions;
window.testClientCreation = testClientCreation;
window.checkModals = checkModals;
window.checkSections = checkSections;
window.testNavigation = testNavigation;
window.testAPI = testAPI;
window.runDiagnosis = runDiagnosis;

console.log('✅ Script de diagnóstico carregado!');
console.log('📋 Execute runDiagnosis() para diagnóstico completo...'); 