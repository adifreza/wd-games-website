import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ToastProvider.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { push } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from || '/storefront';

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-(--wd-border) bg-(--wd-surface) p-6">
          <div className="wd-brand text-xs tracking-widest text-(--wd-accent)">WD GAMES</div>
          <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-white/60">Login untuk checkout HDD &amp; orders.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await login({ email, password });
                push({ type: 'success', title: 'Welcome back', message: 'Login berhasil.' });
                navigate(from, { replace: true });
              } catch (err) {
                push({ type: 'error', title: 'Login failed', message: err?.response?.data?.error || err?.message || 'Unknown error' });
              }
            }}
          >
            <div>
              <label className="text-xs text-white/60">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
            </div>

            <button
              disabled={loading}
              className={[
                'w-full rounded-xl px-4 py-2 text-sm font-semibold transition',
                loading
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-(--wd-accent) text-gray-950 hover:bg-(--wd-accent)/90',
              ].join(' ')}
              type="submit"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>

            <div className="text-xs text-white/60">
              Belum punya akun?{' '}
              <Link to="/storefront/register" className="text-(--wd-accent) hover:text-(--wd-accent)/90">
                Register
              </Link>
            </div>

            <div className="text-[11px] text-white/40">
              API: <span className="text-white/60">POST /api/auth/login</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
