'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';

type Prop = { id: string; title: string; type: string };
type Block = { id: string; start: string; end: string; note: string };

// Admin: close dates on a hotel or rental (maintenance, owner stay). Guests then cannot book or pay for those nights.
export default function BlockDates({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [props, setProps] = useState<Prop[] | null>(null);
  const [pid, setPid] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const fail = useCallback((e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + ((e as Error).message || 'حصل خطأ')); }, [onUnauthorized]);

  useEffect(() => {
    adminApi<{ properties: Prop[] }>('/api/admin/properties')
      .then((d) => setProps((d.properties || []).filter((p) => p.type === 'hotel' || p.type === 'rent')))
      .catch(fail);
  }, [fail]);

  const loadBlocks = useCallback((id: string) => {
    if (!id) { setBlocks([]); return; }
    adminApi<{ blocks: Block[] }>('/api/admin/blocks?propertyId=' + encodeURIComponent(id)).then((d) => setBlocks(d.blocks || [])).catch(fail);
  }, [fail]);
  useEffect(() => { loadBlocks(pid); }, [pid, loadBlocks]);

  if (!props || props.length === 0) return null;

  const add = async () => {
    setBusy(true); setMsg('');
    try {
      await adminApi('/api/admin/blocks', { method: 'POST', body: JSON.stringify({ propertyId: pid, start, end, note }) });
      setStart(''); setEnd(''); setNote(''); setMsg('✅ الأيام اتقفلت');
      loadBlocks(pid);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const remove = async (b: Block) => {
    if (!window.confirm(`تفتح الأيام من ${b.start} إلى ${b.end} تاني؟`)) return;
    setBusy(true); setMsg('');
    try {
      await adminApi(`/api/admin/blocks?propertyId=${encodeURIComponent(pid)}&id=${encodeURIComponent(b.id)}`, { method: 'DELETE' });
      loadBlocks(pid);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  return (
    <Card title="🔒 قفل أيام على فندق / إيجار">
      <p className="mb-2 text-xs text-gray-400">الأيام المقفولة مش بتتحجز ولا بتتدفع. لو فيها حجز ضيف، الغي الحجز الأول من لوحة الحجوزات.</p>
      {msg && <p className="mb-2 text-xs text-gray-200">{msg}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="العقار">
            <select className={inputCls} value={pid} onChange={(e) => setPid(e.target.value)}>
              <option value="">— اختار —</option>
              {props.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
        </div>
        {pid && (
          <>
            <Field label="من (أول ليلة)"><input type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="إلى (يوم الخروج)"><input type="date" className={inputCls} value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="ملاحظة (اختياري، مثلاً: صيانة)"><input className={inputCls} value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Btn onClick={add} disabled={busy || !start || !end}>{busy ? '...' : 'اقفل الأيام دي'}</Btn></div>
          </>
        )}
      </div>
      {pid && blocks.length > 0 && (
        <div className="mt-3 space-y-2">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-3 text-xs text-gray-300">
              <span dir="ltr">{b.start} → {b.end}</span>
              <span className="min-w-0 flex-1 truncate">{b.note}</span>
              <Btn small kind="ghost" onClick={() => remove(b)} disabled={busy}>افتح</Btn>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
