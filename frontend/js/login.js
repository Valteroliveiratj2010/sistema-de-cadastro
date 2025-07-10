// frontend/js/login.js

// A variável API_BASE_URL será definida globalmente por apiConfig.js.
// Não precisamos declará-la aqui novamente com 'const' ou 'let' no escopo global
// para evitar o ReferenceError. Basta usá-la diretamente.
// Se estiver em ambiente local e apiConfig.js não for carregado, podemos ter um fallback.

// Define um fallback para desenvolvimento local, caso apiConfig.js não seja carregado
// Em produção, window.API_BASE_URL virá de apiConfig.js
const API_BASE_URL_FINAL = window.API_BASE_URL || 'http://localhost:4000/api';


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

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            // Requisição para a API de login do backend
            // Agora usa a API_BASE_URL_FINAL que aponta para o Railway
            const response = await fetch(`${API_BASE_URL_FINAL}/auth/login`, { // <--- MUDANÇA AQUI!
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            // Se a resposta não for OK (ex: 401, 404, 500), tenta ler o JSON de erro
            // Mas se for HTML, vai dar SyntaxError. Capturamos isso no catch.
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
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            // Mensagem de erro mais específica para o usuário
            if (error instanceof SyntaxError) {
                showMessage('Resposta inesperada do servidor. Verifique a URL da API ou o status do backend.');
            } else {
                showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            }
        }
    });
});
