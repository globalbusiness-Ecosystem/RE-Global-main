// Pure helpers for the admin sub-tab bar (no React, easy to test).

/** Returns the saved id if it is still a real tab, otherwise the first tab. */
export function pickTab(ids: string[], saved: string | null | undefined): string {
  if (saved && ids.includes(saved)) return saved;
  return ids[0] ?? '';
}

/** Moves by delta (+1 / -1) and wraps around. Unknown current id starts from the first tab. */
export function stepTab(ids: string[], current: string, delta: number): string {
  if (!ids.length) return '';
  const i = ids.indexOf(current);
  const from = i < 0 ? 0 : i;
  return ids[(from + delta + ids.length) % ids.length];
}

/** Maps a keyboard key to the next tab id, or null when the key is not a tab key. */
export function keyTab(ids: string[], current: string, key: string, rtl: boolean): string | null {
  if (key === 'Home') return ids[0] ?? null;
  if (key === 'End') return ids[ids.length - 1] ?? null;
  if (key === 'ArrowRight') return stepTab(ids, current, rtl ? -1 : 1);
  if (key === 'ArrowLeft') return stepTab(ids, current, rtl ? 1 : -1);
  return null;
}
