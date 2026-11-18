'use client';
import { VerifiedBadge } from '@/components/verified-badge';
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { countryName, pt } from '@/lib/partners-i18n';
import { pp } from '@/lib/partner-projects-i18n';
import { PROJECT_KINDS } from '@/lib/partner-projects';
import { ProjectDetailModal, type PublicProject } from './project-detail-modal';

const field = 'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent';

/** Pure filter used by the grid (exported for tests). */
export function filterProjects(list: PublicProject[], f: { q: string; kind: string; country: string; installments: boolean }): PublicProject[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => (!f.kind || p.kind === f.kind) && (!f.country || p.country === f.country) && (!f.installments || p.hasInstallments)
    && (!q || `${p.title} ${p.city} ${p.company}`.toLowerCase().includes(q)));
}

// The public list of approved projects, with search, filters and a detail window.
export function ProjectShowcase({ language, onLoaded }: { language: string; onLoaded?: (list: PublicProject[]) => void }) {
  const [list, setList] = useState<PublicProject[] | null>(null);
  const [f, setF] = useState({ q: '', kind: '', country: '', installments: false });
  const [open, setOpen] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/partners/showcase').then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => { if (!alive) return; const l = Array.isArray(d.projects) ? (d.projects as PublicProject[]) : []; setList(l); onLoaded?.(l); })
      .catch(() => { if (alive) setList([]); });
    return () => { alive = false; };
  }, [onLoaded]);

  const countries = useMemo(() => Array.from(new Set((list ?? []).map((p) => p.country))).sort(), [list]);
  const shown = useMemo(() => filterProjects(list ?? [], f), [list, f]);

  if (list === null) return <p className="text-sm text-muted-foreground">{pt('loading', language)}</p>;
  if (list.length === 0) return <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">{pp('showcaseEmpty', language)}</p>;

  return (
    <section>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input aria-label={pp('searchPh', language)} placeholder={pp('searchPh', language)} className={`${field} w-full ps-9`} value={f.q} onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))} />
        </label>
        <select aria-label={pp('fKind', language)} className={field} value={f.kind} onChange={(e) => setF((p) => ({ ...p, kind: e.target.value }))}>
          <option value="">{pp('allKinds', language)}</option>
          {PROJECT_KINDS.map((k) => <option key={k} value={k}>{pp(`k_${k}`, language)}</option>)}
        </select>
        <select aria-label={pp('fCountry', language)} className={field} value={f.country} onChange={(e) => setF((p) => ({ ...p, country: e.target.value }))}>
          <option value="">{pp('allCountries', language)}</option>
          {countries.map((c) => <option key={c} value={c}>{countryName(c, language)}</option>)}
        </select>
      </div>
      <label className="mb-4 inline-flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={f.installments} onChange={(e) => setF((p) => ({ ...p, installments: e.target.checked }))} />{pp('onlyInstallments', language)}
      </label>

      {shown.length === 0 ? <p className="text-sm text-muted-foreground">{pp('noResults', language)}</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <button key={p.id} type="button" onClick={() => setOpen(p.id)} className="group overflow-hidden rounded-xl border border-border bg-card text-start transition hover:border-accent">
              <div className="relative aspect-[16/10] bg-muted">
                {p.images[0] && <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
                <span className="absolute start-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-xs font-semibold text-white">{pp(`k_${p.kind}` as 'k_other', language)}</span>
                {p.lowestMonthly !== null && <span className="absolute bottom-2 start-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{pp('fromMonthly', language).replace('{n}', formatMoney(p.lowestMonthly, p.currency, language))}</span>}
              </div>
              <div className="space-y-1 p-3">
                <h3 className="truncate font-semibold text-foreground">{p.title}</h3>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /><span className="truncate">{p.city}, {countryName(p.country, language)}</span></p>
                <p className="text-lg font-bold text-accent">{formatMoney(p.price, p.currency, language)}</p>
                <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"><span className="truncate">{pp('byPartner', language)} {p.company}</span><VerifiedBadge language={language} size={14} /></p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && <ProjectDetailModal id={open} language={language} onClose={() => setOpen('')} />}
    </section>
  );
}
