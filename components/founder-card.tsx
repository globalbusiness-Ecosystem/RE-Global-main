'use client';

import { useFounder } from '@/hooks/use-founder';
import { founderVisible } from '@/lib/founder';
import { FOUNDER_UI, founderText } from '@/lib/founder-i18n';
import { pickText } from '@/lib/home-features';
import { VerifiedBadge } from '@/components/verified-badge';
import type { NavLanguage } from '@/lib/nav-i18n';

// "Meet the founder" on the About page: the photo and words the admin wrote. Nothing shows until a name is saved.
export function FounderCard({ language }: { language: NavLanguage }) {
  const f = useFounder();
  if (!founderVisible(f)) return null;
  const role = f.role ? pickText(f.role, language) : '';
  const bio = f.bio ? pickText(f.bio, language) : '';
  const quote = f.quote ? pickText(f.quote, language) : '';
  return (
    <section aria-label={founderText(FOUNDER_UI.title, language)}>
      <h2 className="mb-4 text-xl font-bold text-foreground">{founderText(FOUNDER_UI.title, language)}</h2>
      <div className="rounded-2xl border border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/10 to-transparent p-5">
        <div className="mb-4 flex items-center gap-4">
          {f.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.photoUrl} alt={f.name ?? ''} loading="lazy" className="h-24 w-24 shrink-0 rounded-full border-2 border-[#d4af37] object-cover" />
          ) : (
            <div aria-hidden className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#d4af37] bg-card text-3xl">👤</div>
          )}
          <div className="min-w-0">
            <h3 className="flex min-w-0 items-center gap-1.5 text-lg font-bold text-foreground"><span className="truncate">{f.name}</span><VerifiedBadge language={language} size={20} /></h3>
            <span className="mt-1 inline-block rounded-full bg-[#d4af37] px-2.5 py-0.5 text-[11px] font-bold text-black">👑 {founderText(FOUNDER_UI.chip, language)}</span>
            {role && <p className="mt-1 text-sm text-muted-foreground" dir="auto">{role}</p>}
          </div>
        </div>
        {bio && <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground" dir="auto">{bio}</p>}
        {quote && <blockquote className="mt-4 border-s-4 border-[#d4af37] ps-3 text-sm italic text-foreground" dir="auto">“{quote}”</blockquote>}
        {(f.linkedin || f.website) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {f.linkedin && <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-accent/10">{founderText(FOUNDER_UI.linkedin, language)}</a>}
            {f.website && <a href={f.website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-accent/10">{founderText(FOUNDER_UI.website, language)}</a>}
          </div>
        )}
      </div>
    </section>
  );
}
