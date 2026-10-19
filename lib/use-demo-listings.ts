'use client';
import { useEffect, useState } from 'react';

let pending: Promise<boolean> | null = null;
const load = () =>
  (pending ??= fetch('/api/site-settings')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && d.showDemoListings === false ? false : true))
    .catch(() => true));

/** null while loading, then whether the sample listings should be shown. */
export function useShowDemo(): boolean | null {
  const [show, setShow] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    load().then((v) => { if (live) setShow(v); });
    return () => { live = false; };
  }, []);
  return show;
}
