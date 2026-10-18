'use client';
import { usdHint } from '@/lib/price-format';
import { usePiUsdRate } from '@/lib/use-pi-rate';
import { useLanguage } from '@/contexts/language-context';

// Small "≈ $X" next to a price in Pi. Renders nothing when there is no rate or the listing is priced in dollars.
export function PriceUsd({ prop, className = 'ml-2 text-xs font-normal text-gray-400' }: { prop: { price?: unknown; currency?: unknown }; className?: string }) {
  const { language } = useLanguage();
  const hint = usdHint(prop, usePiUsdRate(), language);
  return hint ? <span className={className} dir="ltr">{hint}</span> : null;
}
