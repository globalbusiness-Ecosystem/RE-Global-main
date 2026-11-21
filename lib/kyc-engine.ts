// What to do with a verdict from an identity company. Clear passes are approved automatically; anything doubtful goes to a person;
// a forged or invalid document is rejected. A company that sends no extra signals keeps working exactly as before (its approve/reject stands).

export type KycSignals = {
  docValid?: boolean;      // the document is genuine and readable
  liveness?: boolean;      // a live person took the selfie (not a photo or video of one)
  faceMatch?: boolean;     // the selfie matches the document photo
  sanctions?: boolean;     // true = the company found a sanctions-list hit
  pep?: boolean;           // true = politically exposed person
  expiresAt?: string;      // the document's expiry date (YYYY-MM-DD)
};

export type KycVerdict = { decision: 'approved' | 'rejected'; signals?: KycSignals };
export type KycAction = { action: 'approve' | 'reject' | 'review'; reasons: string[] };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `screenHit`: the team's own watchlist matched the legal name. `now`: for the expiry check. */
export function decideFromVerdict(v: KycVerdict, screenHit: boolean, now: Date = new Date()): KycAction {
  const s = v.signals ?? {};
  if (v.decision === 'rejected') return { action: 'reject', reasons: ['provider_rejected'] };
  if (s.docValid === false) return { action: 'reject', reasons: ['document_invalid'] };
  const reasons: string[] = [];
  if (s.sanctions === true) reasons.push('sanctions_hit');
  if (s.pep === true) reasons.push('pep');
  if (s.liveness === false) reasons.push('liveness_failed');
  if (s.faceMatch === false) reasons.push('face_mismatch');
  if (screenHit) reasons.push('watchlist_hit');
  if (typeof s.expiresAt === 'string' && DATE.test(s.expiresAt) && new Date(`${s.expiresAt}T23:59:59Z`).getTime() < now.getTime()) reasons.push('document_expired');
  return reasons.length ? { action: 'review', reasons } : { action: 'approve', reasons: [] };
}

/** Keeps only the known signal fields with the right types (a provider payload is never trusted as-is). */
export function cleanSignals(raw: unknown): KycSignals | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>, out: KycSignals = {};
  for (const k of ['docValid', 'liveness', 'faceMatch', 'sanctions', 'pep'] as const) if (typeof r[k] === 'boolean') out[k] = r[k] as boolean;
  if (typeof r.expiresAt === 'string' && DATE.test(r.expiresAt)) out.expiresAt = r.expiresAt;
  return Object.keys(out).length ? out : undefined;
}
