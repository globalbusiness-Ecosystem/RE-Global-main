// A small on-device copy of the signed-in guest's own bookings, so they can still see dates and status when the
// connection drops during a trip. Per user, only the fields the list shows, expires after 30 days, and is only
// ever read for the same signed-in user (never shown to someone who is not signed in).
export const OFFLINE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PREFIX = 're_offline_bookings_v1:';

export interface StorageLike { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
export interface OfflineBooking {
  id: string; propertyTitle: string; propertyType: string; start: string; end: string; nights: number; amount: number; status: string;
  guests?: number; reviewed?: boolean; hostReply?: string; guestNote?: string;
}

const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** Keeps only the known fields, so nothing extra the server sends ever lands on the device. */
export function pickBooking(raw: unknown): OfflineBooking | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id, 100);
  if (!id) return null;
  const b: OfflineBooking = {
    id, propertyTitle: str(r.propertyTitle, 200), propertyType: str(r.propertyType, 40), start: str(r.start, 10), end: str(r.end, 10),
    nights: num(r.nights), amount: num(r.amount), status: str(r.status, 30),
  };
  if (typeof r.guests === 'number') b.guests = num(r.guests);
  if (typeof r.reviewed === 'boolean') b.reviewed = r.reviewed;
  if (typeof r.hostReply === 'string') b.hostReply = str(r.hostReply);
  if (typeof r.guestNote === 'string') b.guestNote = str(r.guestNote);
  return b;
}

/** The browser's storage, or null when it is blocked (private mode, site data off): even touching it can throw. */
export function browserStore(): StorageLike | null {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function saveOfflineBookings(store: StorageLike, uid: string, bookings: unknown[], now: number): void {
  if (!uid) return;
  try {
    const list = bookings.map(pickBooking).filter((b): b is OfflineBooking => b !== null).slice(0, 50);
    if (list.length === 0) { store.removeItem(PREFIX + uid); return; }
    store.setItem(PREFIX + uid, JSON.stringify({ at: now, bookings: list }));
  } catch { /* storage full or blocked: the app works without it */ }
}

export function loadOfflineBookings(store: StorageLike, uid: string, now: number): { at: number; bookings: OfflineBooking[] } | null {
  if (!uid) return null;
  try {
    const raw = store.getItem(PREFIX + uid);
    if (!raw) return null;
    const d = JSON.parse(raw) as { at?: unknown; bookings?: unknown };
    if (typeof d.at !== 'number' || !Array.isArray(d.bookings)) return null;
    if (now - d.at > OFFLINE_TTL_MS || d.at > now + 60_000) { store.removeItem(PREFIX + uid); return null; }
    const bookings = d.bookings.map(pickBooking).filter((b): b is OfflineBooking => b !== null);
    return bookings.length ? { at: d.at, bookings } : null;
  } catch { return null; }
}
