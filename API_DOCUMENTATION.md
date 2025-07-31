# 📚 Documentação da API - Gestor PRO

## 🌐 Base URL

```
Desenvolvimento: http://localhost:3000/api
Produção: https://sistema-de-cadastro-backend.onrender.com/api
```

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Inclua o token no header de todas as requisições:

```
Authorization: Bearer <seu_token_jwt>
```

## 📋 Endpoints

### 🔑 Autenticação

#### **POST** `/auth/login`
Realiza login do usuário.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gestorpro.com",
    "role": "admin"
  }
}
```

#### **POST** `/auth/register`
Registra novo usuário (apenas admin).

**Body:**
```json
{
  "username": "novo_usuario",
  "email": "usuario@email.com",
  "password": "senha123",
  "role": "vendedor"
}
```

#### **GET** `/auth/validate`
Valida token JWT.

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 📊 Dashboard

#### **GET** `/dashboard/stats`
Retorna estatísticas do dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalClients": 150,
    "totalSalesAmount": 50000.00,
    "totalReceivable": 15000.00,
    "overdueSales": 5000.00,
    "salesThisMonth": 12000.00,
    "salesByMonth": [
      {
        "month": "2024-01",
        "total": 15000.00,
        "count": 45
      }
    ],
    "salesPrediction": [
      {
        "month": "2024-02",
        "predicted": 18000.00
      }
    ]
  }
}
```

### 👥 Clientes

#### **GET** `/clients`
Lista clientes com paginação e busca.

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": 1,
        "nome": "João Silva",
        "cpfCnpj": "123.456.789-00",
        "telefone": "(11) 99999-9999",
        "email": "joao@email.com",
        "endereco": "Rua A, 123",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/clients`
Cria novo cliente.

**Body:**
```json
{
  "nome": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "telefone": "(11) 88888-8888",
  "email": "maria@email.com",
  "endereco": "Rua B, 456"
}
```

#### **GET** `/clients/:id`
Retorna cliente específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpfCnpj": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "email": "joao@email.com",
    "endereco": "Rua A, 123",
    "sales": [
      {
        "id": 1,
        "valorTotal": 1500.00,
        "dataVenda": "2024-01-15T10:30:00Z",
        "status": "Pago"
      }
    ]
  }
}
```

#### **PUT** `/clients/:id`
Atualiza cliente.

**Body:**
```json
{
  "nome": "João Silva Atualizado",
  "telefone": "(11) 77777-7777"
}
```

#### **DELETE** `/clients/:id`
Remove cliente.

**Response (200):**
```json
{
  "success": true,
  "message": "Cliente removido com sucesso"
}
```

### 🛒 Vendas

#### **GET** `/sales`
Lista vendas com paginação e filtros.

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca
- `status` (string): Status da venda
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": 1,
        "cliente": {
          "id": 1,
          "nome": "João Silva"
        },
        "valorTotal": 1500.00,
        "valorPago": 1500.00,
        "dataVenda": "2024-01-15T10:30:00Z",
        "dataVencimento": "2024-02-15T10:30:00Z",
        "status": "Pago",
        "observacoes": "Venda à vista",
        "products": [
          {
            "id": 1,
            "nome": "Produto A",
            "quantidade": 2,
            "precoUnitario": 750.00
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/sales`
Cria nova venda.

**Body:**
```json
{
  "clienteId": 1,
  "valorTotal": 1500.00,
  "valorPago": 1500.00,
  "dataVenda": "2024-01-15T10:30:00Z",
  "dataVencimento": "2024-02-15T10:30:00Z",
  "status": "Pago",
  "observacoes": "Venda à vista",
  "products": [
    {
      "productId": 1,
      "quantidade": 2,
      "precoUnitario": 750.00
    }
  ]
}
```

#### **GET** `/sales/:id`
Retorna venda específica.

#### **PUT** `/sales/:id`
Atualiza venda.

#### **DELETE** `/sales/:id`
Remove venda.

### 📦 Produtos

#### **GET** `/products`
Lista produtos com paginação e busca.

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca
- `category` (string): Categoria do produto

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "nome": "Produto A",
        "descricao": "Descrição do produto",
        "preco": 750.00,
        "estoque": 50,
        "categoria": "Eletrônicos",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/products`
Cria novo produto.

**Body:**
```json
{
  "nome": "Novo Produto",
  "descricao": "Descrição do novo produto",
  "preco": 100.00,
  "estoque": 25,
  "categoria": "Eletrônicos"
}
```

#### **GET** `/products/:id`
Retorna produto específico.

#### **PUT** `/products/:id`
Atualiza produto.

#### **DELETE** `/products/:id`
Remove produto.

### 🛍️ Compras

#### **GET** `/purchases`
Lista compras com paginação e filtros.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": 1,
        "fornecedor": {
          "id": 1,
          "nome": "Fornecedor A"
        },
        "valorTotal": 5000.00,
        "dataCompra": "2024-01-15T10:30:00Z",
        "status": "Concluída",
        "observacoes": "Compra de produtos",
        "products": [
          {
            "id": 1,
            "nome": "Produto A",
            "quantidade": 10,
            "precoUnitario": 500.00
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/purchases`
Cria nova compra.

#### **GET** `/purchases/:id`
Retorna compra específica.

#### **PUT** `/purchases/:id`
Atualiza compra.

#### **DELETE** `/purchases/:id`
Remove compra.

### 🏢 Fornecedores

#### **GET** `/suppliers`
Lista fornecedores.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "id": 1,
        "nome": "Fornecedor A",
        "cnpj": "12.345.678/0001-90",
        "telefone": "(11) 99999-9999",
        "email": "fornecedor@email.com",
        "endereco": "Rua C, 789",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/suppliers`
Cria novo fornecedor.

#### **GET** `/suppliers/:id`
Retorna fornecedor específico.

#### **PUT** `/suppliers/:id`
Atualiza fornecedor.

#### **DELETE** `/suppliers/:id`
Remove fornecedor.

### 👤 Usuários

#### **GET** `/users`
Lista usuários (apenas admin).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@gestorpro.com",
        "role": "admin",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10
    }
  }
}
```

#### **POST** `/users`
Cria novo usuário (apenas admin).

#### **GET** `/users/:id`
Retorna usuário específico.

#### **PUT** `/users/:id`
Atualiza usuário.

#### **DELETE** `/users/:id`
Remove usuário.

### 📈 Relatórios

#### **GET** `/reports/sales`
Relatório de vendas.

**Query Parameters:**
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)
- `format` (string): Formato (json, csv, pdf)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 50000.00,
      "totalPaid": 45000.00,
      "totalReceivable": 5000.00,
      "totalSalesCount": 150
    },
    "salesByMonth": [
      {
        "month": "2024-01",
        "total": 15000.00,
        "count": 45
      }
    ],
    "topProducts": [
      {
        "productId": 1,
        "nome": "Produto A",
        "totalSold": 10000.00,
        "quantity": 20
      }
    ]
  }
}
```

#### **GET** `/reports/cash-flow`
Relatório de fluxo de caixa.

#### **GET** `/reports/inventory`
Relatório de estoque.

### 📊 Exportação

#### **GET** `/clients/export`
Exporta clientes em CSV.

#### **GET** `/sales/export`
Exporta vendas em CSV.

#### **GET** `/products/export`
Exporta produtos em CSV.

## 🔒 Códigos de Status HTTP

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Requisição inválida
- **401** - Não autorizado
- **403** - Acesso negado
- **404** - Não encontrado
- **422** - Dados inválidos
- **500** - Erro interno do servidor

## 📝 Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// Login
const login = async (username, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  return data;
};

// Buscar clientes
const getClients = async (token, page = 1) => {
  const response = await fetch(`/api/clients?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};

// Criar cliente
const createClient = async (token, clientData) => {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(clientData)
  });
  
  const data = await response.json();
  return data;
};
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Buscar clientes
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# Criar cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"nome":"João Silva","cpfCnpj":"123.456.789-00"}'
```

## 🚨 Tratamento de Erros

### Formato de Erro

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### Erros Comuns

- **400** - Dados obrigatórios não fornecidos
- **401** - Token JWT inválido ou expirado
- **403** - Usuário sem permissão para a ação
- **404** - Recurso não encontrado
- **422** - Validação de dados falhou

## 📞 Suporte

Para dúvidas sobre a API, entre em contato:

- **Email**: api@gestorpro.com
- **Documentação**: [docs.gestorpro.com/api](https://docs.gestorpro.com/api)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/gestor-pro/issues) 