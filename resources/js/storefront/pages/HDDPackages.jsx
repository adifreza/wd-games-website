import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HDDCard from '../components/HDDCard.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useStorefront } from '../context/StorefrontContext.jsx';
import { apiGetHddVariants } from '../services/index.js';

export default function HDDPackages() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { selectedHdd, selectHdd, usedGB } = useStorefront();

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackVariants = [
    { id: 1, nama: 'HDD 320GB', kapasitas_gb: 320, harga: 0, stok: 0 },
    { id: 2, nama: 'HDD 500GB', kapasitas_gb: 500, harga: 0, stok: 0 },
    { id: 3, nama: 'HDD 1TB', kapasitas_gb: 1000, harga: 0, stok: 0 },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGetHddVariants();
        setVariants(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load HDD variants', e);
        setError('Backend belum tersambung (DB/MySQL error). Jalankan MySQL atau aktifkan mock mode: VITE_USE_MOCK_API=true');
        setVariants(fallbackVariants);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">HDD Packages</h1>
          <p className="mt-1 text-sm text-white/60">Pilih HDD 320GB / 500GB / 1TB.</p>
        </div>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          onClick={() => navigate('/storefront/games')}
        >
          Browse Games
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {(loading ? [] : variants).map((v) => (
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

        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="mt-3 h-7 w-36 bg-white/10 rounded" />
                <div className="mt-6 h-2 w-full bg-white/10 rounded" />
                <div className="mt-4 h-9 w-32 bg-white/10 rounded-xl" />
              </div>
            ))}
          </>
        ) : null}
      </div>

      {!loading && variants.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
          No HDD variants found.
        </div>
      ) : null}
    </div>
  );
}
