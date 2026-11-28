import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAV, norm, searchNav } from '@/lib/admin-nav';

const read = (p: string) => readFileSync(p, 'utf8');
const FILE: Record<string, string> = { dashboard: 'dashboard-tab', payments: 'payments-tab', properties: 'properties-tab', content: 'content-tab' };

describe('norm', () => {
  it('ignores case, Arabic marks and letter variants', () => {
    expect(norm('  Payouts!  ')).toBe('payouts');
    expect(norm('الهَويّة')).toBe(norm('الهويه'));
    expect(norm('إيجار')).toBe(norm('ايجار'));
    expect(norm('مدفوعات')).toBe('مدفوعات');
  });
});

describe('searchNav', () => {
  const ids = (q: string) => searchNav(q).map((x) => x.sub ?? x.tab);
  it('an empty query lists everything in order', () => {
    expect(searchNav('')).toEqual(NAV);
    expect(searchNav('   ')).toEqual(NAV);
  });
  it('finds a section by its Arabic name, its English name or a keyword', () => {
    expect(ids('هوية')).toContain('kyc');
    expect(ids('identity')).toContain('kyc');
    expect(ids('KYC')).toContain('kyc');
    expect(ids('payouts')).toContain('payouts');
    expect(ids('عوائد')).toContain('distributions');
    expect(ids('سعر')).toContain('pricing');
    expect(ids('shariah')).toContain('list');
  });
  it('every word typed must match', () => {
    expect(ids('سعر pi')).toContain('pricing');
    expect(ids('سعر zzzz')).toEqual([]);
  });
  it('only searches the entries it is given (a role may see fewer tabs)', () => {
    const some = NAV.filter((n) => n.tab === 'users');
    expect(searchNav('المستخدمون', some).map((x) => x.tab)).toEqual(['users']);
    expect(searchNav('هوية', some)).toEqual([]);
  });
});

describe('the list matches the real screens', () => {
  const page = read('app/admin/page.tsx');
  it('every top tab exists in the admin page', () => {
    for (const t of new Set(NAV.map((n) => n.tab))) expect(page, t).toContain(`id: '${t}'`);
  });
  it('every sub-section exists in its tab file, under the same storeKey', () => {
    for (const n of NAV.filter((x) => x.sub)) {
      const src = read(`components/admin/${FILE[n.storeKey!]}.tsx`);
      expect(src, `${n.storeKey} storeKey`).toContain(`storeKey="${n.storeKey}"`);
      expect(src, `${n.storeKey}/${n.sub}`).toMatch(new RegExp(`id: '${n.sub}',\\s*icon: '[^']+',\\s*label: '`));
    }
  });
  it('no two entries point at the same place, and every entry has a label', () => {
    const keys = NAV.map((n) => `${n.tab}/${n.sub ?? ''}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const n of NAV) { expect(n.label.length).toBeGreaterThan(1); expect(n.en.length).toBeGreaterThan(1); }
  });
});

describe('wiring', () => {
  it('the admin page opens the box with the button and Ctrl/Cmd+K, and the sub-tab bar listens for the jump', () => {
    const page = read('app/admin/page.tsx');
    expect(page).toContain("ev.key.toLowerCase() === 'k'");
    expect(page).toContain('<QuickNav');
    expect(read('components/admin/sub-tabs.tsx')).toContain('addEventListener(NAV_EVENT');
  });
  it('the content section now uses the shared tab bar', () => {
    const c = read('components/admin/content-tab.tsx');
    expect(c).toContain('storeKey="content"');
    expect(c).not.toContain("setKind('texts')");
  });
});
