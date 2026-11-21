'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Empty, fmtDate, inputCls } from './admin-ui';
import { passkeysAvailable, registerPasskey } from '@/lib/passkey-client';

type Item = { id: string; label: string; backedUp: boolean; createdAt: string | null; lastUsedAt: string | null };
const BASE = '/api/admin/passkeys';
const REASON: Record<string, string> = {
  cancelled: 'اتلغى. مفيش حاجة اتضافت.', duplicate: 'الجهاز ده مضاف بالفعل.', limit: 'وصلت للحد الأقصى (5 أجهزة). شيل جهاز الأول.',
  origin: 'عنوان الموقع ده مش متظبط للبصمة (ضيفه في PASSKEY_ORIGINS).', generic: 'حصل خطأ، حاول تاني.',
};

// Fingerprints / Face ID that can replace the 6-digit code when signing in to the admin panel (the PIN is still asked).
export default function AdminPasskeysPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { let alive = true; passkeysAvailable().then((v) => { if (alive) setSupported(v); }); return () => { alive = false; }; }, []);
  const fail = useCallback((e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg({ ok: false, text: (e as Error).message }); }, [onUnauthorized]);
  const load = useCallback(() => { adminApi<{ passkeys: Item[] }>(BASE).then((d) => setItems(d.passkeys)).catch(fail); }, [fail]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (busy) return;
    setBusy(true); setMsg(null);
    const r = await registerPasskey(null, label, BASE);
    setBusy(false);
    if (r.ok) { setLabel(''); setMsg({ ok: true, text: 'تم إضافة الجهاز. هتلاقي زر «الدخول بالبصمة» في شاشة الدخول.' }); load(); }
    else setMsg({ ok: false, text: REASON[r.reason] ?? REASON.generic });
  };
  const remove = async (p: Item) => {
    if (!window.confirm(`إزالة «${p.label}»؟`)) return;
    try { await adminApi(`${BASE}?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' }); load(); } catch (e) { fail(e); }
  };

  return (
    <Card title="🔑 بصمة الأدمن (Face ID / بصمة الإصبع)">
      <p className="mb-3 text-xs text-muted-foreground">بتدخل بالـ PIN + بصمتك بدل كود الـ 6 أرقام. البصمة نفسها مبتسيبش الجهاز. لو فقدت الجهاز، شيله من هنا أو من Firestore (collection ‏passkeys).</p>
      {items === null ? null : items.length === 0 ? <Empty>مفيش أجهزة مضافة لسه.</Empty> : (
        <ul className="mb-3 space-y-2">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-input p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground" dir="auto">{p.label}</p>
                <p className="text-xs text-muted-foreground">اتضاف {fmtDate(p.createdAt ?? '')} · آخر استخدام {p.lastUsedAt ? fmtDate(p.lastUsedAt) : 'لسه'}</p>
              </div>
              <Btn small kind="danger" onClick={() => remove(p)}>إزالة</Btn>
            </li>
          ))}
        </ul>
      )}
      {supported === false ? (
        <p className="text-xs text-yellow-400">المتصفح ده مش بيدعم البصمة. افتح لوحة الأدمن من متصفح موبايل أو كمبيوتر بيدعمها عشان تضيف جهاز.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input aria-label="اسم الجهاز" placeholder="اسم الجهاز (اختياري)" maxLength={40} value={label} onChange={(e) => setLabel(e.target.value)} className={`${inputCls} min-w-0 flex-1`} />
          <Btn kind="gold" disabled={busy || supported === null} onClick={add}>{busy ? 'في انتظار جهازك…' : '➕ إضافة الجهاز ده'}</Btn>
        </div>
      )}
      {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
    </Card>
  );
}
