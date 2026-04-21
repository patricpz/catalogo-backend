# DevFlow API - Rotas Completas

**URL Base:** `http://localhost:5000/api`

> ⚠️ Sem indicação de autenticação = rota pública
> 🔐 Com `[Bearer Token]` = requer autenticação JWT

---

## 🔐 Autenticação

### Registrar Usuário
```
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123"
}

Response 201:
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "createdAt": "2025-04-05T10:00:00Z"
  },
  "accessToken": "eyJhbGc...",
  "expiresIn": "7d"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123"
}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "createdAt": "2025-04-05T10:00:00Z"
  },
  "accessToken": "eyJhbGc...",
  "expiresIn": "7d"
}
```

### Perfil do Usuário
```
GET /auth/me
Authorization: Bearer {accessToken}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "createdAt": "2025-04-05T10:00:00Z"
  }
}
```

---

## 🏪 Lojas (Stores)

### Criar Loja
```
POST /stores
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Minha Loja",
  "whatsappNumber": "+5511999999999" // opcional
}

Response 201:
{
  "store": {
    "id": "uuid",
    "name": "Minha Loja",
    "slug": "minha-loja",
    "whatsappNumber": "+5511999999999",
    "userId": "uuid"
  }
}
```

### Obter Loja do Usuário Autenticado
```
GET /stores/me
Authorization: Bearer {accessToken}

Response 200:
{
  "store": {
    "id": "uuid",
    "name": "Minha Loja",
    "slug": "minha-loja",
    "whatsappNumber": "+5511999999999",
    "userId": "uuid"
  }
}
```

### Atualizar Loja
```
PUT /stores
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Loja Atualizada", // opcional
  "whatsappNumber": "+5511988888888" // opcional
}

Response 200:
{
  "store": {
    "id": "uuid",
    "name": "Loja Atualizada",
    "slug": "minha-loja",
    "whatsappNumber": "+5511988888888",
    "userId": "uuid"
  }
}
```

### Deletar Loja
```
DELETE /stores
Authorization: Bearer {accessToken}

Response 200:
{
  "message": "Loja deletada com sucesso"
}
```

### Obter Catálogo Público (por slug) ⚠️ SEM AUTENTICAÇÃO
```
GET /catalog/:slug
Content-Type: application/json

Exemplo: GET /catalog/minha-loja

Response 200:
{
  "store": {
    "id": "uuid",
    "name": "Minha Loja",
    "slug": "minha-loja",
    "whatsappNumber": "+5511999999999",
    "products": [
      {
        "id": "uuid",
        "name": "Produto 1",
        "description": "Descrição do produto",
        "image": "https://exemplo.com/imagem.jpg",
        "price": 99.90,
        "available": true,
        "storeId": "uuid",
        "createdAt": "2025-04-05T10:00:00Z",
        "updatedAt": "2025-04-05T10:00:00Z"
      }
    ]
  }
}
```

---

## 📦 Produtos

### Criar Produto
```
POST /products
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Produto Novo",
  "description": "Descrição do produto", // opcional
  "image": "https://exemplo.com/imagem.jpg", // opcional
  "price": 99.90,
  "available": true // padrão: true
}

Response 201:
{
  "product": {
    "id": "uuid",
    "name": "Produto Novo",
    "description": "Descrição do produto",
    "image": "https://exemplo.com/imagem.jpg",
    "price": 99.90,
    "available": true,
    "storeId": "uuid",
    "createdAt": "2025-04-05T10:00:00Z",
    "updatedAt": "2025-04-05T10:00:00Z"
  }
}
```

### Listar Produtos da Loja
```
GET /products
Authorization: Bearer {accessToken}

Response 200:
{
  "products": [
    {
      "id": "uuid",
      "name": "Produto 1",
      "description": "...",
      "image": "https://exemplo.com/imagem.jpg",
      "price": 99.90,
      "available": true,
      "storeId": "uuid",
      "createdAt": "2025-04-05T10:00:00Z",
      "updatedAt": "2025-04-05T10:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Produto 2",
      "description": "...",
      "image": "https://exemplo.com/imagem2.jpg",
      "price": 149.90,
      "available": false,
      "storeId": "uuid",
      "createdAt": "2025-04-05T10:00:00Z",
      "updatedAt": "2025-04-05T10:00:00Z"
    }
  ]
}
```

### Obter Detalhes de um Produto
```
GET /products/:productId
Authorization: Bearer {accessToken}

Exemplo: GET /products/uuid-do-produto

Response 200:
{
  "product": {
    "id": "uuid",
    "name": "Produto 1",
    "description": "Descrição",
    "image": "https://exemplo.com/imagem.jpg",
    "price": 99.90,
    "available": true,
    "storeId": "uuid",
    "createdAt": "2025-04-05T10:00:00Z",
    "updatedAt": "2025-04-05T10:00:00Z"
  }
}
```

### Atualizar Produto
```
PUT /products/:productId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Produto Atualizado", // opcional
  "description": "Nova descrição", // opcional
  "image": "https://exemplo.com/nova-imagem.jpg", // opcional
  "price": 129.90, // opcional
  "available": false // opcional
}

Response 200:
{
  "product": {
    "id": "uuid",
    "name": "Produto Atualizado",
    "description": "Nova descrição",
    "image": "https://exemplo.com/nova-imagem.jpg",
    "price": 129.90,
    "available": false,
    "storeId": "uuid",
    "createdAt": "2025-04-05T10:00:00Z",
    "updatedAt": "2025-04-05T10:00:00Z"
  }
}
```

### Deletar Produto
```
DELETE /products/:productId
Authorization: Bearer {accessToken}

Response 200:
{
  "message": "Produto deletado com sucesso"
}
```

---

## 🛒 Pedidos (Orders)

### Criar Pedido
```
POST /orders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid-do-produto-1",
      "quantity": 2
    },
    {
      "productId": "uuid-do-produto-2",
      "quantity": 1
    }
  ]
}

Response 201:
{
  "order": {
    "id": "uuid-do-pedido",
    "total": 249.70,
    "whatsappLink": "https://wa.me/5511999999999?text=🛒%20*Novo%20Pedido...",
    "storeId": "uuid",
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid-do-pedido",
        "product": "Produto 1",
        "price": 99.90,
        "quantity": 2
      },
      {
        "id": "uuid",
        "orderId": "uuid-do-pedido",
        "product": "Produto 2",
        "price": 149.90,
        "quantity": 1
      }
    ],
    "createdAt": "2025-04-05T10:00:00Z"
  }
}
```

### Obter Link do WhatsApp do Pedido
O campo `whatsappLink` é retornado automaticamente na criação do pedido. Ele já vem formatado e pronto para usar.

**Formato da mensagem no WhatsApp:**
```
🛒 *Novo Pedido - Minha Loja*

• Produto 1 | Qtd: 2 | R$ 199.80
• Produto 2 | Qtd: 1 | R$ 149.90

💰 *Total: R$ 349.70*
🔗 Pedido: uuid-do-pedido
```

### Listar Pedidos da Loja
```
GET /orders
Authorization: Bearer {accessToken}

Response 200:
{
  "orders": [
    {
      "id": "uuid",
      "total": 249.70,
      "whatsappLink": "https://wa.me/...",
      "storeId": "uuid",
      "items": [
        {
          "id": "uuid",
          "orderId": "uuid",
          "product": "Produto 1",
          "price": 99.90,
          "quantity": 2
        }
      ],
      "createdAt": "2025-04-05T10:00:00Z"
    }
  ]
}
```

---

## 🏥 Health Check

### Status da API
```
GET /health

Response 200:
{
  "status": "ok"
}
```

---

## 📋 Resumo de Autenticação

### Usar o Token JWT

Adicione o header em todas as requisições autenticadas:

```
Authorization: Bearer <seu_accessToken>
```

**Exemplo com curl:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/stores/me
```

**Exemplo com JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:5000/api/stores/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🚨 Códigos de Erro

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Dados inválidos ou faltando |
| 401 | Unauthorized | Token não informado ou inválido |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Recurso já existe (ex: loja duplicada) |
| 500 | Internal Server Error | Erro do servidor |

**Formato de erro:**
```json
{
  "message": "Descrição do erro",
  "code": "CODIGO_DO_ERRO"
}
```

---

## 💡 Fluxo Recomendado

1. **Registrar/Login** → obter `accessToken`
2. **Criar Loja** → obter `slug` da loja
3. **Criar Produtos** → adicionar ao catálogo
4. **Listar Catálogo Público** → listar produtos por slug (sem auth)
5. **Criar Pedido** → gerar link WhatsApp automático
