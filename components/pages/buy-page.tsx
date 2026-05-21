'use client';

import { useProperties } from '@/lib/useProperties';
import { MapPin, Bed, Maximize2, Video, Heart, X, Eye } from 'lucide-react';
import { useState, useMemo, memo } from 'react';
import { SimplePiPaymentButton } from '@/components/simple-pi-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { Property } from '@/lib/useProperties';

interface BuyPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const buyProperties = [
  {
    id: 'buy-1',
    titleEn: 'Luxury Downtown Penthouse',
    titleAr: 'بنتهاوس فاخر وسط المدينة',
    price: 850000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-2',
    titleEn: 'Modern Apartment Manhattan',
    titleAr: 'شقة حديثة في مانهاتن',
    price: 650000,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1613490493576-4d884d0b7f2e?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-3',
    titleEn: 'Beachfront Villa Thailand',
    titleAr: 'فيلا على الشاطئ في تايلاند',
    price: 450000,
    city: 'Phuket',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 4,
    area: 320,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-4',
    titleEn: 'Contemporary House London',
    titleAr: 'منزل معاصر في لندن',
    price: 750000,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-5',
    titleEn: 'Urban Condo Tokyo',
    titleAr: 'شقة حضرية في طوكيو',
    price: 520000,
    city: 'Tokyo',
    country: 'JP',
    countryFlag: '🇯🇵',
    bedrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-6',
    titleEn: 'Hillside Estate Paris',
    titleAr: 'عقار على التل في باريس',
    price: 920000,
    city: 'Paris',
    country: 'FR',
    countryFlag: '🇫🇷',
    bedrooms: 4,
    area: 350,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'buy-7',
    titleEn: 'Seaside Retreat Sydney',
    titleAr: 'ملاذ ساحلي في سيدني',
    price: 580000,
    city: 'Sydney',
    country: 'AU',
    countryFlag: '🇦🇺',
    bedrooms: 3,
    area: 240,
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
];

// Memoized property card to prevent unnecessary re-renders
const PropertyCard = memo(({
  property,
  language,
  currency,
  isFavorite,
  onToggleFavorite,
  onTourClick,
}: {
  property: typeof buyProperties[0];
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
          <span>{property.city}, {property.country}</span>
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
            {language === 'en' ? 'Price' : 'السعر'}
          </p>
          <p className="text-xl font-bold text-accent">
            {property.price.toLocaleString()} {currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <SimplePiPaymentButton
          propertyId={property.id}
          language={language}
          className="col-span-1"
        />
        <button
          onClick={() => {
            sessionStorage.setItem('focusProperty', JSON.stringify({
              lat: 0,
              lng: 0,
              title: language === 'en' ? property.titleEn : property.titleAr,
              price: property.price,
              category: 'buy',
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

PropertyCard.displayName = 'PropertyCard';

// ─── Firebase Property Detail Modal ───────────────────────────────────────────
function FirebasePropertyModal({
  prop,
  language,
  onClose,
}: {
  prop: Property;
  language: 'en' | 'ar';
  onClose: () => void;
}) {
  const title = language === 'ar' && prop.titleAr ? prop.titleAr : prop.title;
  const location = language === 'ar' && prop.locationAr ? prop.locationAr : prop.location;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0f1923] border border-accent/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-accent/20 bg-[#0f1923] z-10">
          <h2 className="text-lg font-bold text-white truncate flex-1">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg ml-2 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Image */}
          {prop.image && (
            <img
              src={prop.image}
              alt={title}
              className="w-full h-52 object-cover rounded-xl"
            />
          )}

          {/* Price & Location */}
          <div>
            <p className="text-3xl font-bold text-accent">{prop.price} π</p>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {location}
            </p>
          </div>

          {/* Details */}
          {(prop.bedrooms || prop.bathrooms || prop.area) && (
            <div className="flex gap-4 text-sm text-gray-300 border border-white/10 rounded-xl p-3">
              {prop.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-accent" />
                  <span>{prop.bedrooms} {language === 'en' ? 'Beds' : 'غرف'}</span>
                </div>
              )}
              {prop.bathrooms && (
                <div className="flex items-center gap-1">
                  <Maximize2 className="w-4 h-4 text-accent" />
                  <span>{prop.bathrooms} {language === 'en' ? 'Baths' : 'حمام'}</span>
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

          {/* Description */}
          {prop.description && (
            <p className="text-gray-400 text-sm leading-relaxed">
              {language === 'ar' && prop.descriptionAr ? prop.descriptionAr : prop.description}
            </p>
          )}

          {/* Map */}
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
          ) : (
            <div className="rounded-xl border border-white/10 p-4 text-center text-gray-500 text-sm">
              📍 {language === 'en' ? 'Map location not available' : 'الموقع على الخريطة غير متاح'}
            </div>
          )}

          {/* 360° VR Tour */}
          {prop.vrUrl ? (
            <div className="rounded-xl overflow-hidden border border-accent/20">
              <p className="text-xs text-gray-400 px-3 pt-2 pb-1 bg-[#0f1923]">
                🎥 {language === 'en' ? '360° Virtual Tour' : 'جولة افتراضية 360°'}
              </p>
              <iframe
                src={`https://pannellum.org/api/viewer/?panorama=${encodeURIComponent(prop.vrUrl)}&autoLoad=true`}
                className="w-full h-56"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="vr-tour"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 p-4 text-center text-gray-500 text-sm">
              🎥 {language === 'en' ? '360° tour not available' : 'الجولة الافتراضية غير متاحة'}
            </div>
          )}

          {/* Buy Button */}
          <button className="w-full bg-accent hover:bg-accent/90 text-black font-bold py-3 rounded-xl transition text-base">
            {language === 'en' ? '🛒 Buy Now with Pi' : '🛒 اشتري الآن بـ Pi'}
          </button>

        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BuyPage({ language, currency, favorites, toggleFavorite }: BuyPageProps) {
  const { properties, loading: propertiesLoading } = useProperties();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const firebaseProperties = useMemo(
    () => properties.filter(p => p.type === 'buy'),
    [properties]
  );

  // If viewing static VR tour
  if (activeTourId) {
    return (
      <VRPropertyTourViewer
        property={DEMO_PROPERTY}
        onClose={() => setActiveTourId(null)}
        onBuyClick={() => {
          alert('Buy with Pi feature - Integrate with Pi payment SDK');
        }}
      />
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">
          {language === 'en' ? 'Buy Properties' : 'شراء العقارات'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Discover premium properties worldwide' : 'اكتشف العقارات الفاخرة في جميع أنحاء العالم'}
        </p>
      </div>

      {/* Firebase Properties */}
      {propertiesLoading ? (
        <div className="text-center text-gray-400 py-4">
          {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
        </div>
      ) : firebaseProperties.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-accent border-b border-accent/30 pb-2">
            {language === 'en' ? '⭐ Available Properties' : '⭐ العقارات المتاحة'}
          </h2>
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
                  <p className="text-accent font-bold text-lg">{prop.price} π</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize border border-gray-700 px-2 py-0.5 rounded">
                      {prop.type}
                    </span>
                    <span className="text-xs text-accent border border-accent/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {language === 'en' ? 'Details' : 'تفاصيل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Static Properties */}
      <div className="space-y-4">
        {firebaseProperties.length === 0 && (
          <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
            {language === 'en' ? 'Featured Listings' : 'قوائم مميزة'}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyProperties.map((property) => (
            <PropertyCard
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
        <FirebasePropertyModal
          prop={selectedProp}
          language={language}
          onClose={() => setSelectedProp(null)}
        />
      )}
    </div>
  );
}