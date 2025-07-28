// Script para corrigir o layout do botão Adicionar
console.log('🔧 Corrigindo layout do botão Adicionar...');

// Aplicar estilos específicos para o layout
const layoutStyle = document.createElement('style');
layoutStyle.textContent = `
    /* CORREÇÕES DE LAYOUT DO BOTÃO */
    
    /* 1. Corrigir coluna do botão */
    #purchaseModal .row .col-md-2:last-child {
        min-width: 140px !important;
        flex: 0 0 auto !important;
        width: auto !important;
    }
    
    /* 2. Corrigir botão dentro da coluna */
    #purchaseModal .row .col-md-2:last-child .btn {
        width: 100% !important;
        min-width: 120px !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        font-size: 14px !important;
        padding: 8px 16px !important;
    }
    
    /* 3. Ajustar outras colunas */
    #purchaseModal .row .col-md-3 {
        flex: 1 !important;
        min-width: 0 !important;
    }
    
    #purchaseModal .row .col-md-2:not(:last-child) {
        flex: 0 0 auto !important;
        min-width: 80px !important;
    }
    
    /* 4. Garantir que a linha não quebre */
    #purchaseModal .row {
        flex-wrap: nowrap !important;
        align-items: end !important;
        gap: 10px !important;
    }
    
    /* 5. Responsividade */
    @media (max-width: 768px) {
        #purchaseModal .row {
            flex-wrap: wrap !important;
        }
        
        #purchaseModal .row .col-md-2:last-child {
            min-width: 100% !important;
            margin-top: 10px !important;
        }
        
        #purchaseModal .row .col-md-2:last-child .btn {
            width: 100% !important;
        }
    }
`;

document.head.appendChild(layoutStyle);
console.log('✅ Estilos de layout aplicados');

// Aplicar estilos diretamente ao botão se existir
setTimeout(() => {
    const addButton = document.getElementById('btnAddPurchaseProduct');
    if (addButton) {
        // Aplicar estilos ao botão
        addButton.style.whiteSpace = 'nowrap';
        addButton.style.wordBreak = 'keep-all';
        addButton.style.minWidth = '120px';
        addButton.style.fontSize = '14px';
        addButton.style.padding = '8px 16px';
        
        // Aplicar estilos à coluna pai
        const buttonColumn = addButton.closest('.col-md-2');
        if (buttonColumn) {
            buttonColumn.style.minWidth = '140px';
            buttonColumn.style.flex = '0 0 auto';
            buttonColumn.style.width = 'auto';
        }
        
        // Aplicar estilos à linha pai
        const buttonRow = addButton.closest('.row');
        if (buttonRow) {
            buttonRow.style.flexWrap = 'nowrap';
            buttonRow.style.alignItems = 'end';
            buttonRow.style.gap = '10px';
        }
        
        console.log('✅ Estilos aplicados diretamente ao botão e layout');
    } else {
        console.log('⚠️ Botão não encontrado');
    }
}, 500);

console.log('✅ Correções de layout aplicadas!');
console.log('🎯 Agora o botão não deve quebrar na caixa'); 