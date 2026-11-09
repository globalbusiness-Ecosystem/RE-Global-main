import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { diagnose } from '@/lib/chain-check';

const D = 'GDERIVED';
const ok = { hasSecret: true, derived: D, configuredPublic: D, status: 'ok' as const, balance: 5 };

describe('platform account check', () => {
  it('names the first thing that is wrong', () => {
    expect(diagnose({ ...ok, hasSecret: false, derived: null }).code).toBe('no_keys');
    expect(diagnose({ ...ok, derived: null }).code).toBe('bad_secret');
    expect(diagnose({ ...ok, configuredPublic: 'GOTHER' })).toEqual({ code: 'mismatch', publicKey: D });
    expect(diagnose({ ...ok, status: 'network' }).code).toBe('network');
    expect(diagnose({ ...ok, status: 'not_found' }).code).toBe('not_found');
    expect(diagnose({ ...ok, balance: 0 }).code).toBe('low_balance');
    expect(diagnose(ok)).toEqual({ code: 'ok', publicKey: D, balance: 5 });
  });
  it('ignores spaces around the configured public key', () => {
    expect(diagnose({ ...ok, configuredPublic: ` ${D} ` }).code).toBe('ok');
  });
  it('the route is admin only and the result never carries a secret', () => {
    const route = readFileSync('app/api/admin/contracts/check/route.ts', 'utf8');
    expect(route).toContain('isAdminRequest');
    const lib = readFileSync('lib/chain-check.ts', 'utf8');
    expect(lib).not.toMatch(/return \{[^}]*\bsecret\s*[:,}]/);
  });
  it('the panel has the check button', () => {
    expect(readFileSync('components/admin/card-orders-panel.tsx', 'utf8')).toContain('/api/admin/contracts/check');
  });
});
