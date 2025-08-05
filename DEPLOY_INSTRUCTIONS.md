# 🚀 Deploy Rápido - Sistema Gestor PRO v2.0

## ⚡ Passos Rápidos para Deploy no Render

### 1. **Acesse o Render**
- Vá para [render.com](https://render.com)
- Faça login ou crie uma conta

### 2. **Crie o Banco de Dados**
1. Clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `gestor-pro-db`
   - **Database**: `gestor_pro_prod`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Free`
3. **Anote as credenciais** (você precisará delas)

### 3. **Crie o Web Service**
1. Clique em **"New +"** → **"Web Service"**
2. Conecte com **GitHub**
3. Selecione o repositório `app-cadastro`
4. Configure:

#### **Configurações Básicas**
- **Name**: `sistema-gestor-pro`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### **Variáveis de Ambiente**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=gestor_pro_jwt_secret_2024_production_secure_v2
JWT_EXPIRES_IN=24h
ENABLE_LOGGING=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@gestorpro.com
DATABASE_URL=<URL_DO_BANCO_CRIADO>
DB_HOST=<HOST_DO_BANCO>
DB_NAME=gestor_pro_prod
DB_USER=<USER_DO_BANCO>
DB_PASSWORD=<PASSWORD_DO_BANCO>
DB_PORT=5432
```

### 4. **Configurações Avançadas**
- **Health Check Path**: `/health`
- **Auto-Deploy**: ✅ Habilitado

### 5. **Deploy**
- Clique em **"Create Web Service"**
- Aguarde o build e deploy (5-10 minutos)

## 🎯 URLs de Verificação

Após o deploy:
- **Aplicação**: `https://sistema-gestor-pro.onrender.com`
- **Health Check**: `https://sistema-gestor-pro.onrender.com/health`
- **API**: `https://sistema-gestor-pro.onrender.com/api/health`

## 🔑 Credenciais de Acesso

- **Usuário**: `admin`
- **Senha**: `admin123`
- **Email**: `admin@gestorpro.com`

## ✅ Checklist de Deploy

- [ ] Banco PostgreSQL criado
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído
- [ ] Health check funcionando
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Relatórios funcionando

## 🆘 Suporte

Se houver problemas:
1. Verifique os **logs** no painel do Render
2. Confirme se as **variáveis de ambiente** estão corretas
3. Verifique se o **banco está ativo**
4. Teste o **health check**

---

**🎉 Sistema Gestor PRO v2.0 - Deploy Concluído!** 