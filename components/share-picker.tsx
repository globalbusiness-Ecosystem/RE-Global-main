'use client';

import { useEffect, useMemo, useState } from 'react';
import { ownershipPercent, remainingShares, sharesTotal } from '@/lib/share-rules';

// How many shares to buy of an invest / tokenized listing, with what is left, the share of the asset and the total in Pi.
// totalPi is the value of the whole asset in Pi. Calls onChange only when the choice is valid.
export function SharePicker({ totalShares, sharesSold, totalPi, language, onChange }: {
  totalShares: number;
  sharesSold?: number;
  totalPi: number | null;
  language: string;
  onChange: (v: { count: number; total: number } | null) => void;
}) {
  const ar = language === 'ar';
  const left = remainingShares({ totalShares, sharesSold });
  const [count, setCount] = useState('1');

  const result = useMemo(() => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1) return { error: ar ? 'اكتب عدد حصص صحيح' : 'Enter a whole number of shares', value: null as null | { count: number; total: number } };
    if (n > left) return { error: ar ? `المتاح ${left} حصة بس` : `Only ${left} shares left`, value: null };
    const total = totalPi ? sharesTotal(totalPi, totalShares, n) : null;
    if (total === null) return { error: ar ? 'السعر مش متاح' : 'Price unavailable', value: null };
    return { error: '', value: { count: n, total } };
  }, [count, left, totalPi, totalShares, ar]);

  useEffect(() => { onChange(left > 0 ? result.value : null); }, [result.value, left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (left <= 0) {
    return <p className="rounded-xl border border-yellow-500/40 p-3 text-sm text-yellow-400 text-center">{ar ? 'الحصص كلها اتباعت' : 'Fully subscribed'}</p>;
  }
  const n = result.value?.count ?? 0;
  return (
    <div className="space-y-2 rounded-xl border border-accent/20 p-3">
      <p className="text-sm font-semibold text-white">{ar ? 'عدد الحصص' : 'Number of shares'}</p>
      <p className="text-xs text-gray-400">{ar ? `المتاح ${left} من ${totalShares} حصة` : `${left} of ${totalShares} shares available`}</p>
      <input
        aria-label={ar ? 'عدد الحصص' : 'Number of shares'}
        type="number" min={1} max={left} step={1} value={count}
        onChange={(e) => setCount(e.target.value)}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white"
      />
      {result.error && <p className="text-xs text-red-400">{result.error}</p>}
      {result.value && (
        <p className="text-sm text-accent font-bold">
          {n} {ar ? 'حصة' : 'shares'} ({ownershipPercent(n, totalShares)}%) · {result.value.total} π
        </p>
      )}
    </div>
  );
}
