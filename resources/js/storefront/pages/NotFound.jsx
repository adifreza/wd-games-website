import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-white/60">The page you requested doesn’t exist.</p>
      <Link
        to="/storefront"
        className="mt-6 inline-flex rounded-xl bg-(--wd-accent) px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-(--wd-accent)/90 transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
