'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { formatNumber, formatMoney, formatCompact, formatDate, formatDateTime } from '@/lib/format';

// Formatting functions already bound to the language the visitor picked.
export function useFormat() {
  const { language } = useLanguage();
  return useMemo(() => ({
    language,
    num: (v: unknown, maxFraction?: number) => formatNumber(v, language, maxFraction),
    compact: (v: unknown) => formatCompact(v, language),
    money: (amount: unknown, currency?: unknown) => formatMoney(amount, currency, language),
    date: (v: unknown) => formatDate(v, language),
    dateTime: (v: unknown) => formatDateTime(v, language),
  }), [language]);
}
