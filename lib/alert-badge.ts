import type { StorageLike } from './offline-bookings';

// The red dot on the Alerts tab: how many of the guest's stay alerts they have not looked at yet.
// "Looked at" is remembered on this device only, per user, as a short list of alert ids.
const PREFIX = 're_alerts_seen_v1:';
const MAX_SEEN = 200;

export function unseenCount(alertIds: string[], seen: ReadonlySet<string>): number {
  return new Set(alertIds).size - [...new Set(alertIds)].filter((id) => seen.has(id)).length;
}

export function loadSeen(store: StorageLike | null, uid: string): Set<string> {
  if (!store || !uid) return new Set();
  try {
    const raw = store.getItem(PREFIX + uid);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string').slice(-MAX_SEEN) : []);
  } catch { return new Set(); }
}

/** Marks these alerts as seen. Ids no longer current drop out, so the list cannot grow forever. */
export function markSeen(store: StorageLike | null, uid: string, currentIds: string[]): void {
  if (!store || !uid) return;
  try {
    const keep = [...new Set(currentIds)].slice(-MAX_SEEN);
    if (keep.length === 0) { store.removeItem(PREFIX + uid); return; }
    store.setItem(PREFIX + uid, JSON.stringify(keep));
  } catch { /* storage blocked: the dot just comes back next time */ }
}

export const ALERTS_SEEN_EVENT = 're-alerts-seen';
