'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_FOUNDER, parseFounder, type Founder } from '@/lib/founder';
import { authHeaders } from '@/lib/api-token';

let inflight: Promise<Founder> | null = null;
function load(): Promise<Founder> {
  if (!inflight) {
    inflight = fetch('/api/founder')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? parseFounder(j) : DEFAULT_FOUNDER))
      .catch(() => DEFAULT_FOUNDER)
      .finally(() => { setTimeout(() => { inflight = null; }, 60_000); });
  }
  return inflight;
}

/** The founder card for the About page. Empty (so nothing shows) until it arrives. */
export function useFounder(): Founder {
  const [f, setF] = useState<Founder>(DEFAULT_FOUNDER);
  useEffect(() => {
    let off = false;
    load().then((x) => { if (!off) setF(x); });
    return () => { off = true; };
  }, []);
  return f;
}

/** True when the signed-in account is the one the admin linked as founder. */
export function useIsFounder(accessToken: string | null | undefined): boolean {
  const [yes, setYes] = useState(false);
  useEffect(() => {
    if (!accessToken) { setYes(false); return; }
    let off = false;
    fetch('/api/founder/me', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off) setYes(j?.isFounder === true); })
      .catch(() => { if (!off) setYes(false); });
    return () => { off = true; };
  }, [accessToken]);
  return yes;
}
