import React from 'react';

export default function HDDCard({ hdd, selected, usedGB, onSelect, onViewGames }) {
  const capacity = Number(hdd?.kapasitas_gb ?? hdd?.capacity_gb ?? 0);
  const used = Math.max(0, Number(usedGB ?? 0));
  const pct = capacity > 0 ? Math.min(100, Math.round((used / capacity) * 100)) : 0;

  return (
    <div
      className={[
        'group rounded-2xl border bg-linear-to-b p-5 transition',
        selected
          ? 'border-(--wd-accent-35) from-(--wd-accent-10) to-white/0'
          : 'border-white/10 from-white/5 to-white/0 hover:border-white/20',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-widest text-white/50">HDD PACKAGE</div>
          <div className="mt-2 text-2xl font-semibold text-white">{hdd?.nama || hdd?.label || 'HDD'}</div>
          <div className="mt-1 text-sm text-white/65">Plug &amp; Play PC Games</div>
        </div>

        <div className="shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] text-white/50">Capacity</div>
          <div className="text-sm font-semibold text-white">{capacity} GB</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Estimated fill</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-(--wd-accent) to-(--wd-accent-2) transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelect}
          className={[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            selected
              ? 'bg-(--wd-accent) text-gray-950 hover:bg-(--wd-accent)/90'
              : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10',
          ].join(' ')}
        >
          {selected ? 'Selected' : 'Select HDD'}
        </button>

        <button
          type="button"
          onClick={onViewGames}
          className="rounded-xl px-4 py-2 text-sm text-white/80 border border-white/10 bg-black/30 hover:bg-black/40 transition"
        >
          View Games
        </button>
      </div>

      <div className="mt-4 text-xs text-white/45">
        {hdd?.harga != null ? (
          <span>
            Price: <span className="text-white/70">Rp {Number(hdd.harga).toLocaleString('id-ID')}</span>
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  );
}
