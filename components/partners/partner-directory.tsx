'use client';
import { useEffect, useState } from 'react';
import { ROLE_META } from './partner-types';
import { IconBadge } from '@/components/ui/icon-badge';
import { pt, countryName } from '@/lib/partners-i18n';
import type { PartnerRole } from '@/lib/partners';

type Row = { role: PartnerRole; company: string; country: string; about: string; website: string };

// Approved partners who agreed to be listed.
export function PartnerDirectory({ language }: { language: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/partners/directory').then((r) => (r.ok ? r.json() : { partners: [] })).then((d) => { if (alive) setRows(Array.isArray(d.partners) ? d.partners : []); }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, []);
  if (rows === null) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{pt('directoryT', language)}</h2>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">{pt('directoryEmpty', language)}</p> : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((p, i) => (
            <article key={`${p.company}-${i}`} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <IconBadge icon={ROLE_META[p.role]?.icon ?? ROLE_META.broker.icon} />
                <div className="min-w-0"><h3 className="truncate font-semibold text-foreground">{p.company}</h3><p className="text-xs text-muted-foreground">{pt(ROLE_META[p.role]?.name ?? 'broker', language)} · {countryName(p.country, language)}</p></div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.about}</p>
              {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-block text-sm text-accent hover:underline">{pt('visit', language)}</a>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
