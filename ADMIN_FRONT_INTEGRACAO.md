# Guia de Integracao Frontend - Painel Admin

Este documento descreve como integrar o frontend com os endpoints administrativos implementados no backend.

## Base da API

- Base URL local: `http://localhost:5000/api`
- Prefixo admin: `/admin`
- Exemplo completo: `http://localhost:5000/api/admin/dashboard`

## Autenticacao e autorizacao

Todos os endpoints de admin exigem:

1. Header `Authorization: Bearer <token_jwt>`
2. Usuario autenticado com `role = ADMIN`

Se nao houver token, retorna `401`.
Se houver token valido sem permissao de admin, retorna `403`.

## Formato de erro padrao

As respostas de erro seguem o padrao:

```json
{
  "error": true,
  "message": "descricao do erro",
  "code": 401
}
```

Campos adicionais podem aparecer em alguns casos (ex.: `error_code`, `issues` para validacao).

## Convencoes de dados

- Moeda: sempre `number` (float), sem prefixo `R$`
- Datas: `DD/MM/YYYY` ou `ISO 8601` (conforme endpoint)
- Filtros de query: sempre opcionais
- Busca textual: case-insensitive (estilo `LIKE %termo%`)
- Paginacao:
  - `data`
  - `total`
  - `page`
  - `limit`
  - `total_pages`

---

## 1) Dashboard

### GET `/api/admin/dashboard`

Retorna metricas gerais do sistema, pedidos dos ultimos dias, top lojas e atividade recente.

Exemplo de resposta:

```json
{
  "metricas": {
    "total_lojas_ativas": 12,
    "total_usuarios": 240,
    "pedidos_hoje": 18,
    "receita_total": 93210.4,
    "total_produtos": 1430,
    "variacao_lojas": "+2 este mes",
    "variacao_usuarios": "+9 este mes",
    "variacao_pedidos": "+14 este mes",
    "variacao_receita": "+3500.90 este mes",
    "variacao_produtos": "+0 este mes"
  },
  "pedidos_7_dias": [
    { "dia": "Seg", "total": 11 },
    { "dia": "Ter", "total": 9 }
  ],
  "top_5_lojas": [
    { "nome": "Loja XPTO", "receita": 18200.5 }
  ],
  "atividade_recente": [
    {
      "tipo": "PATCH_PRODUCT_STATUS",
      "descricao": "product 9d4f...",
      "timestamp": "2026-04-25T19:12:32.123Z"
    }
  ]
}
```

---

## 2) Lojas

### GET `/api/admin/lojas`

Query params opcionais:

- `page` (default `1`)
- `limit` (default `10`)
- `status`: `Ativa | Inativa | Pendente | Bloqueada`
- `search`: nome ou email do dono

Exemplo:

`/api/admin/lojas?page=1&limit=10&status=Ativa&search=joao`

Resposta:

```json
{
  "data": [
    {
      "id": "uuid-da-loja",
      "nome": "Loja do Joao",
      "dono": "joao@exemplo.com",
      "email_dono": "joao@exemplo.com",
      "status": "Ativa",
      "total_produtos": 24,
      "total_pedidos": 130,
      "receita_total": 10450.9,
      "data_cadastro": "25/04/2026"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### GET `/api/admin/lojas/:id`

Retorna os campos da loja + blocos de `produtos_recentes` e `pedidos_recentes`.

### PATCH `/api/admin/lojas/:id/status`

Body:

```json
{
  "status": "Ativa"
}
```

Valores aceitos: `Ativa | Inativa | Bloqueada`

Observacao: esta acao gera log de auditoria no banco.

---

## 3) Usuarios

### GET `/api/admin/usuarios`

Query params opcionais:

- `page` (default `1`)
- `limit` (default `10`)
- `tipo`: `Cliente | Lojista | Admin`
- `status`: `Ativo | Inativo | Bloqueado | Pendente`
- `search`: nome ou email (atualmente busca por email)

Exemplo:

`/api/admin/usuarios?page=1&limit=10&tipo=Lojista&status=Ativo&search=@exemplo.com`

Resposta:

```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "joao",
      "email": "joao@exemplo.com",
      "tipo": "Lojista",
      "status": "Ativo",
      "data_cadastro": "20/04/2026",
      "ultimo_acesso": "Hoje"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### PATCH `/api/admin/usuarios/:id/status`

Body:

```json
{
  "status": "Bloqueado"
}
```

Valores aceitos: `Ativo | Bloqueado | Inativo`

Observacao: esta acao gera log de auditoria.

---

## 4) Pedidos

### GET `/api/admin/pedidos`

Query params opcionais:

- `page` (default `1`)
- `limit` (default `10`)
- `status`: `Aguardando | Em andamento | Entregue | Cancelado`
- `search`: id ou nome do cliente
- `data_inicio`: `YYYY-MM-DD`
- `data_fim`: `YYYY-MM-DD`

Exemplo:

`/api/admin/pedidos?page=1&limit=10&status=Entregue&search=joao&data_inicio=2026-04-01&data_fim=2026-04-30`

Resposta:

```json
{
  "data": [
    {
      "id": "#AB12",
      "cliente": "Joao",
      "loja": "Loja do Joao",
      "total_itens": 3,
      "valor_total": 189.9,
      "status": "Entregue",
      "data": "25/04/2026"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### GET `/api/admin/pedidos/:id`

Aceita o id curto exibido com `#` ou id interno.

Resposta inclui:

- dados principais do pedido
- `itens`
- `endereco_entrega`
- `historico_status`

---

## 5) Catalogos

### GET `/api/admin/catalogos`

Query params opcionais:

- `search`: nome do catalogo
- `loja_id`: id da loja

Exemplo:

`/api/admin/catalogos?search=verao&loja_id=uuid-loja`

Resposta:

```json
{
  "data": [
    {
      "id": "uuid-catalogo",
      "loja": "Loja do Joao",
      "loja_id": "uuid-loja",
      "nome": "Colecao Verao",
      "categorias": ["Moda", "Praia"],
      "total_produtos": 0,
      "data_atualizacao": "2026-04-25T19:22:13.120Z",
      "status": "Publicado"
    }
  ],
  "total": 1
}
```

### PATCH `/api/admin/catalogos/:id/status`

Body:

```json
{
  "status": "Pausado"
}
```

Valores aceitos: `Publicado | Pausado`

Observacao: gera log de auditoria.

---

## 6) Produtos

### GET `/api/admin/produtos`

Query params opcionais:

- `page` (default `1`)
- `limit` (default `20`)
- `loja_id`
- `categoria`
- `status`: `Ativo | Inativo`
- `search`: nome

Exemplo:

`/api/admin/produtos?page=1&limit=20&loja_id=uuid&categoria=Moda&status=Ativo&search=camiseta`

Resposta:

```json
{
  "data": [
    {
      "id": "uuid-produto",
      "nome": "Camiseta Basica",
      "loja": "Loja do Joao",
      "loja_id": "uuid-loja",
      "categoria": "Moda",
      "preco": 49.9,
      "estoque": 10,
      "status": "Ativo",
      "imagem_url": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "total_pages": 1
}
```

### PATCH `/api/admin/produtos/:id/status`

Body:

```json
{
  "status": "Inativo"
}
```

Valores aceitos: `Ativo | Inativo`

Observacao: gera log de auditoria.

### DELETE `/api/admin/produtos/:id`

Remove o produto.

Resposta:

```json
{
  "deleted": true
}
```

Observacao: gera log de auditoria.

---

## Checklist rapido para o frontend

1. Criar cliente HTTP com injeção de Bearer token.
2. Tratar `401` (logout/refresh) e `403` (tela sem permissao).
3. Padronizar leitura de paginacao (`data`, `total`, `page`, `limit`, `total_pages`).
4. Exibir moeda usando formatacao no frontend (`Intl.NumberFormat`).
5. Exibir datas no timezone desejado (backend entrega DD/MM/YYYY ou ISO).
6. Usar debounce para `search` nos list endpoints.
7. Confirmar acao para `PATCH/DELETE` e atualizar lista apos sucesso.

## Observacoes de implementacao backend

- O modulo admin foi adicionado em `src/routes/admin.routes.ts`.
- Validacoes de entrada estao em `src/schemas/admin.schema.ts`.
- Regras e consultas estao em `src/services/admin.service.ts`.
- Permissao admin via `requireAdminMiddleware`.
- Auditoria persistida em `AuditLog`.
