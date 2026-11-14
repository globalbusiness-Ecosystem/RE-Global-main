'use client';
import { useCallback, useEffect, useState } from 'react';
import type { MarketStats } from '@/lib/market-stats';

// Public market figures from /api/market-stats.
export function useMarketStats() {
  const [data, setData] = useState<MarketStats | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const load = useCallback(() => {
    setState('loading');
    fetch('/api/market-stats')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('x'))))
      .then((d: MarketStats) => { setData(d); setState('ready'); })
      .catch(() => setState('error'));
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, state, reload: load };
}
