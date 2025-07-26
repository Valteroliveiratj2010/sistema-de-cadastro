// frontend/js/login.js

// Se API_BASE_URL não estiver definido globalmente, usamos localhost como fallback para desenvolvimento
const API_BASE_URL_FINAL = 'https://sistema-de-cadastro-backend.onrender.com/api';
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    function showMessage(message, type = 'danger') {
        loginMessage.textContent = message;
        loginMessage.className = `mt-3 text-center text-${type}`;
        loginMessage.classList.remove('d-none');
    }

    function hideMessage() {
        loginMessage.classList.add('d-none');
        loginMessage.textContent = '';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        hideMessage();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL_FINAL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            let data = null;

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Erro ao interpretar JSON:', jsonError);
            }

            if (response.ok) {
                localStorage.setItem('jwtToken', data?.token || '');
                localStorage.setItem('userRole', data?.role || '');
                localStorage.setItem('userName', data?.username || '');
                localStorage.setItem('userId', data?.id || '');

                showMessage('Login bem-sucedido! Redirecionando...', 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(data?.message || 'Usuário ou senha inválidos.');
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);

            if (error instanceof TypeError) {
                showMessage('Não foi possível conectar ao servidor. Verifique a URL da API e tente novamente.');
            } else {
                showMessage('Erro inesperado. Tente novamente.');
            }
        }
    });
});
