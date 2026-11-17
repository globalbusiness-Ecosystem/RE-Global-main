'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_ANNOUNCEMENTS, parseAnnouncements, type Announcements } from '@/lib/announcements';

let inflight: Promise<Announcements> | null = null;
function load(): Promise<Announcements> {
  if (!inflight) {
    inflight = fetch('/api/announcements')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? parseAnnouncements(j) : DEFAULT_ANNOUNCEMENTS))
      .catch(() => DEFAULT_ANNOUNCEMENTS)
      .finally(() => { setTimeout(() => { inflight = null; }, 60_000); });
  }
  return inflight;
}

// The home page board. Nothing (and no stats) until the saved one arrives.
export function useAnnouncements(): Announcements {
  const [a, setA] = useState<Announcements>(DEFAULT_ANNOUNCEMENTS);
  useEffect(() => {
    let off = false;
    load().then((x) => { if (!off) setA(x); });
    return () => { off = true; };
  }, []);
  return a;
}
