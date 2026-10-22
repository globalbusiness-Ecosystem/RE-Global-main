'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { receiptStrings } from '@/lib/receipt';

// Opens the printable receipt of a confirmed stay in a new tab (the guest prints it or saves it as PDF).
export function ReceiptButton({ bookingId, language }: { bookingId: string; language: string }) {
  const { accessToken } = usePiAuth();
  const t = receiptStrings(language);
  const [busy, setBusy] = useState(false);
  const open = async () => {
    if (!accessToken || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/bookings/receipt?bookingId=${encodeURIComponent(bookingId)}&lang=${encodeURIComponent(language)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (!r.ok) return;
      const url = URL.createObjectURL(new Blob([await r.text()], { type: 'text/html;charset=utf-8' }));
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { /* nothing to show: the guest can tap again */ } finally { setBusy(false); }
  };
  return (
    <button type="button" onClick={open} disabled={busy} className="rounded border border-accent/50 px-2 py-0.5 text-xs text-accent hover:bg-accent/10 disabled:opacity-50">🧾 {t.title}</button>
  );
}
