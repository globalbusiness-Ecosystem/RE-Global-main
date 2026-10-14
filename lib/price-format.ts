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
