import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { computeMarketStats, lastMonths, monthKey, type StatListing, type StatContract } from '@/lib/market-stats';
import { STATS_TEXT, st, typeLabel, regionName, compact } from '@/lib/market-stats-i18n';

const src = (p: string) => readFileSync(p, 'utf8');
const NOW = Date.UTC(2026, 10, 14); // 14 Nov 2026
const L = (o: Partial<StatListing>): StatListing => ({ type: 'buy', country: 'EG', price: 100, currency: 'PI', sold: false, ...o });
const C = (o: Partial<StatContract>): StatContract => ({ type: 'buy', amount: 50, currency: 'PI', status: 'completed', createdAtMs: Date.UTC(2026, 9, 5), ...o });

describe('market statistics', () => {
  it('counts listings, available and sold, by type and by country', () => {
    const s = computeMarketStats([L({}), L({ sold: true }), L({ type: 'rent', country: 'AE' }), L({ type: 'rent', country: 'AE' }), L({ type: 'hotel', country: 'AE' })], [], NOW);
    expect(s.listings).toEqual({ total: 5, available: 4, sold: 1 });
    expect(s.byType).toEqual([{ type: 'buy', count: 2 }, { type: 'rent', count: 2 }, { type: 'hotel', count: 1 }]);
    expect(s.countries).toEqual([{ country: 'AE', count: 3 }, { country: 'EG', count: 2 }]);
    expect(s.countryCount).toBe(2);
  });
  it('shows the top eight countries only, but counts them all', () => {
    const many = 'ABCDEFGHIJ'.split('').map((c) => L({ country: `X${c}` }));
    const s = computeMarketStats(many, [], NOW);
    expect(s.countries).toHaveLength(8);
    expect(s.countryCount).toBe(10);
  });
  it('uses the median, so one huge price does not distort the headline', () => {
    const s = computeMarketStats([L({ price: 100 }), L({ price: 110 }), L({ price: 120 }), L({ price: 9_000_000 })], [], NOW);
    expect(s.headline).toEqual({ currency: 'PI', median: 115, count: 4 });
  });
  it('never mixes currencies: the headline uses the most common one, prices are listed per currency', () => {
    const s = computeMarketStats([L({ price: 100 }), L({ price: 200 }), L({ price: 5000, currency: 'usd' })], [], NOW);
    expect(s.headline).toEqual({ currency: 'PI', median: 150, count: 2 });
    expect(s.prices.map((p) => `${p.type}|${p.currency}|${p.count}`)).toEqual(['buy|PI|2', 'buy|USD|1']);
  });
  it('stays and unpriced listings do not count toward the sale price', () => {
    const s = computeMarketStats([L({ type: 'rent', price: 999 }), L({ price: 0 }), L({ price: NaN })], [], NOW);
    expect(s.headline).toBeNull();
    expect(s.prices.map((p) => p.type)).toEqual(['rent']);
  });
  it('counts only completed deals of the last twelve months, per month', () => {
    const s = computeMarketStats([], [
      C({}), C({ createdAtMs: Date.UTC(2026, 9, 20) }), C({ createdAtMs: Date.UTC(2026, 10, 1) }),
      C({ status: 'pending' }), C({ createdAtMs: Date.UTC(2025, 9, 1) }), C({ createdAtMs: 0 }),
    ], NOW);
    expect(s.months).toHaveLength(12);
    expect(s.months[0].month).toBe('2025-12');
    expect(s.months[11]).toEqual({ month: '2026-11', deals: 1 });
    expect(s.months.find((m) => m.month === '2026-10')?.deals).toBe(2);
    expect(s.deals12m).toBe(3);
  });
  it('sales volume adds only property purchases, per currency', () => {
    const s = computeMarketStats([], [C({ amount: 100 }), C({ amount: 50, type: 'offplan' }), C({ type: 'rent', amount: 999 }), C({ amount: 7, currency: 'egp' })], NOW);
    expect(s.volume12m).toEqual([{ currency: 'PI', amount: 150 }, { currency: 'EGP', amount: 7 }]);
  });
  it('handles an empty platform', () => {
    const s = computeMarketStats([], [], NOW);
    expect(s.listings.total).toBe(0);
    expect(s.headline).toBeNull();
    expect(s.deals12m).toBe(0);
    expect(s.months.every((m) => m.deals === 0)).toBe(true);
  });
  it('lists twelve calendar months, across a year end', () => {
    expect(lastMonths(Date.UTC(2026, 0, 31))).toEqual(['2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01']);
    expect(monthKey(Date.UTC(2026, 5, 30, 23, 59))).toBe('2026-06');
  });
});

describe('texts', () => {
  it('every text exists in all seven languages', () => {
    for (const [k, row] of Object.entries(STATS_TEXT)) for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect((row as Record<string, string>)[l]?.trim(), `${k}.${l}`).toBeTruthy();
  });
  it('type names, country names and short numbers', () => {
    expect(typeLabel('buy', 'ar')).not.toBe(typeLabel('buy', 'en'));
    expect(typeLabel('something-new', 'en')).toBe(st('other', 'en'));
    expect(regionName('FR', 'en')).toBe('France');
    expect(regionName('ZZZZ', 'en')).toBe('ZZZZ');
    expect(compact(1_500_000, 'en-US')).toBe('1.5M');
  });
});

describe('wiring', () => {
  it('the page shows real figures from the API and no hard-coded sample data', () => {
    const p = src('components/pages/analytics-page.tsx');
    expect(p).toContain('useMarketStats');
    expect(p).not.toContain('ai-market-analysis-dashboard');
    expect(p).not.toMatch(/regionalData|priceTrendData|marketDistribution|5,?502|thisMonthGrowth/);
  });
  it('charts and cards use theme colours, so light and dark both work', () => {
    const p = src('components/pages/analytics-page.tsx');
    expect(p).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(p).not.toMatch(/bg-(black|gray-[0-9]|slate-[0-9])|text-gray-[0-9]/);
    expect(p).toContain('var(--accent)');
  });
  it('the API only exposes aggregates', () => {
    const s = src('lib/market-stats-server.ts');
    expect(s).toContain(".select('type', 'amount', 'currency', 'status', 'createdAt')");
    expect(s).not.toMatch(/buyerUsername|contractText|txid/);
  });
});
