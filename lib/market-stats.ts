// Market statistics computed from what the platform really holds: visible listings and completed contracts.
// Pure functions (no Firebase here). Amounts of different currencies are never added together.
export type StatListing = { type: string; country: string; price: number; currency: string; sold: boolean };
export type StatContract = { type: string; amount: number; currency: string; status: string; createdAtMs: number };

export type MarketStats = {
  listings: { total: number; available: number; sold: number };
  byType: { type: string; count: number }[];
  countries: { country: string; count: number }[];
  countryCount: number;
  prices: { type: string; currency: string; count: number; median: number; min: number; max: number }[];
  headline: { currency: string; median: number; count: number } | null;
  months: { month: string; deals: number }[];
  deals12m: number;
  volume12m: { currency: string; amount: number }[];
};

export const SALE_TYPES = ['buy', 'offplan', 'abroad', 'tokenized', 'invest'];
const TOP_COUNTRIES = 8;

const round2 = (n: number) => Math.round(n * 100) / 100;
const cur = (c: unknown) => (typeof c === 'string' && c.trim() ? c.trim().toUpperCase() : 'PI');
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const monthKey = (ms: number) => new Date(ms).toISOString().slice(0, 7);

// The 12 calendar months ending with the one that contains `nowMs`, oldest first ("2026-01" ...).
export function lastMonths(nowMs: number, n = 12): string[] {
  const d = new Date(nowMs);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
  return out;
}

export function computeMarketStats(listings: StatListing[], contracts: StatContract[], nowMs = Date.now()): MarketStats {
  const byType = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const priced = new Map<string, number[]>();
  let sold = 0;
  for (const l of listings) {
    byType.set(l.type || 'other', (byType.get(l.type || 'other') ?? 0) + 1);
    if (l.country) byCountry.set(l.country, (byCountry.get(l.country) ?? 0) + 1);
    if (l.sold) sold++;
    if (Number.isFinite(l.price) && l.price > 0) {
      const k = `${l.type || 'other'}|${cur(l.currency)}`;
      (priced.get(k) ?? priced.set(k, []).get(k)!).push(l.price);
    }
  }
  const prices = [...priced.entries()].map(([k, xs]) => {
    const [type, currency] = k.split('|');
    return { type, currency, count: xs.length, median: round2(median(xs)), min: round2(Math.min(...xs)), max: round2(Math.max(...xs)) };
  }).sort((a, b) => b.count - a.count);

  // The headline price: the median of for-sale listings in the currency most of them use.
  const sale = new Map<string, number[]>();
  for (const [k, xs] of priced) {
    const [type, currency] = k.split('|');
    if (SALE_TYPES.includes(type)) (sale.get(currency) ?? sale.set(currency, []).get(currency)!).push(...xs);
  }
  const top = [...sale.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const headline = top ? { currency: top[0], median: round2(median(top[1])), count: top[1].length } : null;

  const months = lastMonths(nowMs);
  const deals = new Map(months.map((m) => [m, 0]));
  const volume = new Map<string, number>();
  let deals12m = 0;
  for (const c of contracts) {
    if (c.status !== 'completed' || !Number.isFinite(c.createdAtMs) || c.createdAtMs <= 0) continue;
    const m = monthKey(c.createdAtMs);
    if (!deals.has(m)) continue;
    deals.set(m, deals.get(m)! + 1);
    deals12m++;
    if (SALE_TYPES.includes(c.type) && Number.isFinite(c.amount) && c.amount > 0) volume.set(cur(c.currency), (volume.get(cur(c.currency)) ?? 0) + c.amount);
  }

  return {
    listings: { total: listings.length, available: listings.length - sold, sold },
    byType: [...byType.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    countries: [...byCountry.entries()].map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count || a.country.localeCompare(b.country)).slice(0, TOP_COUNTRIES),
    countryCount: byCountry.size,
    prices,
    headline,
    months: months.map((month) => ({ month, deals: deals.get(month)! })),
    deals12m,
    volume12m: [...volume.entries()].map(([currency, amount]) => ({ currency, amount: round2(amount) })).sort((a, b) => b.amount - a.amount),
  };
}
