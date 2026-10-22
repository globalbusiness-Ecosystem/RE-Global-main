'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { REQUEST_MAX, requestStrings } from '@/lib/guest-requests';

// The guest's special request on an upcoming stay: shown as text, with a small form to add or change it.
export function GuestRequest({ bookingId, language, initial }: { bookingId: string; language: string; initial?: string }) {
  const { accessToken } = usePiAuth();
  const t = requestStrings(language);
  const [saved, setSaved] = useState(initial ?? '');
  const [text, setText] = useState(initial ?? '');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const save = async () => {
    if (!accessToken) return;
    setState('saving');
    try {
      const r = await fetch('/api/bookings/request', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ bookingId, note: text }) });
      const d = await r.json().catch(() => null);
      if (!r.ok) { setState('error'); return; }
      setSaved(typeof d?.note === 'string' ? d.note : text);
      setState('done');
      setOpen(false);
    } catch { setState('error'); }
  };

  if (!open) {
    return (
      <div className="space-y-1">
        {saved && <p className="whitespace-pre-line break-words rounded-md bg-white/5 p-2 text-xs text-gray-200"><span className="font-semibold text-white">{t.label}: </span>{saved}</p>}
        {state === 'done' && <p className="text-xs text-green-400">✓ {t.saved}</p>}
        <button type="button" onClick={() => { setText(saved); setState('idle'); setOpen(true); }} className="rounded border border-accent/50 px-2 py-0.5 text-xs text-accent hover:bg-accent/10">💬 {saved ? t.edit : t.add}</button>
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-md bg-white/5 p-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={REQUEST_MAX} rows={3} placeholder={t.placeholder} aria-label={t.label} className="w-full rounded border border-white/10 bg-black/30 p-2 text-xs text-white" />
      {state === 'error' && <p className="text-xs text-red-400">{t.error}</p>}
      <button type="button" onClick={save} disabled={state === 'saving'} className="rounded bg-accent px-3 py-1 text-xs font-bold text-black disabled:opacity-50">{state === 'saving' ? t.saving : t.save}</button>
    </div>
  );
}
