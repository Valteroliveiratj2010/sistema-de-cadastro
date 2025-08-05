const { Sequelize } = require('sequelize');

// Lista de senhas comuns do PostgreSQL
const passwords = [
    'postgres',
    '123456',
    'password',
    'admin',
    'root',
    'admin123',
    'postgres123',
    '123456789',
    'qwerty',
    'dv201015',
    'postgresql',
    '1234',
    '12345',
    '1234567',
    '12345678',
    '1234567890',
    'abc123',
    'password123',
    'admin1234',
    'root123'
];

async function findPostgresPassword() {
    console.log('🔍 Procurando senha do usuário postgres...');
    console.log('==========================================');
    
    for (const password of passwords) {
        console.log(`\n🔄 Tentando: ${password}`);
        
        const sequelize = new Sequelize({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: password,
            database: 'postgres',
            logging: false,
            pool: {
                max: 1,
                min: 0,
                acquire: 2000,
                idle: 1000
            }
        });

        try {
            await sequelize.authenticate();
            console.log(`🎉 SUCESSO! Senha do postgres é: ${password}`);
            
            // Testar se conseguimos criar o usuário 19vsilva
            console.log('\n👤 Testando criação do usuário 19vsilva...');
            try {
                await sequelize.query(`CREATE USER "19vsilva" WITH PASSWORD 'dv201015'`);
                console.log('✅ Usuário 19vsilva criado!');
                
                // Criar banco de dados
                await sequelize.query(`CREATE DATABASE "gestor_pro_local" OWNER "19vsilva"`);
                console.log('✅ Banco gestor_pro_local criado!');
                
                // Dar privilégios
                await sequelize.query(`GRANT ALL PRIVILEGES ON DATABASE "gestor_pro_local" TO "19vsilva"`);
                await sequelize.query(`ALTER USER "19vsilva" CREATEDB`);
                console.log('✅ Privilégios concedidos!');
                
                console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
                console.log('📋 Agora você pode:');
                console.log('1. Executar: npm run migrate');
                console.log('2. Executar: npm run seed');
                console.log('3. Fazer login com: 19vsilva / dv201015');
                
            } catch (userError) {
                if (userError.message.includes('already exists')) {
                    console.log('ℹ️ Usuário 19vsilva já existe');
                } else {
                    console.log(`⚠️ Erro ao criar usuário: ${userError.message}`);
                }
            }
            
            await sequelize.close();
            return password;
            
        } catch (error) {
            console.log(`❌ Falhou`);
            await sequelize.close();
        }
    }
    
    console.log('\n❌ Nenhuma senha funcionou.');
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Verificar se PostgreSQL está rodando');
    console.log('2. Resetar senha do postgres no pgAdmin');
    console.log('3. Reinstalar PostgreSQL');
    console.log('4. Usar DBeaver em vez do pgAdmin');
    
    return null;
}

findPostgresPassword(); 