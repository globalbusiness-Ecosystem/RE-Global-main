'use client';
import { useEffect, useState } from 'react';
import type { TourItem } from '@/lib/tours';

export type ToursState = { enabled: boolean; demo: boolean; items: TourItem[] };
let pending: Promise<ToursState | null> | null = null;
const load = () => (pending ??= fetch('/api/tours').then((r) => (r.ok ? r.json() : null)).catch(() => null));

/** null while loading or when the answer cannot be read (the entry then stays hidden rather than opening nothing). */
export function useTours(): ToursState | null {
  const [s, setS] = useState<ToursState | null>(null);
  useEffect(() => {
    let live = true;
    load().then((v) => { if (live && v) setS(v); });
    return () => { live = false; };
  }, []);
  return s;
}
