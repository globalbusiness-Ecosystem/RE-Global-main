'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_HOME_FEATURES, parseHomeFeatures, type HomeFeatures } from '@/lib/home-features';

let inflight: Promise<HomeFeatures> | null = null;
function load(): Promise<HomeFeatures> {
  if (!inflight) {
    inflight = fetch('/api/home-features')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? parseHomeFeatures(j) : DEFAULT_HOME_FEATURES))
      .catch(() => DEFAULT_HOME_FEATURES)
      .finally(() => { setTimeout(() => { inflight = null; }, 60_000); });
  }
  return inflight;
}

// What the "Why choose RE?" strip shows. The built-in strip until the saved one arrives.
export function useHomeFeatures(): HomeFeatures {
  const [f, setF] = useState<HomeFeatures>(DEFAULT_HOME_FEATURES);
  useEffect(() => {
    let off = false;
    load().then((x) => { if (!off) setF(x); });
    return () => { off = true; };
  }, []);
  return f;
}
