# 🚀 Deploy no Render - Sistema Gestor PRO v2.0

## 📋 Pré-requisitos

1. **Conta no Render.com** - Criar conta gratuita
2. **Repositório no GitHub** - Código deve estar no GitHub
3. **Banco PostgreSQL** - Render oferece PostgreSQL gratuito

## 🎯 Passos para Deploy

### 1. **Criar Banco de Dados PostgreSQL**

1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `gestor-pro-db`
   - **Database**: `gestor_pro_prod`
   - **User**: `gestor_pro_user`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Free`

4. **Anote as credenciais**:
   - `DATABASE_URL`
   - `DB_HOST`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

### 2. **Criar Web Service**

1. Clique em **"New +"** → **"Web Service"**
2. Conecte com **GitHub**
3. Selecione o repositório `app-cadastro`
4. Configure:

#### **Configurações Básicas**
- **Name**: `sistema-gestor-pro`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Root Directory**: `/` (deixe vazio)

#### **Configurações de Build**
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

### 3. **Configurações Avançadas**

#### **Health Check**
- **Health Check Path**: `/health`

#### **Auto Deploy**
- ✅ **Auto-Deploy**: Habilitado
- ✅ **Deploy on Push**: Habilitado

## 🔧 Configurações Específicas

### **Arquivo render.yaml**
```yaml
services:
  - type: web
    name: sistema-gestor-pro
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        value: gestor_pro_jwt_secret_2024_production_secure_v2
      - key: JWT_EXPIRES_IN
        value: 24h
      - key: ENABLE_LOGGING
        value: true
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_PASSWORD
        value: admin123
      - key: ADMIN_EMAIL
        value: admin@gestorpro.com
      - key: DATABASE_URL
        sync: false
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
    healthCheckPath: /health
    autoDeploy: true
    region: oregon
```

## 🎯 Verificação do Deploy

### **1. Health Check**
- Acesse: `https://sistema-gestor-pro.onrender.com/health`
- Deve retornar: `{"status":"OK","timestamp":"...","environment":"production"}`

### **2. Aplicação Principal**
- Acesse: `https://sistema-gestor-pro.onrender.com`
- Deve carregar o sistema de login

### **3. API**
- Acesse: `https://sistema-gestor-pro.onrender.com/api/health`
- Deve retornar status da API

## 🔍 Troubleshooting

### **Problemas Comuns**

#### **1. Erro de Conexão com Banco**
- Verifique se `DATABASE_URL` está configurada
- Confirme se o banco está ativo no Render
- Verifique se as credenciais estão corretas

#### **2. Erro de Build**
- Verifique se `package.json` tem o script `start`
- Confirme se todas as dependências estão listadas
- Verifique se o Node.js versão está correta (>=20)

#### **3. Erro de Health Check**
- Verifique se a rota `/health` está implementada
- Confirme se o servidor está rodando na porta correta

### **Logs**
- Acesse **"Logs"** no painel do Render
- Verifique logs de build e runtime
- Procure por erros específicos

## 🎉 Deploy Concluído

Após o deploy bem-sucedido:

1. **Teste todas as funcionalidades**:
   - Login/Logout
   - Dashboard
   - Relatórios
   - CRUD de entidades

2. **Configure domínio personalizado** (opcional):
   - Vá em **"Settings"** → **"Custom Domains"**
   - Adicione seu domínio

3. **Monitore performance**:
   - Use **"Metrics"** no painel
   - Configure alertas se necessário

## 📞 Suporte

- **Documentação Render**: [docs.render.com](https://docs.render.com)
- **Status Render**: [status.render.com](https://status.render.com)
- **Comunidade**: [community.render.com](https://community.render.com)

---

**✅ Sistema Gestor PRO v2.0 - Deploy Concluído!** 