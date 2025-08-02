// Configuração da API - Detecta automaticamente ambiente local vs produção
// Versão: 2025-08-02 - Corrigido para Railway
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '';

if (isLocalhost) {
    // Desenvolvimento local
    window.API_BASE_URL = 'http://localhost:3000/api';
    console.log('🌐 Ambiente: DESENVOLVIMENTO LOCAL');
} else {
    // Produção (Railway)
    window.API_BASE_URL = 'https://sistema-de-cadastro-production.up.railway.app/api';
    console.log('🌐 Ambiente: PRODUÇÃO');
}

console.log('🔗 API URL:', window.API_BASE_URL);
