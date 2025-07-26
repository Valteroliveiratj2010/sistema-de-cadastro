# 🔧 Configuração das Variáveis de Ambiente

## ❌ Problema Identificado

A variável `DATABASE_URL` não está configurada. Esta é essencial para conectar ao banco PostgreSQL do Render.

## 🔧 Como Configurar

### 1. **Obter a DATABASE_URL do Render**

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Vá para seu projeto
3. Clique em "Environment" ou "Environment Variables"
4. Procure por `DATABASE_URL` ou crie uma nova

### 2. **Formato da DATABASE_URL**

```
postgresql://usuario:senha@host:porta/banco?sslmode=require
```

**Exemplo:**
```
postgresql://gestorpro_user:abc123@dpg-abc123-a.oregon-postgres.render.com/gestorpro_db?sslmode=require
```

### 3. **Configurar no arquivo .env**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configuração do Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host:porta/seu_banco?sslmode=require

# Configuração de Segurança (JÁ CONFIGURADO)
JWT_SECRET=e2ea0bb89f...

# Usuário Admin (JÁ CONFIGURADO)
ADMIN_USERNAME=19vsilva
ADMIN_PASSWORD=sua_senha_atual

# Ambiente (OBRIGATÓRIO)
NODE_ENV=production
```

### 4. **Onde encontrar a DATABASE_URL no Render**

1. **No Dashboard do Render:**
   - Vá para seu projeto
   - Clique em "Environment"
   - Procure por `DATABASE_URL`

2. **Se não existir:**
   - Vá para "Services" > "New" > "PostgreSQL"
   - Crie um novo banco PostgreSQL
   - Copie a URL de conexão fornecida

3. **Formato típico do Render:**
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### 5. **Adicionar parâmetros SSL**

Se a URL não incluir `?sslmode=require`, adicione ao final:
```
postgresql://usuario:senha@host:porta/banco?sslmode=require
```

## 🧪 Testar a Configuração

Após configurar, execute:

```bash
# 1. Verificar se todas as variáveis estão configuradas
node check-env.js

# 2. Testar conexão com o banco
node test-database.js

# 3. Testar hash de senha
node test-password-hash.js
```

## 📋 Checklist

- [ ] DATABASE_URL configurada
- [ ] Inclui `?sslmode=require`
- [ ] NODE_ENV=production
- [ ] Todas as variáveis presentes no `check-env.js`

## 🆘 Se não conseguir a DATABASE_URL

1. **Verifique se o banco PostgreSQL foi criado no Render**
2. **Confirme se o serviço está ativo**
3. **Verifique as credenciais de acesso**
4. **Entre em contato com o suporte do Render se necessário**

## 🔍 Próximos Passos

Após configurar a `DATABASE_URL`:

1. Execute `node check-env.js` para confirmar
2. Execute `node test-database.js` para testar conexão
3. Execute `node setup-database.js` para configurar o banco
4. Teste o login com `test-login.html` 