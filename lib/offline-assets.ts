import { OFFLINE_TTL_MS, type StorageLike } from '@/lib/offline-bookings';
import type { NavLanguage } from '@/lib/nav-i18n';

// On-device copy of the signed-in user's own shares and amounts owed to them, used only when the network is down.
// Same rules as the bookings copy: per user, only the displayed fields, expires after 30 days.
const PREFIX = 're_offline_assets_v1:';

export interface OfflineHolding { id: string; propertyTitle: string; shares: number; totalShares: number; amount: number; status: string }
export interface OfflinePayout { id: string; kind: string; amount: number; status: string }

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === 'object' ? (v as Record<string, unknown>) : null);

export function pickHolding(raw: unknown): OfflineHolding | null {
  const r = obj(raw);
  const id = r ? str(r.id, 100) : '';
  if (!r || !id) return null;
  return { id, propertyTitle: str(r.propertyTitle, 200), shares: num(r.shares), totalShares: num(r.totalShares), amount: num(r.amount), status: str(r.status, 30) };
}

export function pickPayout(raw: unknown): OfflinePayout | null {
  const r = obj(raw);
  const id = r ? str(r.id, 100) : '';
  if (!r || !id) return null;
  return { id, kind: str(r.kind, 30), amount: num(r.amount), status: str(r.status, 30) };
}

export function saveOfflineAssets(store: StorageLike, uid: string, data: { holdings: unknown[]; payouts: unknown[] }, now: number): void {
  if (!uid) return;
  try {
    const holdings = data.holdings.map(pickHolding).filter((x): x is OfflineHolding => x !== null).slice(0, 100);
    const payouts = data.payouts.map(pickPayout).filter((x): x is OfflinePayout => x !== null).slice(0, 100);
    if (holdings.length === 0 && payouts.length === 0) { store.removeItem(PREFIX + uid); return; }
    store.setItem(PREFIX + uid, JSON.stringify({ at: now, holdings, payouts }));
  } catch { /* storage full or blocked: the app works without it */ }
}

export function loadOfflineAssets(store: StorageLike, uid: string, now: number): { at: number; holdings: OfflineHolding[]; payouts: OfflinePayout[] } | null {
  if (!uid) return null;
  try {
    const raw = store.getItem(PREFIX + uid);
    if (!raw) return null;
    const d = JSON.parse(raw) as { at?: unknown; holdings?: unknown; payouts?: unknown };
    if (typeof d.at !== 'number' || !Array.isArray(d.holdings) || !Array.isArray(d.payouts)) return null;
    if (now - d.at > OFFLINE_TTL_MS || d.at > now + 60_000) { store.removeItem(PREFIX + uid); return null; }
    const holdings = d.holdings.map(pickHolding).filter((x): x is OfflineHolding => x !== null);
    const payouts = d.payouts.map(pickPayout).filter((x): x is OfflinePayout => x !== null);
    return holdings.length || payouts.length ? { at: d.at, holdings, payouts } : null;
  } catch { return null; }
}

/** The strip shown above the saved copy: bookings, shares and amounts owed. {date} is replaced by the caller. */
export const OFFLINE_COPY_I18N: Record<NavLanguage, string> = {
  en: 'You are offline. This is the last saved copy of your data ({date}).',
  ar: 'مفيش اتصال بالإنترنت. دي آخر نسخة محفوظة من بياناتك ({date}).',
  fr: 'Vous êtes hors ligne. Voici la dernière copie enregistrée de vos données ({date}).',
  es: 'Sin conexión. Esta es la última copia guardada de tus datos ({date}).',
  pt: 'Você está offline. Esta é a última cópia salva dos seus dados ({date}).',
  ur: 'آپ آف لائن ہیں۔ یہ آپ کے ڈیٹا کی آخری محفوظ کاپی ہے ({date})۔',
  zh: '您已离线。这是您数据的最近一次保存副本（{date}）。',
};
