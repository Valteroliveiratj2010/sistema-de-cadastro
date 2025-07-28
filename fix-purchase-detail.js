// Script para corrigir a seção de detalhes da compra
console.log('🔧 Aplicando correções na seção de detalhes da compra...');

// 1. Remover estilos de debug
const section = document.getElementById('purchaseDetailSection');
if (section) {
    // Remover borda vermelha e fundo amarelo
    section.style.border = 'none';
    section.style.backgroundColor = 'white';
    
    // Ajustar posicionamento
    section.style.cssText = `
        position: fixed;
        top: 0;
        left: 280px;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 9999;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    console.log('✅ Estilos de debug removidos e posicionamento corrigido');
}

// 2. Modificar o conteúdo para centralizar e remover ações
const contentDiv = section?.querySelector('.row');
if (contentDiv) {
    // Remover a coluna de ações (col-md-4)
    const actionsColumn = contentDiv.querySelector('.col-md-4');
    if (actionsColumn) {
        actionsColumn.remove();
        console.log('✅ Caixa de ações removida');
    }
    
    // Expandir a coluna principal para ocupar toda a largura
    const mainColumn = contentDiv.querySelector('.col-md-8');
    if (mainColumn) {
        mainColumn.className = 'col-12';
        console.log('✅ Coluna principal expandida');
    }
}

// 3. Adicionar botão de fechar
const breadcrumb = section?.querySelector('.breadcrumb');
if (breadcrumb) {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
    closeButton.className = 'btn btn-outline-secondary btn-sm';
    closeButton.style.cssText = 'position: absolute; top: 20px; right: 20px; z-index: 10000;';
    closeButton.onclick = () => {
        section.remove();
        // Mostrar seção de compras novamente
        const purchasesSection = document.getElementById('purchasesSection');
        if (purchasesSection) {
            purchasesSection.style.display = 'block';
        }
    };
    section.appendChild(closeButton);
    console.log('✅ Botão de fechar adicionado');
}

console.log('✅ Todas as correções aplicadas!'); 