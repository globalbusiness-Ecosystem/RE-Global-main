import { formatMoney, formatNumber } from '@/lib/format';

// How a listing's price is shown, according to the currency the admin priced it in.
export function formatPropertyPrice(p: { price?: unknown; currency?: unknown }, lang?: string): string {
  if (!Number.isFinite(Number(p.price)) || p.price === '' || p.price === null) {
    const raw = String(p.price ?? '');
    const c = typeof p.currency === 'string' ? p.currency.toUpperCase() : 'PI';
    return c === 'PI' || c === '' ? `${raw} π` : `${raw} ${p.currency}`;
  }
  return formatMoney(p.price, p.currency, lang);
}

// "≈ $1,234" for a listing priced in Pi, so visitors anywhere can read the price in dollars.
// Needs the admin-set Pi/USD rate; returns null when there is no rate or the listing is not priced in Pi.
export function usdHint(p: { price?: unknown; currency?: unknown }, piUsdRate: number | null | undefined, lang?: string): string | null {
  const c = typeof p.currency === 'string' ? p.currency.toUpperCase() : 'PI';
  if (c !== 'PI' && c !== '') return null;
  const price = Number(p.price);
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(Number(piUsdRate)) || Number(piUsdRate) <= 0) return null;
  const usd = price * Number(piUsdRate);
  return `≈ $${formatNumber(usd, lang, usd >= 100 ? 0 : 2)}`;
}
