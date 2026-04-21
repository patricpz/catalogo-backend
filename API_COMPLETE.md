# 🚀 DevFlow Backend - API Completa

## ✅ Status: 100% Funcional

Backend Node.js + TypeScript + Express + Prisma completamente implementado e testado.

---

## 🎯 Funcionalidades Implementadas

### 1. **Autenticação JWT** ✅
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil (protegido)

### 2. **Lojas Multi-Tenant** ✅
- `POST /api/stores` - Criar loja (1 por usuário)
- `GET /api/stores/me` - Pegar loja do usuário autenticado
- `PUT /api/stores` - Atualizar loja
- `DELETE /api/stores` - Deletar loja
- Auto-geração de **slug único** a partir do nome
- Suporte a número de WhatsApp

### 3. **Gerenciamento de Produtos** ✅
- `POST /api/products` - Criar produto
- `GET /api/products` - Listar produtos da loja
- `GET /api/products/:productId` - Obter detalhe do produto
- `PUT /api/products/:productId` - Atualizar produto
- `DELETE /api/products/:productId` - Deletar produto

Campos: nome, preço, descrição, imagem (URL), disponibilidade

### 4. **Catálogo Público** ✅
- `GET /api/catalog/:slug` - Obter loja com produtos (SEM AUTENTICAÇÃO)
- Retorna loja com todos os produtos

### 5. **Sistema de Pedidos** ✅
- `POST /api/orders` - Criar pedido com lista de produtos
- `GET /api/orders` - Listar pedidos do usuário
- Cálculo automático de total
- **Link WhatsApp pré-formatado** com mensagem dos itens

### 6. **Link WhatsApp Automatizado** ✅
- URL: `https://wa.me/{phone}?text={mensagem}`
- Mensagem formatada com:
  - 🛒 Nome da loja
  - Lista de produtos (nome | quantidade | preço unitário)
  - 💰 Total do pedido
  - 🔗 ID do pedido

Exemplo:
```
🛒 *Novo Pedido - Test Shop*

• Product A | Qtd: 2 | R$ 199.98

💰 *Total: R$ 199.98*
🔗 Pedido: 1f9dd99e-5331-4bb0-9bf7-7a23277d156b
```

---

## 📊 Entidades do Banco

### User
- `id` (UUID)
- `email` (único)
- `password` (hash bcrypt)
- `createdAt`

### Store
- `id` (UUID)
- `name`
- `slug` (único, gerado automaticamente)
- `whatsappNumber` (opcional)
- `userId` (FK, única - 1 loja por usuário)

### Product
- `id` (UUID)
- `name`
- `description` (opcional)
- `image` (URL, opcional)
- `price` (Decimal 10,2)
- `available` (boolean)
- `storeId` (FK)
- `createdAt`, `updatedAt`

### Order
- `id` (UUID)
- `total` (Decimal 10,2)
- `whatsappLink` (opcional)
- `storeId` (FK)
- `createdAt`

### OrderItem
- `id` (UUID)
- `orderId` (FK)
- `product` (nome snapshot)
- `price` (Decimal 10,2)
- `quantity`

---

## 🔒 Segurança

- ✅ JWT com expiração em 7 dias
- ✅ Senha com hash bcrypt (12 rounds)
- ✅ Middleware de autenticação
- ✅ Isolamento multi-tenant (usuários veem só suas lojas)
- ✅ Tratamento global de erros
- ✅ Validação com Zod

---

## 📦 Scripts NPM

```bash
# Desenvolvimento (recompila ao salvar)
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Prisma commands
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

---

## 🧪 Exemplos de Teste

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Create Store
```bash
curl -X POST http://localhost:5000/api/stores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Shop",
    "whatsappNumber": "+5511987654321"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 2000,
    "description": "Gaming laptop",
    "image": "https://example.com/laptop.jpg",
    "available": true
  }'
```

### Get Public Catalog (no auth!)
```bash
curl http://localhost:5000/api/catalog/my-shop
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-uuid-1",
        "quantity": 2
      },
      {
        "productId": "product-uuid-2",
        "quantity": 1
      }
    ]
  }'
```

---

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── database.ts        (Prisma singleton)
│   └── env.ts             (Variáveis de ambiente)
├── controllers/
│   ├── auth.ts            ❌ (services passaram por auth.service)
│   ├── store.controller.ts
│   ├── product.controller.ts
│   └── order.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── store.service.ts
│   ├── product.service.ts
│   └── order.service.ts
├── repositories/
│   ├── user.repository.ts
│   ├── store.repository.ts
│   └── product.repository.ts
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── store.routes.ts
│   ├── product.routes.ts
│   └── order.routes.ts
├── schemas/
│   ├── auth.schema.ts
│   ├── store.schema.ts
│   ├── product.schema.ts
│   └── order.schema.ts
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── types/
│   └── express.d.ts
├── utils/
│   ├── app-error.ts
│   └── async-handler.ts
├── app.ts
└── server.ts

prisma/
└── schema.prisma
```

---

## 📝 Variáveis de Ambiente

```env
# Banco de dados PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_catalogo?schema=public

# JWT Secret (gere com: openssl rand -base64 48)
JWT_SECRET=dev_secret_32_chars_minimum_length_12345678901234567890

# Opcionais
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Deploy (Docker)

```bash
# Build e rodar com Docker Compose
docker-compose up -d

# API: http://localhost:4000
# Postgres: localhost:5432
```

---

## ✨ Destaques da Implementação

1. **TypeScript Type-Safe** - 100% tipado
2. **Validação Zod** - Schemas robustos
3. **Tratamento de Erro Global** - AppError customizado
4. **Multi-tenant** - Isolamento de dados por usuário
5. **Async/Await** - Código limpo e moderno
6. **Prisma ORM** - Migrations automáticas
7. **JWT Auth** - Tokens com expiração
8. **WhatsApp Integration** - Links pre-formatados com items
9. **Slug Auto-Generated** - Caracteres especiais normalizados

---

## 🎉 Status Final

✅ **Todos os requisitos atendidos**
✅ **Código compilado sem erros**
✅ **API testada e funcionando**
✅ **Pronto para produção**
