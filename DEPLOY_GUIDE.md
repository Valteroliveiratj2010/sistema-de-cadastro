# 🚀 Guia de Deploy - Gestor PRO

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [☁️ Deploy no Render](#️-deploy-no-render)
- [🚂 Deploy no Railway](#-deploy-no-railway)
- [🐳 Deploy com Docker](#-deploy-com-docker)
- [🌐 Deploy no Vercel](#-deploy-no-vercel)
- [🔧 Configuração de Produção](#️-configuração-de-produção)
- [📊 Monitoramento](#-monitoramento)
- [🔒 Segurança](#-segurança)

## 🎯 Visão Geral

Este guia apresenta diferentes opções para fazer o deploy do **Gestor PRO** em produção, desde plataformas gerenciadas até soluções self-hosted.

## ☁️ Deploy no Render

### **1. Preparação**

1. **Crie uma conta** no [Render](https://render.com)
2. **Conecte seu repositório** GitHub/GitLab
3. **Crie um banco PostgreSQL** no Render

### **2. Configuração do Serviço**

1. **Crie um novo Web Service**
2. **Configure o repositório**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### **3. Variáveis de Ambiente**

Configure as seguintes variáveis no Render:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Segurança
JWT_SECRET=sua_chave_secreta_muito_segura_2024
JWT_EXPIRES_IN=24h

# Servidor
NODE_ENV=production
PORT=10000

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
ADMIN_EMAIL=admin@seudominio.com
```

### **4. Configuração do Banco**

1. **Crie um PostgreSQL** no Render
2. **Copie a DATABASE_URL** fornecida
3. **Configure a variável** no seu serviço web

### **5. Deploy**

1. **Faça push** para o repositório
2. **Render fará deploy automático**
3. **Acesse a URL** fornecida

### **6. Configuração de Domínio (Opcional)**

1. **Vá em Settings** > **Custom Domains**
2. **Adicione seu domínio**
3. **Configure DNS** conforme instruções

## 🚂 Deploy no Railway

### **1. Preparação**

1. **Crie uma conta** no [Railway](https://railway.app)
2. **Conecte seu repositório** GitHub
3. **Crie um novo projeto**

### **2. Configuração do Serviço**

1. **Adicione um serviço** do tipo "GitHub Repo"
2. **Selecione seu repositório**
3. **Railway detectará automaticamente** que é um projeto Node.js

### **3. Configuração do Banco**

1. **Adicione um PostgreSQL** ao projeto
2. **Railway conectará automaticamente** os serviços
3. **A DATABASE_URL será injetada** automaticamente

### **4. Variáveis de Ambiente**

Configure no painel do Railway:

```env
JWT_SECRET=sua_chave_secreta_muito_segura_2024
JWT_EXPIRES_IN=24h
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
ADMIN_EMAIL=admin@seudominio.com
```

### **5. Deploy**

1. **Railway fará deploy automático** a cada push
2. **Acesse a URL** fornecida
3. **Configure domínio personalizado** se necessário

## 🐳 Deploy com Docker

### **1. Dockerfile**

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

### **2. Docker Compose**

Crie um `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/gestor_pro
      - JWT_SECRET=sua_chave_secreta
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=gestor_pro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### **3. Deploy Local**

```bash
# Build e execução
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### **4. Deploy em Servidor**

```bash
# No servidor
git clone https://github.com/seu-usuario/gestor-pro.git
cd gestor-pro

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env

# Deploy
docker-compose up -d
```

## 🌐 Deploy no Vercel

### **1. Preparação**

1. **Crie uma conta** no [Vercel](https://vercel.com)
2. **Conecte seu repositório** GitHub
3. **Configure o projeto**

### **2. Configuração**

Crie um arquivo `vercel.json` na raiz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **3. Variáveis de Ambiente**

Configure no painel do Vercel:

```env
DATABASE_URL=sua_url_do_banco
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha
ADMIN_EMAIL=admin@seudominio.com
```

### **4. Deploy**

1. **Vercel fará deploy automático**
2. **Acesse a URL** fornecida
3. **Configure domínio personalizado**

## 🔧 Configuração de Produção

### **1. Variáveis de Ambiente Essenciais**

```env
# OBRIGATÓRIAS
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=chave_super_secreta_e_unica_2024
NODE_ENV=production

# RECOMENDADAS
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha_muito_segura_123
ADMIN_EMAIL=admin@seudominio.com

# OPCIONAIS
PORT=3000
ENABLE_LOGGING=true
CORS_ORIGINS=https://seudominio.com
```

### **2. Configuração do Banco**

#### **PostgreSQL Recomendado**

```sql
-- Criar banco
CREATE DATABASE gestor_pro;

-- Criar usuário
CREATE USER gestor_user WITH PASSWORD 'senha_segura';

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE gestor_pro TO gestor_user;
```

#### **Migrações**

```bash
# Executar migrações
npx sequelize-cli db:migrate

# Executar seeders
npx sequelize-cli db:seed:all
```

### **3. Configuração de SSL**

#### **Certificado Let's Encrypt**

```bash
# Instalar Certbot
sudo apt-get install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **4. Configuração de Proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### **1. Logs**

#### **Configuração de Logs**

```javascript
// server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### **Monitoramento de Logs**

- **Papertrail** - Para logs em tempo real
- **Loggly** - Para análise de logs
- **Sentry** - Para monitoramento de erros

### **2. Métricas**

#### **Health Check**

```javascript
// Adicione ao server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

#### **Monitoramento de Performance**

- **PM2** - Para monitoramento de processos
- **New Relic** - Para APM
- **DataDog** - Para monitoramento completo

### **3. Backup**

#### **Backup do Banco**

```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Backup automático (crontab)
0 2 * * * /path/to/backup_script.sh
```

## 🔒 Segurança

### **1. Configurações de Segurança**

#### **Headers de Segurança**

```javascript
// server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

#### **Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP'
});

app.use('/api/', limiter);
```

### **2. Configuração de CORS**

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **3. Validação de Dados**

```javascript
const { body, validationResult } = require('express-validator');

const validateClient = [
  body('nome').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('cpfCnpj').isLength({ min: 11, max: 14 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
```

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. Erro de Conexão com Banco**

```bash
# Verificar conectividade
psql $DATABASE_URL -c "SELECT 1;"

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

#### **2. Erro de Porta**

```bash
# Verificar porta em uso
lsof -i :3000

# Matar processo
kill -9 <PID>
```

#### **3. Erro de Permissões**

```bash
# Verificar permissões
ls -la

# Corrigir permissões
chmod 755 .
chmod 644 *.js
```

### **Logs de Debug**

```bash
# Ver logs do aplicativo
tail -f logs/app.log

# Ver logs do sistema
journalctl -u gestor-pro -f

# Ver logs do Docker
docker-compose logs -f app
```

## 📞 Suporte

Para problemas de deploy:

- **Email**: deploy@gestorpro.com
- **Documentação**: [docs.gestorpro.com/deploy](https://docs.gestorpro.com/deploy)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/gestor-pro/issues)

---

**Deploy realizado com sucesso! 🎉** 