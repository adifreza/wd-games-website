import React, { useMemo } from 'react';
import { formatGameSize, resolveCoverUrl, resolveTitle } from '../utils/format.js';

export default function GameCard({ game, disabled, selected, remainingGB, onAdd, onRemove }) {
  const title = useMemo(() => resolveTitle(game), [game]);
  const cover = useMemo(() => resolveCoverUrl(game), [game]);
  const sizeLabel = useMemo(() => formatGameSize(game), [game]);

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition">
      <div className="relative aspect-video bg-black/40">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
            No Cover
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-3 bottom-3">
          <div className="text-xs text-white/70">{game?.genre || 'Game'}</div>
          <div className="text-sm font-semibold text-white line-clamp-1">{title}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-white/60">Size</div>
          <div className="text-xs font-semibold text-white/80">{sizeLabel}</div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {!selected ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onAdd}
              className={[
                'w-full rounded-xl px-4 py-2 text-sm font-semibold transition',
                disabled
                  ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                  : 'bg-(--wd-accent) text-gray-950 hover:bg-(--wd-accent)/90 shadow-lg',
              ].join(' ')}
              title={disabled ? `Not enough space (remaining ${remainingGB} GB)` : 'Add to HDD'}
            >
              Add to HDD
            </button>
          ) : (
            <button
              type="button"
              onClick={onRemove}
              className="w-full rounded-xl px-4 py-2 text-sm font-semibold transition bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
