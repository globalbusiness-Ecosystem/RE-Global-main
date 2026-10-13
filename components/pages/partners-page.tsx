'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Users, Building2, Mail, Phone } from 'lucide-react';
import { useSiteContent } from '@/lib/useSiteContent';

interface PartnersPageProps {
  language: NavLanguage;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function PartnersPage({ language, onBack, showBackButton }: PartnersPageProps) {
  const { items: partners, loading } = useSiteContent<any>('partners');
  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded transition flex-shrink-0"
          >
            <span className="text-gray-400 text-lg">←</span>
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-accent">
            {language === 'en' ? 'Our Partners' : 'شركاؤنا'}
          </h1>
        </div>
      </div>
      <p className="text-gray-300 mb-6">
        {language === 'en'
          ? 'Trusted real estate partners worldwide'
          : 'شركاء العقارات الموثوقين في جميع أنحاء العالم'}
      </p>

      {!loading && partners.length === 0 && (
        <p className="text-gray-400 text-center py-8">{language === 'ar' ? 'الشركاء قريباً' : 'Partners coming soon'}</p>
      )}

      <div className="space-y-4">
        {partners.map((partner: any) => (
          <div key={partner.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
            {partner.logo && (
              <div className="h-40 bg-muted overflow-hidden">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
            )}

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'ar' ? partner.nameAr || partner.name : partner.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'ar' ? partner.descriptionAr || partner.description : partner.description}
                </p>
              </div>

              <div className="space-y-2 py-3 border-t border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground truncate">{partner.contact}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {partner.contact && (
                  <a
                    href={partner.contact.includes('@') ? `mailto:${partner.contact}` : `tel:${partner.contact}`}
                    className="flex-1 bg-accent text-accent-foreground rounded-lg py-2 font-medium hover:opacity-90 transition text-sm text-center"
                  >
                    {language === 'en' ? 'Contact' : 'اتصل'}
                  </a>
                )}
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm text-center"
                  >
                    {language === 'en' ? 'Visit' : 'زيارة'}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card border border-border rounded-lg p-6 mb-4">
        <h3 className="text-lg font-semibold text-accent mb-4">
          {language === 'en' ? 'Become a Partner' : 'كن شريكًا'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'en'
            ? 'Join RE Platform and grow your real estate business'
            : 'انضم إلى منصة RE وطور أعمالك العقارية'}
        </p>
        <button className="w-full bg-accent text-accent-foreground rounded-lg py-3 font-medium hover:opacity-90 transition">
          {language === 'en' ? 'Apply Now' : 'تقديم الطلب الآن'}
        </button>
      </div>
    </main>
  );
}
