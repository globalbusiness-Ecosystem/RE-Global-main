import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseApplication, parseProgramRules, readProgramRules, commissionAmount, isCommissionable, DEFAULT_PROGRAM } from '@/lib/partners';

const src = (p: string) => readFileSync(p, 'utf8');
const good = { role: 'broker', company: 'Nile Homes', country: 'EG', phone: '+20 100 123 4567', about: 'We sell new-build apartments in New Cairo.', website: 'https://nile.example', listed: true };

describe('partner application', () => {
  it('accepts a complete application', () => {
    const r = parseApplication(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ role: 'broker', company: 'Nile Homes', country: 'EG', listed: true });
  });
  it('tells which field is wrong', () => {
    expect(parseApplication({ ...good, role: 'admin' })).toEqual({ ok: false, error: 'role' });
    expect(parseApplication({ ...good, company: ' a ' })).toEqual({ ok: false, error: 'company' });
    expect(parseApplication({ ...good, country: 'ZZ' })).toEqual({ ok: false, error: 'country' });
    expect(parseApplication({ ...good, phone: 'call me' })).toEqual({ ok: false, error: 'phone' });
    expect(parseApplication({ ...good, about: 'too short' })).toEqual({ ok: false, error: 'about' });
    expect(parseApplication({ ...good, website: 'http://insecure.example' })).toEqual({ ok: false, error: 'website' });
    expect(parseApplication({ ...good, website: 'javascript:alert(1)' })).toEqual({ ok: false, error: 'website' });
  });
  it('the website is optional, listing is opt-in, and junk input is rejected', () => {
    const r = parseApplication({ ...good, website: '', listed: undefined });
    expect(r.ok && r.value.website === '' && r.value.listed === false).toBe(true);
    expect(parseApplication(null).ok).toBe(false);
    expect(parseApplication('x').ok).toBe(false);
  });
  it('cleans control characters and long text', () => {
    const r = parseApplication({ ...good, company: 'Nile\u0000 \n Homes', about: 'x'.repeat(5000) });
    expect(r.ok && r.value.company).toBe('Nile Homes');
    expect(r.ok && r.value.about.length).toBe(600);
  });
});

describe('commission rules', () => {
  const rates = { broker: 2.5, developer: 1, investor: 0.5, sales: 3 };
  it('no commission is promised by default', () => {
    expect(Object.values(DEFAULT_PROGRAM.rates).every((v) => v === 0)).toBe(true);
    expect(readProgramRules(null)).toEqual(DEFAULT_PROGRAM);
    expect(readProgramRules({ enabled: 'yes' })).toEqual(DEFAULT_PROGRAM);
  });
  it('accepts percentages from 0 to 20 and rounds to two decimals', () => {
    expect(parseProgramRules({ enabled: true, rates })).toEqual({ enabled: true, rates });
    expect(parseProgramRules({ enabled: false, rates: { ...rates, broker: '2.456' } })?.rates.broker).toBe(2.46);
    expect(parseProgramRules({ enabled: true, rates: { ...rates, broker: 20 } })?.rates.broker).toBe(20);
  });
  it('rejects anything out of range or incomplete', () => {
    expect(parseProgramRules({ enabled: true, rates: { ...rates, broker: 20.01 } })).toBeNull();
    expect(parseProgramRules({ enabled: true, rates: { ...rates, sales: -1 } })).toBeNull();
    expect(parseProgramRules({ enabled: true, rates: { ...rates, sales: 'abc' } })).toBeNull();
    expect(parseProgramRules({ enabled: true, rates: { broker: 1 } })).toBeNull();
    expect(parseProgramRules({ rates })).toBeNull();
  });
  it('computes the commission to the cent', () => {
    expect(commissionAmount(100000, 2.5)).toBe(2500);
    expect(commissionAmount(1234.56, 2.5)).toBe(30.86);
    expect(commissionAmount(50, 0)).toBe(0);
  });
  it('only completed property purchases count', () => {
    expect(isCommissionable({ status: 'completed', type: 'buy', amount: 10 })).toBe(true);
    expect(isCommissionable({ status: 'completed', type: 'offplan', amount: 10 })).toBe(true);
    expect(isCommissionable({ status: 'pending', type: 'buy', amount: 10 })).toBe(false);
    expect(isCommissionable({ status: 'completed', type: 'resale', amount: 10 })).toBe(false);
    expect(isCommissionable({ status: 'completed', type: 'buy', amount: 0 })).toBe(false);
    expect(isCommissionable({ status: 'completed', type: 'buy', amount: '10' })).toBe(false);
  });
});

// ---- the money part, against a small in-memory database
const db: { partnerCommissions: Map<string, any>; referrals: any[]; contracts: { id: string; data: any }[]; rules: any } = { partnerCommissions: new Map(), referrals: [], contracts: [], rules: null };
vi.mock('server-only', () => ({}));
vi.mock('@/lib/referrals-server', () => ({ referralStats: async () => ({ invited: 0, qualified: 0, referredBy: false }) }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: name === 'settings' && !!db.rules, data: () => db.rules }),
        create: async (data: any) => { if (db.partnerCommissions.has(id)) throw new Error('exists'); db.partnerCommissions.set(id, data); },
      }),
      where: (field: string, _op: string, value: string) => ({
        limit: () => ({
          get: async () => ({
            docs: name === 'referrals'
              ? db.referrals.filter((r) => r[field] === value).map((r) => ({ data: () => r }))
              : db.contracts.filter((c) => c.data[field] === value).map((c) => ({ id: c.id, data: () => c.data })),
          }),
        }),
      }),
    }),
  },
}));
vi.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => ({ toMillis: () => Date.now() }), fromMillis: (m: number) => ({ toMillis: () => m }) } }));

const T = (m: number) => ({ toMillis: () => m });
const partner = { role: 'broker', status: 'approved', approvedAt: T(1000) };

describe('commission lines', () => {
  beforeEach(() => {
    db.partnerCommissions.clear();
    db.rules = { enabled: true, rates: { broker: 2, developer: 0, investor: 0, sales: 0 } };
    db.referrals = [{ username: 'friend', referredBy: 'pat' }];
    db.contracts = [
      { id: 'c1', data: { buyerUsername: 'friend', status: 'completed', type: 'buy', amount: 1000, currency: 'EGP', contractId: 'C-1', createdAt: T(2000) } },
      { id: 'c2', data: { buyerUsername: 'friend', status: 'completed', type: 'buy', amount: 500, currency: 'EGP', contractId: 'C-2', createdAt: T(500) } },
      { id: 'c3', data: { buyerUsername: 'friend', status: 'pending', type: 'buy', amount: 900, currency: 'EGP', createdAt: T(3000) } },
      { id: 'c4', data: { buyerUsername: 'friend', status: 'completed', type: 'resale', amount: 900, currency: 'EGP', createdAt: T(3000) } },
    ];
  });
  it('writes one line for each qualifying purchase made after approval, with the percentage of that moment', async () => {
    const { syncCommissions } = await import('@/lib/partners-server');
    expect(await syncCommissions('pat', partner)).toBe(1);
    expect([...db.partnerCommissions.keys()]).toEqual(['c1']);
    expect(db.partnerCommissions.get('c1')).toMatchObject({ partner: 'pat', referee: 'friend', base: 1000, rate: 2, amount: 20, currency: 'EGP', status: 'accrued' });
  });
  it('never counts a purchase twice, and a later rate change does not rewrite an old line', async () => {
    const { syncCommissions } = await import('@/lib/partners-server');
    await syncCommissions('pat', partner);
    db.rules = { enabled: true, rates: { broker: 10, developer: 0, investor: 0, sales: 0 } };
    expect(await syncCommissions('pat', partner)).toBe(0);
    expect(db.partnerCommissions.get('c1').rate).toBe(2);
    expect(db.partnerCommissions.size).toBe(1);
  });
  it('writes nothing when the program is off, the rate is zero, or the partner is not approved', async () => {
    const { syncCommissions } = await import('@/lib/partners-server');
    db.rules = { enabled: false, rates: { broker: 2, developer: 0, investor: 0, sales: 0 } };
    expect(await syncCommissions('pat', partner)).toBe(0);
    db.rules = { enabled: true, rates: { broker: 0, developer: 0, investor: 0, sales: 0 } };
    expect(await syncCommissions('pat', partner)).toBe(0);
    db.rules = { enabled: true, rates: { broker: 2, developer: 0, investor: 0, sales: 0 } };
    expect(await syncCommissions('pat', { ...partner, status: 'suspended' })).toBe(0);
    expect(db.partnerCommissions.size).toBe(0);
  });
  it('adds the totals per currency and ignores cancelled lines', async () => {
    const { summarize } = await import('@/lib/partners-server');
    const row = (currency: string, amount: number, status: 'accrued' | 'paid' | 'void') => ({ id: 'x', partner: 'p', role: 'broker', contractId: '', base: 0, currency, rate: 1, amount, status, createdAt: null, paidAt: null, note: '' });
    expect(summarize([row('EGP', 10.1, 'accrued'), row('EGP', 20.2, 'accrued'), row('EGP', 5, 'paid'), row('PI', 3, 'accrued'), row('PI', 99, 'void')]))
      .toEqual([{ currency: 'EGP', accrued: 30.3, paid: 5 }, { currency: 'PI', accrued: 3, paid: 0 }]);
  });
});

describe('wiring', () => {
  it('every admin route is guarded and every change is logged', () => {
    for (const f of ['partners', 'partner-program', 'partner-commissions']) {
      const s = src(`app/api/admin/${f}/route.ts`);
      expect(s.match(/isAdminRequest/g)!.length, f).toBeGreaterThanOrEqual(3);
      expect(s, f).toContain('logAdmin(');
    }
  });
  it('the partner routes need a signed-in user and are rate limited', () => {
    for (const f of ['me', 'apply']) {
      const s = src(`app/api/partners/${f}/route.ts`);
      expect(s, f).toContain('verifyPiAccessToken');
      expect(s, f).toContain('rateLimited(');
    }
  });
  it('a commission line uses the contract id, so it can only exist once, and is created (never overwritten)', () => {
    const s = src('lib/partners-server.ts');
    expect(s).toContain("collection('partnerCommissions').doc(c.id).create(");
  });
  it('the public directory never exposes the account name or phone', () => {
    const s = src('lib/partners-server.ts');
    const dir = s.slice(s.indexOf('export async function partnerDirectory'));
    expect(dir).not.toMatch(/username|phone|uid/);
  });
});
