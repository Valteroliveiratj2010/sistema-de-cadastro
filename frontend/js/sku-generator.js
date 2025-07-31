/**
 * Gerador de SKUs Únicos
 * Gera SKUs automáticos para produtos
 */

console.log('🏷️ GERADOR DE SKUS ÚNICOS');

// Função para gerar SKU único
function generateUniqueSKU() {
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SKU${timestamp}${random}`;
}

// Função para gerar SKU baseado no nome do produto
function generateSKUFromName(productName) {
    if (!productName || productName.trim() === '') {
        return generateUniqueSKU();
    }
    
    // Pegar as primeiras 3 letras do nome (maiúsculas)
    const prefix = productName.substring(0, 3).toUpperCase();
    
    // Adicionar timestamp
    const timestamp = Date.now().toString().slice(-4);
    
    // Adicionar número aleatório
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${prefix}${timestamp}${random}`;
}

// Função para verificar se SKU já existe
async function checkSKUExists(sku) {
    try {
        if (typeof api === 'undefined') {
            console.log('❌ API não disponível para verificar SKU');
            return false;
        }
        
        // Buscar produtos com este SKU
        const response = await api.get('/products', { q: sku });
        
        if (response.success && response.products) {
            const exists = response.products.some(product => product.sku === sku);
            return exists;
        }
        
        return false;
    } catch (error) {
        console.log('❌ Erro ao verificar SKU:', error);
        return false;
    }
}

// Função para gerar SKU único verificando no banco
async function generateVerifiedSKU(productName = '') {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const sku = productName ? generateSKUFromName(productName) : generateUniqueSKU();
        const exists = await checkSKUExists(sku);
        
        if (!exists) {
            console.log(`✅ SKU único gerado: ${sku}`);
            return sku;
        }
        
        attempts++;
        console.log(`🔄 Tentativa ${attempts}: SKU ${sku} já existe, tentando novamente...`);
    }
    
    // Se não conseguir gerar um SKU único, usar timestamp + random
    const fallbackSKU = generateUniqueSKU();
    console.log(`⚠️ Usando SKU de fallback: ${fallbackSKU}`);
    return fallbackSKU;
}

// Função para preencher SKU automaticamente no formulário
function autoFillSKU(productName = '') {
    const skuField = document.getElementById('productSku');
    if (!skuField) {
        console.log('❌ Campo SKU não encontrado');
        return;
    }
    
    if (skuField.value.trim() === '') {
        generateVerifiedSKU(productName).then(sku => {
            skuField.value = sku;
            console.log(`✅ SKU preenchido automaticamente: ${sku}`);
        }).catch(error => {
            console.log('❌ Erro ao gerar SKU:', error);
            skuField.value = generateUniqueSKU();
        });
    }
}

// Função para configurar eventos de geração automática de SKU
function setupSKUAutoGeneration() {
    const nameField = document.getElementById('productName');
    const skuField = document.getElementById('productSku');
    
    if (nameField && skuField) {
        // Gerar SKU quando o nome for digitado
        nameField.addEventListener('input', (e) => {
            if (skuField.value.trim() === '') {
                // Aguardar um pouco para não gerar a cada tecla
                clearTimeout(nameField.skuTimeout);
                nameField.skuTimeout = setTimeout(() => {
                    autoFillSKU(e.target.value);
                }, 1000);
            }
        });
        
        // Botão para gerar SKU manualmente
        const generateButton = document.createElement('button');
        generateButton.type = 'button';
        generateButton.className = 'btn btn-outline-secondary btn-sm';
        generateButton.innerHTML = '🔄 Gerar SKU';
        generateButton.onclick = () => autoFillSKU(nameField.value);
        
        // Inserir botão após o campo SKU
        skuField.parentNode.appendChild(generateButton);
        
        console.log('✅ Geração automática de SKU configurada');
    }
}

// Função para limpar SKU duplicado
function clearDuplicateSKU() {
    const skuField = document.getElementById('productSku');
    if (skuField) {
        skuField.value = '';
        console.log('✅ Campo SKU limpo');
    }
}

// Expor funções
window.generateUniqueSKU = generateUniqueSKU;
window.generateSKUFromName = generateSKUFromName;
window.checkSKUExists = checkSKUExists;
window.generateVerifiedSKU = generateVerifiedSKU;
window.autoFillSKU = autoFillSKU;
window.setupSKUAutoGeneration = setupSKUAutoGeneration;
window.clearDuplicateSKU = clearDuplicateSKU;

console.log('✅ Gerador de SKUs carregado!');
console.log('📋 Comandos disponíveis:');
console.log('- generateUniqueSKU() - Gerar SKU único');
console.log('- generateSKUFromName("Nome") - Gerar SKU baseado no nome');
console.log('- autoFillSKU("Nome") - Preencher SKU automaticamente');
console.log('- setupSKUAutoGeneration() - Configurar geração automática');
console.log('- clearDuplicateSKU() - Limpar campo SKU'); 