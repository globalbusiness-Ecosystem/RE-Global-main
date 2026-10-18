// "Report this listing": a notice-and-action channel (the EU Digital Services Act asks marketplaces for one).
export const REPORT_REASONS = ['illegal', 'scam', 'misleading', 'inappropriate', 'copyright', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export const REPORT_STATUSES = ['open', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type ReportInput = { listingId: string; reason: ReportReason; details: string; email: string };

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

export const isReportReason = (v: unknown): v is ReportReason => typeof v === 'string' && (REPORT_REASONS as readonly string[]).includes(v);
export const isReportStatus = (v: unknown): v is ReportStatus => typeof v === 'string' && (REPORT_STATUSES as readonly string[]).includes(v);

/** A safe, small record from whatever the browser sent. Null when it is not a usable report. */
export function normalizeReport(body: unknown): ReportInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const listingId = typeof b.listingId === 'string' ? b.listingId.trim() : '';
  if (!ID_RE.test(listingId) || !isReportReason(b.reason)) return null;
  const email = clean(b.email, 120);
  return { listingId, reason: b.reason, details: clean(b.details, 1000), email: EMAIL_RE.test(email) ? email : '' };
}
