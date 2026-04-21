#!/bin/bash
# DevFlow API - Testes com cURL
# Execute este script para testar todas as rotas

API_URL="http://localhost:5000/api"
TOKEN=""

echo "🚀 DevFlow API - Teste de Rotas"
echo "================================"
echo ""

# 1. REGISTRAR USUÁRIO
echo "1️⃣  Registrando usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123456"
  }')

echo "$REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "✓ Token obtido: $TOKEN"
echo ""

# 2. LOGIN
echo "2️⃣  Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123456"
  }')
echo "$LOGIN_RESPONSE"
echo ""

# 3. OBTER PERFIL
echo "3️⃣  Obtendo perfil do usuário..."
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 4. CRIAR LOJA
echo "4️⃣  Criando loja..."
STORE_RESPONSE=$(curl -s -X POST "$API_URL/stores" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja de Teste",
    "whatsappNumber": "+5511999999999"
  }')
echo "$STORE_RESPONSE"
STORE_SLUG=$(echo "$STORE_RESPONSE" | grep -o '"slug":"[^"]*' | cut -d'"' -f4)
echo "✓ Slug da loja: $STORE_SLUG"
echo ""

# 5. OBTER LOJA DO USUÁRIO
echo "5️⃣  Obtendo loja do usuário..."
curl -s -X GET "$API_URL/stores/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 6. CRIAR PRODUTO 1
echo "6️⃣  Criando primeiro produto..."
PRODUCT1_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook",
    "description": "Notebook de alta performance",
    "image": "https://via.placeholder.com/300x300.png",
    "price": 2500.00,
    "available": true
  }')
echo "$PRODUCT1_RESPONSE"
PRODUCT1_ID=$(echo "$PRODUCT1_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Produto 1 ID: $PRODUCT1_ID"
echo ""

# 7. CRIAR PRODUTO 2
echo "7️⃣  Criando segundo produto..."
PRODUCT2_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mouse",
    "description": "Mouse wireless com USB",
    "image": "https://via.placeholder.com/300x300.png",
    "price": 79.90,
    "available": true
  }')
echo "$PRODUCT2_RESPONSE"
PRODUCT2_ID=$(echo "$PRODUCT2_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Produto 2 ID: $PRODUCT2_ID"
echo ""

# 8. LISTAR PRODUTOS
echo "8️⃣  Listando produtos..."
curl -s -X GET "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 9. OBTER UM PRODUTO
echo "9️⃣  Buscando um produto específico..."
curl -s -X GET "$API_URL/products/$PRODUCT1_ID" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 10. ATUALIZAR PRODUTO
echo "🔟 Atualizando produto..."
curl -s -X PUT "$API_URL/products/$PRODUCT1_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.90,
    "available": true
  }'
echo ""
echo ""

# 11. CRIAR PEDIDO
echo "1️⃣1️⃣  Criando pedido..."
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT1_ID\",
        \"quantity\": 1
      },
      {
        \"productId\": \"$PRODUCT2_ID\",
        \"quantity\": 2
      }
    ]
  }")
echo "$ORDER_RESPONSE"
echo ""
echo "💬 Link WhatsApp (copie e abra):"
WHATSAPP_LINK=$(echo "$ORDER_RESPONSE" | grep -o '"whatsappLink":"[^"]*' | cut -d'"' -f4)
echo "$WHATSAPP_LINK"
echo ""

# 12. LISTAR PEDIDOS
echo "1️⃣2️⃣  Listando pedidos..."
curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 13. CATÁLOGO PÚBLICO (sem autenticação)
echo "1️⃣3️⃣  Buscando catálogo público pelo slug (SEM AUTENTICAÇÃO)..."
curl -s -X GET "$API_URL/catalog/$STORE_SLUG"
echo ""
echo ""

echo "✅ Testes concluídos!"
