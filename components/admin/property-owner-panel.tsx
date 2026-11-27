'use client';

import { useEffect, useState } from 'react';
import { adminApi, Btn, Field, inputCls } from './admin-ui';

type Owner = { kind: 'individual' | 'company'; name: string; registrationNo?: string };

// The owner of one property. Kept on the server only; the contract prints a masked line.
export default function PropertyOwnerPanel({ propertyId }: { propertyId: string }) {
  const [kind, setKind] = useState<'individual' | 'company'>('individual');
  const [name, setName] = useState('');
  const [reg, setReg] = useState('');
  const [line, setLine] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi<{ owner: Owner | null; line: string | null }>('/api/admin/property-owner?id=' + encodeURIComponent(propertyId))
      .then((d) => { if (d.owner) { setKind(d.owner.kind); setName(d.owner.name); setReg(d.owner.registrationNo || ''); } setLine(d.line); })
      .catch((e) => setMsg('❌ ' + e.message));
  }, [propertyId]);

  const save = async (remove = false) => {
    setBusy(true); setMsg('');
    try {
      const r = await adminApi<{ line: string | null }>('/api/admin/property-owner', { method: 'PUT', body: JSON.stringify({ id: propertyId, owner: remove ? null : { kind, name, registrationNo: reg } }) });
      setLine(r.line);
      if (remove) { setName(''); setReg(''); }
      setMsg(remove ? '✅ اتشال المالك.' : '✅ اتحفظ. العقود الجديدة هتذكر المالك بالشكل المقنّع تحت.');
    } catch (e: any) { setMsg('❌ ' + e.message); }
    setBusy(false);
  };

  return (
    <div className="mt-5 rounded-xl border border-border p-3">
      <div className="mb-1 text-sm font-bold">👤 مالك العقار (بيانات داخلية)</div>
      <p className="mb-2 text-xs text-muted-foreground">الاسم والرقم بيتحفظوا على السيرفر بس، مش في كتالوج العقارات. في العقد بيظهر سطر مقنّع: الشركة باسمها، والفرد بالحروف الأولى، والرقم بآخر 4 بس. المالك مش طرف موقّع ولا له حساب.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="النوع">
          <select aria-label="نوع المالك" className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as 'individual' | 'company')}>
            <option value="individual">فرد</option>
            <option value="company">شركة / كيان</option>
          </select>
        </Field>
        <Field label="الاسم الرسمي"><input aria-label="اسم المالك" className={inputCls} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="رقم التسجيل أو الهوية (اختياري)"><input aria-label="رقم تسجيل المالك" dir="ltr" className={inputCls} maxLength={40} value={reg} onChange={(e) => setReg(e.target.value)} /></Field>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Btn small disabled={busy || !name.trim()} onClick={() => save(false)}>حفظ المالك</Btn>
        {line && <Btn small kind="danger" disabled={busy} onClick={() => save(true)}>إزالة المالك</Btn>}
        {line && <span dir="ltr" className="text-xs text-muted-foreground">في العقد: {line}</span>}
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}
