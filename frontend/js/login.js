// login.js - Lógica de login do frontend
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    // Verificar se já existe um token (mas não redirecionar automaticamente)
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
        messageDiv.innerHTML = '<div class="alert alert-info">Você já está logado. Clique em "Limpar Sessão" para fazer login novamente.</div>';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Entrando...';
        messageDiv.innerHTML = '';
        
        try {
            // Usar a URL da API configurada
            const API_BASE_URL_FINAL = window.API_BASE_URL || 'https://sistema-de-cadastro-backend.onrender.com/api';
            
            const response = await fetch(`${API_BASE_URL_FINAL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            console.log('Resposta da API:', data); // Debug
            
            if (response.ok) {
                // Login bem-sucedido
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    console.warn('API não retornou dados do usuário');
                    // Criar dados básicos do usuário a partir do token
                    try {
                        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
                        const userData = {
                            id: tokenPayload.id,
                            username: tokenPayload.username,
                            role: tokenPayload.role
                        };
                        localStorage.setItem('user', JSON.stringify(userData));
                    } catch (error) {
                        console.error('Erro ao decodificar token:', error);
                    }
                }
                
                messageDiv.innerHTML = '<div class="alert alert-success">Login realizado com sucesso! Redirecionando...</div>';
                
                // Redirecionar para o dashboard após 1 segundo
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Erro no login
                let errorMessage = 'Erro no login';
                
                if (response.status === 401) {
                    errorMessage = 'Usuário ou senha incorretos';
                } else if (response.status === 404) {
                    errorMessage = 'Serviço não encontrado';
                } else if (response.status === 500) {
                    errorMessage = 'Erro interno do servidor';
                } else if (data.message) {
                    errorMessage = data.message;
                }
                
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            messageDiv.innerHTML = '<div class="alert alert-danger">Erro de conexão. Verifique sua internet e tente novamente.</div>';
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Entrar';
        }
    });
    
    // Limpar mensagens quando o usuário digitar
    document.getElementById('username').addEventListener('input', function() {
        messageDiv.innerHTML = '';
    });
    
    document.getElementById('password').addEventListener('input', function() {
        messageDiv.innerHTML = '';
    });
});
