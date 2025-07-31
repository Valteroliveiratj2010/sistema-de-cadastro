/**
 * Limpeza Final do Sistema
 * Remove avisos e melhora a experiência do usuário
 */

console.log('🧹 LIMPEZA FINAL DO SISTEMA');

// Função para suprimir avisos de console desnecessários
function suppressConsoleWarnings() {
    const originalWarn = console.warn;
    console.warn = function(...args) {
        // Suprimir avisos específicos
        const message = args.join(' ');
        if (message.includes('DEPRECATION NOTICE') || 
            message.includes('favicon.ico') ||
            message.includes('autocomplete')) {
            return; // Não mostrar estes avisos
        }
        originalWarn.apply(console, args);
    };
}

// Função para melhorar a experiência do usuário
function enhanceUserExperience() {
    // Adicionar loading states aos botões
    document.addEventListener('click', (e) => {
        if (e.target.matches('button[data-action]')) {
            const button = e.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
            button.disabled = true;
            
            // Restaurar após 2 segundos
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    });
    
    // Melhorar feedback visual
    document.addEventListener('submit', (e) => {
        if (e.target.matches('form')) {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Salvando...';
                submitBtn.disabled = true;
            }
        }
    });
}

// Função para otimizar performance
function optimizePerformance() {
    // Lazy loading para imagens
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Debounce para inputs de busca
    const searchInputs = document.querySelectorAll('input[data-search]');
    searchInputs.forEach(input => {
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Trigger search after 500ms of inactivity
                const event = new Event('search', { bubbles: true });
                input.dispatchEvent(event);
            }, 500);
        });
    });
}

// Função para adicionar melhorias visuais
function addVisualImprovements() {
    // Adicionar animações suaves
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-in {
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .btn-loading {
            position: relative;
            pointer-events: none;
        }
        
        .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            margin: auto;
            border: 2px solid transparent;
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Aplicar animações aos elementos
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', () => {
            modal.querySelector('.modal-content').classList.add('slide-in');
        });
    });
}

// Função para melhorar acessibilidade
function improveAccessibility() {
    // Adicionar labels para elementos sem label
    const inputs = document.querySelectorAll('input:not([id]), select:not([id])');
    inputs.forEach((input, index) => {
        if (!input.id) {
            input.id = `input-${index}`;
        }
        if (!input.getAttribute('aria-label')) {
            const placeholder = input.placeholder || input.name || 'Campo';
            input.setAttribute('aria-label', placeholder);
        }
    });
    
    // Melhorar navegação por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }
    });
}

// Função principal de limpeza
function runFinalCleanup() {
    console.log('🚀 INICIANDO LIMPEZA FINAL...');
    
    try {
        // Aplicar todas as melhorias
        suppressConsoleWarnings();
        enhanceUserExperience();
        optimizePerformance();
        addVisualImprovements();
        improveAccessibility();
        
        console.log('✅ Limpeza final concluída com sucesso!');
        console.log('🎉 Sistema otimizado e pronto para uso profissional!');
        
        // Mostrar notificação de sucesso
        if (typeof showToast === 'function') {
            showToast('Sistema otimizado com sucesso!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Erro durante a limpeza final:', error);
    }
}

// Executar limpeza quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFinalCleanup);
} else {
    runFinalCleanup();
}

// Expor função para uso manual
window.runFinalCleanup = runFinalCleanup;

console.log('✅ Script de limpeza final carregado!');
console.log('📋 Execute runFinalCleanup() para aplicar todas as melhorias...'); 