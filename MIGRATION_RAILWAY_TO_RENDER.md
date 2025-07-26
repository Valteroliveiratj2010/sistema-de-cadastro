# 🚀 Migração do Railway para o Render

## Resumo das Mudanças

Você migrou do Railway para o Render. As seguintes correções foram feitas:

### ✅ Arquivos Atualizados

1. **`frontend/js/apiConfig.js`**
   - URL alterada de: `https://sistema-de-cadastro-production.up.railway.app/api`
   - Para: `https://sistema-de-cadastro-backend.onrender.com/api`

2. **`frontend/js/login.js`**
   - Fallback URL atualizada para o Render

3. **`test-login.html`**
   - URL padrão atualizada para o Render

4. **`check-backend.js`**
   - URL de verificação atualizada para o Render

5. **`LOGIN_BUG_FIX.md`**
   - Documentação atualizada para refletir a mudança

## Scripts de Teste e Configuração

### 🔧 Scripts Criados

1. **`check-backend.js`** - Testa se o backend está funcionando
2. **`test-database.js`** - Testa a conexão com o banco de dados
3. **`setup-database.js`** - Configura o banco automaticamente
4. **`test-login.html`** - Interface para testar o login

## Configuração no Render

### 1. **Variáveis de Ambiente no Render**

Configure as seguintes variáveis de ambiente no seu projeto no Render:

```env
NODE_ENV=production
DATABASE_URL=sua_url_do_banco_postgres_no_render
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_admin_segura
```

### 2. **Configuração do Banco de Dados**

O Render oferece PostgreSQL. Certifique-se de:
- Criar um banco PostgreSQL no Render
- Copiar a URL de conexão para a variável `DATABASE_URL`
- A URL deve ter o formato: `postgresql://usuario:senha@host:porta/banco`

### 3. **Configuração do Serviço**

No Render, configure seu serviço:
- **Build Command:** `npm install && node setup-database.js`
- **Start Command:** `node server.js`
- **Environment:** Node.js

## Testando a Migração

### 1. **Verificar Backend**
```bash
node check-backend.js
```

### 2. **Testar Banco de Dados**
```bash
node test-database.js
```

### 3. **Configurar Banco Automaticamente**
```bash
node setup-database.js
```

### 4. **Testar Login**
Abra o arquivo `test-login.html` no navegador e teste:
- Conexão com a API
- Processo de login

### 5. **Verificar Logs**
No Render, verifique os logs do serviço para identificar possíveis problemas.

## Possíveis Problemas

### 1. **Banco de Dados Não Conecta**
- Execute: `node test-database.js`
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco PostgreSQL está ativo no Render

### 2. **Migrações Não Executadas**
Execute o script de configuração:
```bash
node setup-database.js
```

### 3. **Seeder Não Executado**
O script `setup-database.js` executa automaticamente o seeder.

### 4. **CORS Issues**
Verifique se a URL do frontend está correta no `server.js`:
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://sua-url-do-frontend.vercel.app' // Atualize para sua URL
        : '*',
    // ... resto da configuração
};
```

## Comandos Úteis

### Verificar Status do Backend
```bash
node check-backend.js
```

### Testar Conexão com Banco
```bash
node test-database.js
```

### Configurar Banco Automaticamente
```bash
node setup-database.js
```

### Executar Migrações Manualmente
```bash
npx sequelize-cli db:migrate
```

### Executar Seeder Manualmente
```bash
node backend/seeders/adminSeeder.js
```

## URLs Atualizadas

- **Backend API:** `https://sistema-de-cadastro-backend.onrender.com/api`
- **Teste de Conexão:** `https://sistema-de-cadastro-backend.onrender.com/api/ping`
- **Login:** `https://sistema-de-cadastro-backend.onrender.com/api/auth/login`

## Próximos Passos

1. ✅ Configurar variáveis de ambiente no Render
2. ✅ Deployar o backend no Render
3. ✅ Executar `setup-database.js` para configurar o banco
4. ✅ Testar conexão com `check-backend.js`
5. ✅ Testar banco com `test-database.js`
6. ✅ Testar login com `test-login.html`
7. ✅ Testar sistema principal em `frontend/login.html`

## Troubleshooting

### Se o backend não responder:
1. Execute `node check-backend.js`
2. Verifique os logs no Render
3. Confirme se o serviço está ativo

### Se o banco não conectar:
1. Execute `node test-database.js`
2. Verifique a `DATABASE_URL`
3. Confirme se o banco PostgreSQL está ativo

### Se o login falhar:
1. Execute `node setup-database.js`
2. Verifique se o usuário admin foi criado
3. Confirme as credenciais no `.env`

## Suporte

Se encontrar problemas:
1. Execute os scripts de teste para diagnóstico
2. Verifique os logs no Render
3. Confirme as variáveis de ambiente
4. Teste a conexão com o banco de dados 