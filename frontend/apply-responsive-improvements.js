// apply-responsive-improvements.js
console.log('✨ Aplicando melhorias específicas de responsividade...');

function applyResponsiveImprovements() {
    // 1. Otimizar botões para touch (tamanho mínimo)
    document.querySelectorAll('button, .btn').forEach(button => {
        // Garante um tamanho mínimo para facilitar o toque em telas pequenas
        if (window.innerWidth <= 768) { // Aplicar para mobile e tablet
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        } else {
            // Resetar se for desktop e não precisar
            button.style.minHeight = '';
            button.style.minWidth = '';
        }
    });

    // 2. Melhorar feedback visual em elementos clicáveis no touch
    document.querySelectorAll('button, .btn, .nav-link, .card').forEach(el => {
        // Evita adicionar múltiplos listeners
        if (!el.dataset.touchListenerAdded) {
            el.addEventListener('touchstart', () => {
                el.classList.add('active-touch-feedback');
            });
            el.addEventListener('touchend', () => {
                setTimeout(() => {
                    el.classList.remove('active-touch-feedback');
                }, 150); // Pequeno atraso para feedback visual
            });
            el.dataset.touchListenerAdded = 'true';
        }
    });

    // 3. Ajustar layout de formulários complexos em telas pequenas
    document.querySelectorAll('form .row.g-3, form .row.g-4').forEach(row => {
        if (window.innerWidth <= 576) { // Para telas muito pequenas, empilhar colunas
            row.querySelectorAll('[class*="col-"]').forEach(col => {
                col.style.marginBottom = '10px'; // Adiciona espaçamento entre campos empilhados
            });
        } else {
            row.querySelectorAll('[class*="col-"]').forEach(col => {
                col.style.marginBottom = ''; // Remove espaçamento
            });
        }
    });

    // 4. Otimizar exibição de texto em cards e títulos
    document.querySelectorAll('.card-header h5, .kpi-card h6').forEach(heading => {
        if (window.innerWidth <= 480) {
            heading.style.fontSize = '0.9rem';
            heading.style.whiteSpace = 'normal'; // Permitir quebra de linha
        } else {
            heading.style.fontSize = '';
            heading.style.whiteSpace = '';
        }
    });

    // 5. Ajustar padding e margens gerais para mobile
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        if (window.innerWidth <= 768) {
            mainContent.style.padding = '15px';
        } else {
            mainContent.style.padding = '30px';
        }
    }

    console.log('✅ Melhorias específicas aplicadas.');
}

// Executar as melhorias na carga inicial e no redimensionamento
document.addEventListener('DOMContentLoaded', applyResponsiveImprovements);
window.addEventListener('resize', applyResponsiveImprovements);

// Adicionar um estilo para o feedback visual
const style = document.createElement('style');
style.innerHTML = `
    .active-touch-feedback {
        transform: scale(0.98);
        transition: transform 0.1s ease-out;
        opacity: 0.8;
    }
`;
document.head.appendChild(style); 