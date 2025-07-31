/**
 * Correção Específica para Submissão de Clientes
 * Resolve o problema do botão travado após submissão
 */

console.log('🔧 APLICANDO CORREÇÃO PARA SUBMISSÃO DE CLIENTES...');

// Função para corrigir o botão de submit
function fixSubmitButton() {
    console.log('🔧 Corrigindo botão de submit...');
    
    const form = document.getElementById('clientForm');
    if (!form) {
        console.log('❌ Formulário não encontrado');
        return false;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.log('❌ Botão de submit não encontrado');
        return false;
    }
    
    // Resetar o botão
    submitBtn.textContent = 'Salvar';
    submitBtn.disabled = false;
    
    console.log('✅ Botão corrigido');
    return true;
}

// Função para resetar o formulário
function resetClientForm() {
    console.log('🔧 Resetando formulário...');
    
    const form = document.getElementById('clientForm');
    if (!form) {
        console.log('❌ Formulário não encontrado');
        return false;
    }
    
    // Resetar o formulário
    form.reset();
    
    // Resetar o botão
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Salvar';
        submitBtn.disabled = false;
    }
    
    console.log('✅ Formulário resetado');
    return true;
}

// Função para adicionar event listener específico
function addSpecificEventListener() {
    console.log('🔧 Adicionando event listener específico...');
    
    const form = document.getElementById('clientForm');
    if (!form) {
        console.log('❌ Formulário não encontrado');
        return false;
    }
    
    // Remover event listeners existentes
    form.removeEventListener('submit', handleFormSubmit);
    
    // Adicionar novo event listener
    form.addEventListener('submit', async (event) => {
        console.log('🎯 Event listener específico acionado!');
        event.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Salvando...';
            submitBtn.disabled = true;
        }
        
        try {
            // Coletar dados do formulário
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                if (value !== '') {
                    data[key] = value;
                }
            }
            
            console.log('📊 Dados coletados:', data);
            
            // Verificar se é criação ou atualização
            const action = form.dataset.action;
            console.log('📋 Ação:', action);
            
            if (action === 'createClient') {
                console.log('📤 Chamando createClient...');
                await createClient(data);
            } else if (action === 'updateClient') {
                console.log('📤 Chamando updateClient...');
                await updateClient(data);
            } else {
                console.log('❌ Ação desconhecida:', action);
            }
            
        } catch (error) {
            console.error('❌ Erro no event listener específico:', error);
            showToast('Erro ao processar formulário', 'error');
        } finally {
            // Resetar o botão
            if (submitBtn) {
                submitBtn.textContent = 'Salvar';
                submitBtn.disabled = false;
            }
        }
    });
    
    console.log('✅ Event listener específico adicionado');
    return true;
}

// Função para verificar se o problema foi resolvido
function testFix() {
    console.log('🧪 Testando correção...');
    
    const form = document.getElementById('clientForm');
    if (!form) {
        console.log('❌ Formulário não encontrado');
        return false;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.log('❌ Botão de submit não encontrado');
        return false;
    }
    
    console.log('✅ Formulário encontrado');
    console.log('✅ Botão encontrado');
    console.log('📋 Texto do botão:', submitBtn.textContent);
    console.log('📋 Botão desabilitado:', submitBtn.disabled);
    
    return true;
}

// Função principal de correção
function applyClientSubmitFix() {
    console.log('🚀 APLICANDO CORREÇÃO COMPLETA...\n');
    
    try {
        // 1. Corrigir botão
        fixSubmitButton();
        
        // 2. Resetar formulário
        resetClientForm();
        
        // 3. Adicionar event listener específico
        addSpecificEventListener();
        
        // 4. Testar correção
        testFix();
        
        console.log('\n✅ CORREÇÃO APLICADA COM SUCESSO!');
        console.log('📋 Agora teste criar um cliente novamente...');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao aplicar correção:', error);
        return false;
    }
}

// Expor funções
window.fixSubmitButton = fixSubmitButton;
window.resetClientForm = resetClientForm;
window.addSpecificEventListener = addSpecificEventListener;
window.testFix = testFix;
window.applyClientSubmitFix = applyClientSubmitFix;

console.log('✅ Script de correção carregado!');
console.log('📋 Execute applyClientSubmitFix() para aplicar a correção...'); 