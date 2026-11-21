// How long identity data is kept. The team sets the number of years (default 5, the usual minimum for customer due-diligence records)
// and whether the daily job deletes automatically. A person under a legal hold is never deleted, whatever the date says.
export type RetentionPolicy = { years: number; autoDelete: boolean };
export const DEFAULT_RETENTION: RetentionPolicy = { years: 5, autoDelete: false };
export const MIN_YEARS = 1;
export const MAX_YEARS = 30;

/** Validates what the team typed: whole years between 1 and 30, a real boolean. Anything else falls back to the defaults. */
export function cleanRetention(raw: unknown): RetentionPolicy {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const y = Number(r.years);
  const years = Number.isInteger(y) && y >= MIN_YEARS && y <= MAX_YEARS ? y : DEFAULT_RETENTION.years;
  return { years, autoDelete: r.autoDelete === true };
}

/** The moment before which a decision counts as old enough to delete. */
export function cutoffMs(now: Date, years: number): number {
  const d = new Date(now.getTime());
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.getTime();
}

export type RetentionRecord = { status?: string; decidedAtMs?: number | null; submittedAtMs?: number | null; hold?: boolean; purgedAt?: unknown };

/** True when the record's data should be deleted: no legal hold, not already deleted, and the decision (or the request, if never decided) is older than the cutoff. */
export function isDue(rec: RetentionRecord, cutoff: number): boolean {
  if (rec.hold === true || rec.purgedAt) return false;
  if (rec.status !== 'approved' && rec.status !== 'rejected' && rec.status !== 'pending') return false;
  const basis = rec.decidedAtMs ?? rec.submittedAtMs ?? null;
  return typeof basis === 'number' && basis < cutoff;
}

/** Version of the privacy notice a person agrees to when asking for verification. Change it when the wording changes. */
export const KYC_CONSENT_VERSION = '2026-11';
