'use client';

import { MapPin, Bed, Maximize2, MapPin as MapIcon, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface RentPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const rentProperties = [
  {
    id: 'rent-1',
    titleEn: 'Modern Studio Dubai Marina',
    titleAr: 'استوديو حديث في مارينا دبي',
    price: 2500,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 1,
    area: 50,
    image: 'https://images.unsplash.com/photo-1560301895-9bafb5a78606?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'rent-2',
    titleEn: 'Spacious 2BR Brooklyn Flat',
    titleAr: 'شقة واسعة بغرفتي نوم في بروكلين',
    price: 3200,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 90,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'rent-3',
    titleEn: 'Cozy Apartment Bangkok',
    titleAr: 'شقة دافئة في بانكوك',
    price: 850,
    city: 'Bangkok',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 1,
    area: 55,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'rent-4',
    titleEn: 'Stylish Flat Soho London',
    titleAr: 'شقة أنيقة في سوهو لندن',
    price: 2800,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 2,
    area: 75,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop',
  },
  {
    id: 'rent-5',
    titleEn: 'Chic Apartment Shibuya Tokyo',
    titleAr: 'شقة أنيقة في شيبويا طوكيو',
    price: 1600,
    city: 'Tokyo',
    country: 'JP',
    countryFlag: '🇯🇵',
    bedrooms: 1,
    area: 45,
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop',
  },
  {
    id: 'rent-6',
    titleEn: '3BR Apartment Marais Paris',
    titleAr: 'شقة بثلاث غرف نوم في ماريه باريس',
    price: 3500,
    city: 'Paris',
    country: 'FR',
    countryFlag: '🇫🇷',
    bedrooms: 3,
    area: 120,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 'rent-7',
    titleEn: 'Beachfront 2BR Bondi Sydney',
    titleAr: 'شقة على الشاطئ بغرفتي نوم في بوندي سيدني',
    price: 2100,
    city: 'Sydney',
    country: 'AU',
    countryFlag: '🇦🇺',
    bedrooms: 2,
    area: 85,
    image: 'https://images.unsplash.com/photo-1502670260266-1c1ef2d93688?w=400&h=300&fit=crop',
  },
];

// Memoized property card for rent page
const RentPropertyCard = memo(({
  property,
  language,
  currency,
  isFavorite,
  onToggleFavorite,
  onTourClick,
}: {
  property: typeof rentProperties[0];
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onTourClick: () => void;
}) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition">
    <div className="relative aspect-video overflow-hidden bg-muted">
      <img
        loading="lazy"
        src={property.image}
        alt={language === 'en' ? property.titleEn : property.titleAr}
        className="w-full h-full object-cover hover:scale-105 transition-transform"
      />
      <button
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? 'fill-accent text-accent' : 'text-white'
          }`}
        />
      </button>
      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-sm font-semibold">
        {property.countryFlag}
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <h3 className="font-bold text-lg line-clamp-1">
          {language === 'en' ? property.titleEn : property.titleAr}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>
            {property.city}, {property.country}
          </span>
        </div>
      </div>

      <div className="flex gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Bed className="w-4 h-4" />
          <span>{property.bedrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <Maximize2 className="w-4 h-4" />
          <span>{property.area} m²</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Monthly' : 'شهري'}
          </p>
          <p className="text-xl font-bold text-accent">
            {property.price.toLocaleString()} {currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <UnifiedPaymentButton
          propertyId={property.id}
          propertyTitle={language === 'en' ? property.titleEn : property.titleAr}
          price={property.price}
          transactionType="rent"
          language={language}
          currency={currency}
          className="col-span-1"
        />
        <button 
          onClick={() => {
            sessionStorage.setItem('focusProperty', JSON.stringify({
              lat: 0,
              lng: 0,
              title: language === 'en' ? property.titleEn : property.titleAr,
              price: property.price,
              category: 'rent',
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
          className="border border-accent text-accent py-2 rounded-lg font-semibold hover:bg-accent/10 transition text-sm"
          title={language === 'en' ? 'View on Map' : 'اعرض على الخريطة'}
        >
          📍
        </button>
        <button 
          onClick={onTourClick}
          className="border border-accent text-accent py-2 rounded-lg font-semibold hover:bg-accent/10 transition text-sm"
          title={language === 'en' ? 'Virtual Tour' : 'جولة افتراضية'}
        >
          <Video className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  </div>
));

RentPropertyCard.displayName = 'RentPropertyCard';

export default function RentPage({ language, currency, favorites, toggleFavorite }: RentPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
  // Memoize favorites lookup for better performance
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const activeTourProperty = rentProperties.find((p) => p.id === activeTourId);

  // If viewing tour, show VR Tour viewer
  if (activeTourId) {
    return (
      <VRPropertyTourViewer
        property={DEMO_PROPERTY}
        onClose={() => setActiveTourId(null)}
        onBuyClick={() => {
          // Integrate with Pi payment here
          alert('Buy with Pi feature - Integrate with Pi payment SDK');
        }}
      />
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">
          {language === 'en' ? 'Rent Properties' : 'استئجار العقارات'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Find your perfect rental home' : 'ابحث عن منزل الإيجار المثالي'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rentProperties.map((property) => (
          <RentPropertyCard
            key={property.id}
            property={property}
            language={language}
            currency={currency}
            isFavorite={favoriteSet.has(property.id)}
            onToggleFavorite={() => toggleFavorite(property.id)}
            onTourClick={() => setActiveTourId(property.id)}
          />
        ))}
      </div>
    </div>
  );
}
