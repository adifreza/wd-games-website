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

function OrdersAdminApp() {
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

  // ===== Orders state =====
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { data } = await adminApi.get('/admin/orders');
      setOrders(Array.isArray(data) ? data : []);
      setVisibleCount(10);
    } catch (e) {
      setOrdersError(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !isAdmin) return;
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

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
        <a
          href="/admin"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Admin Panel
        </a>
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
              <div className="text-[11px] text-white/50">Orders Admin</div>
            </div>
          </a>

          <div className="flex-1" />

          {headerRight}
        </div>
      </header>

      <main className="mx-auto max-w-350 px-3 sm:px-6 py-6 space-y-6">
        <Panel title="Access" right={<SubtleButton onClick={refreshMe}>{loadingMe ? 'Checking…' : 'Refresh'}</SubtleButton>}>
          <div className="text-sm text-white/80">
            Token: <span className="text-white/50">{token ? 'present' : 'missing'}</span>
          </div>

          {meError ? <div className="mt-3 text-sm text-rose-200">{meError}</div> : null}

          {loadingMe ? (
            <div className="mt-3 text-sm text-white/60">Loading session…</div>
          ) : !token ? (
            <div className="mt-3 text-sm text-white/60">
              Login dulu lewat <a href="/storefront/login" className="text-(--wd-accent)">/storefront/login</a>.
            </div>
          ) : !me ? (
            <div className="mt-3 text-sm text-white/60">Token invalid/expired. Login ulang.</div>
          ) : !isAdmin ? (
            <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">Forbidden: akun kamu bukan admin.</div>
          ) : (
            <div className="mt-3 rounded-xl border border-(--wd-accent-20) bg-(--wd-accent-10) p-4 text-sm text-white/80">OK: kamu admin.</div>
          )}
        </Panel>

        {token && me && isAdmin ? (
          <Panel
            title="Orders"
            right={
              <div className="flex items-center gap-2">
                <SubtleButton onClick={loadOrders} disabled={ordersLoading}>{ordersLoading ? 'Loading…' : 'Refresh'}</SubtleButton>
              </div>
            }
          >
            {ordersError ? <div className="mb-4 text-sm text-rose-200">{ordersError}</div> : null}

            {ordersLoading ? (
              <div className="text-sm text-white/60">Loading…</div>
            ) : orders.length === 0 ? (
              <div className="text-sm text-white/60">No orders.</div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, visibleCount).map((o) => (
                  <OrderCard key={o.id} order={o} onChanged={loadOrders} />
                ))}

                {visibleCount < orders.length ? (
                  <div className="pt-2">
                    <SubtleButton onClick={() => setVisibleCount((n) => Math.min(n + 10, orders.length))}>Load more</SubtleButton>
                  </div>
                ) : null}
              </div>
            )}
          </Panel>
        ) : null}
      </main>

      <footer className="py-10">
        <div className="mx-auto max-w-350 px-3 sm:px-6 text-xs text-white/40">Admin orders page.</div>
      </footer>
    </div>
  );
}

function OrderCard({ order, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(order.status || 'pending');

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            Order #{order.id} <span className="text-white/40">({order.uuid || '—'})</span>
          </div>
          <div className="mt-1 text-xs text-white/60">
            User: <span className="text-white/80">{order.user?.email || order.user?.name || '—'}</span>
          </div>
          <div className="mt-1 text-xs text-white/60">
            HDD: <span className="text-white/80">{order.hdd_variant?.nama || '—'}</span>
            {order.hdd_variant?.kapasitas_gb != null ? <span className="text-white/40"> • {order.hdd_variant.kapasitas_gb} GB</span> : null}
          </div>
          <div className="mt-1 text-xs text-white/60">
            Qty: <span className="text-white/80">{order.qty ?? items.length ?? 0}</span>
            {order.total_harga != null ? <span className="text-white/40"> • Total: {order.total_harga}</span> : null}
          </div>

          {items.length ? (
            <div className="mt-3">
              <div className="text-[11px] text-white/50">Games:</div>
              <ul className="mt-1 space-y-1">
                {items.slice(0, 8).map((it) => (
                  <li key={it.id} className="text-xs text-white/70">
                    - {it.game?.nama_game || `Game #${it.game_id}`} <span className="text-white/40">({it.size_gb ?? 0} GB)</span>
                  </li>
                ))}
                {items.length > 8 ? <li className="text-xs text-white/40">…and {items.length - 8} more</li> : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="min-w-55">
          <div className="text-xs text-white/50">STATUS</div>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-(--wd-border) bg-black/30 px-3 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
            >
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="cancel">cancel</option>
            </select>
            <PrimaryButton
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError('');
                try {
                  await adminApi.patch(`/admin/orders/${order.id}`, { status });
                  await onChanged();
                } catch (e) {
                  setError(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update');
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </div>
          {error ? <div className="mt-2 text-xs text-rose-200">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}

const el = document.getElementById('wdgames-admin-orders-root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <OrdersAdminApp />
    </React.StrictMode>
  );
}
