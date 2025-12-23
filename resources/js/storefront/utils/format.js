export function resolveTitle(game) {
  return game?.title || game?.nama_game || game?.name || 'Untitled Game';
}

export function resolveCoverUrl(game) {
  const cover = game?.cover || game?.cover_url || game?.image_url;
  if (!cover) return '';

  // If backend stores relative paths, keep them usable.
  if (typeof cover !== 'string') return '';

  // Absolute URL
  if (/^https?:\/\//i.test(cover)) return cover;

  // Already absolute path
  if (cover.startsWith('/')) return cover;

  // Laravel public disk typically served under /storage
  return `/storage/${cover.replace(/^storage\//, '')}`;
}

export function resolveGameSizeGB(game) {
  if (game?.size_gb != null && !Number.isNaN(Number(game.size_gb))) {
    return Number(game.size_gb);
  }

  const s = String(game?.size || game?.ukuran || '').trim();
  // Examples: "119.47 GB", "70GB", "103.14"
  const m = s.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return 0;
  return Number(m[1]);
}

export function formatGameSize(game) {
  // Prefer detailed string from backend if present.
  const raw = game?.size || game?.ukuran;
  if (raw) return String(raw);

  const gb = resolveGameSizeGB(game);
  if (!gb) return '-';
  return `${gb.toFixed(2)} GB`;
}

export function clampText(s, max = 80) {
  const str = String(s || '');
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
