const puppeteer = require('puppeteer');

async function testLogout() {
    console.log('🧪 Iniciando teste de logout...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Configurar console.log para capturar logs do navegador
        page.on('console', msg => {
            console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
        });
        
        // Configurar para capturar erros
        page.on('pageerror', error => {
            console.log(`[ERROR] ${error.message}`);
        });
        
        // Configurar para capturar requisições falhadas
        page.on('requestfailed', request => {
            console.log(`[REQUEST FAILED] ${request.url()}`);
        });
        
        console.log('📱 Acessando página de login...');
        await page.goto('https://sistema-de-cadastro-gestor-pro.vercel.app/login.html', { 
            waitUntil: 'networkidle2' 
        });
        
        console.log('🔍 Verificando se a página carregou corretamente...');
        await page.waitForSelector('#loginForm', { timeout: 10000 });
        
        console.log('👤 Preenchendo credenciais de login...');
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        
        console.log('🚀 Clicando no botão de login...');
        await page.click('#loginForm button[type="submit"]');
        
        console.log('⏳ Aguardando redirecionamento...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        console.log('✅ Login realizado com sucesso!');
        
        // Verificar se estamos no dashboard
        const currentUrl = page.url();
        console.log(`📍 URL atual: ${currentUrl}`);
        
        if (currentUrl.includes('index.html') || currentUrl.includes('dashboard')) {
            console.log('🎯 Dashboard carregado corretamente');
            
            // Aguardar um pouco para o dashboard carregar completamente
            await page.waitForTimeout(3000);
            
            console.log('🔍 Procurando botão de logout...');
            const logoutButton = await page.$('#logoutButton');
            
            if (logoutButton) {
                console.log('✅ Botão de logout encontrado!');
                
                // Verificar localStorage antes do logout
                console.log('📊 Verificando localStorage antes do logout...');
                const localStorageBefore = await page.evaluate(() => {
                    const items = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        items[key] = localStorage.getItem(key);
                    }
                    return items;
                });
                
                console.log('localStorage antes do logout:', localStorageBefore);
                
                console.log('🚪 Clicando no botão de logout...');
                await logoutButton.click();
                
                // Aguardar o logout processar
                await page.waitForTimeout(2000);
                
                // Verificar localStorage após o logout
                console.log('📊 Verificando localStorage após o logout...');
                const localStorageAfter = await page.evaluate(() => {
                    const items = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        items[key] = localStorage.getItem(key);
                    }
                    return items;
                });
                
                console.log('localStorage após o logout:', localStorageAfter);
                
                // Aguardar redirecionamento para login
                console.log('⏳ Aguardando redirecionamento para login...');
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
                
                const finalUrl = page.url();
                console.log(`📍 URL final: ${finalUrl}`);
                
                if (finalUrl.includes('login.html')) {
                    console.log('✅ Logout realizado com sucesso! Redirecionado para login.html');
                } else {
                    console.log('❌ Logout falhou - não foi redirecionado para login.html');
                }
                
            } else {
                console.log('❌ Botão de logout não encontrado!');
            }
            
        } else {
            console.log('❌ Falha no login - não foi redirecionado para o dashboard');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        console.log('🔚 Fechando navegador...');
        await browser.close();
    }
}

// Executar o teste
testLogout().catch(console.error); 