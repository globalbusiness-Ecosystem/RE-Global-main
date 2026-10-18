'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useDisplayCurrency } from '@/lib/use-fx';
import { FX_CURRENCIES, isFxCurrency } from '@/lib/fx';
import { FX_I18N } from '@/lib/fx-i18n';

// Settings card: choose the currency prices are also shown in (an estimate next to the Pi price).
export function CurrencyPicker() {
  const { language } = useLanguage();
  const { currency, setCurrency } = useDisplayCurrency();
  const t = FX_I18N[language] ?? FX_I18N.en;
  const names = useMemo(() => {
    try { return new Intl.DisplayNames([language], { type: 'currency' }); } catch { return null; }
  }, [language]);
  const label = (c: string) => { try { return `${c} · ${names?.of(c) ?? c}`; } catch { return c; } };
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      <label htmlFor="display-currency" className="block font-semibold text-accent">{t.title}</label>
      <select id="display-currency" value={currency} onChange={(e) => { if (isFxCurrency(e.target.value)) setCurrency(e.target.value); }}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
        {FX_CURRENCIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
      </select>
      <p className="text-xs text-muted-foreground">{t.note}</p>
      {currency !== 'USD' && (
        <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="block text-[11px] text-muted-foreground underline">{t.ratesBy}</a>
      )}
    </div>
  );
}
