'use client';
import { useDisplayCurrency } from '@/lib/use-fx';
import { fiatHint } from '@/lib/fx';
import { usePiUsdRate } from '@/lib/use-pi-rate';
import { useLanguage } from '@/contexts/language-context';

// Small "≈ $X" (or the visitor's own currency) next to a price. Renders nothing when there is no rate.
export function PriceUsd({ prop, className = 'ml-2 text-xs font-normal text-gray-400' }: { prop: { price?: unknown; currency?: unknown }; className?: string }) {
  const { language } = useLanguage();
  const { currency, rates } = useDisplayCurrency();
  const hint = fiatHint(prop, usePiUsdRate(), currency, rates, language);
  return hint ? <span className={className} dir="ltr">{hint}</span> : null;
}
