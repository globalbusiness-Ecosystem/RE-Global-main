import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { classifyQuery, shapeTx, fingerprintMatches } from '@/lib/explorer';
import { EXPLORER_LABELS } from '@/lib/explorer-labels';

const src = (p: string) => readFileSync(p, 'utf8');
const H = 'a'.repeat(64);

describe('explorer helpers', () => {
  it('tells hashes from contract numbers from nonsense', () => {
    expect(classifyQuery(` ${H.toUpperCase()} `)).toEqual({ kind: 'hash', q: H });
    expect(classifyQuery('abc123-XYZ_9').kind).toBe('id');
    expect(classifyQuery('a b').kind).toBe('invalid');
    expect(classifyQuery('../etc').kind).toBe('invalid');
    expect(classifyQuery('').kind).toBe('invalid');
  });
  it('reads a transaction and turns the hash memo into hex', () => {
    const memo = Buffer.from(H, 'hex').toString('base64');
    const tx = shapeTx({ hash: H, successful: true, ledger: 7, created_at: '2026-01-01T00:00:00Z', source_account: 'GABC', memo_type: 'hash', memo });
    expect(tx?.memoHex).toBe(H);
    expect(tx?.ledger).toBe(7);
    expect(shapeTx({ hash: 'nope' })).toBeNull();
    expect(shapeTx({ hash: H, memo_type: 'text', memo: 'hi' })?.memoHex).toBeNull();
  });
  it('matches the fingerprint only when identical', () => {
    expect(fingerprintMatches(H, H.toUpperCase())).toBe(true);
    expect(fingerprintMatches('b'.repeat(64), H)).toBe(false);
    expect(fingerprintMatches(null, H)).toBe(false);
  });
});

describe('explorer wiring', () => {
  it('every label exists in all 7 languages', () => {
    for (const [k, row] of Object.entries(EXPLORER_LABELS)) {
      for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect((row as Record<string, string>)[l], `${k}.${l}`).toBeTruthy();
    }
  });
  it('the API is public, rate limited and never returns buyer, seller or amount', () => {
    const r = src('app/api/explorer/route.ts');
    expect(r).toContain("ipLimited('explorer'");
    expect(r).not.toMatch(/buyerUsername|sellerUsername|amount/);
  });
  it('the home grid has a Blockchain card that opens the explorer, and the contract list links to it', () => {
    expect(src('components/pages/home-page.tsx')).toContain("router.push('/explorer')");
    expect(src('lib/home-i18n.ts')).toContain('explorer:');
    expect(src('components/pages/contracts-page.tsx')).toContain('/explorer?q=');
  });
});
