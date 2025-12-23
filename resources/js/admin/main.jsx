import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { adminApi, setAdminAuthToken } from './apiClient.js';

const STORAGE_KEY = 'wdgames.jwt';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function Panel({ title, children, right }) {
  return (
    <section className="rounded-2xl border border-(--wd-border) bg-(--wd-surface) overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-(--wd-border) px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TextInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <div className="text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="mt-2 w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="mt-2 w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
      />
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'rounded-xl px-4 py-2 text-sm font-semibold transition',
        disabled ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-(--wd-accent) text-gray-950 hover:bg-(--wd-accent)/90'
      )}
    >
      {children}
    </button>
  );
}

function SubtleButton({ children, onClick, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/15 transition',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [meError, setMeError] = useState('');

  const isAdmin = Boolean(me?.is_admin);

  useEffect(() => {
    setAdminAuthToken(token || null);
  }, [token]);

  async function refreshMe() {
    setLoadingMe(true);
    setMeError('');
    try {
      if (!token) {
        setMe(null);
        return;
      }
      const { data } = await adminApi.get('/auth/me');
      setMe(data);
    } catch (e) {
      setMe(null);
      setMeError(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load session');
    } finally {
      setLoadingMe(false);
    }
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerRight = useMemo(() => {
    if (!token) {
      return (
        <a
          href="/storefront/login"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Login
        </a>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50 hidden sm:block">{me?.email || '—'}</span>
        <SubtleButton
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setToken('');
            setMe(null);
          }}
        >
          Clear Token
        </SubtleButton>
      </div>
    );
  }, [me?.email, token]);

  // ===== Games state =====
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [gamesVisibleCount, setGamesVisibleCount] = useState(5);

  const [newGame, setNewGame] = useState({
    nama_game: '',
    genre: '',
    ukuran: '',
    size_gb: '0',
    deskripsi: '',
    cover: null,
  });

  const [editGameId, setEditGameId] = useState(null);
  const editGame = useMemo(() => games.find((g) => Number(g.id) === Number(editGameId)) || null, [games, editGameId]);
  const [editGameForm, setEditGameForm] = useState({
    nama_game: '',
    genre: '',
    ukuran: '',
    size_gb: '0',
    deskripsi: '',
    cover: null,
  });

  async function loadGames() {
    setGamesLoading(true);
    setGamesError('');
    try {
      const { data } = await adminApi.get('/games');
      setGames(Array.isArray(data) ? data : []);
      setGamesVisibleCount(5);
    } catch (e) {
      setGamesError(e?.response?.data?.message || e?.message || 'Failed to load games');
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  }

  async function updateGame(gameId, payload) {
    setGamesError('');
    try {
      // If payload is FormData, use POST + method override.
      // PHP does not reliably populate multipart fields/files for PATCH requests.
      if (payload instanceof FormData) {
        payload.set('_method', 'PATCH');
        await adminApi.post(`/games/${gameId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return;
      }

      await adminApi.patch(`/games/${gameId}`, payload);
    } catch (e) {
      setGamesError(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update game');
      throw e;
    }
  }

  // ===== HDD state =====
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState('');

  const [newVariant, setNewVariant] = useState({
    nama: '',
    kapasitas_gb: '500',
    harga: '0',
    stok: '0',
  });

  const [editVariantId, setEditVariantId] = useState(null);
  const editVariant = useMemo(() => variants.find((v) => Number(v.id) === Number(editVariantId)) || null, [variants, editVariantId]);
  const [editVariantForm, setEditVariantForm] = useState({ harga: '', stok: '' });

  async function loadVariants() {
    setVariantsLoading(true);
    setVariantsError('');
    try {
      const { data } = await adminApi.get('/hdd-variants');
      setVariants(Array.isArray(data) ? data : []);
    } catch (e) {
      setVariantsError(e?.response?.data?.message || e?.message || 'Failed to load HDD variants');
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !isAdmin) return;
    loadGames();
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  useEffect(() => {
    if (!editGame) return;
    setEditGameForm({
      nama_game: String(editGame.nama_game ?? ''),
      genre: String(editGame.genre ?? ''),
      ukuran: String(editGame.ukuran ?? ''),
      size_gb: String(editGame.size_gb ?? 0),
      deskripsi: String(editGame.deskripsi ?? ''),
      cover: null,
    });
  }, [editGame]);

  useEffect(() => {
    if (!editVariant) return;
    setEditVariantForm({
      harga: String(editVariant.harga ?? 0),
      stok: String(editVariant.stok ?? 0),
    });
  }, [editVariant]);

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-(--wd-accent)/10 blur-3xl" />
        <div className="absolute top-40 -right-30 h-105 w-105 rounded-full bg-(--wd-accent-2)/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto max-w-350 px-3 sm:px-6 py-3 flex items-center gap-3">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-(--wd-accent) text-gray-950 font-black">
              WD
            </span>
            <div className="leading-tight">
              <div className="wd-brand text-sm font-semibold text-white">WD Games</div>
              <div className="text-[11px] text-white/50">Admin Panel</div>
            </div>
          </a>

          <div className="flex-1" />

          {headerRight}
        </div>
      </header>

      <main className="mx-auto max-w-350 px-3 sm:px-6 py-6 space-y-6">
        <Panel
          title="Access"
          right={<SubtleButton onClick={refreshMe}>{loadingMe ? 'Checking…' : 'Refresh'}</SubtleButton>}
        >
          <div className="text-sm text-white/80">
            Token: <span className="text-white/50">{token ? 'present' : 'missing'}</span>
          </div>

          {meError ? <div className="mt-3 text-sm text-rose-200">{meError}</div> : null}

          {loadingMe ? (
            <div className="mt-3 text-sm text-white/60">Loading session…</div>
          ) : !token ? (
            <div className="mt-3 text-sm text-white/60">
              Login dulu lewat <a href="/storefront/login" className="text-(--wd-accent)">/storefront/login</a>. Setelah login, token akan tersimpan di browser.
            </div>
          ) : !me ? (
            <div className="mt-3 text-sm text-white/60">Token invalid/expired. Login ulang.</div>
          ) : !isAdmin ? (
            <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              Forbidden: akun kamu bukan admin.
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-(--wd-accent-20) bg-(--wd-accent-10) p-4 text-sm text-white/80">
              OK: kamu admin.
            </div>
          )}

          <div className="mt-4 text-[11px] text-white/45">
            Token storage key: <span className="text-white/60">{STORAGE_KEY}</span>
          </div>
        </Panel>

        {/* Admin sections */}
        {token && me && isAdmin ? (
          <>
            <Panel
              title="Games"
              right={
                <div className="flex items-center gap-2">
                  <SubtleButton onClick={loadGames} disabled={gamesLoading}>
                    {gamesLoading ? 'Loading…' : 'Refresh'}
                  </SubtleButton>
                </div>
              }
            >
              {gamesError ? <div className="mb-4 text-sm text-rose-200">{gamesError}</div> : null}

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-white/50">ADD GAME</div>
                  <form
                    className="mt-3 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData();
                      fd.set('nama_game', newGame.nama_game);
                      fd.set('genre', newGame.genre);
                      fd.set('ukuran', newGame.ukuran);
                      fd.set('size_gb', String(parseInt(newGame.size_gb || '0', 10)));
                      fd.set('deskripsi', newGame.deskripsi || '');
                      if (newGame.cover) fd.set('cover', newGame.cover);

                      await adminApi.post('/games', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });

                      setNewGame({ nama_game: '', genre: '', ukuran: '', size_gb: '0', deskripsi: '', cover: null });
                      await loadGames();
                    }}
                  >
                    <TextInput label="Nama" value={newGame.nama_game} onChange={(v) => setNewGame((s) => ({ ...s, nama_game: v }))} />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <TextInput label="Genre" value={newGame.genre} onChange={(v) => setNewGame((s) => ({ ...s, genre: v }))} />
                      <TextInput label="Ukuran (label)" value={newGame.ukuran} onChange={(v) => setNewGame((s) => ({ ...s, ukuran: v }))} placeholder="contoh: 50GB" />
                    </div>
                    <NumberInput label="Size GB" value={newGame.size_gb} onChange={(v) => setNewGame((s) => ({ ...s, size_gb: v }))} />
                    <label className="block">
                      <div className="text-xs text-white/60">Deskripsi (optional)</div>
                      <textarea
                        value={newGame.deskripsi}
                        onChange={(e) => setNewGame((s) => ({ ...s, deskripsi: e.target.value }))}
                        rows={4}
                        className="mt-2 w-full resize-y rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
                        placeholder="Deskripsi singkat game"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-white/60">Cover (jpg/png, optional)</div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white/80 hover:file:bg-white/15"
                        onChange={(e) => setNewGame((s) => ({ ...s, cover: e.target.files?.[0] || null }))}
                      />
                    </label>
                    <PrimaryButton type="submit">Create Game</PrimaryButton>
                  </form>
                </div>

                <div>
                  <div className="text-xs text-white/50">LIST</div>
                  {gamesLoading ? (
                    <div className="mt-3 text-sm text-white/60">Loading…</div>
                  ) : games.length === 0 ? (
                    <div className="mt-3 text-sm text-white/60">No games.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {games.slice(0, gamesVisibleCount).map((g) => (
                        <div key={g.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">{g.nama_game}</div>
                              <div className="mt-1 text-xs text-white/50">
                                ID: {g.id} • {g.genre} • {g.size_gb ?? 0} GB
                              </div>
                              <div className="mt-1 text-xs text-white/60">Ukuran: <span className="text-white/80">{g.ukuran || '—'}</span></div>
                              <div className="mt-1 text-[11px] text-white/40">{g.slug || '—'}</div>
                              {g.cover ? (
                                <a
                                  href={`/storage/${g.cover}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-block text-xs text-(--wd-accent) hover:text-(--wd-accent)/90"
                                >
                                  View cover
                                </a>
                              ) : null}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <SubtleButton
                                onClick={() => {
                                  setEditGameId(g.id);
                                }}
                              >
                                Edit
                              </SubtleButton>
                              <DangerButton
                                onClick={async () => {
                                  if (!confirm(`Delete game: ${g.nama_game}?`)) return;
                                  await adminApi.delete(`/games/${g.id}`);
                                  if (Number(editGameId) === Number(g.id)) setEditGameId(null);
                                  await loadGames();
                                }}
                              >
                                Delete
                              </DangerButton>
                            </div>
                          </div>

                          {Number(editGameId) === Number(g.id) ? (
                            <form
                              className="mt-4 space-y-3"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const sizeGb = parseInt(editGameForm.size_gb || '0', 10);

                                if (editGameForm.cover) {
                                  const fd = new FormData();
                                  fd.set('nama_game', editGameForm.nama_game);
                                  fd.set('genre', editGameForm.genre);
                                  fd.set('ukuran', editGameForm.ukuran);
                                  fd.set('size_gb', String(Number.isFinite(sizeGb) ? sizeGb : 0));
                                  fd.set('deskripsi', editGameForm.deskripsi || '');
                                  fd.set('cover', editGameForm.cover);

                                  await updateGame(g.id, fd);
                                } else {
                                  await updateGame(g.id, {
                                    nama_game: editGameForm.nama_game,
                                    genre: editGameForm.genre,
                                    ukuran: editGameForm.ukuran,
                                    size_gb: Number.isFinite(sizeGb) ? sizeGb : 0,
                                    deskripsi: editGameForm.deskripsi || '',
                                  });
                                }

                                await loadGames();
                              }}
                            >
                              <div className="grid sm:grid-cols-2 gap-3">
                                <TextInput
                                  label="Nama"
                                  value={editGameForm.nama_game}
                                  onChange={(v) => setEditGameForm((s) => ({ ...s, nama_game: v }))}
                                />
                                <TextInput
                                  label="Genre"
                                  value={editGameForm.genre}
                                  onChange={(v) => setEditGameForm((s) => ({ ...s, genre: v }))}
                                />
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <TextInput
                                  label="Ukuran (label)"
                                  value={editGameForm.ukuran}
                                  onChange={(v) => setEditGameForm((s) => ({ ...s, ukuran: v }))}
                                  placeholder="contoh: 50GB"
                                />
                                <NumberInput
                                  label="Size GB"
                                  value={editGameForm.size_gb}
                                  onChange={(v) => setEditGameForm((s) => ({ ...s, size_gb: v }))}
                                />
                              </div>

                              <label className="block">
                                <div className="text-xs text-white/60">Deskripsi (optional)</div>
                                <textarea
                                  value={editGameForm.deskripsi}
                                  onChange={(e) => setEditGameForm((s) => ({ ...s, deskripsi: e.target.value }))}
                                  rows={4}
                                  className="mt-2 w-full resize-y rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
                                />
                              </label>

                              <label className="block">
                                <div className="text-xs text-white/60">Replace cover (jpg/png, optional)</div>
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg"
                                  className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white/80 hover:file:bg-white/15"
                                  onChange={(e) => setEditGameForm((s) => ({ ...s, cover: e.target.files?.[0] || null }))}
                                />
                              </label>

                              <div className="flex items-center gap-2">
                                <PrimaryButton type="submit">Save</PrimaryButton>
                                <SubtleButton onClick={() => setEditGameId(null)} type="button">Cancel</SubtleButton>
                              </div>
                            </form>
                          ) : null}
                        </div>
                      ))}

                      {gamesVisibleCount < games.length ? (
                        <div className="pt-2">
                          <SubtleButton onClick={() => setGamesVisibleCount((n) => Math.min(n + 5, games.length))}>
                            Load more
                          </SubtleButton>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <Panel
              title="HDD Variants"
              right={<SubtleButton onClick={loadVariants} disabled={variantsLoading}>{variantsLoading ? 'Loading…' : 'Refresh'}</SubtleButton>}
            >
              {variantsError ? <div className="mb-4 text-sm text-rose-200">{variantsError}</div> : null}

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-white/50">ADD HDD</div>
                  <form
                    className="mt-3 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await adminApi.post('/hdd-variants', {
                        nama: newVariant.nama,
                        kapasitas_gb: parseInt(newVariant.kapasitas_gb || '0', 10),
                        harga: parseInt(newVariant.harga || '0', 10),
                        stok: parseInt(newVariant.stok || '0', 10),
                      });
                      setNewVariant({ nama: '', kapasitas_gb: '500', harga: '0', stok: '0' });
                      await loadVariants();
                    }}
                  >
                    <TextInput label="Nama" value={newVariant.nama} onChange={(v) => setNewVariant((s) => ({ ...s, nama: v }))} placeholder="contoh: HDD 500GB" />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <NumberInput label="Kapasitas GB" value={newVariant.kapasitas_gb} onChange={(v) => setNewVariant((s) => ({ ...s, kapasitas_gb: v }))} />
                      <NumberInput label="Harga" value={newVariant.harga} onChange={(v) => setNewVariant((s) => ({ ...s, harga: v }))} />
                      <NumberInput label="Stok" value={newVariant.stok} onChange={(v) => setNewVariant((s) => ({ ...s, stok: v }))} />
                    </div>
                    <PrimaryButton type="submit">Create HDD</PrimaryButton>
                  </form>
                </div>

                <div>
                  <div className="text-xs text-white/50">LIST</div>
                  {variantsLoading ? (
                    <div className="mt-3 text-sm text-white/60">Loading…</div>
                  ) : variants.length === 0 ? (
                    <div className="mt-3 text-sm text-white/60">No variants.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {variants.map((v) => (
                        <div key={v.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">{v.nama}</div>
                              <div className="mt-1 text-xs text-white/60">
                                Kapasitas: <span className="text-white/80">{Number(v.kapasitas_gb || 0)} GB</span>
                              </div>
                              <div className="mt-1 text-xs text-white/60">
                                Harga: <span className="text-white/80">Rp {Number(v.harga || 0).toLocaleString('id-ID')}</span> • Stok:{' '}
                                <span className="text-white/80">{Number(v.stok || 0)}</span>
                              </div>
                              <div className="mt-1 text-[11px] text-white/40">{v.slug || '—'}</div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <SubtleButton onClick={() => setEditVariantId(v.id)}>Edit</SubtleButton>
                              <DangerButton
                                onClick={async () => {
                                  if (!confirm(`Delete HDD variant: ${v.nama}?`)) return;
                                  await adminApi.delete(`/hdd-variants/${v.id}`);
                                  if (Number(editVariantId) === Number(v.id)) setEditVariantId(null);
                                  await loadVariants();
                                }}
                              >
                                Delete
                              </DangerButton>
                            </div>
                          </div>

                          {Number(editVariantId) === Number(v.id) ? (
                            <form
                              className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                await adminApi.patch(`/hdd-variants/${v.id}`, {
                                  harga: parseInt(editVariantForm.harga || '0', 10),
                                  stok: parseInt(editVariantForm.stok || '0', 10),
                                });
                                await loadVariants();
                              }}
                            >
                              <NumberInput
                                label="Harga"
                                value={editVariantForm.harga}
                                onChange={(val) => setEditVariantForm((s) => ({ ...s, harga: val }))}
                              />
                              <NumberInput
                                label="Stok"
                                value={editVariantForm.stok}
                                onChange={(val) => setEditVariantForm((s) => ({ ...s, stok: val }))}
                              />
                              <PrimaryButton type="submit">Save</PrimaryButton>
                            </form>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <UsersPanel />
          </>
        ) : null}
      </main>

      <footer className="py-10">
        <div className="mx-auto max-w-350 px-3 sm:px-6 text-xs text-white/40">
          Admin UI uses JWT from localStorage.
        </div>
      </footer>
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel
      title="Users (Admin)"
      right={<SubtleButton onClick={loadUsers} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</SubtleButton>}
    >
      {error ? <div className="mb-4 text-sm text-rose-200">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-white/60">Loading…</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-white/60">No users.</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <div>
                <div className="text-sm font-semibold text-white">{u.name}</div>
                <div className="text-xs text-white/60">{u.email}</div>
                <div className="text-[11px] text-white/40">ID: {u.id}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cx('text-xs', u.is_admin ? 'text-(--wd-accent)' : 'text-white/50')}>
                  {u.is_admin ? 'Admin' : 'User'}
                </span>
                <SubtleButton
                  onClick={async () => {
                    await adminApi.patch(`/admin/users/${u.id}`, { is_admin: !u.is_admin });
                    await loadUsers();
                  }}
                >
                  Toggle Admin
                </SubtleButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-[11px] text-white/45">
        Endpoint: <span className="text-white/60">GET /api/admin/users • PATCH /api/admin/users/{`{id}`}</span>
      </div>
    </Panel>
  );
}

const el = document.getElementById('wdgames-admin-root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>
  );
}
