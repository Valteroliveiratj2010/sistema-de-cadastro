// setup-complete.js - Setup completo do Gestor PRO
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Setup Completo do Gestor PRO');
console.log('================================\n');

// Função para executar comandos
function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} - Concluído\n`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} - Falhou: ${error.message}\n`);
        return false;
    }
}

// Função para verificar se arquivo existe
function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description} - Encontrado`);
        return true;
    } else {
        console.log(`❌ ${description} - Não encontrado`);
        return false;
    }
}

async function setupComplete() {
    console.log('🔍 Verificando arquivos necessários...\n');
    
    // Verificar arquivos essenciais
    const essentialFiles = [
        { path: '.env', description: 'Arquivo de configuração (.env)' },
        { path: 'package.json', description: 'Package.json' },
        { path: 'backend/config/config.js', description: 'Configuração do banco' },
        { path: 'server-improved.js', description: 'Servidor melhorado' }
    ];
    
    let allFilesExist = true;
    essentialFiles.forEach(file => {
        if (!checkFile(file.path, file.description)) {
            allFilesExist = false;
        }
    });
    
    if (!allFilesExist) {
        console.log('\n❌ Alguns arquivos essenciais estão faltando!');
        console.log('📝 Certifique-se de que todos os arquivos foram criados corretamente.\n');
        return;
    }
    
    console.log('\n✅ Todos os arquivos essenciais encontrados!\n');
    
    // Verificar variáveis de ambiente
    console.log('🔧 Verificando configurações...\n');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   PGHOST: ${process.env.PGHOST || 'localhost'}`);
    console.log(`   PGPORT: ${process.env.PGPORT || '5432'}`);
    console.log(`   PGUSER: ${process.env.PGUSER || 'postgres'}`);
    console.log(`   PGDATABASE: ${process.env.PGDATABASE || 'gestor_pro_dev'}`);
    console.log(`   PGPASSWORD: ${process.env.PGPASSWORD ? '***definida***' : 'não definida'}\n`);
    
    // Setup do banco de dados
    console.log('🗄️ Configurando banco de dados...\n');
    
    if (!runCommand('node setup-database.js', 'Setup do banco de dados')) {
        console.log('⚠️ Setup do banco falhou. Verifique se o PostgreSQL está rodando.\n');
        console.log('📋 Para instalar PostgreSQL:');
        console.log('   Windows: https://www.postgresql.org/download/windows/');
        console.log('   Linux: sudo apt-get install postgresql postgresql-contrib');
        console.log('   macOS: brew install postgresql\n');
        return;
    }
    
    // Executar migrações
    console.log('📊 Executando migrações...\n');
    
    if (!runCommand('npm run db:migrate', 'Migrações do banco')) {
        console.log('⚠️ Migrações falharam. Verifique a conexão com o banco.\n');
        return;
    }
    
    // Executar seeds
    console.log('🌱 Executando seeds...\n');
    
    if (!runCommand('npm run db:seed', 'Seeds do banco')) {
        console.log('⚠️ Seeds falharam. Verifique se as migrações foram executadas.\n');
        return;
    }
    
    // Teste final
    console.log('🧪 Testando servidor...\n');
    
    console.log('📋 Para testar o servidor:');
    console.log('   1. Execute: node server-improved.js');
    console.log('   2. Abra: http://localhost:3000');
    console.log('   3. Login: admin / admin123\n');
    
    console.log('🎉 Setup completo concluído com sucesso!');
    console.log('========================================');
    console.log('📝 Próximos passos:');
    console.log('   1. node server-improved.js');
    console.log('   2. Acesse http://localhost:3000');
    console.log('   3. Faça login com admin/admin123');
    console.log('   4. Comece a usar o Gestor PRO!\n');
    
    console.log('🔗 Links úteis:');
    console.log('   - Health Check: http://localhost:3000/health');
    console.log('   - Teste: http://localhost:3000/test');
    console.log('   - API Ping: http://localhost:3000/api/ping');
    console.log('   - Login: http://localhost:3000/login\n');
    
    console.log('📚 Documentação:');
    console.log('   - README.md');
    console.log('   - API_DOCUMENTATION.md');
    console.log('   - MELHORIAS_IMPLEMENTADAS.md\n');
}

// Executar setup
setupComplete().catch(error => {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
}); 