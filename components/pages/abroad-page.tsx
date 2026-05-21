'use client';

import { Globe, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface AbroadPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const abroadProperties = [
  {
    id: 'abroad-1',
    titleEn: 'Historic Townhouse London',
    titleAr: 'دار تاريخية لندن',
    price: 450000,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 3,
    area: 240,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&fit=crop&q=80',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'abroad-2',
    titleEn: 'Parisian Apartment Paris',
    titleAr: 'شقة باريسية باريس',
    price: 520000,
    city: 'Paris',
    country: 'FR',
    countryFlag: '🇫🇷',
    bedrooms: 2,
    area: 140,
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&fit=crop&q=80',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'abroad-3',
    titleEn: 'Manhattan Loft New York',
    titleAr: 'لوفت مانهاتن نيويورك',
    price: 680000,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 130,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&fit=crop&q=80',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'abroad-4',
    titleEn: 'Traditional House Tokyo',
    titleAr: 'منزل تقليدي طوكيو',
    price: 590000,
    city: 'Tokyo',
    country: 'JP',
    countryFlag: '🇯🇵',
    bedrooms: 3,
    area: 180,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&fit=crop&q=80',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'abroad-5',
    titleEn: 'Luxury Condo Singapore',
    titleAr: 'شقة فاخرة سنغافورة',
    price: 520000,
    city: 'Singapore',
    country: 'SG',
    countryFlag: '🇸🇬',
    bedrooms: 2,
    area: 125,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-6',
    titleEn: 'Gothic Quarter Barcelona',
    titleAr: 'الحي القوطي برشلونة',
    price: 420000,
    city: 'Barcelona',
    country: 'ES',
    countryFlag: '🇪🇸',
    bedrooms: 2,
    area: 135,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-7',
    titleEn: 'Marina Penthouse Dubai',
    titleAr: 'بنتهاوس مارينا دبي',
    price: 580000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 260,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-8',
    titleEn: 'Beachfront Villa Sydney',
    titleAr: 'فيلا على الشاطئ سيدني',
    price: 650000,
    city: 'Sydney',
    country: 'AU',
    countryFlag: '🇦🇺',
    bedrooms: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-9',
    titleEn: 'Downtown Condo Toronto',
    titleAr: 'شقة وسط المدينة تورونتو',
    price: 480000,
    city: 'Toronto',
    country: 'CA',
    countryFlag: '🇨🇦',
    bedrooms: 2,
    area: 145,
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-10',
    titleEn: 'Canal House Amsterdam',
    titleAr: 'منزل القناة أمستردام',
    price: 510000,
    city: 'Amsterdam',
    country: 'NL',
    countryFlag: '🇳🇱',
    bedrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-11',
    titleEn: 'Palace Apartment Monaco',
    titleAr: 'شقة القصر موناكو',
    price: 850000,
    city: 'Monaco',
    country: 'MC',
    countryFlag: '🇲🇨',
    bedrooms: 2,
    area: 110,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-12',
    titleEn: 'Art Deco Penthouse Miami',
    titleAr: 'بنتهاوس آرت ديكو ميامي',
    price: 520000,
    city: 'Miami',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-13',
    titleEn: 'Alpine Chalet Zurich',
    titleAr: 'كوخ جبلي زيورخ',
    price: 720000,
    city: 'Zurich',
    country: 'CH',
    countryFlag: '🇨🇭',
    bedrooms: 3,
    area: 220,
    image: 'https://images.unsplash.com/photo-1613490493576-4d884d0b7f2e?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-14',
    titleEn: 'Victoria Peak Hong Kong',
    titleAr: 'ذروة فيكتوريا هونج كونج',
    price: 680000,
    city: 'Hong Kong',
    country: 'HK',
    countryFlag: '🇭🇰',
    bedrooms: 2,
    area: 100,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-15',
    titleEn: 'Kreuzberg Apartment Berlin',
    titleAr: 'شقة كروزبرج برلين',
    price: 380000,
    city: 'Berlin',
    country: 'DE',
    countryFlag: '🇩🇪',
    bedrooms: 2,
    area: 125,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-16',
    titleEn: 'Vatican Luxury Apartment Rome',
    titleAr: 'شقة فاخرة روما',
    price: 580000,
    city: 'Rome',
    country: 'IT',
    countryFlag: '🇮🇹',
    bedrooms: 2,
    area: 140,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-17',
    titleEn: 'Beachfront Bungalow Bali',
    titleAr: 'منزل على الشاطئ بالي',
    price: 280000,
    city: 'Bali',
    country: 'ID',
    countryFlag: '🇮🇩',
    bedrooms: 2,
    area: 160,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-18',
    titleEn: 'Table Mountain House Cape Town',
    titleAr: 'منزل جبل الطاولة كيب تاون',
    price: 350000,
    city: 'Cape Town',
    country: 'ZA',
    countryFlag: '🇿🇦',
    bedrooms: 3,
    area: 240,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-19',
    titleEn: 'Marine Drive Apartment Mumbai',
    titleAr: 'شقة درايف البحر مومباي',
    price: 420000,
    city: 'Mumbai',
    country: 'IN',
    countryFlag: '🇮🇳',
    bedrooms: 2,
    area: 135,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-20',
    titleEn: 'La Boca Penthouse Buenos Aires',
    titleAr: 'بنتهاوس بوينس آيرس',
    price: 380000,
    city: 'Buenos Aires',
    country: 'AR',
    countryFlag: '🇦🇷',
    bedrooms: 2,
    area: 155,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&fit=crop&q=80',
  },
  {
    id: 'abroad-21',
    titleEn: 'Tropical Resort Maldives',
    titleAr: 'منتجع استوائي جزر المالديف',
    price: 520000,
    city: 'Maldives',
    country: 'MV',
    countryFlag: '🇲🇻',
    bedrooms: 2,
    area: 180,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&fit=crop&q=80',
  },
];

export default function AbroadPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: AbroadPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
  const activeTourProperty = abroadProperties.find((p) => p.id === activeTourId);
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
          {language === 'en' ? 'International Properties' : 'العقارات الدولية'}
        </h1>
      </div>

      <div className="space-y-4">
        {abroadProperties.map((property) => (
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
                  transactionType="buy"
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
                      category: 'abroad',
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
