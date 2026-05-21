'use client';

import { Users, Building2, Mail, Phone } from 'lucide-react';

interface PartnersPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
  showBackButton?: boolean;
}

const partners = [
  {
    id: 'partner-1',
    nameEn: 'Global Real Estate Partners',
    nameAr: 'شركاء العقارات العالمية',
    descriptionEn: 'Leading international property developers',
    descriptionAr: 'مطورو الممتلكات الدوليين الرائدين',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    contact: 'partner1@replatform.com',
  },
  {
    id: 'partner-2',
    nameEn: 'Premier Investments LLC',
    nameAr: 'استثمارات بريمير',
    descriptionEn: 'Luxury property investment specialists',
    descriptionAr: 'متخصصو استثمار الممتلكات الفاخرة',
    logo: 'https://images.unsplash.com/photo-1560264357-8d9766a64d97?w=400&h=300&fit=crop',
    contact: 'investments@replatform.com',
  },
  {
    id: 'partner-3',
    nameEn: 'Urban Development Group',
    nameAr: 'مجموعة التطوير الحضري',
    descriptionEn: 'Smart city and sustainable projects',
    descriptionAr: 'مشاريع المدن الذكية والمستدامة',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    contact: 'urban@replatform.com',
  },
  {
    id: 'partner-4',
    nameEn: 'Asia Pacific Properties',
    nameAr: 'خصائص آسيا والمحيط الهادئ',
    descriptionEn: 'Asian market real estate specialists',
    descriptionAr: 'متخصصو العقارات في السوق الآسيوية',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    contact: 'asia@replatform.com',
  },
  {
    id: 'partner-5',
    nameEn: 'European Heritage Homes',
    nameAr: 'منازل التراث الأوروبي',
    descriptionEn: 'Historic and premium European properties',
    descriptionAr: 'الممتلكات الأوروبية التاريخية والممتازة',
    logo: 'https://images.unsplash.com/photo-1560264357-8d9766a64d97?w=400&h=300&fit=crop',
    contact: 'europe@replatform.com',
  },
  {
    id: 'partner-6',
    nameEn: 'Crypto Real Estate Fund',
    nameAr: 'صندوق العقارات المشفرة',
    descriptionEn: 'Blockchain-based property investments',
    descriptionAr: 'استثمارات الممتلكات المستندة إلى البلوك تشين',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    contact: 'crypto@replatform.com',
  },
  {
    id: 'partner-7',
    nameEn: 'Luxury Resorts International',
    nameAr: 'المنتجعات الفاخرة الدولية',
    descriptionEn: 'High-end hotel and resort developments',
    descriptionAr: 'تطوير الفنادق والمنتجعات عالية الجودة',
    logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
    contact: 'resorts@replatform.com',
  },
];

export default function PartnersPage({ language, onBack, showBackButton }: PartnersPageProps) {
  return (
    <main className="px-4 py-6 max-w-md mx-auto">
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

      <div className="space-y-4">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-muted overflow-hidden">
              <img
                src={partner.logo}
                alt={partner.nameEn}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'en' ? partner.nameEn : partner.nameAr}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en' ? partner.descriptionEn : partner.descriptionAr}
                </p>
              </div>

              <div className="space-y-2 py-3 border-t border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground truncate">{partner.contact}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-accent text-accent-foreground rounded-lg py-2 font-medium hover:opacity-90 transition text-sm">
                  {language === 'en' ? 'Contact' : 'اتصل'}
                </button>
                <button className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm">
                  {language === 'en' ? 'Visit' : 'زيارة'}
                </button>
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
