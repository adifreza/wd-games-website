import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-white/60">Akun kamu (dari GET /api/auth/me).</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-white/50">Name</div>
            <div className="text-sm font-semibold text-white">{user?.name || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">Email</div>
            <div className="text-sm font-semibold text-white">{user?.email || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">Role</div>
            <div className="text-sm font-semibold text-white">{user?.is_admin ? 'Admin' : 'User'}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">User ID</div>
            <div className="text-sm font-semibold text-white">{user?.id ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
