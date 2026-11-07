import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');

describe('admin card orders', () => {
  const route = src('app/api/admin/card-orders/route.ts');
  it('only the admin can read or change card orders', () => {
    expect(route.match(/isAdminRequest\(req\)/g)?.length).toBe(2);
    expect(route.indexOf('isAdminRequest')).toBeLessThan(route.indexOf('adminDb.collection'));
  });
  it('only a paid order that is not handed over yet can be marked, and it is written to the audit log', () => {
    expect(route).toContain("status !== 'paid'");
    expect(route).toContain('handedOverAt');
    expect(route).toContain("logAdmin('card-order.handed-over'");
  });
  it('the order id is validated and the list is capped', () => {
    expect(route).toContain("id.includes('/')");
    expect(route).toContain('.limit(200)');
  });
  it('the payments tab shows the panel', () => {
    expect(src('components/admin/payments-tab.tsx')).toContain('<CardOrdersPanel');
  });
});
