# ========================================
# GESTOR PRO - DOCKERFILE
# ========================================
# Build: 2025-08-02 - Corrigido para Node.js 20
# ========================================

# Imagem base Node.js 20 Alpine (leve e segura)
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm install --omit=dev && npm cache clean --force

# Copiar código fonte
COPY . .

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=8080
ENV JWT_SECRET=gestor_pro_jwt_secret_2024_production_secure
ENV JWT_EXPIRES_IN=24h
ENV ENABLE_LOGGING=true
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin123
ENV ADMIN_EMAIL=admin@gestorpro.com

# Configuração do banco de dados (SQLite para produção)
ENV DATABASE_URL=sqlite:///app/database.sqlite

# Criar diretório para uploads
RUN mkdir -p uploads && chmod 755 uploads

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Mudar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["npm", "start"] 