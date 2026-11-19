'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CELEBRATION, parseCelebration, type Celebration } from '@/lib/celebration';

/** How the celebration should look and sound (the admin's settings). null until it arrives, so nothing plays by mistake. */
export function useCelebration(): Celebration | null {
  const [c, setC] = useState<Celebration | null>(null);
  useEffect(() => {
    let off = false;
    fetch('/api/celebration')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off) setC(j ? parseCelebration(j) : DEFAULT_CELEBRATION); })
      .catch(() => { if (!off) setC(DEFAULT_CELEBRATION); });
    return () => { off = true; };
  }, []);
  return c;
}
