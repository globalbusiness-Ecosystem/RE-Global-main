import { usdHint } from '@/lib/price-format';
import { localeFor } from '@/lib/format';

// Showing a price in the visitor's own currency. Rates are "units of that currency per 1 US dollar".
export const FX_CURRENCIES = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'TRY', 'INR', 'PKR', 'CNY', 'BRL', 'NGN', 'JPY', 'CAD', 'AUD', 'CHF'] as const;
export type FxCurrency = (typeof FX_CURRENCIES)[number];
export type FxRates = Partial<Record<FxCurrency, number>>;

export const isFxCurrency = (v: unknown): v is FxCurrency => typeof v === 'string' && (FX_CURRENCIES as readonly string[]).includes(v);

// The provider's answer -> only the currencies we support, only sane numbers. Null when it does not look right.
export function parseRates(body: unknown): FxRates | null {
  const b = body as { result?: unknown; rates?: unknown } | null;
  if (!b || b.result !== 'success' || !b.rates || typeof b.rates !== 'object') return null;
  const raw = b.rates as Record<string, unknown>;
  const out: FxRates = { USD: 1 };
  for (const c of FX_CURRENCIES) {
    const n = Number(raw[c]);
    if (c !== 'USD' && Number.isFinite(n) && n > 0 && n < 1e7) out[c] = n;
  }
  return Object.keys(out).length >= 6 ? out : null;
}

export function formatFiat(amount: number, currency: FxCurrency, lang?: string): string {
  try {
    return new Intl.NumberFormat(localeFor(lang), {
      style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString('en-US')} ${currency}`;
  }
}

// "≈ €1,234" next to a price: from Pi (with the admin's Pi/USD rate) or from a dollar-priced listing.
// For dollars it keeps the old "≈ $X" (and nothing for a listing already in dollars).
export function fiatHint(
  p: { price?: unknown; currency?: unknown },
  piUsdRate: number | null | undefined,
  currency: FxCurrency,
  rates: FxRates | null | undefined,
  lang?: string,
): string | null {
  if (currency === 'USD') return usdHint(p, piUsdRate, lang);
  const rate = rates?.[currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) return null;
  const price = Number(p.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  const c = typeof p.currency === 'string' ? p.currency.toUpperCase() : 'PI';
  let usd: number;
  if (c === 'PI' || c === '') {
    if (!Number.isFinite(Number(piUsdRate)) || Number(piUsdRate) <= 0) return null;
    usd = price * Number(piUsdRate);
  } else if (c === 'USD' || c === 'USDC' || c === 'USDT') {
    usd = price;
  } else {
    return null;
  }
  return `≈ ${formatFiat(usd * rate, currency, lang)}`;
}
