'use client';
import { useCallback, useEffect, useState } from 'react';
import { isFxCurrency, type FxCurrency, type FxRates } from '@/lib/fx';

// The visitor's display currency (kept in the browser) and today's rates (one request per page load, shared).
const KEY = 're_display_currency';
const EVENT = 're-display-currency';
let ratesPromise: Promise<FxRates | null> | null = null;
const loadRates = () =>
  (ratesPromise ??= fetch('/api/fx')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && typeof d.rates === 'object' ? (d.rates as FxRates) : null))
    .catch(() => null));

const read = (): FxCurrency => {
  try {
    const v = localStorage.getItem(KEY);
    return isFxCurrency(v) ? v : 'USD';
  } catch {
    return 'USD';
  }
};

export function useDisplayCurrency() {
  const [currency, setState] = useState<FxCurrency>('USD');
  const [rates, setRates] = useState<FxRates | null>(null);

  useEffect(() => {
    setState(read());
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    if (currency === 'USD') return;
    let live = true;
    loadRates().then((r) => { if (live) setRates(r); });
    return () => { live = false; };
  }, [currency]);

  const setCurrency = useCallback((c: FxCurrency) => {
    try { localStorage.setItem(KEY, c); } catch { /* private mode: the choice lasts until reload */ }
    setState(c);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { currency, setCurrency, rates };
}
