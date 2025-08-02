# ========================================
# GESTOR PRO - DOCKERFILE
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
RUN npm ci --omit=dev && npm cache clean --force

# Copiar código fonte
COPY . .

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