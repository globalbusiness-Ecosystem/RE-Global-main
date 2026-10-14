'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { formatPropertyPrice } from '@/lib/price-format';

type Owned = { id: string; propertyTitle: string; location?: string | null; amount: number; currency: string; status: string; createdAt: string | null; paymentId: string };

// The signed-in user's purchased properties.
export function MyProperties({ language }: { language: string }) {
  const { accessToken } = usePiAuth();
  const [items, setItems] = useState<Owned[] | null>(null);
  const ar = language === 'ar';

  useEffect(() => {
    if (!accessToken) { setItems(null); return; }
    let alive = true;
    fetch('/api/my-properties', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) setItems(Array.isArray(d.items) ? d.items : []); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [accessToken]);

  if (!items || items.length === 0) return null;
  return (
    <section className="rounded-lg border border-accent/40 p-4 space-y-3" style={{ backgroundColor: '#1a2332' }}>
      <h2 className="text-sm font-bold text-accent flex items-center gap-2">
        <Home className="w-4 h-4" /> {ar ? 'ممتلكاتي' : 'My properties'} ({items.length})
      </h2>
      {items.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{o.propertyTitle}</p>
            {o.location && <p className="text-xs text-gray-400 truncate">{o.location}</p>}
            {o.createdAt && <p className="text-[11px] text-gray-500">{new Date(o.createdAt).toLocaleDateString(ar ? 'ar-EG' : 'en-US')}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-accent text-sm font-bold">{formatPropertyPrice({ price: o.amount, currency: o.currency })}</p>
            <p className={`text-[11px] ${o.status === 'review' ? 'text-yellow-400' : 'text-green-400'}`}>
              {o.status === 'review' ? (ar ? 'قيد المراجعة' : 'Under review') : (ar ? 'مؤكد' : 'Confirmed')}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
