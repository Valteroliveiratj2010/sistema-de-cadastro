// fix-logout.js - Correção específica para o logout
console.log('🔧 FIX LOGOUT - Iniciando correção...');

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, procurando botão de logout...');
    
    // Procurar o botão de logout
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        console.log('✅ Botão de logout encontrado:', logoutButton);
        
        // Remover eventos existentes (se houver)
        logoutButton.replaceWith(logoutButton.cloneNode(true));
        
        // Pegar a nova referência
        const newLogoutButton = document.getElementById('logoutButton');
        
        // Adicionar novo evento de logout
        newLogoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚪 LOGOUT CLICADO!');
            
            // Mostrar confirmação
            if (confirm('Tem certeza que deseja sair?')) {
                console.log('Logout confirmado, limpando dados...');
                
                // Limpar localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                
                console.log('localStorage limpo. Redirecionando...');
                
                // Mostrar mensagem
                alert('Logout realizado com sucesso!');
                
                // Redirecionar
                window.location.href = 'login.html';
            } else {
                console.log('Logout cancelado pelo usuário');
            }
        });
        
        console.log('✅ Evento de logout corrigido e adicionado');
        
        // Adicionar estilo visual para indicar que está funcionando
        newLogoutButton.style.backgroundColor = '#dc3545';
        newLogoutButton.style.borderColor = '#dc3545';
        newLogoutButton.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>🚪 Sair (Corrigido)';
        
    } else {
        console.log('❌ Botão de logout NÃO encontrado');
        
        // Criar um botão de logout alternativo
        const sidebar = document.querySelector('.sidebar nav');
        if (sidebar) {
            const altLogoutButton = document.createElement('a');
            altLogoutButton.href = '#';
            altLogoutButton.className = 'nav-link mt-auto';
            altLogoutButton.id = 'altLogoutButton';
            altLogoutButton.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>🚪 Sair (Alt)';
            altLogoutButton.style.backgroundColor = '#dc3545';
            altLogoutButton.style.color = 'white';
            altLogoutButton.style.borderRadius = '5px';
            altLogoutButton.style.margin = '10px';
            
            altLogoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🚪 LOGOUT ALTERNATIVO CLICADO!');
                
                if (confirm('Tem certeza que deseja sair?')) {
                    localStorage.clear();
                    alert('Logout realizado!');
                    window.location.href = 'login.html';
                }
            });
            
            sidebar.appendChild(altLogoutButton);
            console.log('✅ Botão de logout alternativo criado');
        }
    }
});

// Função global para logout
window.forceLogout = function() {
    console.log('Forçando logout...');
    localStorage.clear();
    alert('Logout forçado realizado!');
    window.location.href = 'login.html';
};

console.log('🔧 FIX LOGOUT - Script carregado. Use window.forceLogout() no console se necessário.'); 