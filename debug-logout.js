// debug-logout.js - Script para debugar o problema do logout
console.log('🔍 DEBUG LOGOUT - Iniciando...');

// Verificar se o botão existe
const logoutButton = document.getElementById('logoutButton');
console.log('Botão de logout encontrado:', logoutButton);

if (logoutButton) {
    console.log('✅ Botão de logout existe');
    
    // Verificar se o evento está registrado
    const events = logoutButton.onclick;
    console.log('Eventos do botão:', events);
    
    // Adicionar um evento de teste
    logoutButton.addEventListener('click', function(e) {
        console.log('🚪 CLIQUE NO BOTÃO DE LOGOUT DETECTADO!');
        console.log('Evento:', e);
        
        // Verificar localStorage antes
        console.log('localStorage antes do logout:');
        console.log('- token:', localStorage.getItem('token'));
        console.log('- user:', localStorage.getItem('user'));
        console.log('- jwtToken:', localStorage.getItem('jwtToken'));
        
        // Simular logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        
        console.log('localStorage após logout:');
        console.log('- token:', localStorage.getItem('token'));
        console.log('- user:', localStorage.getItem('user'));
        console.log('- jwtToken:', localStorage.getItem('jwtToken'));
        
        alert('Logout realizado! Redirecionando...');
        window.location.href = 'login.html';
    });
    
    console.log('✅ Evento de logout adicionado com sucesso');
} else {
    console.log('❌ Botão de logout NÃO encontrado');
}

// Verificar se utils.logout existe
if (typeof utils !== 'undefined' && utils.logout) {
    console.log('✅ utils.logout existe');
} else {
    console.log('❌ utils.logout NÃO existe');
}

// Verificar localStorage atual
console.log('📊 Status atual do localStorage:');
console.log('- token:', localStorage.getItem('token'));
console.log('- user:', localStorage.getItem('user'));
console.log('- jwtToken:', localStorage.getItem('jwtToken'));
console.log('- userRole:', localStorage.getItem('userRole'));
console.log('- userName:', localStorage.getItem('userName'));
console.log('- userId:', localStorage.getItem('userId')); 