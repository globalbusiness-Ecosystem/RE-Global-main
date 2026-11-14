'use client';
import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { COUNTRIES } from '@/lib/legal-profiles';
import { PARTNER_ROLES, type PartnerRole } from '@/lib/partners';
import { pt, countryName, FIELD_ERROR } from '@/lib/partners-i18n';

const input = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent';

// The application form. The partner type is picked in the cards above it.
export function PartnerApplyForm({ language, role, onRole, onSent }: { language: string; role: PartnerRole | null; onRole: (r: PartnerRole) => void; onSent: () => void }) {
  const { accessToken } = usePiAuth();
  const [f, setF] = useState({ company: '', country: '', phone: '', about: '', website: '', listed: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !accessToken) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/partners/apply', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ ...f, role }) });
      const d = await res.json().catch(() => null);
      if (res.ok) { onSent(); return; }
      if (res.status === 409) { setErr(pt('errExists', language)); onSent(); return; }
      setErr(pt(FIELD_ERROR[d?.field] ?? 'errGeneric', language));
    } catch { setErr(pt('errGeneric', language)); }
    finally { setBusy(false); }
  };

  return (
    <form id="partner-apply" onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold text-foreground">{pt('applyTitle', language)}</h2>
      <label className="block text-sm text-muted-foreground">{pt('fRole', language)}
        <select aria-label={pt('fRole', language)} className={`${input} mt-1`} value={role ?? ''} onChange={(e) => onRole(e.target.value as PartnerRole)}>
          <option value="" disabled>—</option>
          {PARTNER_ROLES.map((k) => <option key={k} value={k}>{pt(k, language)}</option>)}
        </select>
      </label>
      <label className="block text-sm text-muted-foreground">{pt('fCompany', language)}
        <input aria-label={pt('fCompany', language)} className={`${input} mt-1`} maxLength={100} value={f.company} onChange={(e) => set('company', e.target.value)} />
      </label>
      <label className="block text-sm text-muted-foreground">{pt('fCountry', language)}
        <select aria-label={pt('fCountry', language)} className={`${input} mt-1`} value={f.country} onChange={(e) => set('country', e.target.value)}>
          <option value="" disabled>—</option>
          {Object.keys(COUNTRIES).map((c) => <option key={c} value={c}>{countryName(c, language)}</option>)}
        </select>
      </label>
      <label className="block text-sm text-muted-foreground">{pt('fPhone', language)}
        <input aria-label={pt('fPhone', language)} dir="ltr" inputMode="tel" className={`${input} mt-1`} maxLength={20} value={f.phone} onChange={(e) => set('phone', e.target.value)} />
      </label>
      <label className="block text-sm text-muted-foreground">{pt('fAbout', language)}
        <textarea aria-label={pt('fAbout', language)} rows={4} className={`${input} mt-1`} maxLength={600} value={f.about} onChange={(e) => set('about', e.target.value)} />
        <span className="text-xs">{pt('fAboutHint', language)}</span>
      </label>
      <label className="block text-sm text-muted-foreground">{pt('fWebsite', language)}
        <input aria-label={pt('fWebsite', language)} dir="ltr" inputMode="url" className={`${input} mt-1`} maxLength={200} value={f.website} onChange={(e) => set('website', e.target.value)} />
      </label>
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input type="checkbox" aria-label={pt('fListed', language)} className="mt-1" checked={f.listed} onChange={(e) => set('listed', e.target.checked)} />
        <span>{pt('fListed', language)}</span>
      </label>
      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-accent py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60">
        {busy ? pt('sending', language) : pt('submit', language)}
      </button>
    </form>
  );
}
