/**
 * Integration test: Supabase demo-notes CRUD + Cloudflare R2 (store image upload)
 * Run: node test-integration.mjs
 */

const BASE = 'http://localhost:5000/api';

async function json(res) {
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; }
  catch { return { status: res.status, body: text }; }
}

async function testSupabase() {
  console.log('\n===== SUPABASE demo-notes =====');

  // GET list
  let r = await fetch(`${BASE}/supabase/demo-notes`);
  let d = await json(r);
  console.log(`GET /demo-notes → ${d.status}`, JSON.stringify(d.body));

  // POST create
  r = await fetch(`${BASE}/supabase/demo-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Nota de integração', body: 'Criado pelo test-integration.mjs' }),
  });
  d = await json(r);
  console.log(`POST /demo-notes → ${d.status}`, JSON.stringify(d.body));
  const noteId = d.body?.item?.id;

  if (!noteId) { console.error('Falha: ID não retornado'); return; }

  // GET one
  r = await fetch(`${BASE}/supabase/demo-notes/${noteId}`);
  d = await json(r);
  console.log(`GET /demo-notes/${noteId} → ${d.status}`, JSON.stringify(d.body));

  // PATCH update
  r = await fetch(`${BASE}/supabase/demo-notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Nota atualizada via integração' }),
  });
  d = await json(r);
  console.log(`PATCH /demo-notes/${noteId} → ${d.status}`, JSON.stringify(d.body));

  // DELETE
  r = await fetch(`${BASE}/supabase/demo-notes/${noteId}`, { method: 'DELETE' });
  console.log(`DELETE /demo-notes/${noteId} → ${r.status}`);
}

async function testR2() {
  console.log('\n===== CLOUDFLARE R2 (store image via auth flow) =====');

  // 1. Register test user
  let r = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `test_r2_${Date.now()}@example.com`, password: 'TestPass123!' }),
  });
  let d = await json(r);
  console.log(`POST /auth/register → ${d.status}`);
  const token = d.body?.accessToken;
  if (!token) { console.error('Falha ao registrar usuário:', JSON.stringify(d.body)); return; }

  // 2. Create store
  r = await fetch(`${BASE}/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Loja Teste R2', slug: `loja-r2-${Date.now()}`, description: 'Loja de teste' }),
  });
  d = await json(r);
  console.log(`POST /stores → ${d.status}`, JSON.stringify(d.body));
  if (d.status !== 201) { console.error('Falha ao criar loja'); return; }

  // 3. Upload store image (tiny 1×1 red PNG)
  const PNG_1x1 = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
    '2e000000000c4944415478016360f8cfc000000002000157e184590000000049454e44ae426082',
    'hex'
  );
  const form = new FormData();
  form.append('image', new Blob([PNG_1x1], { type: 'image/png' }), 'test.png');

  r = await fetch(`${BASE}/stores/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  d = await json(r);
  console.log(`POST /stores/image → ${d.status}`, JSON.stringify(d.body));

  if (d.status === 200 && d.body?.store?.imageUrl) {
    console.log('R2 URL:', d.body.store.imageUrl);
  }
}

(async () => {
  try {
    await testSupabase();
    await testR2();
    console.log('\n===== TESTES CONCLUÍDOS =====');
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
})();
