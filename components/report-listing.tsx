'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { REPORT_I18N } from '@/lib/report-i18n';
import { REPORT_REASONS, type ReportReason } from '@/lib/listing-report';

// "Report this listing" on a public listing page: a small form, no sign-in needed.
export function ReportListing({ id }: { id: string }) {
  const { language } = useLanguage();
  const t = REPORT_I18N[language] ?? REPORT_I18N.en;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('illegal');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/listing-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, reason, details, email }) });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') return <p className="pt-4 text-sm text-muted-foreground" role="status">{t.thanks}</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="pt-4 text-sm text-muted-foreground underline">{t.open}</button>;
  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none';
  return (
    <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="font-semibold text-accent">{t.title}</h2>
      <label className="block text-sm">
        {t.reason}
        <select value={reason} onChange={(e) => setReason(e.target.value as ReportReason)} className={`${field} mt-1`}>
          {REPORT_REASONS.map((r) => <option key={r} value={r}>{t.reasons[r]}</option>)}
        </select>
      </label>
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={3} placeholder={t.details} aria-label={t.details} className={field} />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder={t.email} aria-label={t.email} className={field} />
      {state === 'error' && <p className="text-xs text-destructive" role="alert">{t.error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={state === 'sending'} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50">{t.send}</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm">{t.cancel}</button>
      </div>
    </form>
  );
}
