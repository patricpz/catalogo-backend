# ✅ DevFlow Backend - Implementação Concluída

## 🎯 O que foi criado

Backend completo Node.js + TypeScript + Express + Prisma (PostgreSQL) para um SaaS de lojas online.

## 📁 Estrutura Final do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Configuração de variáveis de ambiente
│   │   └── database.ts         # Configuração Prisma Client
│   ├── controllers/
│   │   ├── user.controller.ts      # Auth (register, login, me)
│   │   ├── store.controller.ts     # Lojas CRUD + catálogo público
│   │   ├── product.controller.ts   # Produtos CRUD
│   │   └── order.controller.ts     # Pedidos
│   ├── services/
│   │   ├── auth.service.ts         # Lógica de autenticação
│   │   ├── store.service.ts        # Lógica de lojas
│   │   ├── product.service.ts      # Lógica de produtos
│   │   └── order.service.ts        # Lógica de pedidos + WhatsApp link
│   ├── repositories/
│   │   ├── user.repository.ts      # Data access layer - Usuários
│   │   ├── store.repository.ts     # Data access layer - Lojas
│   │   └── product.repository.ts   # Data access layer - Produtos
│   ├── routes/
│   │   ├── index.ts                # Router principal com catálogo público
│   │   ├── auth.routes.ts          # Rotas de autenticação
│   │   ├── store.routes.ts         # Rotas de lojas
│   │   ├── product.routes.ts       # Rotas de produtos
│   │   └── order.routes.ts         # Rotas de pedidos
│   ├── schemas/
│   │   ├── auth.schema.ts          # Validação - Autenticação
│   │   ├── store.schema.ts         # Validação - Lojas
│   │   ├── product.schema.ts       # Validação - Produtos
│   │   └── order.schema.ts         # Validação - Pedidos
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   └── error.middleware.ts     # Tratamento global de erros
│   ├── types/
│   │   └── express.d.ts            # Tipos TypeScript globais
│   ├── utils/
│   │   ├── app-error.ts            # Classe AppError personalizada
│   │   └── async-handler.ts        # Wrapper para async/await em controllers
│   ├── app.ts                      # Configuração Express
│   └── server.ts                   # Entrada principal
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   └── migrations/                 # Histórico de migrações
├── dist/                           # Build compilado (criado por npm run build)
├── .env                            # Variáveis de ambiente (git ignored)
├── .env.example                    # Template de variáveis de ambiente
├── package.json                    # Dependências
├── tsconfig.json                   # Configuração TypeScript
├── docker-compose.yml              # PostgreSQL via Docker
├── Dockerfile                      # Imagem para produção
├── README.md                       # Documentação completa
├── EXAMPLES.md                     # Exemplos de requisição cURL
└── .gitignore                      # Arquivos ignorados no Git
```

## 🏗️ Entidades do Banco de Dados

### User
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, bcrypt hashed)
- `createdAt` (DateTime)

### Store
- `id` (UUID, PK)
- `name` (String)
- `slug` (String, unique - gerado automaticamente)
- `whatsappNumber` (String, optional)
- `userId` (String, FK - unique, 1 store per user)
- `products` (Relation: Product[])
- `orders` (Relation: Order[])

### Product
- `id` (UUID, PK)
- `name` (String)
- `description` (String, optional)
- `image` (String, optional - URL)
- `price` (Decimal)
- `available` (Boolean, default: true)
- `storeId` (String, FK)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Order
- `id` (UUID, PK)
- `total` (Decimal - calculado automaticamente)
- `whatsappLink` (String - gerado automaticamente)
- `storeId` (String, FK)
- `items` (Relation: OrderItem[])
- `createdAt` (DateTime)

### OrderItem
- `id` (UUID, PK)
- `orderId` (String, FK)
- `product` (String - snapshot do nome)
- `price` (Decimal - snapshot do preço)
- `quantity` (Int)

## 🚀 Funcionalidades Implementadas

✅ **Autenticação**
- Register (criar novo usuário com email/senha)
- Login (obter JWT token)
- Get Profile (verificar dados do usuário logado)
- JWT middleware (verificar autenticação em rotas protegidas)

✅ **Lojas (Multi-tenant)**
- Criar loja (1 loja por usuário)
- Obter minha loja (autenticado)
- Obter catálogo público por slug (sem autenticação)
- Atualizar loja (nome, WhatsApp)
- Deletar loja (cascade delete de products e orders)

✅ **Produtos**
- CRUD completo (Create, Read, Update, Delete)
- Campos: nome, descrição, imagem (URL), preço, disponibilidade
- Listagem ordenada por data de criação (desc)
- Validação de preço positivo
- Isolamento por loja (usuário só vê seus produtos)

✅ **Pedidos**
- Criar pedido com múltiplos itens
- Validação de produtos disponíveis
- Cálculo automático de total
- Geração automática de link WhatsApp formatado
- Snapshot dos produtos no pedido (price/name)
- Listagem de pedidos do usuário

✅ **Catálogo Público**
- Endpoint `/api/catalog/:slug` (sem autenticação)
- Retorna loja + todos os produtos disponíveis
- Slug único como identificador da loja

✅ **Validação**
- Zod schema em todas as entidades
- Email validation
- Senha mínimo 8 caracteres
- Preço > 0
- Número WhatsApp em formato válido

✅ **Tratamento de Erros**
- Middleware global de erro
- AppError class personalizada
- Tratamento específico para ZodError
- Códigos de erro padronizados

✅ **Segurança**
- Bcrypt para hash de senha (12 salt rounds)
- JWT com expiração configurável (padrão: 7 dias)
- Variáveis de ambiente protegidas
- Isolamento de dados por tenant

✅ **Scripts NPM**
- `npm run dev` - Dev server com live reload
- `npm run build` - Build para produção
- `npm start` - Executa servidor compilado
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Cria/executa migrações
- `npm run prisma:studio` - Abre GUI do banco

## 🔧 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
docker-compose up -d
npm run prisma:migrate
```

### 3. Iniciar servidor
```bash
npm run dev
```

API estará em: `http://localhost:5000/api`

### 4. Fazer requisições
Veja `EXAMPLES.md` para exemplos completos de cURL/HTTP.

## 📝 Exemplo Mínimo de Uso

```bash
# 1. Registrar
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"loja@devflow.com","password":"senha123456"}'

# 2. Obter token (response.accessToken)
TOKEN="eyJ..."

# 3. Criar loja
curl -X POST http://localhost:5000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Minha Loja","whatsappNumber":"+5511999999999"}'

# 4. Criar produto
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Camiseta","price":49.90,"available":true}'

# 5. Criar pedido
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"productId":"uuid","quantity":2}]}'

# 6. Obter catálogo público (qualquer pessoa)
curl http://localhost:5000/api/catalog/minha-loja
```

## 📊 Links WhatsApp Gerados

O sistema gera automaticamente um link WhatsApp formatado como:

```
https://wa.me/5511999999999?text=🛒+*Novo+Pedido+-+Minha+Loja*%0A%0A•+Camiseta+|+Qtd:+2+|+R$+99.80%0A•+Calça+|+Qtd:+1+|+R$+89.90%0A%0A💰+*Total:+R$+189.70*%0A🔗+Pedido:+uuid-order-123
```

Quando clicado, abre o WhatsApp com a mensagem pré-formatada contendo os itens do pedido.

## 🔐 Variáveis de Ambiente Required

```env
DATABASE_URL=postgresql://...
JWT_SECRET=seu-secret-longo
```

Opcional:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_EXPIRES_IN=7d
```

## 📚 Documentação

- **README.md** - Guia completo de setup e uso
- **EXAMPLES.md** - Exemplos detalhados de todas as requisições
- **Inspecione os arquivos de schema** - Validação Zod completa de cada entidade

## 🧪 Próximos Passos (Opcional)

Se você quiser expandir:

1. **Frontend** - React/Vue para consumir a API
2. **Autenticação Social** - Google/GitHub OAuth
3. **Pagamentos** - Integração com Stripe/PagSeguro
4. **Email** - Notificações de pedidos por email
5. **S3/Uploads** - Upload de imagens dos produtos
6. **Testes** - Jest/Vitest para testes unitários/integração
7. **Logs** - Winston/Pino para logging estruturado
8. **Rate Limiting** - Express-rate-limit
9. **Documentação Swagger** - Swagger/OpenAPI
10. **Deploy** - AWS/Vercel/Railway

## 📞 Suporte

Se tiver dúvidas:
1. Verifique `README.md` e `EXAMPLES.md`
2. Verifique se PostgreSQL está rodando: `docker ps`
3. Verifique `.env` - credenciais corretas?
4. Verifique logs: `npm run dev`

---

✨ **Backend pronto para produção!** ✨
