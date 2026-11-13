'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_BRANDING, parseBranding, type Branding } from '@/lib/branding';

const KEY = 're_brand';

function fromStorage(): Branding {
  try { const raw = localStorage.getItem(KEY); if (raw) return parseBranding(JSON.parse(raw)); } catch { /* ignore */ }
  return DEFAULT_BRANDING;
}

let inflight: Promise<Branding> | null = null;
function load(): Promise<Branding> {
  if (!inflight) {
    inflight = fetch('/api/brand')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const b = j ? parseBranding(j) : fromStorage();
        try { localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* ignore */ }
        return b;
      })
      .catch(() => fromStorage())
      .finally(() => { setTimeout(() => { inflight = null; }, 60_000); });
  }
  return inflight;
}

// The logo everyone sees. The last one is remembered on the device so it shows at once, then it is refreshed.
export function useBranding(): Branding {
  const [b, setB] = useState<Branding>(DEFAULT_BRANDING);
  useEffect(() => {
    setB(fromStorage());
    let off = false;
    load().then((x) => { if (!off) setB(x); });
    return () => { off = true; };
  }, []);
  return b;
}
