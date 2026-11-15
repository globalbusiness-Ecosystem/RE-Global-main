'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Star, Plus } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { COUNTRIES } from '@/lib/legal-profiles';
import { countryName } from '@/lib/partners-i18n';
import { pp, projectErrorKey } from '@/lib/partner-projects-i18n';
import { PROJECT_KINDS, PROJECT_CURRENCIES, MAX_IMAGES, MAX_PLANS, type InstallmentPlan, type ProjectKind, type ProjectCurrency, type ProjectStatus } from '@/lib/partner-projects';
import { InstallmentTable } from './installment-table';

export type MyProject = {
  id: string; title: string; description: string; kind: ProjectKind; country: string; city: string; price: number; currency: ProjectCurrency;
  images: string[]; contact: string; installments: InstallmentPlan[]; status: ProjectStatus; note: string; lowestMonthly: number | null;
};

const input = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent';
const label = 'block text-sm text-muted-foreground';
type PlanDraft = { label: string; downPct: string; months: string; extraPct: string };
const toDraft = (p: InstallmentPlan): PlanDraft => ({ label: p.label, downPct: String(p.downPct), months: String(p.months), extraPct: String(p.extraPct) });
const toPlan = (d: PlanDraft): InstallmentPlan | null => {
  const downPct = Number(d.downPct), months = Number(d.months), extraPct = d.extraPct === '' ? 0 : Number(d.extraPct);
  return Number.isFinite(downPct) && Number.isInteger(months) && months >= 2 && Number.isFinite(extraPct) ? { label: d.label, downPct, months, extraPct } : null;
};

// Create or edit one project: details, photos (uploaded one by one), instalment plans with a live preview.
export function PartnerProjectForm({ language, project, onDone, onCancel }: { language: string; project: MyProject | null; onDone: (msg: string) => void; onCancel: () => void }) {
  const { accessToken } = usePiAuth();
  const [f, setF] = useState({
    title: project?.title ?? '', description: project?.description ?? '', kind: project?.kind ?? '', country: project?.country ?? '', city: project?.city ?? '',
    price: project ? String(project.price) : '', currency: project?.currency ?? 'USD', contact: project?.contact ?? '',
  });
  const [images, setImages] = useState<string[]>(project?.images ?? []);
  const [plans, setPlans] = useState<PlanDraft[]>((project?.installments ?? []).map(toDraft));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const setPlan = (i: number, k: keyof PlanDraft, v: string) => setPlans((p) => p.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const price = Number(f.price);
  const auth = { Authorization: `Bearer ${accessToken}` };

  const upload = async (files: FileList | null) => {
    if (!files || !accessToken) return;
    setErr(''); setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, MAX_IMAGES - images.length)) {
        const fd = new FormData(); fd.append('file', file);
        const res = await fetch('/api/partners/upload', { method: 'POST', headers: auth, body: fd });
        const d = await res.json().catch(() => null);
        if (!res.ok || !d?.url) { setErr(pp(projectErrorKey(d?.error), language)); break; }
        setImages((p) => (p.length < MAX_IMAGES ? [...p, d.url as string] : p));
      }
    } catch { setErr(pp('e_generic', language)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const save = async (submit: boolean) => {
    if (busy || uploading || !accessToken) return;
    const parsedPlans = plans.map(toPlan);
    if (parsedPlans.some((p) => !p)) { setErr(pp('e_plan', language)); return; }
    if (submit && images.length === 0) { setErr(pp('e_no_images', language)); return; }
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/partners/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ ...f, price: f.price, images, installments: parsedPlans, submit, ...(project ? { id: project.id } : {}) }),
      });
      const d = await res.json().catch(() => null);
      if (res.ok) { onDone(pp(submit ? 'sentReview' : 'savedDraft', language)); return; }
      setErr(pp(projectErrorKey(d?.error, d?.field), language));
    } catch { setErr(pp('e_generic', language)); }
    finally { setBusy(false); }
  };

  const move = (i: number) => setImages((p) => [p[i], ...p.filter((_, j) => j !== i)]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(true); }} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold text-foreground">{pp(project ? 'editProject' : 'addProject', language)}</h3>
      {project?.status === 'approved' && <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-500">{pp('editWarn', language)}</p>}
      <label className={label}>{pp('fTitle', language)}
        <input aria-label={pp('fTitle', language)} className={`${input} mt-1`} maxLength={100} value={f.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label className={label}>{pp('fKind', language)}
        <select aria-label={pp('fKind', language)} className={`${input} mt-1`} value={f.kind} onChange={(e) => set('kind', e.target.value)}>
          <option value="" disabled>—</option>
          {PROJECT_KINDS.map((k) => <option key={k} value={k}>{pp(`k_${k}`, language)}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>{pp('fCountry', language)}
          <select aria-label={pp('fCountry', language)} className={`${input} mt-1`} value={f.country} onChange={(e) => set('country', e.target.value)}>
            <option value="" disabled>—</option>
            {Object.keys(COUNTRIES).map((c) => <option key={c} value={c}>{countryName(c, language)}</option>)}
          </select>
        </label>
        <label className={label}>{pp('fCity', language)}
          <input aria-label={pp('fCity', language)} className={`${input} mt-1`} maxLength={60} value={f.city} onChange={(e) => set('city', e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <label className={label}>{pp('fPrice', language)}
          <input aria-label={pp('fPrice', language)} dir="ltr" inputMode="decimal" className={`${input} mt-1`} value={f.price} onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, ''))} />
        </label>
        <label className={label}>{pp('fCurrency', language)}
          <select aria-label={pp('fCurrency', language)} className={`${input} mt-1`} value={f.currency} onChange={(e) => set('currency', e.target.value)}>
            {PROJECT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className={label}>{pp('fDesc', language)}
        <textarea aria-label={pp('fDesc', language)} rows={5} className={`${input} mt-1`} maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
        <span className="text-xs">{pp('fDescHint', language)}</span>
      </label>

      <div>
        <p className="text-sm font-medium text-foreground">{pp('photos', language)} ({images.length}/{MAX_IMAGES})</p>
        <p className="mb-2 text-xs text-muted-foreground">{pp('photosHint', language)}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((u, i) => (
            <div key={u} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={u} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute start-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">{pp('cover', language)}</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1">
                {i > 0 ? <button type="button" aria-label={pp('makeCover', language)} title={pp('makeCover', language)} onClick={() => move(i)} className="rounded p-1 text-white"><Star className="h-4 w-4" aria-hidden /></button> : <span />}
                <button type="button" aria-label={pp('remove', language)} title={pp('remove', language)} onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="rounded p-1 text-white"><Trash2 className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-60">
              <ImagePlus className="h-5 w-5" aria-hidden />{uploading ? pp('uploading', language) : pp('addPhotos', language)}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void upload(e.target.files)} />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">{pp('plans', language)}</p>
        <p className="mb-2 text-xs text-muted-foreground">{pp('plansHint', language)}</p>
        <div className="space-y-3">
          {plans.map((p, i) => {
            const plan = toPlan(p);
            return (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <input aria-label={pp('pLabel', language)} placeholder={pp('pLabel', language)} className={input} maxLength={40} value={p.label} onChange={(e) => setPlan(i, 'label', e.target.value)} />
                  <button type="button" aria-label={pp('remove', language)} onClick={() => setPlans((x) => x.filter((_, j) => j !== i))} className="rounded p-2 text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" aria-hidden /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs text-muted-foreground">{pp('pDown', language)}<input aria-label={pp('pDown', language)} dir="ltr" inputMode="decimal" className={`${input} mt-1`} value={p.downPct} onChange={(e) => setPlan(i, 'downPct', e.target.value.replace(/[^0-9.]/g, ''))} /></label>
                  <label className="text-xs text-muted-foreground">{pp('pMonths', language)}<input aria-label={pp('pMonths', language)} dir="ltr" inputMode="numeric" className={`${input} mt-1`} value={p.months} onChange={(e) => setPlan(i, 'months', e.target.value.replace(/\D/g, ''))} /></label>
                  <label className="text-xs text-muted-foreground">{pp('pExtra', language)}<input aria-label={pp('pExtra', language)} dir="ltr" inputMode="decimal" className={`${input} mt-1`} value={p.extraPct} onChange={(e) => setPlan(i, 'extraPct', e.target.value.replace(/[^0-9.]/g, ''))} /></label>
                </div>
                {plan && price > 0 && <InstallmentTable price={price} currency={f.currency} plan={plan} language={language} />}
              </div>
            );
          })}
          {plans.length < MAX_PLANS && (
            <button type="button" onClick={() => setPlans((p) => [...p, { label: '', downPct: '10', months: '60', extraPct: '0' }])} className="inline-flex items-center gap-1 rounded-lg border border-accent px-3 py-1.5 text-sm text-accent hover:bg-accent/10">
              <Plus className="h-4 w-4" aria-hidden />{pp('addPlan', language)}
            </button>
          )}
        </div>
      </div>

      <label className={label}>{pp('fContact', language)}
        <input aria-label={pp('fContact', language)} dir="ltr" className={`${input} mt-1`} maxLength={80} value={f.contact} onChange={(e) => set('contact', e.target.value)} />
        <span className="text-xs">{pp('fContactHint', language)}</span>
      </label>

      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy || uploading} className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60">{busy ? pp('saving', language) : pp('submitReview', language)}</button>
        <button type="button" disabled={busy || uploading} onClick={() => void save(false)} className="rounded-lg border border-border px-4 py-3 text-sm text-foreground hover:border-accent disabled:opacity-60">{pp('saveDraft', language)}</button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground">{pp('cancel', language)}</button>
      </div>
    </form>
  );
}
