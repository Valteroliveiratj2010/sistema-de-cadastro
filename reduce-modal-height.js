// Script para reduzir altura dos modais de compra e venda
console.log('🔧 Reduzindo altura dos modais...');

// Aplicar estilos para reduzir altura
const heightStyle = document.createElement('style');
heightStyle.textContent = `
    /* REDUÇÃO DE ALTURA DOS MODAIS */
    
    /* 1. Modal body - reduzir padding */
    .modal-body {
        padding: 15px !important;
    }
    
    /* 2. Modal dialog - reduzir margens e altura */
    .modal-dialog {
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        max-height: 80vh !important;
    }
    
    /* 3. Específico para modais de compra e venda */
    #purchaseModal .modal-body,
    #saleModal .modal-body {
        padding: 15px !important;
    }
    
    #purchaseModal .modal-dialog,
    #saleModal .modal-dialog {
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        max-height: 75vh !important;
    }
    
    /* 4. Reduzir espaçamentos internos */
    #purchaseModal .mb-3,
    #saleModal .mb-3 {
        margin-bottom: 0.75rem !important;
    }
    
    #purchaseModal .card,
    #saleModal .card {
        margin-bottom: 0.75rem !important;
    }
    
    #purchaseModal .card-body,
    #saleModal .card-body {
        padding: 0.75rem !important;
    }
    
    #purchaseModal .card-header,
    #saleModal .card-header {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.9rem !important;
    }
    
    /* 5. Reduzir altura das listas de produtos */
    #purchaseProductsList,
    #saleProductsList {
        max-height: 100px !important;
        overflow-y: auto !important;
        margin-bottom: 0.5rem !important;
    }
    
    /* 6. Reduzir espaçamento dos campos */
    #purchaseModal .form-label,
    #saleModal .form-label {
        margin-bottom: 0.25rem !important;
        font-size: 0.85rem !important;
    }
    
    #purchaseModal .form-control,
    #purchaseModal .form-select,
    #saleModal .form-control,
    #saleModal .form-select {
        padding: 0.375rem 0.5rem !important;
        font-size: 0.85rem !important;
        height: auto !important;
    }
    
    /* 7. Reduzir altura do textarea */
    #purchaseModal textarea,
    #saleModal textarea {
        min-height: 60px !important;
    }
    
    /* 8. Responsividade */
    @media (max-height: 700px) {
        .modal-dialog {
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
            max-height: 95vh !important;
        }
        
        .modal-body {
            padding: 10px !important;
        }
        
        #purchaseProductsList,
        #saleProductsList {
            max-height: 80px !important;
        }
    }
    
    @media (max-width: 768px) {
        #purchaseModal .modal-dialog,
        #saleModal .modal-dialog {
            max-height: 90vh !important;
            margin: 0.25rem auto !important;
        }
    }
`;

document.head.appendChild(heightStyle);
console.log('✅ Estilos de redução de altura aplicados');

// Função para aplicar reduções diretamente aos elementos
function reduceModalHeight() {
    const modals = ['purchaseModal', 'saleModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Modal body
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.padding = '15px';
            }
            
            // Modal dialog
            const modalDialog = modal.querySelector('.modal-dialog');
            if (modalDialog) {
                modalDialog.style.marginTop = '1rem';
                modalDialog.style.marginBottom = '1rem';
                modalDialog.style.maxHeight = '75vh';
            }
            
            // Cards
            const cards = modal.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.marginBottom = '0.75rem';
            });
            
            // Card bodies
            const cardBodies = modal.querySelectorAll('.card-body');
            cardBodies.forEach(cardBody => {
                cardBody.style.padding = '0.75rem';
            });
            
            // Card headers
            const cardHeaders = modal.querySelectorAll('.card-header');
            cardHeaders.forEach(cardHeader => {
                cardHeader.style.padding = '0.5rem 0.75rem';
                cardHeader.style.fontSize = '0.9rem';
            });
            
            // Listas de produtos
            const productLists = modal.querySelectorAll('#purchaseProductsList, #saleProductsList');
            productLists.forEach(list => {
                list.style.maxHeight = '100px';
                list.style.overflowY = 'auto';
                list.style.marginBottom = '0.5rem';
            });
            
            // Labels
            const labels = modal.querySelectorAll('.form-label');
            labels.forEach(label => {
                label.style.marginBottom = '0.25rem';
                label.style.fontSize = '0.85rem';
            });
            
            // Inputs
            const inputs = modal.querySelectorAll('.form-control, .form-select');
            inputs.forEach(input => {
                input.style.padding = '0.375rem 0.5rem';
                input.style.fontSize = '0.85rem';
                input.style.height = 'auto';
            });
            
            // Textareas
            const textareas = modal.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.style.minHeight = '60px';
            });
            
            // Margins
            const mb3Elements = modal.querySelectorAll('.mb-3');
            mb3Elements.forEach(element => {
                element.style.marginBottom = '0.75rem';
            });
            
            console.log(`✅ Altura reduzida do modal: ${modalId}`);
        }
    });
}

// Aplicar imediatamente
reduceModalHeight();

// Aplicar quando modais forem abertos
document.addEventListener('shown.bs.modal', function(event) {
    setTimeout(reduceModalHeight, 100);
});

// Aplicar periodicamente para garantir
setInterval(reduceModalHeight, 2000);

console.log('✅ Reduções de altura aplicadas!');
console.log('🎯 Agora os modais devem ser mais compactos e sem scroll'); 