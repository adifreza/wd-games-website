const TOKEN_KEY = 'wd_games_token';

function $(id) {
  return document.getElementById(id);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  // Always ask JSON so Laravel doesn't redirect to HTML.
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(path, {
    ...options,
    headers,
  });
}

async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && (data.message || data.error)) ? (data.message || data.error) : String(data);
    throw new Error(message);
  }
  return data;
}

function setText(id, text, cls = 'text-gray-700') {
  const el = $(id);
  if (!el) return;
  el.className = `text-sm ${cls}`;
  el.textContent = text;
}

function authUI(isLoggedIn, user = null) {
  const app = $('wd-app');
  const logoutBtn = $('wd-logout');
  const status = $('wd-auth-status');
  const dot = $('wd-auth-dot');

  if (isLoggedIn) {
    app?.classList.remove('hidden');
    logoutBtn?.classList.remove('hidden');
    status.textContent = user ? `Login: ${user.email}` : 'Login';
    dot?.classList.remove('bg-red-400');
    dot?.classList.add('bg-emerald-400');

    // Toggle admin UI
    const isAdmin = !!user?.is_admin;
    const adminGames = $('wd-admin-games');
    const adminGamesHint = $('wd-admin-games-hint');
    const adminVariants = $('wd-admin-variants');
    const adminVariantsHint = $('wd-admin-variants-hint');

    if (adminGames) adminGames.classList.toggle('hidden', !isAdmin);
    if (adminGamesHint) adminGamesHint.classList.toggle('hidden', isAdmin);
    if (adminVariants) adminVariants.classList.toggle('hidden', !isAdmin);
    if (adminVariantsHint) adminVariantsHint.classList.toggle('hidden', isAdmin);

    STATE.isAdmin = isAdmin;
  } else {
    app?.classList.add('hidden');
    logoutBtn?.classList.add('hidden');
    status.textContent = 'Belum login';
    dot?.classList.remove('bg-emerald-400');
    dot?.classList.add('bg-red-400');

    const adminGames = $('wd-admin-games');
    const adminGamesHint = $('wd-admin-games-hint');
    const adminVariants = $('wd-admin-variants');
    const adminVariantsHint = $('wd-admin-variants-hint');

    if (adminGames) adminGames.classList.add('hidden');
    if (adminGamesHint) adminGamesHint.classList.add('hidden');
    if (adminVariants) adminVariants.classList.add('hidden');
    if (adminVariantsHint) adminVariantsHint.classList.add('hidden');

    STATE.isAdmin = false;
  }
}

let STATE = {
  isAdmin: false,
};

function renderGames(games) {
  const tbody = $('wd-games-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (const g of games) {
    const tr = document.createElement('tr');
    tr.className = 'border-t';

    const idCell = `<td class="p-2">${g.id ?? ''}</td>`;
    const slugCell = `<td class="p-2">${g.slug ?? ''}</td>`;
    const nameCell = `<td class="p-2">${g.nama_game ?? ''}</td>`;
    const sizeCell = `<td class="p-2">${g.size_gb ?? ''}</td>`;
    const hargaCell = `<td class="p-2">${g.harga ?? ''}</td>`;
    const stokCell = `<td class="p-2">${g.stok ?? ''}</td>`;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'px-2 py-1 rounded bg-red-600 text-white text-xs';
    delBtn.addEventListener('click', async () => {
      if (!confirm('Hapus game ini?')) return;
      try {
        await apiJson(`/api/games/${g.id}`, { method: 'DELETE' });
        await refreshGames();
      } catch (e) {
        alert(String(e.message || e));
      }
    });

    const viewBtn = document.createElement('a');
    viewBtn.textContent = 'Detail';
    viewBtn.className = 'px-2 py-1 rounded bg-gray-100 text-xs';
    viewBtn.href = `/api/games/${g.slug || g.uuid || g.id}`;
    viewBtn.target = '_blank';

    const aksiTd = document.createElement('td');
    aksiTd.className = 'p-2 space-x-2';
    aksiTd.appendChild(viewBtn);
    if (STATE.isAdmin) aksiTd.appendChild(delBtn);

    tr.innerHTML = idCell + slugCell + nameCell + sizeCell + hargaCell + stokCell;
    tr.appendChild(aksiTd);
    tbody.appendChild(tr);
  }
}

function renderVariants(variants) {
  const tbody = $('wd-variants-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (const v of variants) {
    const tr = document.createElement('tr');
    tr.className = 'border-t';

    const idCell = `<td class="p-2">${v.id ?? ''}</td>`;
    const slugCell = `<td class="p-2">${v.slug ?? ''}</td>`;
    const nameCell = `<td class="p-2">${v.nama ?? ''}</td>`;
    const capCell = `<td class="p-2">${v.kapasitas_gb ?? ''}</td>`;
    const hargaCell = `<td class="p-2">${v.harga ?? ''}</td>`;
    const stokCell = `<td class="p-2">${v.stok ?? ''}</td>`;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'px-2 py-1 rounded bg-red-600 text-white text-xs';
    delBtn.addEventListener('click', async () => {
      if (!confirm('Hapus HDD variant ini?')) return;
      try {
        await apiJson(`/api/hdd-variants/${v.id}`, { method: 'DELETE' });
        CACHE.variants = await refreshVariants();
        await refreshOrderBuilder();
      } catch (e) {
        alert(String(e.message || e));
      }
    });

    const viewBtn = document.createElement('a');
    viewBtn.textContent = 'Detail';
    viewBtn.className = 'px-2 py-1 rounded bg-gray-100 text-xs';
    viewBtn.href = `/api/hdd-variants/${v.slug || v.uuid || v.id}`;
    viewBtn.target = '_blank';

    const aksiTd = document.createElement('td');
    aksiTd.className = 'p-2 space-x-2';
    aksiTd.appendChild(viewBtn);
    if (STATE.isAdmin) aksiTd.appendChild(delBtn);

    tr.innerHTML = idCell + slugCell + nameCell + capCell + hargaCell + stokCell;
    tr.appendChild(aksiTd);
    tbody.appendChild(tr);
  }
}

function getSelectedGameIds() {
  const wrap = $('wd-order-games');
  if (!wrap) return [];
  const ids = [];
  for (const input of wrap.querySelectorAll('input[type="checkbox"][data-game-id]')) {
    if (input.checked) ids.push(Number(input.dataset.gameId));
  }
  return ids;
}

function calcSelectedSize(games, selectedIds) {
  const map = new Map((games || []).map((g) => [Number(g.id), Number(g.size_gb || 0)]));
  let total = 0;
  for (const id of selectedIds) total += Number(map.get(Number(id)) || 0);
  return total;
}

function renderOrderBuilder({ games, variants }) {
  const variantSelect = $('wd-order-variant');
  const wrap = $('wd-order-games');
  const remainingEl = $('wd-cap-remaining');
  const countEl = $('wd-selected-count');
  const sizeEl = $('wd-selected-size');
  const checkoutBtn = $('wd-checkout-btn');

  if (!variantSelect || !wrap) return;

  const currentValue = variantSelect.value;
  variantSelect.innerHTML = '<option value="">Pilih HDD variant…</option>';
  for (const v of variants) {
    const opt = document.createElement('option');
    opt.value = String(v.id);
    opt.textContent = `${v.nama} • ${v.kapasitas_gb}GB • Rp${v.harga} • stok:${v.stok}`;
    variantSelect.appendChild(opt);
  }
  if (currentValue) variantSelect.value = currentValue;

  wrap.innerHTML = '';
  for (const g of games) {
    const row = document.createElement('label');
    row.className = 'flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-3';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.gameId = String(g.id);
    cb.className = 'h-4 w-4 accent-cyan-400';

    const meta = document.createElement('div');
    meta.innerHTML = `<div class="text-sm font-semibold">${g.nama_game ?? ''}</div><div class="text-xs text-white/60">${g.genre ?? ''} • ${g.size_gb ?? 0}GB</div>`;

    left.appendChild(cb);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'text-xs text-white/60';
    right.textContent = g.slug ? `/${g.slug}` : '';

    row.appendChild(left);
    row.appendChild(right);
    wrap.appendChild(row);

    cb.addEventListener('change', () => updateCapacityUI(games, variants));
  }

  variantSelect.addEventListener('change', () => updateCapacityUI(games, variants));

  if (remainingEl) remainingEl.textContent = '-';
  if (countEl) countEl.textContent = '0';
  if (sizeEl) sizeEl.textContent = '0';
  if (checkoutBtn) checkoutBtn.disabled = true;
}

function updateCapacityUI(games, variants) {
  const variantSelect = $('wd-order-variant');
  const remainingEl = $('wd-cap-remaining');
  const countEl = $('wd-selected-count');
  const sizeEl = $('wd-selected-size');
  const checkoutBtn = $('wd-checkout-btn');

  if (!variantSelect || !remainingEl || !countEl || !sizeEl || !checkoutBtn) return;

  const selectedVariantId = Number(variantSelect.value || 0);
  const variant = (variants || []).find((v) => Number(v.id) === selectedVariantId);
  const selectedGameIds = getSelectedGameIds();
  const totalSize = calcSelectedSize(games, selectedGameIds);

  countEl.textContent = String(selectedGameIds.length);
  sizeEl.textContent = String(totalSize);

  if (!variant) {
    remainingEl.textContent = '-';
    checkoutBtn.disabled = true;
    return;
  }

  const capacity = Number(variant.kapasitas_gb || 0);
  const remaining = capacity - totalSize;
  remainingEl.textContent = String(remaining);

  const ok = remaining >= 0 && selectedGameIds.length > 0 && Number(variant.stok || 0) > 0;
  checkoutBtn.disabled = !ok;
}

function renderOrders(orders) {
  const tbody = $('wd-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (const o of orders) {
    const tr = document.createElement('tr');
    tr.className = 'border-t';

    const idCell = `<td class="p-2">${o.id ?? ''}</td>`;
    const uuidCell = `<td class="p-2">${o.uuid ?? ''}</td>`;
    const hddCell = `<td class="p-2">${o.hddVariant?.nama ?? o.hdd_variant_id ?? ''}</td>`;
    const items = Array.isArray(o.items) ? o.items : [];
    const gamesList = items.map((it) => it.game?.nama_game || it.game_id).filter(Boolean).join(', ');
    const gamesCell = `<td class="p-2">${gamesList}</td>`;
    const qtyCell = `<td class="p-2">${o.qty ?? ''}</td>`;
    const totalCell = `<td class="p-2">${o.total_harga ?? ''}</td>`;
    const statusCell = `<td class="p-2">${o.status ?? ''}</td>`;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'px-2 py-1 rounded bg-red-600 text-white text-xs';
    delBtn.addEventListener('click', async () => {
      if (!confirm('Hapus order ini?')) return;
      try {
        await apiJson(`/api/orders/${o.id}`, { method: 'DELETE' });
        await refreshOrders();
      } catch (e) {
        alert(String(e.message || e));
      }
    });

    const viewBtn = document.createElement('a');
    viewBtn.textContent = 'Detail';
    viewBtn.className = 'px-2 py-1 rounded bg-gray-100 text-xs';
    viewBtn.href = `/api/orders/${o.uuid || o.id}`;
    viewBtn.target = '_blank';

    const aksiTd = document.createElement('td');
    aksiTd.className = 'p-2 space-x-2';
    aksiTd.appendChild(viewBtn);
    aksiTd.appendChild(delBtn);

    tr.innerHTML = idCell + uuidCell + hddCell + gamesCell + qtyCell + totalCell + statusCell;
    tr.appendChild(aksiTd);
    tbody.appendChild(tr);
  }
}

async function refreshMe() {
  const me = await apiJson('/api/auth/me');
  $('wd-me').textContent = JSON.stringify(me, null, 2);
  authUI(true, me);
  return me;
}

async function refreshGames() {
  const games = await apiJson('/api/games');
  renderGames(games);
  return games;
}

async function refreshVariants() {
  const variants = await apiJson('/api/hdd-variants');
  renderVariants(variants);
  return variants;
}

let CACHE = {
  games: [],
  variants: [],
};

async function refreshOrderBuilder() {
  renderOrderBuilder({ games: CACHE.games, variants: CACHE.variants });
  updateCapacityUI(CACHE.games, CACHE.variants);
}

async function refreshOrders() {
  const orders = await apiJson('/api/orders');
  renderOrders(orders);
  return orders;
}

async function init() {
  const root = $('wd-dashboard');
  if (!root) return;

  $('wd-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-login-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    const payload = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const data = await apiJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setToken(data.access_token);
      setText('wd-login-msg', 'Login berhasil', 'text-green-700');
      await refreshMe();
      CACHE.games = await refreshGames();
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
      await refreshOrders();
    } catch (err) {
      setText('wd-login-msg', err.message || String(err), 'text-red-700');
      authUI(false);
    }
  });

  $('wd-register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-register-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
    };

    try {
      await apiJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setText('wd-register-msg', 'Register berhasil. Silakan login.', 'text-green-700');
    } catch (err) {
      setText('wd-register-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-logout')?.addEventListener('click', async () => {
    try {
      await apiJson('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearToken();
    $('wd-me').textContent = '';
    authUI(false);
  });

  $('wd-refresh-games')?.addEventListener('click', async () => {
    try {
      CACHE.games = await refreshGames();
      await refreshOrderBuilder();
    } catch (e) {
      alert(String(e.message || e));
    }
  });

  $('wd-refresh-variants')?.addEventListener('click', async () => {
    try {
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
    } catch (e) {
      alert(String(e.message || e));
    }
  });

  $('wd-refresh-orders')?.addEventListener('click', async () => {
    try {
      await refreshOrders();
    } catch (e) {
      alert(String(e.message || e));
    }
  });

  $('wd-create-game-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-create-game-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;

    try {
      const fd = new FormData(form);
      const res = await apiFetch('/api/games', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal create game');
      setText('wd-create-game-msg', 'Create game berhasil', 'text-green-700');
      form.reset();
      await refreshGames();
    } catch (err) {
      setText('wd-create-game-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-update-game-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-update-game-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    const identifier = form.identifier.value.trim();
    if (!identifier) {
      setText('wd-update-game-msg', 'identifier wajib', 'text-red-700');
      return;
    }

    try {
      const fd = new FormData();
      fd.set('_method', 'PATCH');

      // Only send non-empty fields
      for (const name of ['nama_game', 'genre', 'ukuran', 'deskripsi', 'size_gb', 'harga', 'stok']) {
        const v = form[name].value;
        if (v !== '' && v != null) fd.set(name, v);
      }
      if (form.cover.files?.[0]) {
        fd.set('cover', form.cover.files[0]);
      }

      const res = await apiFetch(`/api/games/${encodeURIComponent(identifier)}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update game');
      setText('wd-update-game-msg', 'Update game berhasil', 'text-green-700');
      await refreshGames();
    } catch (err) {
      setText('wd-update-game-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-create-variant-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-create-variant-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    try {
      await apiJson('/api/hdd-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama.value,
          kapasitas_gb: Number(form.kapasitas_gb.value),
          harga: Number(form.harga.value),
          stok: Number(form.stok.value),
        }),
      });
      setText('wd-create-variant-msg', 'Create HDD variant berhasil', 'text-green-700');
      form.reset();
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
    } catch (err) {
      setText('wd-create-variant-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-update-variant-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-update-variant-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    const identifier = form.identifier.value.trim();
    if (!identifier) {
      setText('wd-update-variant-msg', 'identifier wajib', 'text-red-700');
      return;
    }

    const payload = {};
    for (const name of ['nama', 'kapasitas_gb', 'harga', 'stok']) {
      const v = form[name].value;
      if (v !== '' && v != null) payload[name] = (name === 'nama') ? v : Number(v);
    }

    try {
      await apiJson(`/api/hdd-variants/${encodeURIComponent(identifier)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setText('wd-update-variant-msg', 'Update HDD variant berhasil', 'text-green-700');
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
    } catch (err) {
      setText('wd-update-variant-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-create-order-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-create-order-msg', 'Loading...', 'text-gray-600');

    const variantSelect = $('wd-order-variant');
    const hddVariantId = Number(variantSelect?.value || 0);
    const gameIds = getSelectedGameIds();

    try {
      const data = await apiJson('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hdd_variant_id: hddVariantId,
          game_ids: gameIds,
        }),
      });
      setText('wd-create-order-msg', `Checkout berhasil (total: ${data.total_harga})`, 'text-green-700');
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
      await refreshOrders();
    } catch (err) {
      setText('wd-create-order-msg', err.message || String(err), 'text-red-700');
    }
  });

  $('wd-update-order-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setText('wd-update-order-msg', 'Loading...', 'text-gray-600');
    const form = e.currentTarget;
    const identifier = form.identifier.value.trim();
    const payload = { status: form.status.value };

    try {
      await apiJson(`/api/orders/${encodeURIComponent(identifier)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setText('wd-update-order-msg', 'Update status berhasil', 'text-green-700');
      await refreshOrders();
    } catch (err) {
      setText('wd-update-order-msg', err.message || String(err), 'text-red-700');
    }
  });

  // Initial state
  authUI(false);
  if (getToken()) {
    try {
      await refreshMe();
      CACHE.games = await refreshGames();
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
      await refreshOrders();
    } catch {
      clearToken();
      authUI(false);
    }
  } else {
    // Still show public games list for convenience
    try {
      CACHE.games = await refreshGames();
      CACHE.variants = await refreshVariants();
      await refreshOrderBuilder();
    } catch {
      // ignore
    }
  }
}

export { init as initWdDashboard };
