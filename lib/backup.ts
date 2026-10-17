// Admin data export (pure helpers). Only business collections, never personal data or secrets
// (no profiles, emails, one-time codes, login attempts or rate-limit counters).

export const BACKUP_COLLECTIONS: Record<string, string> = {
  properties: 'العقارات',
  contracts: 'العقود',
  signed_contracts: 'العقود الموقّعة',
  share_holdings: 'حصص المستثمرين',
  share_listings: 'عروض سوق الحصص',
  share_transfers: 'تحويلات الحصص',
  payouts: 'المستحقات',
  bookings: 'الحجوزات',
  property_reservations: 'حجوزات العقارات',
  ownerships: 'الملكيات',
  settings: 'الإعدادات',
};

export const BACKUP_MAX_DOCS = 5000;

export function isBackupCollection(name: unknown): name is string {
  return typeof name === 'string' && Object.prototype.hasOwnProperty.call(BACKUP_COLLECTIONS, name);
}

// Firestore Timestamps and Dates become ISO strings; everything else is kept as plain JSON.
export function serializeValue(v: unknown): unknown {
  if (v === null || v === undefined) return v ?? null;
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(serializeValue);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.toDate === 'function') {
      try { return (o.toDate as () => Date)().toISOString(); } catch { return null; }
    }
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o)) out[k] = serializeValue(o[k]);
    return out;
  }
  return v;
}

export function backupFilename(collection: string, now = new Date()): string {
  return `re-global-${collection}-${now.toISOString().slice(0, 10)}.json`;
}
