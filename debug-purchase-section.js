// Script para debugar a seção purchaseDetailSection
console.log('🔍 Verificando seção purchaseDetailSection...');

// Verificar se a seção existe no DOM
const section = document.getElementById('purchaseDetailSection');
if (section) {
    console.log('✅ Seção encontrada:', section);
    console.log('📍 ID:', section.id);
    console.log('📍 Classe:', section.className);
    console.log('📍 Display:', section.style.display);
    console.log('📍 Visibilidade:', section.offsetParent !== null);
} else {
    console.log('❌ Seção NÃO encontrada');
    
    // Verificar se há seções similares
    const allSections = document.querySelectorAll('section');
    console.log('📋 Todas as seções encontradas:');
    allSections.forEach((s, i) => {
        console.log(`${i + 1}. ID: ${s.id}, Classe: ${s.className}`);
    });
}

console.log('🎯 Verificação concluída!'); 