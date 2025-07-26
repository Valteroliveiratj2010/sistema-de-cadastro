#!/usr/bin/env node

// Script para ajudar a configurar variáveis de ambiente
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuração de Variáveis de Ambiente\n');

function setupEnv() {
    const envPath = path.join(process.cwd(), '.env');
    
    console.log('1️⃣ Verificando arquivo .env...');
    
    let envContent = '';
    let needsUpdate = false;
    
    // Verificar se arquivo .env existe
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log('✅ Arquivo .env encontrado');
    } else {
        console.log('⚠️ Arquivo .env não encontrado - será criado');
        needsUpdate = true;
    }
    
    // Verificar variáveis existentes
    const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
    const hasJwtSecret = envContent.includes('JWT_SECRET=');
    const hasAdminUsername = envContent.includes('ADMIN_USERNAME=');
    const hasAdminPassword = envContent.includes('ADMIN_PASSWORD=');
    const hasNodeEnv = envContent.includes('NODE_ENV=');
    
    console.log('\n2️⃣ Status das variáveis:');
    console.log(`DATABASE_URL: ${hasDatabaseUrl ? '✅ Configurada' : '❌ FALTANDO'}`);
    console.log(`JWT_SECRET: ${hasJwtSecret ? '✅ Configurada' : '❌ FALTANDO'}`);
    console.log(`ADMIN_USERNAME: ${hasAdminUsername ? '✅ Configurada' : '❌ FALTANDO'}`);
    console.log(`ADMIN_PASSWORD: ${hasAdminPassword ? '✅ Configurada' : '❌ FALTANDO'}`);
    console.log(`NODE_ENV: ${hasNodeEnv ? '✅ Configurada' : '❌ FALTANDO'}`);
    
    // Se DATABASE_URL está faltando, mostrar instruções
    if (!hasDatabaseUrl) {
        console.log('\n❌ DATABASE_URL NÃO CONFIGURADA!');
        console.log('\n🔧 Para configurar:');
        console.log('1. Acesse o Render Dashboard: https://dashboard.render.com/');
        console.log('2. Vá para seu projeto');
        console.log('3. Clique em "Environment"');
        console.log('4. Procure por DATABASE_URL ou crie uma nova');
        console.log('5. Formato esperado: postgresql://usuario:senha@host:porta/banco?sslmode=require');
        
        console.log('\n📝 Exemplo de DATABASE_URL:');
        console.log('postgresql://gestorpro_user:abc123@dpg-abc123-a.oregon-postgres.render.com/gestorpro_db?sslmode=require');
        
        console.log('\n💡 Se você não tem um banco PostgreSQL no Render:');
        console.log('1. Vá para "Services" > "New" > "PostgreSQL"');
        console.log('2. Crie um novo banco PostgreSQL');
        console.log('3. Copie a URL de conexão fornecida');
        console.log('4. Adicione ?sslmode=require ao final da URL');
        
        needsUpdate = true;
    }
    
    // Criar template do arquivo .env se necessário
    if (needsUpdate) {
        console.log('\n3️⃣ Criando template do arquivo .env...');
        
        const template = `# Configuração do Banco de Dados (OBRIGATÓRIO)
# Substitua pela sua URL real do Render
DATABASE_URL=postgresql://usuario:senha@host:porta/banco?sslmode=require

# Configuração de Segurança
JWT_SECRET=e2ea0bb89f...

# Usuário Admin
ADMIN_USERNAME=19vsilva
ADMIN_PASSWORD=sua_senha_atual

# Ambiente
NODE_ENV=production

# Configuração para desenvolvimento local (opcional)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=gestorpro_dev
# DB_USER=postgres
# DB_PASSWORD=sua_senha
`;
        
        fs.writeFileSync(envPath, template);
        console.log('✅ Arquivo .env criado/atualizado');
        console.log('📝 Edite o arquivo .env e configure a DATABASE_URL real');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure a DATABASE_URL no arquivo .env');
    console.log('2. Execute: node check-env.js');
    console.log('3. Execute: node test-database.js');
    console.log('4. Execute: node setup-database.js');
    
    if (!hasDatabaseUrl) {
        console.log('\n⚠️ IMPORTANTE: Configure a DATABASE_URL antes de continuar!');
    }
}

// Executar configuração
setupEnv(); 