'use client';

import { useEffect, useState } from 'react';
import { useAnnouncements } from '@/hooks/use-announcements';
import { visibleAnnouncements, type Announcement } from '@/lib/announcements';
import { ANN_EMOJI, ANN_KIND, ANN_UI, annText } from '@/lib/announcements-i18n';
import { embedUrl, parseVideoUrl, videoThumb } from '@/lib/video-embed';
import { pickText } from '@/lib/home-features';
import type { NavLanguage } from '@/lib/nav-i18n';

const today = () => new Date().toISOString().slice(0, 10);

function fmtDate(d: string, language: string) {
  try { return new Date(d + 'T00:00:00Z').toLocaleDateString(language === 'zh' ? 'zh-CN' : language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); } catch { return d; }
}

function VideoModal({ url, title, language, onClose }: { url: string; title: string; language: NavLanguage; onClose: () => void }) {
  const ref = parseVideoUrl(url);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  if (!ref) return null;
  const src = embedUrl(ref);
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between text-white">
          <p className="truncate text-sm font-semibold" dir="auto">{title}</p>
          <button type="button" onClick={onClose} className="rounded-full bg-white/15 px-3 py-1 text-sm hover:bg-white/25">{annText(ANN_UI.close, language)} ✕</button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {src ? (
            <iframe src={src} title={title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          ) : ref.type === 'file' ? (
            <video src={ref.url} controls autoPlay playsInline className="h-full w-full" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HomeAnnouncements({ language, onCategoryClick }: { language: NavLanguage; onCategoryClick?: (id: string) => void }) {
  const board = useAnnouncements();
  const [playing, setPlaying] = useState<Announcement | null>(null);
  const items = visibleAnnouncements(board.items, today());
  if (!board.enabled || items.length === 0) return null;

  const open = (a: Announcement) => {
    if (a.video && !a.link) { setPlaying(a); return; }
    if (!a.link) return;
    if (a.link.startsWith('page:')) onCategoryClick?.(a.link.slice(5));
    else window.open(a.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="mb-12" aria-label={board.title ? pickText(board.title, language) : annText(ANN_UI.title, language)}>
      <h3 className="mb-4 text-lg font-semibold tracking-wide text-foreground">{board.title ? pickText(board.title, language) : annText(ANN_UI.title, language)}</h3>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {items.map((a, i) => {
          const ref = a.video ? parseVideoUrl(a.video) : null;
          const img = a.img || (ref ? videoThumb(ref) : null);
          const title = pickText(a.t, language);
          const text = a.d ? pickText(a.d, language) : '';
          const label = a.linkLabel ? pickText(a.linkLabel, language) : annText(ANN_UI.learnMore, language);
          const dateTxt = a.date ? `${annText(a.kind === 'offer' ? ANN_UI.endsOn : ANN_UI.onDate, language)} ${fmtDate(a.date, language)}` : '';
          return (
            <article key={i} className="relative h-56 w-[78%] max-w-sm shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card sm:w-72">
              {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
              <div aria-hidden className={`absolute inset-0 ${img ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/10' : 'bg-gradient-to-br from-accent/30 to-transparent'}`} />
              <span className="absolute start-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-black">{ANN_EMOJI[a.kind]} {annText(ANN_KIND[a.kind], language)}</span>
              {dateTxt && <span className="absolute end-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">{dateTxt}</span>}
              {a.video && (
                <button type="button" aria-label={`${annText(ANN_UI.watch, language)}: ${title}`} onClick={() => setPlaying(a)} className="absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-black shadow-lg">▶</button>
              )}
              <div className={`absolute inset-x-0 bottom-0 p-3 ${img ? 'text-white' : 'text-foreground'}`}>
                <h4 className="line-clamp-2 text-base font-bold leading-tight" dir="auto">{title}</h4>
                {text && <p className="mt-1 line-clamp-2 text-xs opacity-90" dir="auto">{text}</p>}
                {a.link && (
                  <button type="button" onClick={() => open(a)} className="mt-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black hover:bg-white">{label}</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {playing?.video && <VideoModal url={playing.video} title={pickText(playing.t, language)} language={language} onClose={() => setPlaying(null)} />}
    </section>
  );
}
