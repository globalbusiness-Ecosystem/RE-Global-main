'use client';
import { VerifiedBadge } from '@/components/verified-badge';
import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Phone, Mail } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { countryName, pt } from '@/lib/partners-i18n';
import { pp } from '@/lib/partner-projects-i18n';
import type { InstallmentPlan } from '@/lib/partner-projects';
import { InstallmentTable } from './installment-table';
import { ROLE_META } from './partner-types';
import type { PartnerRole } from '@/lib/partners';

export type PublicProject = {
  id: string; company: string; role: PartnerRole; title: string; description: string; kind: string; country: string; city: string; price: number; currency: string;
  images: string[]; lowestMonthly: number | null; hasInstallments: boolean; contact?: string; plansView?: (InstallmentPlan & Record<string, number>)[];
};

// The full public view of one approved project: gallery, description, partner, instalment tables and the contact the partner chose to show.
export function ProjectDetailModal({ id, language, onClose }: { id: string; language: string; onClose: () => void }) {
  const [p, setP] = useState<PublicProject | null>(null);
  const [failed, setFailed] = useState(false);
  const [shot, setShot] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/partners/showcase?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('x'))))
      .then((d) => { if (alive) setP(d.project as PublicProject); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const meta = p ? ROLE_META[p.role] ?? ROLE_META.broker : null;
  const isMail = !!p?.contact && p.contact.includes('@');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p?.title ?? pp('viewDetails', language)} onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card sm:max-w-2xl sm:rounded-2xl">
        <button ref={closeRef} type="button" onClick={onClose} aria-label={pp('close', language)} className="absolute end-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"><X className="h-5 w-5" aria-hidden /></button>
        {!p && !failed && <p className="p-8 text-center text-sm text-muted-foreground">{pt('loading', language)}</p>}
        {failed && <p className="p-8 text-center text-sm text-red-400">{pp('loadFailed', language)}</p>}
        {p && meta && (
          <>
            <div className="aspect-[16/10] w-full bg-muted">
              {p.images[shot] && <img src={p.images[shot]} alt={`${p.title} — ${pp('photoN', language)} ${shot + 1}`} className="h-full w-full object-cover" />}
            </div>
            {p.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 pt-3">
                {p.images.map((u, i) => (
                  <button key={u} type="button" onClick={() => setShot(i)} aria-label={`${pp('photoN', language)} ${i + 1}`} aria-current={i === shot}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${i === shot ? 'border-accent' : 'border-transparent opacity-70'}`}>
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-4 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">{pp(`k_${p.kind}` as 'k_other', language)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden />{p.city}, {countryName(p.country, language)}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-foreground">{p.title}</h2>
                <p className="mt-1 text-2xl font-bold text-accent">{formatMoney(p.price, p.currency, language)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pp('byPartner', language)} <span className="font-medium text-foreground">{p.company}</span> <VerifiedBadge language={language} size={15} className="align-[-3px]" /> · {pt(meta.name, language)}</p>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{p.description}</p>
              <section>
                <h3 className="mb-2 font-semibold text-foreground">{pp('plansTitle', language)}</h3>
                {!p.plansView?.length ? <p className="text-sm text-muted-foreground">{pp('noPlans', language)}</p> : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {p.plansView.map((pl, i) => <InstallmentTable key={i} price={p.price} currency={p.currency} plan={{ label: pl.label, downPct: pl.downPct, months: pl.months, extraPct: pl.extraPct }} language={language} />)}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{pp('plansNote', language)}</p>
                  </>
                )}
              </section>
              {p.contact && (
                <a href={isMail ? `mailto:${p.contact}` : `tel:${p.contact.replace(/\s+/g, '')}`} className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground hover:opacity-90">
                  {isMail ? <Mail className="h-4 w-4" aria-hidden /> : <Phone className="h-4 w-4" aria-hidden />}{pp('contactTitle', language)}: <span dir="ltr">{p.contact}</span>
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
