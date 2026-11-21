'use client';

import { useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, inputCls } from './admin-ui';

// For a person who lost the phone that held their fingerprint (and has the fingerprint lock on): clears it so they can start over.
export default function UserPasskeyReset({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const reset = async () => {
    const id = uid.trim();
    if (!id || busy) return;
    if (!window.confirm(`مسح بصمات وقفل المستخدم ${id}؟ هيقدر يضيف جهاز جديد ويفعّل القفل تاني.`)) return;
    setBusy(true); setMsg(null);
    try {
      await adminApi('/api/admin/passkey-reset', { method: 'POST', body: JSON.stringify({ uid: id }) });
      setUid(''); setMsg({ ok: true, text: 'تم المسح. المستخدم يقدر يدخل ويضيف بصمة جديدة.' });
    } catch (e) {
      if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg({ ok: false, text: (e as Error).message });
    } finally { setBusy(false); }
  };

  return (
    <Card title="🔓 إعادة ضبط بصمة مستخدم (ضاع جهازه)">
      <p className="mb-3 text-xs text-muted-foreground">لو مستخدم فعّل قفل البصمة وفقد جهازه، حط الـ uid بتاعه (حساب Pi أو web_…) هنا. بيمسح بصماته وإعداد القفل، وبيتسجّل في سجل الأدمن.</p>
      <div className="flex flex-wrap gap-2">
        <input aria-label="uid المستخدم" dir="ltr" placeholder="uid" maxLength={140} value={uid} onChange={(e) => setUid(e.target.value)} className={`${inputCls} min-w-0 flex-1`} />
        <Btn kind="danger" disabled={busy || !uid.trim()} onClick={reset}>{busy ? 'جاري…' : 'مسح البصمات'}</Btn>
      </div>
      {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
    </Card>
  );
}
