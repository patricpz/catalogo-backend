// DevFlow API - Exemplos de Integração com JavaScript/TypeScript

// ============================================
// 1. AUTENTICAÇÃO
// ============================================

// Register
async function register(email: string, password: string) {
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.accessToken;
}

// Login
async function login(email: string, password: string) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.accessToken;
}

// Get Profile
async function getProfile(token: string) {
  const res = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ============================================
// 2. LOJAS
// ============================================

// Criar Loja
async function createStore(token: string, name: string, whatsappNumber?: string) {
  const res = await fetch('http://localhost:5000/api/stores', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, whatsappNumber })
  });
  return res.json();
}

// Obter Loja do Usuário
async function getMyStore(token: string) {
  const res = await fetch('http://localhost:5000/api/stores/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Atualizar Loja
async function updateStore(token: string, data: { name?: string; whatsappNumber?: string }) {
  const res = await fetch('http://localhost:5000/api/stores', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// ============================================
// 3. CATÁLOGO PÚBLICO (SEM AUTENTICAÇÃO!)
// ============================================

// Obter Catálogo Público por Slug
async function getPublicCatalog(slug: string) {
  const res = await fetch(`http://localhost:5000/api/catalog/${slug}`);
  return res.json();
}

// Exemplo: Listar produtos de uma loja no front
async function displayStoreProducts(slug: string) {
  const { store } = await getPublicCatalog(slug);
  console.log(`Loja: ${store.name}`);
  console.log(`Produtos:`);
  store.products.forEach((product) => {
    console.log(`  - ${product.name}: R$ ${product.price}`);
  });
}

// ============================================
// 4. PRODUTOS
// ============================================

// Criar Produto
async function createProduct(token: string, productData: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  available?: boolean;
}) {
  const res = await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });
  return res.json();
}

// Listar Produtos
async function getProducts(token: string) {
  const res = await fetch('http://localhost:5000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Atualizar Produto
async function updateProduct(token: string, productId: string, data: Partial<any>) {
  const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Deletar Produto
async function deleteProduct(token: string, productId: string) {
  const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ============================================
// 5. PEDIDOS
// ============================================

interface OrderItem {
  productId: string;
  quantity: number;
}

// Criar Pedido (retorna whatsappLink)
async function createOrder(token: string, items: OrderItem[]) {
  const res = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  return data.order; // { id, total, whatsappLink, items, ... }
}

// Listar Pedidos
async function getOrders(token: string) {
  const res = await fetch('http://localhost:5000/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Redirecionar para WhatsApp com o pedido
async function sendOrderToWhatsApp(token: string, items: OrderItem[]) {
  const order = await createOrder(token, items);
  if (order.whatsappLink) {
    window.open(order.whatsappLink, '_blank');
  }
  return order;
}

// ============================================
// 6. EXEMPLO DE FLUXO COMPLETO
// ============================================

async function completeFlow() {
  try {
    // 1. Registrar usuário
    console.log('1️⃣  Registrando...');
    const token = await register('loja@devflow.com', 'senha123456');
    console.log('✓ Registrado');

    // 2. Criar loja
    console.log('2️⃣  Criando loja...');
    const storeRes = await createStore(token, 'Minha Loja', '+5511999999999');
    const storeSlug = storeRes.store.slug;
    console.log(`✓ Loja criada: ${storeSlug}`);

    // 3. Criar produtos
    console.log('3️⃣  Criando produtos...');
    const product1 = await createProduct(token, {
      name: 'Notebook',
      description: 'Notebook i7 16GB',
      price: 2500,
      available: true
    });
    const product1Id = product1.product.id;

    const product2 = await createProduct(token, {
      name: 'Mouse',
      price: 79.90,
      available: true
    });
    const product2Id = product2.product.id;
    console.log('✓ Produtos criados');

    // 4. Criar pedido
    console.log('4️⃣  Criando pedido...');
    const order = await createOrder(token, [
      { productId: product1Id, quantity: 1 },
      { productId: product2Id, quantity: 2 }
    ]);
    console.log('✓ Pedido criado');
    console.log(`📦 Total: R$ ${order.total}`);
    console.log(`📱 Link WhatsApp: ${order.whatsappLink}`);

    // 5. Visualizar catálogo público
    console.log('5️⃣  Catálogo público:');
    await displayStoreProducts(storeSlug);

  } catch (error) {
    console.error('Erro:', error);
  }
}

// ============================================
// 7. REACT HOOKS (EXEMPLO)
// ============================================

/*
import { useEffect, useState } from 'react';

export function useDevFlowAPI(token: string) {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Fetch store
    getMyStore(token).then(data => setStore(data.store));

    // Fetch products
    getProducts(token).then(data => setProducts(data.products));

    // Fetch orders
    getOrders(token).then(data => setOrders(data.orders));
  }, [token]);

  return {
    store,
    products,
    orders,
    createProduct: (data) => createProduct(token, data),
    createOrder: (items) => createOrder(token, items),
    updateProduct: (id, data) => updateProduct(token, id, data),
    deleteProduct: (id) => deleteProduct(token, id)
  };
}

// Uso no componente:
function StoreDashboard() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const api = useDevFlowAPI(token);

  return (
    <div>
      <h1>{api.store?.name}</h1>
      <div>
        {api.products.map(p => (
          <div key={p.id}>
            {p.name} - R$ {p.price}
          </div>
        ))}
      </div>
    </div>
  );
}
*/

// ============================================
// 8. CLASS API (TYPESCRIPT)
// ============================================

class DevFlowAPI {
  private baseUrl = 'http://localhost:5000/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: this.headers()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Auth
  register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Products
  createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getProducts() {
    return this.request('/products');
  }

  // Orders
  createOrder(items: OrderItem[]) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }

  getOrders() {
    return this.request('/orders');
  }
}

// Uso:
// const api = new DevFlowAPI();
// const { accessToken } = await api.register('user@example.com', 'password123');
// api.setToken(accessToken);
// const products = await api.getProducts();

export {
  register,
  login,
  getProfile,
  createStore,
  getMyStore,
  updateStore,
  getPublicCatalog,
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrders,
  sendOrderToWhatsApp,
  completeFlow,
  DevFlowAPI
};
