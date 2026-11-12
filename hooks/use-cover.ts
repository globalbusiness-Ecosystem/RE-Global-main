'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_COVER, isCoverId, type CoverId } from '@/lib/cover';

const KEY = 're_profile_cover';
const EVENT = 're-cover-changed';

function read(): CoverId {
  try { const v = localStorage.getItem(KEY); if (isCoverId(v)) return v; } catch { /* ignore */ }
  return DEFAULT_COVER;
}

// The banner choice is a per-device look, so it is kept in the browser; every place that shows it updates together.
export function useCover() {
  const [cover, setCoverState] = useState<CoverId>(DEFAULT_COVER);
  useEffect(() => {
    setCoverState(read());
    const on = () => setCoverState(read());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const setCover = useCallback((id: CoverId) => {
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
    try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
    setCoverState(id);
  }, []);
  return { cover, setCover };
}
