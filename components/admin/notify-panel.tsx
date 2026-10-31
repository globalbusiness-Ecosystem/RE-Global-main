'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Card, Btn, Badge } from './admin-ui';
import type { ReadinessItem } from '@/lib/notify-readiness';

const ERRORS: Record<string, string> = {
  'mail-not-configured': 'خدمة الإيميل مش متظبطة لسه.',
  'admin-email-missing': 'ADMIN_ALERT_EMAIL مش متظبط.',
  'send-failed': 'الإرسال فشل. راجع بيانات الإيميل (غالباً App Password غلط).',
};

// Admin: are guest e-mail reminders ready, and a button that sends a test mail to the admin address.
export default function NotifyPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<{ items: ReadinessItem[]; ready: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ items: ReadinessItem[]; ready: boolean }>('/api/admin/notify-test')
      .then(setData)
      .catch((e) => { if (e instanceof UnauthorizedError) onUnauthorized(); });
  }, [onUnauthorized]);

  const test = async () => {
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/notify-test', { method: 'POST' });
      setMsg('✅ اتبعت. شوف الإيميل (وفولدر Spam).');
    } catch (e) {
      if (e instanceof UnauthorizedError) return onUnauthorized();
      const code = e instanceof Error ? e.message : '';
      setMsg('❌ ' + (ERRORS[code] ?? 'حصل خطأ. جرّب تاني.'));
    } finally { setBusy(false); }
  };

  if (!data) return null;
  return (
    <Card title="🔔 جاهزية إشعارات الإيميل">
      <p className="mb-3 text-xs text-gray-400">
        {data.ready ? 'تذكيرات الضيوف جاهزة وهتتبعت يومياً الساعة 9 الصبح بتوقيت القاهرة.' : 'تذكيرات الضيوف لسه مش هتتبعت. كمّل الناقص تحت.'}
      </p>
      <div className="space-y-2">
        {data.items.map((i) => (
          <div key={i.id} className="rounded-lg bg-[#141414] px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-200">{i.label}</span>
              <Badge tone={i.ok ? 'green' : 'gold'}>{i.ok ? '✅ جاهز' : '⚠️ ناقص'}</Badge>
            </div>
            {!i.ok && <p className="mt-1 text-gray-400">{i.fix}</p>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn onClick={test} disabled={busy}>{busy ? '...' : 'ابعتلي إيميل تجريبي'}</Btn>
        {msg && <span role="status" className="text-xs text-gray-300">{msg}</span>}
      </div>
    </Card>
  );
}
