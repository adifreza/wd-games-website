import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/storefront', label: 'Dashboard' },
  { to: '/storefront/hdd', label: 'HDD Packages' },
  { to: '/storefront/games', label: 'All Games' },
  { to: '/storefront/orders', label: 'Orders' },
  { to: '/storefront/profile', label: 'Profile' },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center justify-between rounded-xl px-4 py-3 text-sm transition',
          isActive
            ? 'bg-(--wd-accent-10) border border-(--wd-accent-20) text-(--wd-accent)'
            : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
      end={to === '/storefront'}
    >
      <span className="font-medium">{label}</span>
      <span className="text-white/30 text-xs">›</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <aside>
      {/* Mobile overlay */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-30 transition',
          open ? 'bg-black/50' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <div
        className={[
          'lg:static fixed z-40 top-16 left-0 h-[calc(100vh-64px)] w-70 transition-transform',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4">
            <div className="text-xs tracking-widest text-white/50">NAVIGATION</div>
          </div>

          <div className="space-y-3">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} onClick={onClose} />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-semibold">Tip</div>
            <div className="mt-1 text-xs text-white/60">
              Pilih HDD dulu, lalu tambah game sampai kapasitas penuh.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
