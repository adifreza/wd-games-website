import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useStorefront } from '../context/StorefrontContext.jsx';

function initials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return 'WG';
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || 'W';
  const b = parts[1]?.[0] || parts[0]?.[1] || 'G';
  return (a + b).toUpperCase();
}

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useStorefront();

  const [open, setOpen] = useState(false);

  const avatarText = useMemo(() => initials(user?.name || user?.email), [user?.name, user?.email]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto max-w-350 px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <span className="font-semibold">☰</span>
          </button>

          <Link to="/storefront" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-(--wd-accent) text-gray-950 font-black">WD</span>
            <div className="leading-tight">
              <div className="wd-brand text-sm font-semibold text-white">WD Games</div>
              <div className="text-[11px] text-white/50">Storefront</div>
            </div>
          </Link>

          <div className="flex-1" />

          <div className="hidden md:flex w-full max-w-130">
            <div className="relative w-full">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">⌕</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!token ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/storefront/login"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/storefront/register"
                  className="rounded-xl bg-(--wd-accent) px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-(--wd-accent)/90 transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(v => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-(--wd-accent) to-(--wd-accent-2) text-gray-950 font-bold text-xs">
                    {avatarText}
                  </span>
                  <span className="hidden sm:block text-sm text-white/80 max-w-35 truncate">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-white/50 text-xs">▾</span>
                </button>

                {open && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-gray-950 shadow-xl shadow-black/40 overflow-hidden"
                    onMouseLeave={() => setOpen(false)}
                  >
                    <button
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpen(false);
                        navigate('/storefront/profile');
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5"
                      onClick={async () => {
                        setOpen(false);
                        await logout();
                        navigate('/storefront/login');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden mt-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full rounded-xl border border-(--wd-border) bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-(--wd-accent-35) focus:ring-2 focus:ring-(--wd-accent-20)"
          />
        </div>
      </div>
    </header>
  );
}
