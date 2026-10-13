import { useEffect, useState } from 'react';
import type { ContentKind } from '@/lib/site-content';

// Active banners / partners added from the admin panel. `items` is [] until loaded
// (or if there is nothing), so callers can fall back to their built-in defaults.
export function useSiteContent<T = Record<string, any>>(kind: ContentKind) {
  const [items, setItems] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch(`/api/content?kind=${kind}`)
      .then((r) => r.json())
      .then((d) => { if (alive && Array.isArray(d.items)) setItems(d.items); })
      .catch(() => undefined)
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [kind]);
  return { items, loading };
}
