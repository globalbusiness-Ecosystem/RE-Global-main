'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { stayAlerts, type StayBooking } from '@/lib/stay-alerts';
import { unseenCount, loadSeen, ALERTS_SEEN_EVENT } from '@/lib/alert-badge';
import { browserStore } from '@/lib/offline-bookings';

// Number of stay alerts the signed-in guest has not opened yet. 0 when signed out or when bookings cannot be loaded.
// Bookings are fetched once per sign-in; "seen" is re-read when the guest changes page or opens the alerts tab.
export function useStayAlertCount(currentPage: string): number {
  const { accessToken, user } = usePiAuth();
  const uid = user?.uid ?? '';
  const [ids, setIds] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!accessToken) { setIds([]); return; }
    let alive = true;
    fetch('/api/my-properties', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        const bookings = Array.isArray(d?.bookings) ? (d.bookings as StayBooking[]) : [];
        setIds(stayAlerts(bookings, new Date().toISOString().slice(0, 10)).map((a) => a.id));
      })
      .catch(() => { if (alive) setIds([]); });
    return () => { alive = false; };
  }, [accessToken]);

  const recount = useCallback(() => setCount(unseenCount(ids, loadSeen(browserStore(), uid))), [ids, uid]);
  useEffect(() => { recount(); }, [recount, currentPage]);
  useEffect(() => {
    window.addEventListener(ALERTS_SEEN_EVENT, recount);
    return () => window.removeEventListener(ALERTS_SEEN_EVENT, recount);
  }, [recount]);

  return count;
}
