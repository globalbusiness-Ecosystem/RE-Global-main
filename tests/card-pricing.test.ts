import { describe, it, expect } from 'vitest';
import { cardQuote, localCurrencyFor, COUNTRY_CURRENCY, isCardCurrency } from '@/lib/card-pay/pricing';
import { COUNTRIES } from '@/lib/legal-profiles';
import { CURRENCIES } from '@/lib/card-pay/provider';
import { parsePropertyInput } from '@/lib/admin-property';

describe('card pricing', () => {
  it('charges in the currency of the listing country', () => {
    expect(cardQuote({ country: 'EG', cardPrice: 1500000 })).toEqual({ currency: 'EGP', amountMinor: 150000000 });
    expect(cardQuote({ country: 'AE', cardPrice: 750000.5 })).toEqual({ currency: 'AED', amountMinor: 75000050 });
    expect(cardQuote({ country: 'DE', cardPrice: 100 })).toEqual({ currency: 'EUR', amountMinor: 10000 });
  });
  it('is not available without a country, a supported currency or a local price', () => {
    for (const d of [null, undefined, {}, { country: 'EG' }, { cardPrice: 5 }, { country: 'EG', cardPrice: 0 }, { country: 'EG', cardPrice: -3 },
      { country: 'EG', cardPrice: 'abc' }, { country: 'KW', cardPrice: 5 }, { country: 'XX', cardPrice: 5 }, { country: 'EG', cardPrice: 1.005 }]) {
      expect(cardQuote(d as never)).toBeNull();
    }
  });
  it('hostile country codes never match', () => {
    for (const c of ['__proto__', 'constructor', 'toString', 'eg', '']) expect(localCurrencyFor(c)).toBeNull();
  });
  it('every mapped currency is one the providers know, and every mapped country is a known country', () => {
    for (const [c, cur] of Object.entries(COUNTRY_CURRENCY)) { expect(c in COUNTRIES).toBe(true); expect(CURRENCIES).toContain(cur); }
    expect(isCardCurrency('EGP')).toBe(true);
    expect(isCardCurrency('KWD')).toBe(false);
  });
});

describe('admin property input', () => {
  const base = { title: 'Villa', price: 10, currency: 'Pi', type: 'buy', propertyType: 'villa', status: 'available', bedrooms: 1, bathrooms: 1, area: 100, country: 'EG' };
  const ok = (extra: object) => parsePropertyInput({ ...base, ...extra }) as any;
  it('stores a local card price only when positive and rejects garbage', () => {
    const a = ok({ cardPrice: 2500000 });
    expect(a.ok).toBe(true);
    expect(a.doc.cardPrice).toBe(2500000);
    const none = ok({});
    expect(none.ok).toBe(true);
    expect('cardPrice' in none.doc).toBe(false);
    expect(ok({ cardPrice: 'abc' }).ok).toBe(false);
    expect(ok({ cardPrice: -5 }).ok).toBe(false);
  });
});
