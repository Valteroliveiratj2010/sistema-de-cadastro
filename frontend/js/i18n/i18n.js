// Sistema de Internacionalização (i18n) - Gestor PRO
class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'pt';
        this.translations = window.translations || {};
        this.localeConfig = window.localeConfig || {};
        
        // Inicializar
        this.init();
    }

    init() {
        console.log('🌍 Inicializando sistema de internacionalização...');
        this.setLanguage(this.currentLanguage);
        this.updateAllElements();
    }

    // Definir idioma
    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`❌ Idioma '${language}' não suportado. Usando 'pt' como fallback.`);
            language = 'pt';
        }

        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // Atualizar atributo lang do HTML
        document.documentElement.lang = language;
        
        console.log(`✅ Idioma alterado para: ${language}`);
        
        // Disparar evento de mudança de idioma
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: language } 
        }));
    }

    // Obter tradução
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['pt']?.[key] || 
                          key;

        // Substituir parâmetros
        return this.interpolate(translation, params);
    }

    // Interpolar parâmetros na string
    interpolate(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // Formatar moeda
    formatCurrency(amount, currency = null) {
        const config = this.localeConfig[this.currentLanguage];
        const currencySymbol = currency || config.currencySymbol;
        
        return new Intl.NumberFormat(this.getNumberFormatLocale(), {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: config.numberFormat.precision,
            maximumFractionDigits: config.numberFormat.precision
        }).format(amount);
    }

    // Formatar número
    formatNumber(number) {
        const config = this.localeConfig[this.currentLanguage];
        
        return new Intl.NumberFormat(this.getNumberFormatLocale(), {
            minimumFractionDigits: config.numberFormat.precision,
            maximumFractionDigits: config.numberFormat.precision
        }).format(number);
    }

    // Formatar data
    formatDate(date, format = null) {
        const config = this.localeConfig[this.currentLanguage];
        const dateObj = new Date(date);
        
        if (!format) {
            format = config.dateFormat;
        }

        // Implementação básica de formatação de data
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    }

    // Formatar data relativa
    formatRelativeDate(date) {
        const now = new Date();
        const dateObj = new Date(date);
        const diffTime = Math.abs(now - dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return this.t('today');
        } else if (diffDays === 1) {
            return this.t('yesterday');
        } else if (diffDays < 7) {
            return this.t('daysAgo', { days: diffDays });
        } else {
            return this.formatDate(date);
        }
    }

    // Obter locale para formatação de números
    getNumberFormatLocale() {
        const localeMap = {
            'pt': 'pt-PT',
            'en': 'en-US',
            'es': 'es-ES'
        };
        return localeMap[this.currentLanguage] || 'pt-PT';
    }

    // Atualizar todos os elementos com data-i18n
    updateAllElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            this.updateElement(element);
        });

        // Atualizar placeholders
        const inputs = document.querySelectorAll('input[data-i18n-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            input.placeholder = this.t(key);
        });

        // Atualizar títulos
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        console.log(`✅ ${elements.length} elementos traduzidos`);
    }

    // Atualizar elemento específico
    updateElement(element) {
        const key = element.getAttribute('data-i18n');
        const params = this.parseParams(element.getAttribute('data-i18n-params'));
        
        const translation = this.t(key, params);
        
        // Atualizar conteúdo baseado no tipo de elemento
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = translation;
        } else {
            element.textContent = translation;
        }
    }

    // Parsear parâmetros do data-i18n-params
    parseParams(paramsString) {
        if (!paramsString) return {};
        
        try {
            return JSON.parse(paramsString);
        } catch (e) {
            console.warn('❌ Erro ao parsear parâmetros i18n:', paramsString);
            return {};
        }
    }

    // Criar seletor de idioma
    createLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-globe"></i> ${this.getLanguageName(this.currentLanguage)}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" data-lang="pt">🇵🇹 Português</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="en">🇺🇸 English</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="es">🇪🇸 Español</a></li>
                </ul>
            </div>
        `;

        // Adicionar event listeners
        selector.querySelectorAll('[data-lang]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
                this.updateAllElements();
            });
        });

        return selector;
    }

    // Obter nome do idioma
    getLanguageName(code) {
        const names = {
            'pt': 'Português',
            'en': 'English',
            'es': 'Español'
        };
        return names[code] || code;
    }

    // Obter idioma atual
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Verificar se é RTL (direita para esquerda)
    isRTL() {
        return false; // Português, Inglês e Espanhol são LTR
    }
}

    // Inicializar sistema i18n quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n = new I18nManager();
        
        // Adicionar seletor de idioma ao sidebar
        const languageSelectorContainer = document.getElementById('languageSelector');
        if (languageSelectorContainer) {
            const languageSelector = window.i18n.createLanguageSelector();
            languageSelectorContainer.appendChild(languageSelector);
        }
    });

// Exportar para uso global
window.I18nManager = I18nManager; 