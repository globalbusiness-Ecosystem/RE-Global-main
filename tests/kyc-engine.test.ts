import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { decideFromVerdict, cleanSignals } from '@/lib/kyc-engine';
import { normalizeName, screenName, cleanWatchlist } from '@/lib/kyc-screening';

const src = (p: string) => readFileSync(p, 'utf8');
const NOW = new Date('2026-11-21T12:00:00Z');

describe('decision engine', () => {
  it('a company without signals keeps its plain approve / reject', () => {
    expect(decideFromVerdict({ decision: 'approved' }, false, NOW)).toEqual({ action: 'approve', reasons: [] });
    expect(decideFromVerdict({ decision: 'rejected' }, false, NOW).action).toBe('reject');
  });
  it('approves only clear passes', () => {
    expect(decideFromVerdict({ decision: 'approved', signals: { docValid: true, liveness: true, faceMatch: true, sanctions: false, pep: false, expiresAt: '2030-01-01' } }, false, NOW).action).toBe('approve');
  });
  it('sends every doubt to a person instead of approving or rejecting', () => {
    for (const [signals, why] of [
      [{ sanctions: true }, 'sanctions_hit'], [{ pep: true }, 'pep'], [{ liveness: false }, 'liveness_failed'], [{ faceMatch: false }, 'face_mismatch'], [{ expiresAt: '2026-01-01' }, 'document_expired'],
    ] as const) {
      const r = decideFromVerdict({ decision: 'approved', signals }, false, NOW);
      expect(r.action).toBe('review');
      expect(r.reasons).toContain(why);
    }
    expect(decideFromVerdict({ decision: 'approved' }, true, NOW)).toEqual({ action: 'review', reasons: ['watchlist_hit'] });
  });
  it('rejects an invalid document even when the company said approved', () => {
    expect(decideFromVerdict({ decision: 'approved', signals: { docValid: false } }, false, NOW)).toEqual({ action: 'reject', reasons: ['document_invalid'] });
  });
  it('a provider payload is cleaned to known fields and types', () => {
    expect(cleanSignals({ liveness: true, sanctions: 'yes', expiresAt: '2030-05-05', evil: 1 })).toEqual({ liveness: true, expiresAt: '2030-05-05' });
    expect(cleanSignals({ expiresAt: 'tomorrow' })).toBeUndefined();
    expect(cleanSignals(null)).toBeUndefined();
  });
});

describe('watchlist screening', () => {
  it('matches names regardless of order, case, accents and Arabic letter variants', () => {
    expect(screenName('Hassan Ali MOHAMED', ['Mohamed Ali Hassan'])).toEqual(['Mohamed Ali Hassan']);
    expect(screenName('José Álvarez Ruiz', ['jose alvarez'])).toEqual(['jose alvarez']);
    expect(screenName('أحمد إبراهيم محمود', ['احمد ابراهيم'])).toEqual(['احمد ابراهيم']);
    expect(normalizeName('مُحَمَّد')).toBe('محمد');
  });
  it('does not match a different person, a partial entry, or a one-word entry', () => {
    expect(screenName('Ahmed Mohamed Ali', ['Mohamed Ali Hassan'])).toEqual([]);
    expect(screenName('Ahmed Ali', ['Ali'])).toEqual([]);
    expect(screenName('', ['Ali Hassan'])).toEqual([]);
  });
  it('cleans what the team types', () => {
    expect(cleanWatchlist([' A  B ', 'A B', '', 5, 'C D'])).toEqual(['A B', 'C D']);
    expect(cleanWatchlist('x')).toEqual([]);
  });
});

describe('wiring', () => {
  it('the webhook decides through the engine, keeps doubtful requests pending and flags them', () => {
    const w = src('app/api/kyc/webhook/[provider]/route.ts');
    expect(w).toContain('decideFromVerdict(');
    expect(w).toContain('flagForReview(');
    expect(w).toContain('cleanSignals(');
  });
  it('a new request is screened against the watchlist, and the reviewer sees the flags', () => {
    expect(src('lib/kyc-store.ts')).toContain('screenName(input.legalName');
    expect(src('components/admin/kyc-panel.tsx')).toContain('screenHits');
  });
  it('the watchlist route is admin-only', () => {
    expect(src('app/api/admin/kyc-watchlist/route.ts')).toContain('isAdminRequest(');
  });
});
