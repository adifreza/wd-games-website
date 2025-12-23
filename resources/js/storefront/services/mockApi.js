// Mock API to keep frontend runnable when backend is unavailable.
// Enable with: VITE_USE_MOCK_API=true

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mockUser = { id: 1, name: 'Player One', email: 'player@wdgames.test', is_admin: false };

const mockHdd = [
  { id: 1, nama: 'HDD 320GB', kapasitas_gb: 320, harga: 150000, stok: 10 },
  { id: 2, nama: 'HDD 500GB', kapasitas_gb: 500, harga: 200000, stok: 10 },
  { id: 3, nama: 'HDD 1TB', kapasitas_gb: 1000, harga: 300000, stok: 10 },
];

const mockGames = [
  {
    id: 1,
    nama_game: 'Red Dead Redemption 2',
    genre: 'Action',
    ukuran: '119.47 GB',
    size_gb: 119.47,
    cover: 'https://images.unsplash.com/photo-1521038199265-bc482db0f65a?w=1200&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    nama_game: 'Cyberpunk 2077',
    genre: 'RPG',
    ukuran: '70.20 GB',
    size_gb: 70.2,
    cover: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&auto=format&fit=crop&q=60',
  },
  {
    id: 3,
    nama_game: 'Forza Horizon 5',
    genre: 'Racing',
    ukuran: '103.14 GB',
    size_gb: 103.14,
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=60',
  },
];

let token = '';
let orders = [];

export async function mockLogin({ email, password }) {
  await sleep(700);
  if (!email || !password) throw new Error('Email/password required');
  token = 'mock.jwt.token';
  return { access_token: token, token_type: 'bearer', expires_in: 3600 };
}

export async function mockRegister() {
  await sleep(600);
  return { message: 'Register berhasil' };
}

export async function mockMe() {
  await sleep(250);
  if (!token) throw new Error('Unauthorized');
  return mockUser;
}

export async function mockLogout() {
  await sleep(150);
  token = '';
  return { message: 'Logout berhasil' };
}

export async function mockGetGames() {
  await sleep(700);
  return mockGames;
}

export async function mockGetHddVariants() {
  await sleep(450);
  return mockHdd;
}

export async function mockGetOrders() {
  await sleep(500);
  if (!token) throw new Error('Unauthorized');
  return orders;
}

export async function mockCreateOrder({ hdd_variant_id, game_ids }) {
  await sleep(600);
  if (!token) throw new Error('Unauthorized');

  const hdd = mockHdd.find((x) => Number(x.id) === Number(hdd_variant_id));
  const items = (game_ids || []).map((id) => {
    const g = mockGames.find((x) => Number(x.id) === Number(id));
    return { id: `${Date.now()}-${id}`, game: g, size_gb: g?.size_gb ?? 0 };
  });

  const order = {
    id: orders.length + 1,
    uuid: 'mock-order-' + (orders.length + 1),
    status: 'pending',
    total_harga: hdd?.harga ?? 0,
    hdd_variant: hdd,
    items,
    created_at: new Date().toISOString(),
  };

  orders = [order, ...orders];
  return order;
}
