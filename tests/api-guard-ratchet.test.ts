import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Every API route must either use one of the project's guards (admin check, Pi sign-in, payment guard,
// cron secret, rate limit) or be on the short list below of routes that are public ON PURPOSE.
// A new route with no guard fails this test, so an open endpoint can never be added by accident.
const GUARDS = /isAdminRequest|verifyAdminToken|guardApi|ipLimited|consumeRateLimit|authorizePayment|requireUser|verifyPiAccessToken|isCronRequest|CRON_SECRET/;

const PUBLIC_ON_PURPOSE: Record<string, string> = {
  'app/api/legal/route.ts': 'read-only legal notice; the country is checked against a fixed list and the answer is cached',
  'app/api/pricing/route.ts': 'read-only Pi/USD rate (one document); cached',
  'app/api/swap/route.ts': 'placeholder that only answers 503; reads nothing',
};

function routes(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) routes(full, out);
    else if (name === 'route.ts') out.push(full.split('\\').join('/'));
  }
  return out;
}

describe('API guard ratchet', () => {
  const all = routes('app/api');
  it('finds the API routes', () => {
    expect(all.length).toBeGreaterThan(20);
  });
  it('every route has a guard or is on the public-on-purpose list', () => {
    const open = all.filter((f) => !GUARDS.test(readFileSync(f, 'utf8')) && !(f in PUBLIC_ON_PURPOSE));
    expect(open, `add a guard to these routes (see lib/rate-limit.ts, lib/admin-guard.ts): ${open.join(', ')}`).toEqual([]);
  });
  it('the public list has no stale entries and no entry that is guarded anyway', () => {
    for (const f of Object.keys(PUBLIC_ON_PURPOSE)) {
      expect(all, f).toContain(f);
      expect(GUARDS.test(readFileSync(f, 'utf8')), `${f} now has a guard: remove it from the list`).toBe(false);
    }
  });
});
