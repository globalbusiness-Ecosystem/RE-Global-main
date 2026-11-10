import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { registryVerdict } from '@/lib/registry-client';

const A = 'GADMIN';
const f = { configured: true, reach: 'ok' as const, admin: A, expectedAdmin: A };
const src = (p: string) => readFileSync(p, 'utf8');

describe('ownership registry status', () => {
  it('says what is wrong, in order', () => {
    expect(registryVerdict({ ...f, configured: false })).toBe('not_configured');
    expect(registryVerdict({ ...f, reach: 'network' })).toBe('unreachable');
    expect(registryVerdict({ ...f, reach: 'error', admin: undefined })).toBe('not_ready');
    expect(registryVerdict({ ...f, admin: 'GOTHER' })).toBe('admin_mismatch');
    expect(registryVerdict(f)).toBe('ok');
  });
  it('the account check looks at the registry only when the account itself is fine, with a read-only call', () => {
    const s = src('lib/chain-check.ts');
    expect(s).toMatch(/out\.code === 'ok'/);
    expect(src('lib/registry-client.ts')).toContain('simulateTransaction');
  });
  it('the deploy script never reads or prints a secret key and checks the admin', () => {
    const s = src('scripts/deploy-registry.sh');
    expect(s).not.toMatch(/keys secret|SECRET|S[A-Z2-7]{55}/);
    expect(s).toContain('stellar keys address');
    expect(s).toContain('-- admin');
    expect(s).toContain('platform-anchor');
  });
  it('the panel explains every registry state', () => {
    const p = src('components/admin/card-orders-panel.tsx');
    for (const k of ['not_configured', 'ok', 'not_ready', 'admin_mismatch', 'unreachable']) expect(p).toContain(`${k}:`);
  });
});
