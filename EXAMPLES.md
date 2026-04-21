# 📝 Exemplos de Requisição - DevFlow API

Base URL: `http://localhost:5000/api`

## 1️⃣ Autenticação

### Registrar novo usuário
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "loja@devflow.com",
    "password": "senha123456"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid-123",
    "email": "loja@devflow.com",
    "createdAt": "2026-04-05T20:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "loja@devflow.com",
    "password": "senha123456"
  }'
```

### Obter perfil (autenticado)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <seu_token>"
```

---

## 2️⃣ Lojas (Requer Autenticação)

### Criar loja
```bash
curl -X POST http://localhost:5000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "name": "Minha Loja",
    "whatsappNumber": "+5511999999999"
  }'
```

**Resposta:**
```json
{
  "store": {
    "id": "uuid-456",
    "name": "Minha Loja",
    "slug": "minha-loja",
    "whatsappNumber": "+5511999999999",
    "userId": "uuid-123"
  }
}
```

### Obter minha loja
```bash
curl -X GET http://localhost:5000/api/stores/me \
  -H "Authorization: Bearer <seu_token>"
```

### Atualizar loja
```bash
curl -X PUT http://localhost:5000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "whatsappNumber": "+5511988888888"
  }'
```

### Deletar loja
```bash
curl -X DELETE http://localhost:5000/api/stores \
  -H "Authorization: Bearer <seu_token>"
```

---

## 3️⃣ Catálogo Público (Sem Autenticação)

### Obter catálogo da loja por slug
```bash
curl -X GET http://localhost:5000/api/catalog/minha-loja
```

**Resposta:**
```json
{
  "store": {
    "id": "uuid-456",
    "name": "Minha Loja",
    "slug": "minha-loja",
    "whatsappNumber": "+5511999999999",
    "userId": "uuid-123",
    "products": [
      {
        "id": "uuid-789",
        "name": "Camiseta",
        "description": "100% algodão",
        "price": "49.90",
        "image": "https://...",
        "available": true,
        "createdAt": "2026-04-05T20:00:00Z",
        "updatedAt": "2026-04-05T20:00:00Z"
      }
    ]
  }
}
```

---

## 4️⃣ Produtos (Requer Autenticação)

### Criar produto
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "name": "Camiseta Azul",
    "description": "Camiseta 100% algodão, cor azul",
    "price": 49.90,
    "image": "https://exemplo.com/camiseta-azul.jpg",
    "available": true
  }'
```

### Listar meus produtos
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <seu_token>"
```

### Obter detalhes de um produto
```bash
curl -X GET http://localhost:5000/api/products/uuid-789 \
  -H "Authorization: Bearer <seu_token>"
```

### Atualizar produto
```bash
curl -X PUT http://localhost:5000/api/products/uuid-789 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "price": 59.90,
    "available": false
  }'
```

### Deletar produto
```bash
curl -X DELETE http://localhost:5000/api/products/uuid-789 \
  -H "Authorization: Bearer <seu_token>"
```

---

## 5️⃣ Pedidos (Requer Autenticação)

### Criar pedido
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "items": [
      {
        "productId": "uuid-789",
        "quantity": 2
      },
      {
        "productId": "uuid-790",
        "quantity": 1
      }
    ]
  }'
```

**Resposta:**
```json
{
  "order": {
    "id": "uuid-order-123",
    "total": "148.70",
    "whatsappLink": "https://wa.me/5511999999999?text=🛒+*Novo+Pedido+-+Minha+Loja*%0A...",
    "storeId": "uuid-456",
    "createdAt": "2026-04-05T20:00:00Z",
    "items": [
      {
        "id": "uuid-item-1",
        "orderId": "uuid-order-123",
        "product": "Camiseta Azul",
        "price": "49.90",
        "quantity": 2
      },
      {
        "id": "uuid-item-2",
        "orderId": "uuid-order-123",
        "product": "Calça Preta",
        "price": "89.90",
        "quantity": 1
      }
    ]
  }
}
```

### Listar meus pedidos
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer <seu_token>"
```

---

## 🔗 WhatsApp Link

O pedido gera automaticamente um link do WhatsApp. Use o campo `whatsappLink` para redirecionar o cliente:

```html
<a href="https://wa.me/5511999999999?text=🛒 *Novo Pedido - Minha Loja*...">
  Enviar pelo WhatsApp
</a>
```

---

## 🐛 Tratamento de Erros

### Erro de Validação (400)
```json
{
  "message": "Dados inválidos",
  "issues": {
    "fieldErrors": {
      "email": ["E-mail inválido"],
      "password": ["Senha deve ter no mínimo 8 caracteres"]
    }
  }
}
```

### Não Autenticado (401)
```json
{
  "message": "Token não informado",
  "code": "UNAUTHORIZED"
}
```

### Recurso Não Encontrado (404)
```json
{
  "message": "Loja não encontrada",
  "code": "STORE_NOT_FOUND"
}
```

### Conflito (409)
```json
{
  "message": "Você já possui uma loja",
  "code": "STORE_EXISTS"
}
```

---

## 📊 Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

**Resposta:**
```json
{
  "status": "ok"
}
```
