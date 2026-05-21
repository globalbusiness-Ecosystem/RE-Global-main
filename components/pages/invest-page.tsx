'use client';

import { MapPin, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface InvestPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const investProperties = [
  {
    id: 'invest-1',
    titleEn: 'Commercial Complex Dubai',
    titleAr: 'مجمع تجاري دبي',
    price: 2500000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 12,
    area: 5000,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'invest-2',
    titleEn: 'Office Tower Manhattan',
    titleAr: 'برج مكاتب مانهاتن',
    price: 3800000,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 20,
    area: 8000,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'invest-3',
    titleEn: 'Retail Mall Bangkok',
    titleAr: 'مول البيع بالتجزئة بانكوك',
    price: 1800000,
    city: 'Bangkok',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 15,
    area: 6000,
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop',
  },
  {
    id: 'invest-4',
    titleEn: 'Business Park London',
    titleAr: 'حديقة الأعمال لندن',
    price: 2200000,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 18,
    area: 7200,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
  },
  {
    id: 'invest-5',
    titleEn: 'Mixed Use Development Singapore',
    titleAr: 'تطوير الاستخدام المختلط سنغافورة',
    price: 2100000,
    city: 'Singapore',
    country: 'SG',
    countryFlag: '🇸🇬',
    bedrooms: 16,
    area: 6500,
    image: 'https://images.unsplash.com/photo-1541888046-540a88dba118?w=400&h=300&fit=crop',
  },
  {
    id: 'invest-6',
    titleEn: 'Tech Hub Seoul',
    titleAr: 'مركز التكنولوجيا سيول',
    price: 1950000,
    city: 'Seoul',
    country: 'KR',
    countryFlag: '🇰🇷',
    bedrooms: 14,
    area: 5800,
    image: 'https://images.unsplash.com/photo-1486326612027-8081e485255e?w=400&h=300&fit=crop',
  },
  {
    id: 'invest-7',
    titleEn: 'Financial District Toronto',
    titleAr: 'الحي المالي تورونتو',
    price: 1750000,
    city: 'Toronto',
    country: 'CA',
    countryFlag: '🇨🇦',
    bedrooms: 13,
    area: 5500,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  },
];

export default function InvestPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: InvestPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
  const activeTourProperty = investProperties.find((p) => p.id === activeTourId);
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
        <h1 className="text-3xl font-bold text-accent">
          {language === 'en' ? 'Investment Properties' : 'العقارات الاستثمارية'}
        </h1>
      </div>

      <div className="space-y-4">
        {investProperties.map((property) => (
          <div key={property.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={property.image}
                alt={property.titleEn}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
              <button
                onClick={() => toggleFavorite(property.id)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-2 transition backdrop-blur"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(property.id)
                      ? 'fill-accent text-accent'
                      : 'text-white'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {property.countryFlag} {property.city}, {property.country}
                </p>
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {language === 'en' ? property.titleEn : property.titleAr}
                </h3>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-border">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{property.area}m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'en' ? 'Price' : 'السعر'}
                  </p>
                  <p className="text-lg font-bold text-accent">
                    {property.price.toLocaleString()} {currency}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <UnifiedPaymentButton
                  propertyId={property.id}
                  propertyTitle={language === 'en' ? property.titleEn : property.titleAr}
                  price={property.price}
                  transactionType="invest"
                  language={language}
                  currency={currency}
                  className="flex-1"
                />
                <button 
                  onClick={() => {
                    sessionStorage.setItem('focusProperty', JSON.stringify({
                      lat: 0,
                      lng: 0,
                      title: language === 'en' ? property.titleEn : property.titleAr,
                      price: property.price,
                      category: 'invest',
                      id: property.id,
                      city: property.city,
                      country: property.country,
                      countryFlag: property.countryFlag,
                      bedrooms: property.bedrooms,
                      area: property.area,
                      image: property.image,
                    }));
                    window.dispatchEvent(new CustomEvent('navigateToPage', { detail: 'map' }));
                  }}
                  className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm"
                  title={language === 'en' ? 'View on Map' : 'اعرض على الخريطة'}
                >
                  📍
                </button>
                <button 
                  onClick={() => setActiveTourId(property.id)}
                  className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm"
                  title={language === 'en' ? 'Virtual Tour' : 'جولة افتراضية'}
                >
                  <Video className="w-4 h-4 inline mr-1" />
                  {language === 'en' ? 'Tour' : 'جولة'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VR Tour Modal */}
      {activeTourProperty && (
        <VRPropertyTourViewer
          property={DEMO_PROPERTY}
          onClose={() => setActiveTourId(null)}
          onBuyClick={() => {
            alert('Buy with Pi feature - Integrate with Pi payment SDK');
          }}
        />
      )}
    </main>
  );
}
