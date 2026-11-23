import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { probe } from '@/lib/health-checks';

const src = (p: string) => readFileSync(p, 'utf8');

describe('health probe', () => {
  it('is true when the check finishes', async () => {
    expect(await probe('x', async () => 1)).toBe(true);
  });
  it('is false when the check throws, and logs only a short first line', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await probe('db', async () => { throw new Error('first line\nsecret second line'); })).toBe(false);
    const line = String(spy.mock.calls[0][0]);
    expect(line).toContain('[health] db failed');
    expect(line).toContain('first line');
    expect(line).not.toContain('secret second line');
    spy.mockRestore();
  });
  it('is false when the check is too slow', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await probe('slow', () => new Promise(() => {}), 20)).toBe(false);
    spy.mockRestore();
  });
});

describe('health endpoint covers what broke before', () => {
  const route = src('app/api/system-health/route.ts');
  it('checks database, queries, login signing and passkeys, and is never cached', () => {
    for (const name of ["'database'", "'queries'", "'auth'", "'passkeys'"]) expect(route).toContain(`probe(${name}`);
    expect(route).toContain('createCustomToken');
    expect(route).toContain('generateAuthenticationOptions');
    expect(route).toContain("'Cache-Control': 'no-store'");
    expect(route).toContain('ipLimited');
  });
  it('answers booleans only, no error text', () => {
    expect(route).not.toMatch(/error\.message|e\.message|\.stack/);
    expect(route).toContain('healthy ? 200 : 503');
  });
});

describe('release safety', () => {
  it('the smoke test checks the same parts and the tours entry', () => {
    const s = src('scripts/smoke-test.mjs');
    for (const k of ['database', 'queries', 'auth', 'passkeys']) expect(s).toContain(`'${k}'`);
    expect(s).toContain('/api/tours');
    expect(s).toContain('VERCEL_BYPASS_TOKEN');
  });
  it('runs automatically after a production deployment, read-only, and is skipped without a live address', () => {
    const w = src('.github/workflows/smoke.yml');
    expect(w).toContain('deployment_status');
    expect(w).toContain("environment == 'Production'");
    expect(w).toContain('vars.SMOKE_URL');
    expect(w).toContain('scripts/smoke-test.mjs');
    expect(w).toMatch(/permissions:\s*\n\s+contents: read/);
  });
});
