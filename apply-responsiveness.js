// Script para aplicar responsividade completa ao sistema
console.log('📱 Aplicando responsividade completa...');

// Função para aplicar responsividade
function applyResponsiveness() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    console.log(`📐 Tela: ${screenWidth}x${screenHeight}`);
    
    // Aplicar classes responsivas baseadas no tamanho da tela
    if (screenWidth <= 480px) {
        document.body.classList.add('xs-screen');
        console.log('📱 Tela extra pequena detectada');
    } else if (screenWidth <= 576px) {
        document.body.classList.add('sm-screen');
        console.log('📱 Tela pequena detectada');
    } else if (screenWidth <= 768px) {
        document.body.classList.add('md-screen');
        console.log('📱 Tela média detectada');
    } else if (screenWidth <= 992px) {
        document.body.classList.add('lg-screen');
        console.log('📱 Tela grande detectada');
    } else if (screenWidth <= 1200px) {
        document.body.classList.add('xl-screen');
        console.log('📱 Tela extra grande detectada');
    } else {
        document.body.classList.add('xxl-screen');
        console.log('📱 Tela muito grande detectada');
    }
    
    // Ajustar sidebar baseado no tamanho da tela
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        if (screenWidth <= 768px) {
            sidebar.style.transform = 'translateX(-100%)';
            mainContent.style.marginLeft = '0';
            mainContent.style.width = '100%';
        } else if (screenWidth <= 992px) {
            sidebar.style.width = '200px';
            mainContent.style.marginLeft = '200px';
        } else if (screenWidth <= 1200px) {
            sidebar.style.width = '250px';
            mainContent.style.marginLeft = '250px';
        } else {
            sidebar.style.width = '280px';
            mainContent.style.marginLeft = '280px';
        }
    }
    
    // Ajustar modais baseado no tamanho da tela
    const modals = ['purchaseModal', 'saleModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalDialog = modal.querySelector('.modal-dialog');
            const modalBody = modal.querySelector('.modal-body');
            
            if (modalDialog && modalBody) {
                if (screenWidth <= 576px) {
                    modalDialog.style.maxWidth = '100%';
                    modalDialog.style.width = '100%';
                    modalDialog.style.margin = '0';
                    modalDialog.style.height = '100vh';
                    modalDialog.style.maxHeight = '100vh';
                    modalBody.style.height = 'calc(100vh - 120px)';
                    modalBody.style.overflowY = 'auto';
                } else if (screenWidth <= 768px) {
                    modalDialog.style.maxWidth = '98%';
                    modalDialog.style.width = '98%';
                    modalDialog.style.margin = '0.25rem auto';
                } else if (screenWidth <= 992px) {
                    modalDialog.style.maxWidth = '95%';
                    modalDialog.style.width = '95%';
                    modalDialog.style.margin = '0.5rem auto';
                } else if (screenWidth <= 1200px) {
                    modalDialog.style.maxWidth = '90%';
                    modalDialog.style.width = '90%';
                    modalDialog.style.margin = '1rem auto';
                }
            }
        }
    });
    
    // Ajustar tabelas baseado no tamanho da tela
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (thead && tbody) {
            if (screenWidth <= 576px) {
                // Ocultar colunas menos importantes
                const headers = thead.querySelectorAll('th');
                const rows = tbody.querySelectorAll('tr');
                
                headers.forEach((header, index) => {
                    if (index >= 3) { // Manter apenas ID, Nome e Ações
                        header.style.display = 'none';
                        rows.forEach(row => {
                            const cell = row.querySelectorAll('td')[index];
                            if (cell) cell.style.display = 'none';
                        });
                    }
                });
            } else if (screenWidth <= 768px) {
                // Ocultar algumas colunas
                const headers = thead.querySelectorAll('th');
                const rows = tbody.querySelectorAll('tr');
                
                headers.forEach((header, index) => {
                    if (index >= 4) { // Manter ID, Nome, Email e Ações
                        header.style.display = 'none';
                        rows.forEach(row => {
                            const cell = row.querySelectorAll('td')[index];
                            if (cell) cell.style.display = 'none';
                        });
                    }
                });
            }
        }
    });
    
    // Ajustar botões baseado no tamanho da tela
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (screenWidth <= 576px) {
            button.style.fontSize = '0.8rem';
            button.style.padding = '0.5rem 0.75rem';
            button.style.height = '40px';
        } else if (screenWidth <= 768px) {
            button.style.fontSize = '0.85rem';
            button.style.padding = '0.5rem 0.75rem';
        }
    });
    
    // Ajustar campos de formulário
    const formControls = document.querySelectorAll('.form-control, .form-select');
    formControls.forEach(control => {
        if (screenWidth <= 576px) {
            control.style.fontSize = '0.8rem';
            control.style.padding = '0.5rem';
            control.style.height = '40px';
        } else if (screenWidth <= 768px) {
            control.style.fontSize = '0.85rem';
            control.style.padding = '0.5rem';
        }
    });
    
    // Ajustar labels
    const labels = document.querySelectorAll('.form-label');
    labels.forEach(label => {
        if (screenWidth <= 576px) {
            label.style.fontSize = '0.8rem';
            label.style.marginBottom = '0.25rem';
        } else if (screenWidth <= 768px) {
            label.style.fontSize = '0.85rem';
            label.style.marginBottom = '0.25rem';
        }
    });
    
    console.log('✅ Responsividade aplicada com sucesso!');
}

// Aplicar imediatamente
applyResponsiveness();

// Aplicar quando a janela redimensionar
window.addEventListener('resize', function() {
    setTimeout(applyResponsiveness, 100);
});

// Aplicar quando a orientação mudar
window.addEventListener('orientationchange', function() {
    setTimeout(applyResponsiveness, 500);
});

// Aplicar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyResponsiveness, 100);
});

// Aplicar quando modais forem abertos
document.addEventListener('shown.bs.modal', function(event) {
    setTimeout(applyResponsiveness, 100);
});

// Aplicar periodicamente para garantir
setInterval(applyResponsiveness, 5000);

console.log('📱 Responsividade completa aplicada!');
console.log('🎯 Sistema agora é totalmente responsivo!'); 