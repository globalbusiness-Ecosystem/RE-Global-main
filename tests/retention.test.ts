import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { Timestamp } from 'firebase-admin/firestore';

vi.mock('server-only', () => ({}));

type Doc = Record<string, Timestamp | string>;
const db: Record<string, Map<string, Doc>> = {};
const mk = (rows: [string, Doc][]) => new Map<string, Doc>(rows);
let failOn = '';
const deletes: string[] = [];
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      where: (field: string, _op: string, ts: Timestamp) => ({
        limit: (n: number) => ({
          get: async () => {
            if (name === failOn) throw new Error('down');
            const docs = [...(db[name] ?? new Map()).entries()]
              .filter(([, d]) => d[field] instanceof Timestamp && (d[field] as Timestamp).toMillis() < ts.toMillis())
              .slice(0, n)
              .map(([id]) => ({ id, ref: { name, id } }));
            return { empty: docs.length === 0, size: docs.length, docs };
          },
        }),
      }),
    }),
    batch: () => {
      const refs: { name: string; id: string }[] = [];
      return { delete: (r: { name: string; id: string }) => refs.push(r), commit: async () => { refs.forEach((r) => { db[r.name].delete(r.id); deletes.push(`${r.name}/${r.id}`); }); } };
    },
  },
}));

import { retentionRules } from '@/lib/retention';
import { runRetention } from '@/lib/retention-server';
import { isCronRequest } from '@/lib/cron-auth';
import { GET } from '@/app/api/cron/retention/route';

const NOW = new Date('2026-10-18T10:00:00Z');
const ago = (days: number) => Timestamp.fromMillis(NOW.getTime() - days * 86400000);
const SECRET = 'a-long-random-secret-123';
const req = (auth?: string) => ({ headers: new Headers(auth ? { authorization: auth } : {}) }) as never;

beforeEach(() => {
  for (const k of Object.keys(db)) delete db[k];
  failOn = ''; deletes.length = 0;
  process.env.CRON_SECRET = SECRET;
  db.rate_limits = mk([['old', { expireAt: ago(1) }], ['live', { expireAt: Timestamp.fromMillis(NOW.getTime() + 60000) }]]);
  db.client_errors = mk([['old', { lastAt: ago(100) }], ['new', { lastAt: ago(10) }]]);
  db.csp_reports = mk([['old', { lastAt: ago(91) }], ['new', { lastAt: ago(89) }]]);
  db.email_otps = mk([['old', { expiresAt: ago(2) }], ['recent', { expiresAt: ago(0.5) }]]);
  db.listing_reports = mk([['closed-old', { resolvedAt: ago(200) }], ['closed-new', { resolvedAt: ago(30) }], ['open', { status: 'open' }]]);
});
afterEach(() => { delete process.env.CRON_SECRET; vi.useRealTimers(); });

describe('retentionRules', () => {
  it('only covers technical records, never legal ones', () => {
    const names = retentionRules(NOW).map((r) => r.collection);
    expect(names).toEqual(['rate_limits', 'email_otps', 'client_errors', 'csp_reports', 'listing_reports']);
    for (const legal of ['bookings', 'payouts', 'contracts', 'signed_contracts', 'ownerships', 'admin_audit', 'admin_login_attempts', 'share_holdings']) expect(names).not.toContain(legal);
  });
});

describe('runRetention', () => {
  it('deletes only what is past its period, and leaves open reports alone', async () => {
    const res = await runRetention(NOW);
    expect(res.every((r) => !r.error)).toBe(true);
    expect([...deletes].sort()).toEqual(['client_errors/old', 'csp_reports/old', 'email_otps/old', 'listing_reports/closed-old', 'rate_limits/old']);
    expect([...db.listing_reports.keys()].sort()).toEqual(['closed-new', 'open']);
  });
  it('keeps going when one collection fails', async () => {
    failOn = 'client_errors';
    const res = await runRetention(NOW);
    expect(res.find((r) => r.collection === 'client_errors')!.error).toBe(true);
    expect(res.find((r) => r.collection === 'csp_reports')!.deleted).toBe(1);
  });
  it('works through a big backlog in rounds', async () => {
    db.client_errors = mk(Array.from({ length: 900 }, (_, i): [string, Doc] => [`e${i}`, { lastAt: ago(200) }]));
    const res = await runRetention(NOW);
    expect(res.find((r) => r.collection === 'client_errors')!.deleted).toBe(900);
    expect(db.client_errors.size).toBe(0);
  });
});

describe('GET /api/cron/retention', () => {
  it('refuses callers without the secret and deletes nothing', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer nope'))).status).toBe(401);
    expect(deletes).toHaveLength(0);
    expect(isCronRequest(req(`Bearer ${SECRET}`))).toBe(true);
  });
  it('runs for the cron caller', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW);
    const res = await GET(req(`Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    expect((await res.json()).results.length).toBe(5);
    expect(deletes.length).toBe(5);
  });
});

describe('no one-time codes in the logs', () => {
  it('never prints a generated code', () => {
    expect(readFileSync('lib/otp-authentication.ts', 'utf8')).not.toMatch(/OTP generated:/);
    expect(readFileSync('lib/auth-manager.ts', 'utf8')).not.toMatch(/OTP generated: \$\{/);
  });
});
