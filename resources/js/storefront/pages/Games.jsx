import React, { useEffect, useMemo, useState } from 'react';

import GameCard from '../components/GameCard.jsx';
import { GameCardSkeleton } from '../components/Skeletons.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useStorefront } from '../context/StorefrontContext.jsx';
import { apiGetGames } from '../services/index.js';
import { resolveGameSizeGB, resolveTitle } from '../utils/format.js';

export default function Games() {
  const { push } = useToast();
  const { selectedHdd, addGame, removeGame, hasGame, canAddGame, remainingGB, searchQuery } = useStorefront();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGetGames();
        setGames(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load games', e);
        setError('Gagal ambil games dari backend. Pastikan MySQL jalan atau aktifkan mock mode: VITE_USE_MOCK_API=true');
        setGames([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => {
      const title = resolveTitle(g).toLowerCase();
      const genre = String(g?.genre || '').toLowerCase();
      return title.includes(q) || genre.includes(q);
    });
  }, [games, searchQuery]);

  const visibleGames = useMemo(() => {
    return filtered.slice(0, Math.max(0, visibleCount));
  }, [filtered, visibleCount]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">All Games</h1>
          <p className="mt-1 text-sm text-white/60">Browse dan add game ke HDD.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2">
          <div className="text-[10px] text-white/50">Selected HDD</div>
          <div className="text-sm font-semibold text-white">
            {selectedHdd ? selectedHdd.nama : '—'}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
          No games.
        </div>
      ) : (
        <div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleGames.map((g) => {
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

                  push({ type: 'success', title: 'Added', message: `${resolveTitle(g)} added.` });
                }}
                onRemove={() => {
                  removeGame(g);
                  push({ type: 'success', title: 'Removed', message: `${resolveTitle(g)} removed.` });
                }}
              />
            );
          })}
          </div>

          {filtered.length > visibleCount ? (
            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                onClick={() => setVisibleCount((c) => c + 20)}
              >
                Load more
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
