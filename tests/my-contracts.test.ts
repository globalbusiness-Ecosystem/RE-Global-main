import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (p: string) => readFileSync(p, 'utf8');

describe('contracts of linked accounts', () => {
  it('the route is guarded and reads every linked account as buyer and seller', () => {
    const s = src('app/api/my-contracts/route.ts');
    expect(s).toContain('guardApi');
    expect(s).toContain('personAccounts');
    expect(s).toContain("'buyerUsername', '==', n");
    expect(s).toContain("'sellerUsername', '==', n");
  });
  it('the app reads contracts through the server first and keeps the direct query as a fallback', () => {
    const s = src('lib/firebase-database.ts');
    expect(s).toContain("fetch('/api/my-contracts'");
    expect(s).toContain("where('buyerUsername', '==', username)");
  });
});
