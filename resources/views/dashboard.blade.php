<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WD Games Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
<div id="wd-dashboard" class="max-w-6xl mx-auto px-4 py-8">
    <header class="rounded-2xl border border-white/10 bg-linear-to-r from-indigo-600/15 via-fuchsia-600/15 to-cyan-600/15 p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="text-xs tracking-widest text-cyan-200/90">WD GAMES • DASHBOARD</p>
                <h1 class="mt-1 text-2xl sm:text-3xl font-semibold">Penjualan HDD Full Game PC</h1>
                <p class="mt-1 text-sm text-white/70">Login JWT, CRUD Games & Orders, dan stok otomatis berkurang saat order.</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm">
                    <span class="h-2 w-2 rounded-full bg-red-400" id="wd-auth-dot"></span>
                    <span id="wd-auth-status" class="text-white/80">Belum login</span>
                </span>
                <button id="wd-logout" class="hidden px-4 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-white/90">Logout</button>
            </div>
        </div>
    </header>

    <section class="mt-6 grid md:grid-cols-2 gap-6">
        <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div class="flex items-center justify-between">
                <h2 class="font-semibold">Login</h2>
                <span class="text-xs text-white/60">JWT Bearer Token</span>
            </div>
            <form id="wd-login-form" class="mt-4 space-y-3">
                <div>
                    <label class="text-sm text-white/80">Email</label>
                    <input name="email" type="email" class="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                </div>
                <div>
                    <label class="text-sm text-white/80">Password</label>
                    <input name="password" type="password" class="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                </div>
                <button class="w-full px-4 py-2 rounded-xl bg-cyan-400 text-gray-950 text-sm font-semibold hover:bg-cyan-300">Login</button>
                <p id="wd-login-msg" class="text-sm text-white/80"></p>
            </form>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div class="flex items-center justify-between">
                <h2 class="font-semibold">Register</h2>
                <span class="text-xs text-white/60">Buat akun baru</span>
            </div>
            <form id="wd-register-form" class="mt-4 space-y-3">
                <div>
                    <label class="text-sm text-white/80">Name</label>
                    <input name="name" class="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                </div>
                <div>
                    <label class="text-sm text-white/80">Email</label>
                    <input name="email" type="email" class="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                </div>
                <div>
                    <label class="text-sm text-white/80">Password</label>
                    <input name="password" type="password" class="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                </div>
                <button class="w-full px-4 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-white/90">Register</button>
                <p id="wd-register-msg" class="text-sm text-white/80"></p>
            </form>
        </div>
    </section>

    <section id="wd-app" class="mt-8 hidden">
        <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div class="flex items-center justify-between">
                <h2 class="font-semibold">User</h2>
                <span class="text-xs text-white/60">/api/auth/me</span>
            </div>
            <pre id="wd-me" class="mt-3 text-xs bg-black/30 border border-white/10 rounded-xl p-4 overflow-auto"></pre>
        </div>

        <div class="mt-6 grid lg:grid-cols-2 gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold">Games</h2>
                        <p class="text-xs text-white/60">Create/Update/Delete khusus admin • Public: list & detail</p>
                    </div>
                    <button id="wd-refresh-games" class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm hover:bg-black/40">Refresh</button>
                </div>

                <div id="wd-admin-games" class="mt-4">
                <form id="wd-create-game-form" class="grid grid-cols-2 gap-3" enctype="multipart/form-data">
                    <input name="nama_game" placeholder="nama_game" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="genre" placeholder="genre" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="ukuran" placeholder="ukuran (contoh 99GB)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="size_gb" type="number" min="1" placeholder="size_gb (angka)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="harga" type="number" min="0" placeholder="harga" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="stok" type="number" min="0" placeholder="stok" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                    <input name="deskripsi" placeholder="deskripsi (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" />
                    <input name="cover" type="file" accept="image/png,image/jpeg" class="col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-950 hover:file:bg-white/90" />
                    <button class="col-span-2 px-4 py-2 rounded-xl bg-cyan-400 text-gray-950 text-sm font-semibold hover:bg-cyan-300">Create Game</button>
                    <p id="wd-create-game-msg" class="col-span-2 text-sm text-white/80"></p>
                </form>

                <div class="mt-5">
                    <h3 class="text-sm font-semibold">Update Game</h3>
                    <p class="text-xs text-white/60">Identifier bisa id / slug / uuid</p>
                    <form id="wd-update-game-form" class="mt-3 grid grid-cols-2 gap-3" enctype="multipart/form-data">
                        <input name="identifier" placeholder="id / slug / uuid" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                        <input name="nama_game" placeholder="nama_game (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="genre" placeholder="genre (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="ukuran" placeholder="ukuran (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="size_gb" type="number" min="1" placeholder="size_gb (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="harga" type="number" min="0" placeholder="harga (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="stok" type="number" min="0" placeholder="stok (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="deskripsi" placeholder="deskripsi (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                        <input name="cover" type="file" accept="image/png,image/jpeg" class="col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-950 hover:file:bg-white/90" />
                        <button class="col-span-2 px-4 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-white/90">Update Game</button>
                        <p id="wd-update-game-msg" class="col-span-2 text-sm text-white/80"></p>
                    </form>
                </div>

                <p id="wd-admin-games-hint" class="mt-3 text-xs text-white/50 hidden">Login sebagai admin untuk mengatur game.</p>
                </div>

                <div class="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30">
                    <table class="min-w-full text-sm">
                        <thead class="bg-white/5">
                        <tr>
                            <th class="text-left p-3">id</th>
                            <th class="text-left p-3">slug</th>
                            <th class="text-left p-3">nama</th>
                            <th class="text-left p-3">size_gb</th>
                            <th class="text-left p-3">harga</th>
                            <th class="text-left p-3">stok</th>
                            <th class="text-left p-3">aksi</th>
                        </tr>
                        </thead>
                        <tbody id="wd-games-tbody"></tbody>
                    </table>
                </div>

                <div id="wd-admin-variants" class="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-semibold">HDD Variants</h2>
                            <p class="text-xs text-white/60">Paket HDD (kapasitas & harga). CRUD khusus admin. Public: list & detail.</p>
                        </div>
                        <button id="wd-refresh-variants" class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm hover:bg-black/40">Refresh</button>
                    </div>

                    <form id="wd-create-variant-form" class="mt-4 grid grid-cols-2 gap-3">
                        <input name="nama" placeholder="nama (contoh HDD 500GB)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                        <input name="kapasitas_gb" type="number" min="1" placeholder="kapasitas_gb" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                        <input name="harga" type="number" min="0" placeholder="harga" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                        <input name="stok" type="number" min="0" placeholder="stok" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required />
                        <button class="col-span-2 px-4 py-2 rounded-xl bg-cyan-400 text-gray-950 text-sm font-semibold hover:bg-cyan-300">Create HDD Variant</button>
                        <p id="wd-create-variant-msg" class="col-span-2 text-sm text-white/80"></p>
                    </form>

                    <div class="mt-4">
                        <h3 class="text-sm font-semibold">Update HDD Variant</h3>
                        <p class="text-xs text-white/60">Identifier bisa id / slug / uuid</p>
                        <form id="wd-update-variant-form" class="mt-3 grid grid-cols-2 gap-3">
                            <input name="identifier" placeholder="id / slug / uuid" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                            <input name="nama" placeholder="nama (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                            <input name="kapasitas_gb" type="number" min="1" placeholder="kapasitas_gb (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                            <input name="harga" type="number" min="0" placeholder="harga (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                            <input name="stok" type="number" min="0" placeholder="stok (opsional)" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" />
                            <button class="col-span-2 px-4 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-white/90">Update HDD Variant</button>
                            <p id="wd-update-variant-msg" class="col-span-2 text-sm text-white/80"></p>
                        </form>
                    </div>

                    <div class="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/30">
                        <table class="min-w-full text-sm">
                            <thead class="bg-white/5">
                            <tr>
                                <th class="text-left p-3">id</th>
                                <th class="text-left p-3">slug</th>
                                <th class="text-left p-3">nama</th>
                                <th class="text-left p-3">kapasitas_gb</th>
                                <th class="text-left p-3">harga</th>
                                <th class="text-left p-3">stok</th>
                                <th class="text-left p-3">aksi</th>
                            </tr>
                            </thead>
                            <tbody id="wd-variants-tbody"></tbody>
                        </table>
                    </div>
                </div>

                <p id="wd-admin-variants-hint" class="mt-3 text-xs text-white/50 hidden">Login sebagai admin untuk mengatur HDD variants.</p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold">Orders</h2>
                        <p class="text-xs text-white/60">Flow: pilih HDD → pilih games sampai kapasitas penuh → checkout (harga dari HDD)</p>
                    </div>
                    <button id="wd-refresh-orders" class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm hover:bg-black/40">Refresh</button>
                </div>

                <form id="wd-create-order-form" class="mt-4 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <select name="hdd_variant_id" id="wd-order-variant" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40" required>
                            <option value="">Pilih HDD variant…</option>
                        </select>
                        <div class="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <p class="text-xs text-white/60">Sisa kapasitas</p>
                            <p class="text-sm font-semibold"><span id="wd-cap-remaining">-</span> GB</p>
                        </div>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-semibold">Pilih Games</h3>
                                <p class="text-xs text-white/60">Centang game sampai kapasitas penuh</p>
                            </div>
                            <div class="text-xs text-white/60">Total dipilih: <span id="wd-selected-count">0</span> • Total size: <span id="wd-selected-size">0</span> GB</div>
                        </div>
                        <div id="wd-order-games" class="mt-3 max-h-64 overflow-auto space-y-2"></div>
                    </div>

                    <button id="wd-checkout-btn" class="w-full px-4 py-2 rounded-xl bg-cyan-400 text-gray-950 text-sm font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Checkout</button>
                    <p id="wd-create-order-msg" class="text-sm text-white/80"></p>
                </form>

                <div class="mt-5">
                    <h3 class="text-sm font-semibold">Update Order Status</h3>
                    <p class="text-xs text-white/60">Identifier bisa id / uuid</p>
                    <form id="wd-update-order-form" class="mt-3 grid grid-cols-2 gap-3">
                        <input name="identifier" placeholder="order id / uuid" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required />
                        <select name="status" class="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" required>
                            <option value="pending">pending</option>
                            <option value="paid">paid</option>
                            <option value="cancel">cancel</option>
                        </select>
                        <button class="col-span-2 px-4 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-white/90">Update Status</button>
                        <p id="wd-update-order-msg" class="col-span-2 text-sm text-white/80"></p>
                    </form>
                </div>

                <div class="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30">
                    <table class="min-w-full text-sm">
                        <thead class="bg-white/5">
                        <tr>
                            <th class="text-left p-3">id</th>
                            <th class="text-left p-3">uuid</th>
                            <th class="text-left p-3">hdd</th>
                            <th class="text-left p-3">games</th>
                            <th class="text-left p-3">qty</th>
                            <th class="text-left p-3">total</th>
                            <th class="text-left p-3">status</th>
                            <th class="text-left p-3">aksi</th>
                        </tr>
                        </thead>
                        <tbody id="wd-orders-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <footer class="mt-10 text-xs text-white/50">
        <p>Catatan: fitur Create/Update/Delete memakai JWT (Bearer token) dari login. Endpoint public: <span class="text-white/70">GET /api/games</span> & <span class="text-white/70">GET /api/hdd-variants</span>.</p>
    </footer>
</div>
</body>
</html>
