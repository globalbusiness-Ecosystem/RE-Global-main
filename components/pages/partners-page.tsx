'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useSiteContent } from '@/lib/useSiteContent';
import { qs } from '@/lib/scanner-labels';
import { pt } from '@/lib/partners-i18n';
import { PartnerHub } from '@/components/partners/partner-hub';
import { PartnerDirectory } from '@/components/partners/partner-directory';
import { ProjectShowcase } from '@/components/partners/project-showcase';
import type { PublicProject } from '@/components/partners/project-detail-modal';
import { pp } from '@/lib/partner-projects-i18n';

interface PartnersPageProps {
  language: NavLanguage;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Partners: a hero, then three tabs - the public project showcase, the partner directory (with the logos the team added) and join / my account.
type Tab = 'projects' | 'partners' | 'join';
const TABS: { id: Tab; label: 'tabProjects' | 'tabPartners' | 'tabJoin' }[] = [{ id: 'projects', label: 'tabProjects' }, { id: 'partners', label: 'tabPartners' }, { id: 'join', label: 'tabJoin' }];

export default function PartnersPage({ language, onBack, showBackButton }: PartnersPageProps) {
  const { items: partners } = useSiteContent<any>('partners');
  const arabic = language === 'ar';
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const countries = new Set(projects.map((p) => p.country)).size;
  const withPlans = projects.filter((p) => p.hasInstallments).length;
  const stats: [number, 'statProjects' | 'statCountries' | 'statInstallments'][] = [[projects.length, 'statProjects'], [countries, 'statCountries'], [withPlans, 'statInstallments']];
  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
      <header className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/20 via-card to-card p-5">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button onClick={onBack} aria-label={pt('back', language)} className="p-2 hover:bg-muted rounded transition flex-shrink-0">
              <span className="text-muted-foreground text-lg rtl:rotate-180 inline-block">←</span>
            </button>
          )}
          <h1 className="text-3xl font-bold text-accent">{pt('title', language)}</h1>
        </div>
        <p className="mt-2 text-foreground">{pt('tagline', language)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{pp('heroLine', language)}</p>
        {projects.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {stats.map(([n, k]) => (
              <div key={k} className="rounded-xl bg-background/60 p-3 text-center">
                <dd className="text-2xl font-bold text-foreground">{n}</dd>
                <dt className="text-xs text-muted-foreground">{pp(k, language)}</dt>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div role="tablist" aria-label={pt('title', language)} className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`partners-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`partners-panel-${t.id}`} onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${tab === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {pp(t.label, language)}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="partners-panel-projects" aria-labelledby="partners-tab-projects" hidden={tab !== 'projects'}>
        <ProjectShowcase language={language} onLoaded={setProjects} />
      </div>
      <div role="tabpanel" id="partners-panel-partners" aria-labelledby="partners-tab-partners" hidden={tab !== 'partners'}>
        <PartnerDirectory language={language} />
        {partners.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{pt('showcase', language)}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {partners.map((partner: any) => (
                <div key={partner.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  {partner.logo && <div className="h-40 bg-muted overflow-hidden"><img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" /></div>}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{arabic ? partner.nameAr || partner.name : partner.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{arabic ? partner.descriptionAr || partner.description : partner.description}</p>
                    </div>
                    {partner.contact && (
                      <div className="flex items-center gap-2 text-sm border-t border-border pt-3"><Mail className="w-4 h-4 text-accent" aria-hidden /><span className="text-muted-foreground truncate">{partner.contact}</span></div>
                    )}
                    <div className="flex gap-2">
                      {partner.contact && <a href={partner.contact.includes('@') ? `mailto:${partner.contact}` : `tel:${partner.contact}`} className="flex-1 bg-accent text-accent-foreground rounded-lg py-2 font-medium hover:opacity-90 transition text-sm text-center">{qs('contact', language)}</a>}
                      {partner.website && <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm text-center">{qs('visit', language)}</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <div role="tabpanel" id="partners-panel-join" aria-labelledby="partners-tab-join" hidden={tab !== 'join'}>
        <PartnerHub language={language} showDirectory={false} />
      </div>
    </main>
  );
}
