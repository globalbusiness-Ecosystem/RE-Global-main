'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Card } from './admin-ui';
import type { AttentionItem } from '@/lib/attention-rules';

// "Needs your attention": settings that stop payments or contracts, cases waiting for a review, and money owed.
export default function AttentionPanel({ onUnauthorized, goto }: { onUnauthorized: () => void; goto: (tab: string) => void }) {
  const [items, setItems] = useState<AttentionItem[] | null>(null);

  useEffect(() => {
    adminApi<{ items: AttentionItem[] }>('/api/admin/attention')
      .then((d) => setItems(d.items))
      .catch((e) => { if (e instanceof UnauthorizedError) onUnauthorized(); });
  }, [onUnauthorized]);

  if (!items) return null;
  if (items.length === 0) return <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">✅ كل حاجة تمام: مفيش حاجة محتاجة تدخّل.</div>;
  return (
    <Card title={`🔔 محتاج انتباهك (${items.length})`}>
      <div className="space-y-2">
        {items.map((it) => (
          <button key={it.id} onClick={() => goto(it.tab)}
            className={`block w-full rounded-xl border p-3 text-right text-sm ${it.level === 'bad' ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'}`}>
            {it.level === 'bad' ? '⛔' : '⚠️'} {it.text}
          </button>
        ))}
      </div>
    </Card>
  );
}
