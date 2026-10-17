// How a listing's price is shown, according to the currency the admin priced it in.
export function formatPropertyPrice(p: { price?: unknown; currency?: unknown }): string {
  const n = Number(p.price);
  const v = Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(p.price ?? '');
  const c = typeof p.currency === 'string' ? p.currency.toUpperCase() : 'PI';
  if (c === 'PI' || c === '') return `${v} π`;
  if (c === 'USD' || c === 'USDC' || c === 'USDT') return `$${v}`;
  if (c === 'OUSD') return `${v} OUSD`;
  return `${v} ${p.currency}`;
}

// "≈ $1,234" for a listing priced in Pi, so visitors anywhere can read the price in dollars.
// Needs the admin-set Pi/USD rate; returns null when there is no rate or the listing is not priced in Pi.
export function usdHint(p: { price?: unknown; currency?: unknown }, piUsdRate: number | null | undefined): string | null {
  const c = typeof p.currency === 'string' ? p.currency.toUpperCase() : 'PI';
  if (c !== 'PI' && c !== '') return null;
  const price = Number(p.price);
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(Number(piUsdRate)) || Number(piUsdRate) <= 0) return null;
  const usd = price * Number(piUsdRate);
  return `≈ $${usd.toLocaleString('en-US', { maximumFractionDigits: usd >= 100 ? 0 : 2 })}`;
}
