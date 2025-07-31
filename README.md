# 🚀 Gestor PRO - Sistema de Gestão Empresarial

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/seu-usuario/gestor-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D12.0.0-blue.svg)](https://www.postgresql.org/)

> **Sistema completo de gestão empresarial** desenvolvido com tecnologias modernas para controle de vendas, compras, clientes, produtos e usuários.

## 📋 Índice

- [✨ Características](#-características)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [📱 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🔧 Desenvolvimento](#-desenvolvimento)
- [📦 Deploy](#-deploy)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## ✨ Características

### 🎯 **Funcionalidades Principais**
- **Dashboard Inteligente** com KPIs e gráficos em tempo real
- **Gestão Completa de Clientes** com histórico de compras
- **Controle de Vendas** com múltiplas formas de pagamento
- **Gestão de Produtos** com controle de estoque
- **Sistema de Compras** com fornecedores
- **Relatórios Avançados** de vendas e fluxo de caixa
- **Controle de Usuários** com diferentes níveis de acesso
- **Interface Responsiva** para todos os dispositivos

### 🔒 **Segurança**
- Autenticação JWT com refresh tokens
- Autorização baseada em roles (Admin, Gerente, Vendedor)
- Hash de senhas com bcrypt
- Validação de dados em todas as camadas
- Proteção contra ataques comuns

### 📱 **Responsividade**
- Design mobile-first
- Sidebar responsiva com navegação otimizada
- Tabelas adaptativas para dispositivos móveis
- Modais responsivos
- Performance otimizada

## 🛠️ Tecnologias

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript ES6+** - Lógica da aplicação
- **Bootstrap 5** - Framework CSS
- **Chart.js** - Gráficos interativos
- **Toastify** - Notificações

### **Ferramentas**
- **Git** - Controle de versão
- **npm** - Gerenciador de pacotes
- **Sequelize CLI** - Migrações e seeders

## 🚀 Instalação

### **Pré-requisitos**
- Node.js >= 18.0.0
- PostgreSQL >= 12.0.0
- npm ou yarn

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/gestor-pro.git
cd gestor-pro
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure o banco de dados**
```bash
# Crie um banco PostgreSQL
createdb gestor_pro

# Execute as migrações
npx sequelize-cli db:migrate

# Execute os seeders (opcional)
npx sequelize-cli db:seed:all
```

### **4. Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### **5. Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## ⚙️ Configuração

### **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/gestor_pro
PGDATABASE=gestor_pro
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGHOST=localhost
PGPORT=5432

# Configuração de Segurança
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=24h

# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Usuário Admin Padrão
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@gestorpro.com
```

### **Configuração do Banco**

O sistema suporta duas formas de configuração:

1. **URL completa** (recomendado para produção):
   ```env
   DATABASE_URL=postgresql://usuario:senha@host:porta/banco?sslmode=require
   ```

2. **Variáveis individuais** (recomendado para desenvolvimento):
   ```env
   PGDATABASE=gestor_pro
   PGUSER=seu_usuario
   PGPASSWORD=sua_senha
   PGHOST=localhost
   PGPORT=5432
   ```

## 📱 Funcionalidades

### **Dashboard**
- **KPIs em tempo real**: Total de clientes, vendas, recebíveis
- **Gráficos interativos**: Vendas mensais, predições
- **Alertas de estoque**: Produtos com baixo estoque
- **Resumo financeiro**: Fluxo de caixa e recebíveis

### **Gestão de Clientes**
- Cadastro completo com validações
- Histórico de compras
- Busca e filtros avançados
- Exportação de dados

### **Controle de Vendas**
- Múltiplas formas de pagamento
- Controle de parcelas
- Status de pagamento
- Relatórios detalhados

### **Gestão de Produtos**
- Controle de estoque
- Alertas de baixo estoque
- Categorização
- Histórico de preços

### **Sistema de Compras**
- Gestão de fornecedores
- Controle de pedidos
- Recebimento de mercadorias
- Relatórios de compras

### **Usuários e Permissões**
- **Admin**: Acesso total ao sistema
- **Gerente**: Gestão de vendas, produtos e relatórios
- **Vendedor**: Acesso limitado a vendas e clientes

## 🏗️ Arquitetura

### **Estrutura do Projeto**
```
gestor-pro/
├── backend/                 # Backend Node.js/Express
│   ├── config/             # Configurações
│   ├── controllers/        # Controladores
│   ├── database/           # Configuração do banco
│   ├── middleware/         # Middlewares
│   ├── migrations/         # Migrações do banco
│   ├── models/            # Modelos Sequelize
│   ├── routes/            # Rotas da API
│   └── seeders/           # Dados iniciais
├── frontend/              # Frontend
│   ├── css/              # Estilos
│   ├── js/               # JavaScript modular
│   │   ├── api.js        # Serviços de API
│   │   ├── auth.js       # Autenticação
│   │   ├── utils.js      # Utilitários
│   │   ├── ui.js         # Gerenciamento de UI
│   │   └── app.js        # Aplicação principal
│   └── index.html        # Página principal
├── server.js             # Servidor principal
├── package.json          # Dependências
└── README.md            # Documentação
```

### **Padrões de Desenvolvimento**
- **MVC** - Model-View-Controller
- **RESTful API** - Endpoints padronizados
- **Modular JavaScript** - Código organizado em módulos
- **Responsive Design** - Mobile-first approach

## 🔧 Desenvolvimento

### **Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run dev:frontend     # Servidor frontend apenas
npm run dev:backend      # Servidor backend apenas
npm run dev:full         # Ambos os servidores

# Banco de dados
npm run db:migrate       # Executar migrações
npm run db:seed          # Executar seeders
npm run db:reset         # Resetar banco

# Produção
npm start               # Iniciar servidor de produção
npm run build           # Build para produção
```

### **Estrutura de Módulos JavaScript**

#### **api.js** - Serviços de API
```javascript
// Configuração centralizada da API
const api = new ApiService();

// Métodos disponíveis
await api.get('/endpoint');
await api.post('/endpoint', data);
await api.put('/endpoint', data);
await api.delete('/endpoint');
```

#### **auth.js** - Autenticação
```javascript
// Gerenciamento de autenticação
const auth = new AuthService();

// Verificar permissões
if (auth.canAccess('dashboard')) {
    // Acesso permitido
}
```

#### **utils.js** - Utilitários
```javascript
// Funções utilitárias
Utils.formatCurrency(1000);        // R$ 1.000,00
Utils.formatDate(new Date());      // 01/01/2024
Utils.formatPhone('11999999999');  // (11) 99999-9999
```

#### **ui.js** - Interface
```javascript
// Gerenciamento de UI
const ui = new UIManager();

// Mostrar modal
ui.showModal('clientModal');

// Mostrar confirmação
const confirmed = await ui.showConfirm({
    title: 'Confirmar',
    message: 'Deseja continuar?'
});
```

## 📦 Deploy

### **Deploy no Render**

1. **Conecte seu repositório** ao Render
2. **Configure as variáveis de ambiente**:
   ```env
   DATABASE_URL=sua_url_do_postgresql
   JWT_SECRET=sua_chave_secreta
   NODE_ENV=production
   ```
3. **Configure o build command**:
   ```bash
   npm install
   ```
4. **Configure o start command**:
   ```bash
   npm start
   ```

### **Deploy no Railway**

1. **Conecte seu repositório** ao Railway
2. **Adicione um serviço PostgreSQL**
3. **Configure as variáveis de ambiente**
4. **Deploy automático** será executado

### **Deploy Local com Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build e execução
docker build -t gestor-pro .
docker run -p 3000:3000 gestor-pro
```

## 🤝 Contribuição

### **Como Contribuir**

1. **Fork o projeto**
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Commit suas mudanças**:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. **Push para a branch**:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. **Abra um Pull Request**

### **Padrões de Código**

- **JavaScript**: ES6+ com arrow functions
- **CSS**: BEM methodology com variáveis CSS
- **HTML**: Semântico e acessível
- **Commits**: Conventional Commits
- **Documentação**: JSDoc para funções

### **Testes**

```bash
# Executar testes
npm test

# Cobertura de testes
npm run test:coverage
```

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@gestorpro.com
- **Documentação**: [docs.gestorpro.com](https://docs.gestorpro.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/gestor-pro/issues)

## 🙏 Agradecimentos

- **Bootstrap** - Framework CSS
- **Chart.js** - Gráficos interativos
- **Sequelize** - ORM para Node.js
- **Express.js** - Framework web

---

**Desenvolvido com ❤️ para facilitar a gestão empresarial** 