import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function ShellLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageKey = useMemo(() => location.pathname, [location.pathname]);

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-(--wd-accent)/10 blur-3xl" />
        <div className="absolute top-40 -right-30 h-105 w-105 rounded-full bg-(--wd-accent-2)/10 blur-3xl" />
      </div>

      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(v => !v)} />

      <div className="mx-auto max-w-350 px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 py-6">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main
            key={pageKey}
            className="relative rounded-2xl border border-(--wd-border) bg-(--wd-surface) p-4 sm:p-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
