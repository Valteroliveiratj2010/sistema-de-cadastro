// Script para executar no console do navegador
console.log('🔍 Iniciando debug da seção purchaseDetailSection...');

// 1. Verificar se a seção existe
let section = document.getElementById('purchaseDetailSection');
console.log('1. Seção encontrada:', section);

// 2. Remover seção anterior se existir
if (section) {
    section.remove();
    console.log('2. Seção anterior removida');
}

// 3. Criar nova seção com estilos agressivos
section = document.createElement('div');
section.id = 'purchaseDetailSection';
section.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: yellow !important;
    z-index: 99999 !important;
    overflow-y: auto !important;
    padding: 20px !important;
    border: 5px solid red !important;
    font-size: 16px !important;
    color: black !important;
`;

// 4. Adicionar conteúdo de teste
section.innerHTML = `
    <h1 style="color: red; font-size: 24px;">TESTE - SEÇÃO DE DETALHES DA COMPRA</h1>
    <p>Se você vê esta mensagem, a seção está funcionando!</p>
    <p>Fornecedor: Fornecedor Teste</p>
    <p>Data: 2025-07-28</p>
    <p>Valor: R$ 1.000,00</p>
    <button onclick="this.parentElement.remove()" style="padding: 10px; background: red; color: white; border: none; cursor: pointer;">FECHAR</button>
`;

// 5. Adicionar ao body
document.body.appendChild(section);

// 6. Verificar se foi adicionada
console.log('3. Nova seção criada:', section);
console.log('4. Seção no DOM:', document.getElementById('purchaseDetailSection'));
console.log('5. Estilos aplicados:', section.style.cssText);

// 7. Forçar recálculo
section.offsetHeight;

console.log('6. Dimensões finais:');
console.log('   - OffsetWidth:', section.offsetWidth);
console.log('   - OffsetHeight:', section.offsetHeight);
console.log('   - ClientWidth:', section.clientWidth);
console.log('   - ClientHeight:', section.clientHeight);

console.log('✅ Debug concluído! Se você vê uma caixa amarela com borda vermelha, a seção está funcionando.'); 