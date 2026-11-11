import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');

describe('chain sync', () => {
  it('the admin button and the daily job use the same function', () => {
    expect(src('app/api/admin/contracts/anchor/route.ts')).toContain('syncCardContracts(10)');
    expect(src('app/api/cron/daily-digest/route.ts')).toContain('syncCardContracts(10)');
  });
  it('the daily job never blocks the owner summary and adds no third cron job', () => {
    const c = src('app/api/cron/daily-digest/route.ts');
    expect(c).toMatch(/try \{\s*const r = await syncCardContracts/);
    expect((JSON.parse(src('vercel.json')).crons as unknown[]).length).toBe(2);
  });
  it('the sync does the whole job in order: create, repair keys, anchor, record', () => {
    const s = src('lib/chain-sync.ts');
    const order = ['await createMissingCardContracts', 'await repairPlatformKeys', 'await anchorContract', 'await recordContract'].map((k) => s.indexOf(k));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
