<!-- SETUP.md -->

# ⚡ Setup em 2 Minutos

## Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

## Instalação

### 1️⃣ Clonar / Já está no diretório
```bash
cd /path/to/backend
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Iniciar PostgreSQL
```bash
docker-compose up -d
```

### 4️⃣ Aplicar migrations
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

### 5️⃣ Rodar servidor em desenvolvimento
```bash
npm run dev
```

✅ Pronto! API rodando em `http://localhost:5000`

---

## ✅ Verificar se tudo funciona

```bash
curl http://localhost:5000/api/health
# Resposta: {"status":"ok"}
```

---

## 🎯 Próximos Passos

1. **Ver exemplos de uso**: Abra `README.md`
2. **Testar API**: Use exemplos do `README.md` ou `EXAMPLES.md`
3. **Entender estrutura**: Leia `IMPLEMENTATION.md`
4. **Checklist de features**: Veja `CHECKLIST.md`

---

## 📝 Comandos Úteis

```bash
# Dev (recompila ao salvar)
npm run dev

# Build para produção
npm run build

# Iniciar servidor (prod)
npm start

# Prisma Studio (UI do banco)
npm run prisma:studio

# Migrations
npm run prisma:migrate
npm run prisma:generate
```

---

## 🆘 Problemas Comuns

### ❌ Porta 5000 já em uso
```bash
# Matar processo na porta
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### ❌ PostgreSQL não conecta
```bash
docker-compose restart db
# Espere 5 segundos e tente novamente
```

### ❌ Erro ao fazer migrate
```bash
npx prisma db push --accept-data-loss
```

---

## 🔗 Documentação

- `README.md` - Guia rápido de uso
- `EXAMPLES.md` - Exemplos de curl/requests
- `IMPLEMENTATION.md` - Arquitetura e detalhes técnicos
- `API_COMPLETE.md` - Documentação completa da API
- `CHECKLIST.md` - Requisitos executados

---

**Tudo pronto! 🚀**
