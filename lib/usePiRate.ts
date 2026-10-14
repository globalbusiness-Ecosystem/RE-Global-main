import { useEffect, useState } from 'react';

let cached: Promise<number | null> | null = null;
const load = () =>
  (cached ??= fetch('/api/pricing')
    .then((r) => r.json())
    .then((d) => (typeof d?.piUsdRate === 'number' && d.piUsdRate > 0 ? (d.piUsdRate as number) : null))
    .catch(() => null));

// The admin-set Pi/USD rate (null until loaded or when not set).
export function usePiRate(): number | null {
  const [rate, setRate] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((r) => { if (alive) setRate(r); });
    return () => { alive = false; };
  }, []);
  return rate;
}
