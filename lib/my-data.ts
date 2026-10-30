// "Download my data" and "delete my personal data" (GDPR / CCPA style rights). Pure helpers.
// Personal data (profile, email, preferences, favorites, referral code) is deleted on request.
// Guest reviews are kept but anonymized (the account link is removed).
// Money and contract records are kept: they are accounting records and the public contract check depends on them.

export const ERASE_WORD = 'DELETE';
export const EXPORT_LIMIT = 1000;

export const isEraseConfirm = (body: unknown): boolean =>
  typeof body === 'object' && body !== null && (body as { confirm?: unknown }).confirm === ERASE_WORD;

export const isSafeId = (id: unknown): id is string =>
  typeof id === 'string' && id.length > 0 && id.length <= 128 && !id.includes('/');

export const exportFilename = (now = new Date()): string => `my-re-global-data-${now.toISOString().slice(0, 10)}.json`;

export const KEPT_NOTE = 'Payments, contracts, ownerships and payouts are kept as legal and accounting records.';

export function buildExport(user: { uid: string; username: string }, data: Record<string, unknown>, now = new Date()) {
  return {
    exportedAt: now.toISOString(),
    user: { uid: user.uid, username: user.username },
    note: 'This file contains the data RE Global holds about you.',
    data,
  };
}
