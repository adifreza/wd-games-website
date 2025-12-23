import React, { useEffect, useState } from 'react';

import { apiGetOrders } from '../services/index.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGetOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-white/60">Riwayat order kamu (JWT required).</p>

      {error ? <div className="mt-4 text-sm text-rose-200">{error}</div> : null}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
          Loading…
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white/50">Order</div>
                  <div className="text-sm font-semibold text-white">
                    #{o.id} <span className="text-white/50 font-normal">({o.uuid || '—'})</span>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  Status: <span className="text-white/80 font-semibold">{o.status}</span>
                </div>
                <div className="text-xs text-white/60">
                  Total: <span className="text-white/80 font-semibold">Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/60">
                HDD: <span className="text-white/80">{o.hdd_variant?.nama || o.hddVariant?.nama || '—'}</span>
              </div>

              <div className="mt-3">
                <div className="text-xs text-white/50">Games</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(o.items || []).map((it) => (
                    <span
                      key={it.id}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                    >
                      {it.game?.nama_game || it.game?.title || 'Game'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
