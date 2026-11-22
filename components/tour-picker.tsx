'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { NavLanguage } from '@/lib/nav-i18n';
import type { ToursState } from '@/lib/use-tours';
import { TOUR_PICKER_I18N } from '@/lib/tour-picker-i18n';
import { PanoramaModal } from '@/components/panorama-modal';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

// The one home entry for tours: the listings the admin gave a 360 link, then (only while sample content is on) the built-in sample tour.
export function TourPicker({ tours, language, onClose }: { tours: ToursState; language: NavLanguage; onClose: () => void }) {
  const t = TOUR_PICKER_I18N[language] ?? TOUR_PICKER_I18N.en;
  const [open, setOpen] = useState<{ url: string; title: string } | 'sample' | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  if (open === 'sample') return <VRPropertyTourViewer property={DEMO_PROPERTY} onClose={() => setOpen(null)} />;
  if (open) return <PanoramaModal url={open.url} title={open.title} language={language} onClose={() => setOpen(null)} />;

  const name = (i: ToursState['items'][number]) => (language === 'ar' && i.titleAr ? i.titleAr : i.title);
  const where = (i: ToursState['items'][number]) => (language === 'ar' && i.locationAr ? i.locationAr : i.location);
  const row = 'flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start hover:border-accent';
  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-background" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="flex items-center justify-between gap-3 border-b border-border p-3">
        <h2 className="text-base font-semibold text-foreground">🎥 {t.title}</h2>
        <button type="button" onClick={onClose} aria-label={t.close} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5 text-foreground" /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {tours.items.map((i) => (
          <button key={i.id} type="button" className={row} onClick={() => setOpen({ url: i.vrUrl, title: name(i) })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {i.image ? <img src={i.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <span className="h-14 w-14 shrink-0 rounded-lg bg-muted" aria-hidden />}
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{name(i)}</span><span className="block truncate text-xs text-muted-foreground">{where(i)}</span></span>
            <span className="text-xs text-accent">{t.open}</span>
          </button>
        ))}
        {tours.demo ? (
          <button type="button" className={row} onClick={() => setOpen('sample')}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl" aria-hidden>🏙️</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{t.sample}</span><span className="block text-xs text-muted-foreground">{t.sampleNote}</span></span>
            <span className="text-xs text-accent">{t.open}</span>
          </button>
        ) : null}
        {tours.items.length === 0 && !tours.demo ? <p className="p-6 text-center text-sm text-muted-foreground">{t.empty}</p> : null}
      </div>
    </div>
  );
}
