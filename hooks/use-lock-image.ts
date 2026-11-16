'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCK_IMAGE, parseLockImage, type LockImage } from '@/lib/lock-image';

const KEY = 're_lock_image';

function fromStorage(): LockImage {
  try { const raw = localStorage.getItem(KEY); if (raw) return parseLockImage(JSON.parse(raw)); } catch { /* ignore */ }
  return DEFAULT_LOCK_IMAGE;
}

let inflight: Promise<LockImage> | null = null;
function load(): Promise<LockImage> {
  if (!inflight) {
    inflight = fetch('/api/lock-image')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const v = j ? parseLockImage(j) : fromStorage();
        try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
        return v;
      })
      .catch(() => fromStorage())
      .finally(() => { setTimeout(() => { inflight = null; }, 60_000); });
  }
  return inflight;
}

// The picture inside the fingerprint button. Remembered on the device so it shows at once, then refreshed.
export function useLockImage(): LockImage {
  const [v, setV] = useState<LockImage>(DEFAULT_LOCK_IMAGE);
  useEffect(() => {
    setV(fromStorage());
    let off = false;
    load().then((x) => { if (!off) setV(x); });
    return () => { off = true; };
  }, []);
  return v;
}
