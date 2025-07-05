// frontend/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    // Função para exibir mensagens na tela
    function showMessage(message, type = 'danger') {
        loginMessage.textContent = message;
        loginMessage.className = `mt-3 text-center text-${type}`; // Altera classe para cor (danger = vermelho, success = verde)
        loginMessage.classList.remove('d-none'); // Torna visível
    }

    // Função para ocultar mensagens
    function hideMessage() {
        loginMessage.classList.add('d-none'); // Oculta
        loginMessage.textContent = '';
    }

    // Event Listener para o envio do formulário
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o comportamento padrão de recarregar a página

        hideMessage(); // Limpa mensagens anteriores

        // --- CORREÇÃO AQUI: Adicionar .trim() para remover espaços em branco ---
        const username = usernameInput.value.trim(); 
        const password = passwordInput.value.trim();
        // --- FIM DA CORREÇÃO ---

        try {
            // Requisição para a API de login do backend
            // O caminho '/api/auth/login' é construído a partir de:
            // '/api' (definido em server.js para o apiRoutes)
            // '/auth/login' (definido em backend/routes/auth.js)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) { // Se a resposta for 2xx (sucesso)
                // Salvar o token no localStorage
                localStorage.setItem('jwtToken', data.token);
                // Opcional: Salvar outras informações do usuário se necessário (role, username, id)
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.username);
                localStorage.setItem('userId', data.id);

                showMessage('Login bem-sucedido! Redirecionando...', 'success');
                
                // Redirecionar para a página principal (dashboard)
                window.location.href = 'index.html'; 
            } else { // Se a resposta não for 2xx (erro)
                showMessage(data.message || 'Erro desconhecido ao fazer login.');
                // Opcional: Limpar campos de senha ou usuário para nova tentativa
                // passwordInput.value = ''; 
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
    });
});
