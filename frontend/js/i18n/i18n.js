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
        
        // Limpar cache de traduções ao mudar idioma
        if (this._translationCache) {
            this._translationCache.clear();
        }
        
        // Atualizar atributo lang do HTML
        document.documentElement.lang = language;
        
        console.log(`✅ Idioma alterado para: ${language}`);
        
        // Disparar evento de mudança de idioma
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: language } 
        }));

        // Forçar atualização do gráfico após um pequeno delay
        setTimeout(() => {
            this.updateSalesChart();
        }, 100);
        
        // Recarregar dropdowns após mudança de idioma
        setTimeout(() => {
            this.reloadDropdowns();
        }, 200);
        
        // Forçar atualização adicional após um delay maior para garantir
        setTimeout(() => {
            this.updateSalesChart();
        }, 500);
    }

    // Obter tradução
    t(key, params = {}) {
        // Cache para melhorar performance
        if (!this._translationCache) {
            this._translationCache = new Map();
        }
        
        const cacheKey = `${this.currentLanguage}:${key}:${JSON.stringify(params)}`;
        if (this._translationCache.has(cacheKey)) {
            return this._translationCache.get(cacheKey);
        }
        
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['pt']?.[key] || 
                          key;

        // Substituir parâmetros
        const result = this.interpolate(translation, params);
        
        // Armazenar no cache
        this._translationCache.set(cacheKey, result);
        
        return result;
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
            'pt': 'pt-BR',
            'en': 'en-US',
            'es': 'es-ES'
        };
        return localeMap[this.currentLanguage] || 'pt-BR';
    }

    // Atualizar todos os elementos com data-i18n
    updateAllElements() {
        console.log('🔄 Aplicando traduções...');
        const startTime = performance.now();
        
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`📊 Encontrados ${elements.length} elementos para traduzir`);
        
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

        // Atualizar seletor de idioma se existir
        const languageSelector = document.querySelector('.language-selector');
        if (languageSelector) {
            this.updateLanguageSelector(languageSelector, this.currentLanguage);
        }

        // Atualizar valores monetários nos KPIs
        this.updateCurrencyValues();
        
        // Atualizar anos dinamicamente
        this.updateDynamicYears();
        
        // Atualizar status das tabelas
        if (typeof window.updateTableStatuses === 'function') {
            window.updateTableStatuses();
        }

        const endTime = performance.now();
        console.log(`✅ ${elements.length} elementos traduzidos em ${(endTime - startTime).toFixed(2)}ms para ${this.currentLanguage}`);
    }

    // Atualizar anos dinamicamente
    updateDynamicYears() {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        // Atualizar anos no HTML
        const previousYearElement = document.getElementById('previousYear');
        const currentYearElement = document.getElementById('currentYear');
        
        if (previousYearElement) {
            previousYearElement.textContent = previousYear;
        }
        
        if (currentYearElement) {
            currentYearElement.textContent = currentYear;
        }
        
        // Atualizar estatísticas se existirem
        if (window.updateSalesStatistics && window.state && window.state.charts && window.state.charts.has('salesChart')) {
            // Recriar o gráfico para atualizar as estatísticas
            setTimeout(() => {
                if (window.renderSalesChart) {
                    window.renderSalesChart({});
                }
            }, 100);
        }
    }

    // Recarregar dropdowns com traduções atualizadas
    reloadDropdowns() {
        console.log('🔄 Recarregando dropdowns com traduções atualizadas...');
        
        // Verificar se as funções de carregamento existem
        if (typeof window.loadClientsForDropdown === 'function') {
            window.loadClientsForDropdown();
        }
        
        if (typeof window.loadProductsForDropdown === 'function') {
            window.loadProductsForDropdown();
        }
        
        if (typeof window.loadSuppliersForDropdown === 'function') {
            window.loadSuppliersForDropdown();
        }
        
        if (typeof window.loadProductsForPurchaseDropdown === 'function') {
            window.loadProductsForPurchaseDropdown();
        }
        
        console.log('✅ Dropdowns recarregados');
    }

    // Atualizar valores monetários
    updateCurrencyValues() {
        const kpiCards = document.querySelectorAll('.kpi-card .fs-2');
        kpiCards.forEach(element => {
            const text = element.textContent;
            if (text && (text.includes('R$') || text.includes('$') || text.includes('€'))) {
                const numericValue = parseFloat(text.replace(/[^\d,.-]/g, '').replace(',', '.'));
                if (!isNaN(numericValue)) {
                    element.textContent = this.formatCurrency(numericValue);
                }
            }
        });

        // Atualizar gráfico de vendas se existir
        this.updateSalesChart();
    }

    // Atualizar gráfico de vendas
    updateSalesChart() {
        console.log('🔄 Iniciando atualização do gráfico de vendas...');
        
        // Verificar se existe um gráfico ativo
        if (!window.state || !window.state.charts || !window.state.charts.has('salesChart')) {
            console.log('⚠️ Gráfico de vendas não encontrado no estado');
            return;
        }

        const chart = window.state.charts.get('salesChart');
        if (!chart) {
            console.log('⚠️ Instância do gráfico não encontrada');
            return;
        }

        console.log('🔄 Atualizando traduções do gráfico existente...');
        
        // Atualizar apenas as traduções do gráfico existente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currencySymbol = this.formatCurrency(0).replace('0,00', '');
        
        // Meses traduzidos
        const months = [
            this.t('jan'), this.t('feb'), this.t('mar'), 
            this.t('apr'), this.t('may'), this.t('jun'),
            this.t('jul'), this.t('aug'), this.t('sep'),
            this.t('oct'), this.t('nov'), this.t('dec')
        ];

        // Atualizar labels e legendas
        chart.data.labels = months;
        chart.data.datasets[0].label = `${this.t('sales')} ${previousYear} (${currencySymbol})`;
        chart.data.datasets[1].label = `${this.t('sales')} ${currentYear} (${currencySymbol})`;
        
        // Atualizar anos dinâmicos
        this.updateDynamicYears();
        
        // Atualizar o gráfico
        chart.update();
        console.log('✅ Gráfico atualizado com novas traduções');
    }

    // Atualizar elemento específico
    updateElement(element) {
        const key = element.getAttribute('data-i18n');
        const params = this.parseParams(element.getAttribute('data-i18n-params'));
        
        const translation = this.t(key, params);
        
        // Verificar se a tradução é diferente do conteúdo atual
        const currentContent = element.textContent || element.value || '';
        if (currentContent.trim() === translation.trim()) {
            return; // Não atualizar se já está traduzido
        }
        
        // Atualizar conteúdo baseado no tipo de elemento
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = translation;
        } else if (element.tagName === 'A' && element.querySelector('i')) {
            // Para links com ícones, preservar o ícone e atualizar apenas o texto
            const icon = element.querySelector('i');
            element.innerHTML = icon.outerHTML + ' ' + translation;
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
                e.stopPropagation();
                const lang = e.target.getAttribute('data-lang');
                console.log('🌍 Mudando idioma para:', lang);
                this.setLanguage(lang);
                this.updateAllElements();
                this.updateLanguageSelector(selector, lang);
            });
        });

        return selector;
    }

    // Atualizar o seletor de idioma
    updateLanguageSelector(selector, language) {
        const button = selector.querySelector('.dropdown-toggle');
        if (button) {
            button.innerHTML = `<i class="bi bi-globe"></i> ${this.getLanguageName(language)}`;
        }
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

    // Aplicar traduções em um elemento específico ou container
    translateElement(element) {
        if (!element) return;
        
        // Se for um elemento específico
        if (element.hasAttribute('data-i18n')) {
            this.updateElement(element);
            return;
        }
        
        // Se for um container, traduzir todos os elementos filhos
        const elements = element.querySelectorAll('[data-i18n]');
        elements.forEach(el => this.updateElement(el));
        
        // Traduzir placeholders
        const inputs = element.querySelectorAll('input[data-i18n-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            input.placeholder = this.t(key);
        });
        
        // Traduzir títulos
        const titles = element.querySelectorAll('[data-i18n-title]');
        titles.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }

    // Função global para aplicar traduções em elementos dinâmicos
    static translateDynamicContent(container) {
        if (window.i18n && container) {
            window.i18n.translateElement(container);
        }
    }
}

    // Inicializar sistema i18n quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Inicializando sistema i18n...');
        window.i18n = new I18nManager();
        
        // Adicionar seletor de idioma ao sidebar
        const languageSelectorContainer = document.getElementById('languageSelector');
        if (languageSelectorContainer) {
            const languageSelector = window.i18n.createLanguageSelector();
            languageSelectorContainer.appendChild(languageSelector);
        }

        // Aplicar traduções imediatamente
        if (window.i18n) {
            window.i18n.updateAllElements();
        }

        // Aplicar traduções novamente após um pequeno delay para garantir elementos dinâmicos
        setTimeout(() => {
            if (window.i18n) {
                window.i18n.updateAllElements();
            }
        }, 50);

        // Aplicar traduções uma terceira vez para garantir elementos carregados dinamicamente
        setTimeout(() => {
            if (window.i18n) {
                window.i18n.updateAllElements();
            }
        }, 200);
    });

    // Também inicializar quando a página estiver completamente carregada
    window.addEventListener('load', () => {
        if (window.i18n) {
            console.log('🔄 Aplicando traduções após carregamento completo...');
            window.i18n.updateAllElements();
        }
    });

// Exportar para uso global
window.I18nManager = I18nManager; 