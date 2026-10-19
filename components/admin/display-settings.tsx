'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card } from './admin-ui';

export default function DisplaySettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [show, setShow] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ showDemoListings: boolean }>('/api/admin/display-settings')
      .then((d) => setShow(d.showDemoListings))
      .catch((e) => (e instanceof UnauthorizedError ? onUnauthorized() : setMsg('❌ ' + e.message)));
  }, [onUnauthorized]);

  const toggle = async () => {
    if (show === null) return;
    const next = !show;
    if (!next && !confirm('هتخفي العقارات التجريبية عن كل الزوار (الصفحات والخريطة). عقاراتك الحقيقية مش هتتأثر. تكمّل؟')) return;
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/display-settings', { method: 'PUT', body: JSON.stringify({ showDemoListings: next }) });
      setShow(next);
      setMsg('✅ اتحفظ. التغيير بيوصل للزوار خلال دقيقة تقريباً.');
    } catch (e: any) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + e.message);
    } finally { setBusy(false); }
  };

  return (
    <Card title="🧪 العقارات التجريبية">
      <p className="mb-3 text-xs text-gray-400">دي العقارات النموذجية الجاهزة جوه التطبيق (مش من الأدمن). لما تجهز للإطلاق اخفيها عشان الزوار يشوفوا عقاراتك الحقيقية بس.</p>
      <p className="mb-3 text-sm text-gray-100">الحالة: {show === null ? '...' : show ? '👁 ظاهرة للزوار' : '🙈 مخفية عن الزوار'}</p>
      <Btn onClick={toggle} disabled={busy || show === null}>{busy ? '...' : show ? '🙈 اخفيها' : '👁 اظهرها'}</Btn>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
    </Card>
  );
}
