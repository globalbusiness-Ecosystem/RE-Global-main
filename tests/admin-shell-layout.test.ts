import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

describe('admin shell layout', () => {
  it('the phone bottom bar has a column for every item, the Security link included', () => {
    const s = read('app/admin/page.tsx');
    expect(s).toContain('repeat(${tabs.length + 1}, minmax(0, 1fr))');
    expect(s).toContain('href="/admin/security"');
  });
  it('a long number wraps inside its card and cannot hide under the next one', () => {
    const s = read('components/admin/admin-ui.tsx');
    expect(s).toContain('min-w-0 rounded-xl');
    expect(s).toContain('[overflow-wrap:anywhere]');
    expect(s).toContain('tabular-nums');
  });
  it('the payments total is shown with thousands separators', () => {
    const s = read('components/admin/dashboard-tab.tsx');
    expect(s).toContain("formatNumber(data.contracts.totalAmount, 'en', 4)");
    expect(s).toContain("formatNumber(data.contracts.last7.amount, 'en', 4)");
  });
});
