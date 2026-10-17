'use client';
import { useEffect, useState } from 'react';

// The public Pi/USD rate (set by the admin). One request per page load, shared by every price on the page.
let cached: Promise<number | null> | null = null;
const loadRate = () =>
  (cached ??= fetch('/api/pricing')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (Number(d?.piUsdRate) > 0 ? Number(d.piUsdRate) : null))
    .catch(() => null));

export function usePiUsdRate(): number | null {
  const [rate, setRate] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    loadRate().then((r) => { if (live) setRate(r); });
    return () => { live = false; };
  }, []);
  return rate;
}
