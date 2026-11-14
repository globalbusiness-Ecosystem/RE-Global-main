'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Mail } from 'lucide-react';
import { useSiteContent } from '@/lib/useSiteContent';
import { qs } from '@/lib/scanner-labels';
import { pt } from '@/lib/partners-i18n';
import { PartnerHub } from '@/components/partners/partner-hub';

interface PartnersPageProps {
  language: NavLanguage;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Partners: the partner hub (apply, dashboard, directory) and, below it, the logos the team added from the admin panel.
export default function PartnersPage({ language, onBack, showBackButton }: PartnersPageProps) {
  const { items: partners } = useSiteContent<any>('partners');
  const arabic = language === 'ar';
  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        {showBackButton && (
          <button onClick={onBack} aria-label={pt('back', language)} className="p-2 hover:bg-muted rounded transition flex-shrink-0">
            <span className="text-muted-foreground text-lg rtl:rotate-180 inline-block">←</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-accent">{pt('title', language)}</h1>
      </div>
      <p className="text-muted-foreground mb-6">{pt('tagline', language)}</p>

      <PartnerHub language={language} />

      {partners.length > 0 && (
        <section className="mt-10">
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
    </main>
  );
}
