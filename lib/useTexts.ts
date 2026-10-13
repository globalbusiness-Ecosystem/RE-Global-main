import { useEffect, useMemo, useState } from 'react';
import { applyOverrides, type Overrides, type TextPage } from '@/lib/site-texts';

// One fetch per page per session; every component using the same page shares it.
const cache = new Map<string, Promise<Record<string, Overrides>>>();
function load(page: TextPage) {
  let p = cache.get(page);
  if (!p) {
    p = fetch(`/api/texts?page=${page}`)
      .then((r) => r.json())
      .then((d) => (d && typeof d.texts === 'object' && d.texts ? (d.texts as Record<string, Overrides>) : {}))
      .catch(() => ({}));
    cache.set(page, p);
  }
  return p;
}

// Returns `base` (the built-in strings) with the admin's edits applied for this language.
export function useTexts<T>(page: TextPage, language: string, base: T): T {
  const [texts, setTexts] = useState<Record<string, Overrides>>({});
  useEffect(() => {
    let alive = true;
    load(page).then((t) => { if (alive) setTexts(t); });
    return () => { alive = false; };
  }, [page]);
  return useMemo(() => applyOverrides(base, texts[language]), [base, texts, language]);
}
