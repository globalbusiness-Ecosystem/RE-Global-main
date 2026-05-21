'use client';

import { FileText, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface OffPlanPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const offplanProperties = [
  {
    id: 'offplan-1',
    titleEn: 'Luxury Tower Dubai Pre-Construction',
    titleAr: 'برج فاخر دبي قيد الإنشاء',
    price: 750000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-2',
    titleEn: 'Waterfront Complex Marina',
    titleAr: 'مجمع واجهة بحرية قيد الإنشاء',
    price: 650000,
    city: 'Dubai Marina',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 290,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-3',
    titleEn: 'New City Development Abu Dhabi',
    titleAr: 'تطوير مدينة جديدة أبو ظبي',
    price: 580000,
    city: 'Abu Dhabi',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 260,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-4',
    titleEn: 'Smart City Project Egypt',
    titleAr: 'مشروع مدينة ذكية مصر',
    price: 420000,
    city: 'New Cairo',
    country: 'EG',
    countryFlag: '🇪🇬',
    bedrooms: 3,
    area: 240,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-5',
    titleEn: 'Eco-City Development Thailand',
    titleAr: 'تطوير مدينة بيئية تايلاند',
    price: 380000,
    city: 'Bangkok',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 3,
    area: 220,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-6',
    titleEn: 'Tech Hub Development Singapore',
    titleAr: 'تطوير مركز التكنولوجيا سنغافورة',
    price: 600000,
    city: 'Singapore',
    country: 'SG',
    countryFlag: '🇸🇬',
    bedrooms: 3,
    area: 270,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'offplan-7',
    titleEn: 'Mixed-Use Complex KL Malaysia',
    titleAr: 'مجمع استخدام مختلط كوالالمبور',
    price: 480000,
    city: 'Kuala Lumpur',
    country: 'MY',
    countryFlag: '🇲🇾',
    bedrooms: 2,
    area: 180,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
];

export default function OffPlanPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: OffPlanPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
  const activeTourProperty = offplanProperties.find((p) => p.id === activeTourId);
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
          {language === 'en' ? 'Off-Plan Properties' : 'العقارات قيد الإنشاء'}
        </h1>
      </div>

      <div className="space-y-4">
        {offplanProperties.map((property) => (
          <div key={property.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={property.image}
                alt={property.titleEn}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-secondary/90 rounded-full p-2 backdrop-blur">
                <FileText className="w-4 h-4 text-secondary-foreground" />
              </div>
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
                    {language === 'en' ? 'Starting Price' : 'السعر الابتدائي'}
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
                      category: 'offplan',
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
