'use client';

import { Zap, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface TokenizedPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const tokenizedProperties = [
  {
    id: 'tokenized-1',
    titleEn: 'Fractional Penthouse Dubai',
    titleAr: 'بنتهاوس مجزأ دبي',
    price: 85000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 220,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-2',
    titleEn: 'Token Apartment Riyadh',
    titleAr: 'شقة رمزية الرياض',
    price: 72000,
    city: 'Riyadh',
    country: 'SA',
    countryFlag: '🇸🇦',
    bedrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1613490493576-4d884d0b7f2e?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-3',
    titleEn: 'Blockchain Property London',
    titleAr: 'ملكية بلوكتشين لندن',
    price: 110000,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 2,
    area: 140,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-4',
    titleEn: 'Smart Estate Paris',
    titleAr: 'عقار ذكي باريس',
    price: 125000,
    city: 'Paris',
    country: 'FR',
    countryFlag: '🇫🇷',
    bedrooms: 2,
    area: 155,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-5',
    titleEn: 'NFT Tower New York',
    titleAr: 'برج NFT نيويورك',
    price: 155000,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 130,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-6',
    titleEn: 'Web3 Loft Tokyo',
    titleAr: 'لوفت Web3 طوكيو',
    price: 95000,
    city: 'Tokyo',
    country: 'JP',
    countryFlag: '🇯🇵',
    bedrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'tokenized-7',
    titleEn: 'Crypto Condo Singapore',
    titleAr: 'شقة كريبتو سنغافورة',
    price: 105000,
    city: 'Singapore',
    country: 'SG',
    countryFlag: '🇸🇬',
    bedrooms: 2,
    area: 115,
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-8',
    titleEn: 'Tokenized Villa Istanbul',
    titleAr: 'فيلا رمزية اسطنبول',
    price: 68000,
    city: 'Istanbul',
    country: 'TR',
    countryFlag: '🇹🇷',
    bedrooms: 3,
    area: 180,
    image: 'https://images.unsplash.com/photo-1560301895-9bafb5a78606?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-9',
    titleEn: 'Shared Property Cairo',
    titleAr: 'ملكية مشتركة القاهرة',
    price: 48000,
    city: 'Cairo',
    country: 'EG',
    countryFlag: '🇪🇬',
    bedrooms: 2,
    area: 140,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-10',
    titleEn: 'Fractional Flat Barcelona',
    titleAr: 'شقة مجزأة برشلونة',
    price: 88000,
    city: 'Barcelona',
    country: 'ES',
    countryFlag: '🇪🇸',
    bedrooms: 2,
    area: 125,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-11',
    titleEn: 'Blockchain Penthouse Miami',
    titleAr: 'بنتهاوس بلوكتشين ميامي',
    price: 98000,
    city: 'Miami',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 145,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-12',
    titleEn: 'Smart Home Hong Kong',
    titleAr: 'منزل ذكي هونج كونج',
    price: 120000,
    city: 'Hong Kong',
    country: 'HK',
    countryFlag: '🇭🇰',
    bedrooms: 2,
    area: 100,
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-13',
    titleEn: 'NFT Apartment Zurich',
    titleAr: 'شقة NFT زيوريخ',
    price: 145000,
    city: 'Zurich',
    country: 'CH',
    countryFlag: '🇨🇭',
    bedrooms: 2,
    area: 135,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-14',
    titleEn: 'Token Villa Sydney',
    titleAr: 'فيلا رمزية سيدني',
    price: 92000,
    city: 'Sydney',
    country: 'AU',
    countryFlag: '🇦🇺',
    bedrooms: 3,
    area: 210,
    image: 'https://images.unsplash.com/photo-1502670260266-1c1ef2d93688?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-15',
    titleEn: 'Web3 Loft Toronto',
    titleAr: 'لوفت Web3 تورونتو',
    price: 82000,
    city: 'Toronto',
    country: 'CA',
    countryFlag: '🇨🇦',
    bedrooms: 2,
    area: 130,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-16',
    titleEn: 'Fractional Penthouse Amsterdam',
    titleAr: 'بنتهاوس مجزأ أمستردام',
    price: 115000,
    city: 'Amsterdam',
    country: 'NL',
    countryFlag: '🇳🇱',
    bedrooms: 2,
    area: 140,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
  },
  {
    id: 'tokenized-17',
    titleEn: 'Luxury Token Apartment Monaco',
    titleAr: 'شقة رمزية فاخرة موناكو',
    price: 175000,
    city: 'Monaco',
    country: 'MC',
    countryFlag: '🇲🇨',
    bedrooms: 2,
    area: 110,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
  },
];

export default function TokenizedPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: TokenizedPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
  const activeTourProperty = tokenizedProperties.find((p) => p.id === activeTourId);
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
          {language === 'en' ? 'Tokenized Real Estate' : 'العقارات الرمزية'}
        </h1>
      </div>

      <div className="space-y-4">
        {tokenizedProperties.map((property) => (
          <div key={property.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={property.image}
                alt={property.titleEn}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-accent/90 rounded-full p-2 backdrop-blur">
                <Zap className="w-4 h-4 text-accent-foreground" />
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    {property.countryFlag} {property.city}, {property.country}
                  </p>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-semibold">
                    {language === 'en' ? 'Tokenized' : 'رمزية'}
                  </span>
                </div>
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

              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'en' ? 'Price' : 'السعر'}
                  </p>
                  <p className="text-lg font-bold text-accent">
                    {property.price.toLocaleString()} π
                  </p>
                </div>
                <p className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1.5">
                  {language === 'en' ? 'Token Share from 1π' : 'حصة رمزية من 1π'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <UnifiedPaymentButton
                  propertyId={property.id}
                  propertyTitle={language === 'en' ? property.titleEn : property.titleAr}
                  price={property.price}
                  transactionType="tokenized"
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
                      category: 'tokenized',
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
                  className="flex-1 border border-accent text-accent rounded-lg py-2 font-medium hover:bg-accent/10 transition text-sm">
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
