'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { MapPin, Bed, Maximize2, MapPin as MapIcon, Video, Heart, Eye } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { useProperties, Property } from '@/lib/useProperties';

interface RentPageProps {
  language: NavLanguage;
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
  language: NavLanguage;
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
        <div className="flex flex-col items-end">
          <PropertyQRCode propertyId={property.id} size={52} className="rounded" />
          <p className="text-[10px] text-muted-foreground font-mono mt-1">#{property.id}</p>
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

// ─── Firebase Property Detail Modal ───────────────────────────────────────────
function FirebaseRentModal({
  prop,
  language,
  onClose,
}: {
  prop: Property;
  language: NavLanguage;
  onClose: () => void;
}) {
  const title = language === 'ar' && prop.titleAr ? prop.titleAr : prop.title;
  const location = language === 'ar' && prop.locationAr ? prop.locationAr : prop.location;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0f1923] border border-accent/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-accent/20 bg-[#0f1923] z-10">
          <h2 className="text-lg font-bold text-white truncate flex-1">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg ml-2 transition">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          {prop.image && (
            <img src={prop.image} alt={title} className="w-full h-52 object-cover rounded-xl" />
          )}
          <div>
            <p className="text-3xl font-bold text-accent">
              {prop.price} π <span className="text-sm text-gray-400">/ {language === 'en' ? 'month' : 'شهريًا'}</span>
            </p>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {location}
            </p>
          </div>
          {(prop.bedrooms || prop.area) && (
            <div className="flex gap-4 text-sm text-gray-300 border border-white/10 rounded-xl p-3">
              {prop.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-accent" />
                  <span>{prop.bedrooms} {language === 'en' ? 'Beds' : 'غرف'}</span>
                </div>
              )}
              {prop.area && (
                <div className="flex items-center gap-1">
                  <Maximize2 className="w-4 h-4 text-accent" />
                  <span>{prop.area} m²</span>
                </div>
              )}
            </div>
          )}
          {prop.description && (
            <p className="text-gray-400 text-sm leading-relaxed">
              {language === 'ar' && prop.descriptionAr ? prop.descriptionAr : prop.description}
            </p>
          )}
          {prop.lat && prop.lng ? (
            <div className="rounded-xl overflow-hidden border border-accent/20">
              <p className="text-xs text-gray-400 px-3 pt-2 pb-1 bg-[#0f1923]">
                📍 {language === 'en' ? 'Property Location' : 'موقع العقار'}
              </p>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${prop.lng - 0.01},${prop.lat - 0.01},${prop.lng + 0.01},${prop.lat + 0.01}&layer=mapnik&marker=${prop.lat},${prop.lng}`}
                className="w-full h-48"
                style={{ border: 0 }}
                loading="lazy"
                title="property-map"
              />
            </div>
          ) : null}
          <UnifiedPaymentButton
            propertyId={prop.id}
            propertyTitle={title}
            price={prop.price}
            transactionType="rent"
            language={language}
            currency="PI"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function RentPage({ language, currency, favorites, toggleFavorite }: RentPageProps) {
  const { properties, loading: propertiesLoading } = useProperties();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  // Memoize favorites lookup for better performance
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const firebaseProperties = useMemo(
    () => properties.filter(p => p.type === 'rent'),
    [properties]
  );

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

      {/* Firebase Properties (dynamic, added via Admin) */}
      {propertiesLoading ? (
        <div className="text-center text-gray-400 py-4">
          {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
        </div>
      ) : firebaseProperties.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-accent border-b border-accent/30 pb-2">
            {language === 'en' ? '⭐ Available Properties' : '⭐ العقارات المتاحة'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {firebaseProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => setSelectedProp(prop)}
                className="rounded-lg border border-accent/40 overflow-hidden hover:border-accent transition cursor-pointer"
                style={{ backgroundColor: '#1a2332' }}
              >
                {prop.image && (
                  <img src={prop.image} alt={prop.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-white font-semibold text-base">
                      {language === 'ar' && prop.titleAr ? prop.titleAr : prop.title}
                    </h4>
                    {prop.featured && (
                      <span className="text-xs bg-accent text-black px-2 py-0.5 rounded font-bold">
                        {language === 'en' ? 'Featured' : 'مميز'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    {language === 'ar' && prop.locationAr ? prop.locationAr : prop.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-accent font-bold text-lg">
                      {prop.price} π <span className="text-xs text-gray-400">/{language === 'en' ? 'mo' : 'شهر'}</span>
                    </p>
                    <span className="text-xs text-accent border border-accent/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {language === 'en' ? 'Details' : 'تفاصيل'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Static Demo Properties */}
      <div className="space-y-4">
        {firebaseProperties.length === 0 && (
          <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
            {language === 'en' ? 'Featured Listings' : 'قوائم مميزة'}
          </h2>
        )}
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

      {/* Firebase Property Detail Modal */}
      {selectedProp && (
        <FirebaseRentModal
          prop={selectedProp}
          language={language}
          onClose={() => setSelectedProp(null)}
        />
      )}
    </div>
  );
}
