import React from 'react';

export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-black/40" />
      <div className="p-4">
        <div className="h-3 w-2/3 bg-white/10 rounded" />
        <div className="mt-2 h-3 w-1/3 bg-white/10 rounded" />
        <div className="mt-5 h-9 w-full bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

export function LineSkeleton({ w = 'w-full' }) {
  return <div className={["h-3 bg-white/10 rounded", w].join(' ')} />;
}
