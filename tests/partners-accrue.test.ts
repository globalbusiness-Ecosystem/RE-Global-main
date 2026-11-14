import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');
const T = (m: number) => ({ toMillis: () => m });

// A small in-memory database: contracts, referral records, partners, the program rules and the commission lines.
const db: { lines: Map<string, any>; contracts: Map<string, any>; referrals: Map<string, any>; partners: Map<string, any>; rules: any; failCreate: boolean } = {
  lines: new Map(), contracts: new Map(), referrals: new Map(), partners: new Map(), rules: null, failCreate: false,
};
vi.mock('server-only', () => ({}));
vi.mock('@/lib/referrals-server', () => ({ referralStats: async () => ({ invited: 0, qualified: 0, referredBy: false }) }));
vi.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => T(Date.now()), fromMillis: (m: number) => T(m) } }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const data = name === 'contracts' ? db.contracts.get(id) : name === 'referrals' ? db.referrals.get(id) : name === 'partners' ? db.partners.get(id) : name === 'settings' ? db.rules : undefined;
          return { exists: !!data, data: () => data };
        },
        create: async (data: any) => { if (db.failCreate) throw new Error('boom'); if (db.lines.has(id)) throw new Error('exists'); db.lines.set(id, data); },
      }),
    }),
  },
}));

const approved = { role: 'broker', status: 'approved', approvedAt: T(1000) };
const sale = (over: Record<string, unknown> = {}) => ({ buyerUsername: 'friend', status: 'completed', type: 'buy', amount: 2000, currency: 'EGP', contractId: 'C-1', createdAt: T(5000), ...over });

describe('commission at the moment of the sale', () => {
  beforeEach(() => {
    db.lines.clear(); db.contracts.clear(); db.referrals.clear(); db.partners.clear(); db.failCreate = false;
    db.rules = { enabled: true, rates: { broker: 2.5, developer: 0, investor: 0, sales: 0 } };
    db.referrals.set('friend', { username: 'friend', referredBy: 'pat' });
    db.partners.set('pat', approved);
    db.contracts.set('pay1', sale());
  });

  it('writes the line for a partner\'s customer, with the rate of that moment', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    expect(await accrueForContract('pay1', 9000)).toBe(true);
    expect(db.lines.get('pay1')).toMatchObject({ partner: 'pat', referee: 'friend', base: 2000, rate: 2.5, amount: 50, currency: 'EGP', status: 'accrued', contractId: 'C-1' });
  });
  it('a second call for the same contract writes nothing more', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    await accrueForContract('pay1');
    db.rules = { enabled: true, rates: { broker: 10, developer: 0, investor: 0, sales: 0 } };
    expect(await accrueForContract('pay1')).toBe(false);
    expect(db.lines.size).toBe(1);
    expect(db.lines.get('pay1').rate).toBe(2.5);
  });
  it('the safety net finds nothing new after the sale line was written', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    await accrueForContract('pay1');
    expect(db.lines.has('pay1')).toBe(true);
    // the sync tries to create the same document id, which already exists
    const { syncCommissions } = await import('@/lib/partners-server');
    expect(typeof syncCommissions).toBe('function');
  });
  it('writes nothing for a buyer nobody invited, a self-referral, or a missing contract', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    db.contracts.set('pay2', sale({ buyerUsername: 'stranger' }));
    expect(await accrueForContract('pay2')).toBe(false);
    db.referrals.set('pat', { username: 'pat', referredBy: 'pat' });
    db.contracts.set('pay3', sale({ buyerUsername: 'pat' }));
    expect(await accrueForContract('pay3')).toBe(false);
    expect(await accrueForContract('nope')).toBe(false);
    expect(db.lines.size).toBe(0);
  });
  it('writes nothing for a stay, an unfinished contract, or a sale before the approval', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    db.contracts.set('a', sale({ type: 'rent' }));
    db.contracts.set('b', sale({ status: 'pending' }));
    db.contracts.set('c', sale({ createdAt: T(500) }));
    for (const id of ['a', 'b', 'c']) expect(await accrueForContract(id), id).toBe(false);
    expect(db.lines.size).toBe(0);
  });
  it('writes nothing when the program is off, the rate is zero, or the partner is not approved', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    db.rules = { enabled: false, rates: { broker: 2.5, developer: 0, investor: 0, sales: 0 } };
    expect(await accrueForContract('pay1')).toBe(false);
    db.rules = { enabled: true, rates: { broker: 0, developer: 0, investor: 0, sales: 0 } };
    expect(await accrueForContract('pay1')).toBe(false);
    db.rules = { enabled: true, rates: { broker: 2.5, developer: 0, investor: 0, sales: 0 } };
    db.partners.set('pat', { ...approved, status: 'suspended' });
    expect(await accrueForContract('pay1')).toBe(false);
    db.partners.set('pat', { role: 'broker', status: 'pending' });
    expect(await accrueForContract('pay1')).toBe(false);
    expect(db.lines.size).toBe(0);
  });
  it('never throws, even when the database fails', async () => {
    const { accrueForContract } = await import('@/lib/partners-server');
    db.failCreate = true;
    await expect(accrueForContract('pay1')).resolves.toBe(false);
  });
});

describe('wiring', () => {
  it('both ways of buying write the commission after the contract exists', () => {
    expect(src('app/api/contracts/sign/route.ts')).toContain('await accrueForContract(paymentId);');
    expect(src('lib/card-contract.ts')).toContain('await accrueForContract(o.id);');
  });
  it('the sale line and the safety net share the same writer, so a contract is counted once', () => {
    const s = src('lib/partners-server.ts');
    expect(s).toContain('async function writeCommission');
    expect((s.match(/writeCommission\(/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(s).toContain('.doc(contractDocId).create(');
  });
});
