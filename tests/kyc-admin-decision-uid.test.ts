import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { canKyc } from '@/lib/kyc-rules';

describe('the team can decide a request from any account that may send one', () => {
  it('a Pi account (uuid) and a web account are both accepted, odd ids are not', () => {
    expect(canKyc('d8b5cf1f-c153-4739-8457-fda23d377362')).toBe(true);
    expect(canKyc('web_abc123')).toBe(true);
    for (const v of ['', 'a/b', 'x'.repeat(141), 5 as unknown as string]) expect(canKyc(v), String(v)).toBe(false);
  });
  it('the admin route no longer insists on a web_ prefix', () => {
    const r = readFileSync('app/api/admin/kyc/route.ts', 'utf8');
    expect(r).not.toContain("uid.startsWith('web_')");
    expect(r).toContain('!canKyc(uid)');
  });
});
