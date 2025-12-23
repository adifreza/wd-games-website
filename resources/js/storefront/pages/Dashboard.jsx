import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HDDCard from '../components/HDDCard.jsx';
import GameCard from '../components/GameCard.jsx';
import { GameCardSkeleton } from '../components/Skeletons.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStorefront } from '../context/StorefrontContext.jsx';
import { apiCreateOrder, apiGetGames, apiGetHddVariants } from '../services/index.js';
import { resolveGameSizeGB, resolveTitle } from '../utils/format.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { push } = useToast();

  const {
    selectedHdd,
    selectHdd,
    selectedGames,
    addGame,
    removeGame,
    hasGame,
    canAddGame,
    usedGB,
    remainingGB,
    capacityGB,
    searchQuery,
    clearSelection,
  } = useStorefront();

  const [hdd, setHdd] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fallbackHdd = [
    { id: 1, nama: 'HDD 320GB', kapasitas_gb: 320, harga: 0, stok: 0 },
    { id: 2, nama: 'HDD 500GB', kapasitas_gb: 500, harga: 0, stok: 0 },
    { id: 3, nama: 'HDD 1TB', kapasitas_gb: 1000, harga: 0, stok: 0 },
  ];

  const filteredGames = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => {
      const title = resolveTitle(g).toLowerCase();
      const genre = String(g?.genre || '').toLowerCase();
      return title.includes(q) || genre.includes(q);
    });
  }, [games, searchQuery]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [hddRes, gamesRes] = await Promise.all([apiGetHddVariants(), apiGetGames()]);
      setHdd(Array.isArray(hddRes) ? hddRes : []);
      setGames(Array.isArray(gamesRes) ? gamesRes : []);
    } catch (e) {
      console.error('Failed to load storefront data', e);
      setError('Backend belum siap (kemungkinan MySQL belum jalan). Kamu bisa aktifkan mock mode: VITE_USE_MOCK_API=true');
      setHdd(fallbackHdd);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectionPct = capacityGB > 0 ? Math.min(100, Math.round((usedGB / capacityGB) * 100)) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs tracking-widest text-white/50">WD GAMES</div>
          <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">Steam-inspired storefront UI (tanpa copy Steam).</p>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>

      {/* HDD PACKAGES */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">HDD Packages</h2>
          <div className="text-xs text-white/50">Select HDD → Add games until full</div>
        </div>

        {loading ? (
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="mt-3 h-7 w-36 bg-white/10 rounded" />
                <div className="mt-6 h-2 w-full bg-white/10 rounded" />
                <div className="mt-4 h-9 w-32 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {(hdd.length ? hdd : [
              { id: 'fallback-320', nama: 'HDD 320GB', kapasitas_gb: 320, harga: 0 },
              { id: 'fallback-500', nama: 'HDD 500GB', kapasitas_gb: 500, harga: 0 },
              { id: 'fallback-1000', nama: 'HDD 1TB', kapasitas_gb: 1000, harga: 0 },
            ]).map((v) => (
              <HDDCard
                key={v.id}
                hdd={v}
                selected={Number(selectedHdd?.id) === Number(v.id)}
                usedGB={Number(selectedHdd?.id) === Number(v.id) ? usedGB : 0}
                onSelect={() => {
                  selectHdd(v);
                  push({ type: 'success', title: 'HDD Selected', message: `${v.nama} selected.` });
                }}
                onViewGames={() => navigate('/storefront/games')}
              />
            ))}
          </div>
        )}

        {/* Selection status */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-white/60">Selected HDD</div>
              <div className="text-sm font-semibold text-white">
                {selectedHdd ? selectedHdd.nama : '—'}
              </div>
            </div>

            <div className="min-w-60 flex-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Storage</span>
                <span>
                  <span className="text-white/80 font-semibold">{usedGB.toFixed(2)} GB</span> / {capacityGB || 0} GB
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-(--wd-accent) to-(--wd-accent-2)"
                  style={{ width: `${selectionPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => clearSelection()}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                disabled={!selectedHdd}
              >
                Clear
              </button>

              <button
                type="button"
                disabled={!selectedHdd || selectedGames.length === 0 || checkoutLoading}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-semibold transition',
                  !selectedHdd || selectedGames.length === 0 || checkoutLoading
                    ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                    : 'bg-(--wd-accent) text-gray-950 hover:bg-(--wd-accent)/90',
                ].join(' ')}
                onClick={async () => {
                  if (!selectedHdd) return;
                  if (!token) {
                    push({ type: 'error', title: 'Login required', message: 'Please login to checkout.' });
                    navigate('/storefront/login', { state: { from: '/storefront' } });
                    return;
                  }

                  setCheckoutLoading(true);
                  try {
                    const payload = {
                      hdd_variant_id: selectedHdd.id,
                      game_ids: selectedGames.map((g) => g.id),
                    };
                    await apiCreateOrder(payload);
                    push({ type: 'success', title: 'Order created', message: 'Checkout berhasil.' });
                    clearSelection();
                    navigate('/storefront/orders');
                  } catch (e) {
                    push({
                      type: 'error',
                      title: 'Checkout failed',
                      message: e?.response?.data?.message || e?.message || 'Unknown error',
                    });
                  } finally {
                    setCheckoutLoading(false);
                  }
                }}
              >
                {checkoutLoading ? 'Processing…' : 'Checkout'}
              </button>
            </div>
          </div>

          {selectedHdd ? (
            <div className="mt-3 text-xs text-white/50">
              Remaining: <span className="text-white/70 font-semibold">{remainingGB.toFixed(2)} GB</span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-white/50">Pilih HDD untuk mulai.</div>
          )}
        </div>
      </div>

      {/* GAMES */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Games</h2>
          {error ? (
            <div className="text-xs text-rose-200">{error}</div>
          ) : (
            <div className="text-xs text-white/50">Fetched from API: GET /api/games</div>
          )}
        </div>

        {loading ? (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
            No games found.
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames.map((g) => {
              const isSelected = hasGame(g);
              const size = resolveGameSizeGB(g);
              const disabled = !isSelected && (!selectedHdd || !canAddGame(g));

              return (
                <GameCard
                  key={g.id}
                  game={g}
                  selected={isSelected}
                  remainingGB={remainingGB.toFixed(2)}
                  disabled={disabled}
                  onAdd={() => {
                    if (!selectedHdd) {
                      push({ type: 'error', title: 'Select HDD first', message: 'Pilih HDD package dulu.' });
                      return;
                    }

                    const ok = addGame(g);
                    if (!ok) {
                      push({
                        type: 'error',
                        title: 'Capacity exceeded',
                        message: `Butuh ${size.toFixed(2)} GB, sisa ${remainingGB.toFixed(2)} GB.`,
                      });
                      return;
                    }

                    push({ type: 'success', title: 'Added', message: `${resolveTitle(g)} added to HDD.` });
                  }}
                  onRemove={() => {
                    removeGame(g);
                    push({ type: 'success', title: 'Removed', message: `${resolveTitle(g)} removed.` });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
