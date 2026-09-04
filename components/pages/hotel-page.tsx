'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { MapPin, Bed, Maximize2, Video, Heart, Eye } from 'lucide-react';
import { useState, useMemo, memo } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { useProperties, Property } from '@/lib/useProperties';

interface HotelPageProps {
  language: NavLanguage;
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const hotelProperties = [
  {
    id: 'hotel-1',
    titleEn: 'Luxury Beach Resort',
    titleAr: 'منتجع شاطئ فاخر',
    price: 125000,
    city: 'Maldives',
    country: 'MV',
    countryFlag: '🇲🇻',
    bedrooms: 5,
    area: 450,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'hotel-2',
    titleEn: 'Mountain Resort Thailand',
    titleAr: 'منتجع الجبل في تايلاند',
    price: 95000,
    city: 'Chiang Mai',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'hotel-3',
    titleEn: 'Urban Boutique Hotel',
    titleAr: 'فندق بوتيك حضري',
    price: 85000,
    city: 'Singapore',
    country: 'SG',
    countryFlag: '🇸🇬',
    bedrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'hotel-4',
    titleEn: 'Desert Luxury Camp',
    titleAr: 'معسكر الصحراء الفاخر',
    price: 75000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 2,
    area: 320,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'hotel-5',
    titleEn: 'Alpine Ski Resort',
    titleAr: 'منتجع التزلج في جبال الألب',
    price: 110000,
    city: 'Zermatt',
    country: 'CH',
    countryFlag: '🇨🇭',
    bedrooms: 4,
    area: 400,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: 'hotel-6',
    titleEn: 'Tropical Paradise Resort',
    titleAr: 'منتجع الجنة الاستوائية',
    price: 130000,
    city: 'Bora Bora',
    country: 'PF',
    countryFlag: '🇵🇫',
    bedrooms: 5,
    area: 500,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
  },
  {
    id: 'hotel-7',
    titleEn: 'Historic Palace Hotel',
    titleAr: 'فندق القصر التاريخي',
    price: 100000,
    city: 'Prague',
    country: 'CZ',
    countryFlag: '🇨🇿',
    bedrooms: 3,
    area: 350,
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=300&fit=crop',
  },
];

// ─── Firebase Property Detail Modal ───────────────────────────────────────────
function FirebaseHotelModal({
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
            <p className="text-3xl font-bold text-accent">{prop.price.toLocaleString()} π</p>
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
            transactionType="hotel"
            language={language}
            currency="PI"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function HotelPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: HotelPageProps) {
  const { properties, loading: propertiesLoading } = useProperties();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const firebaseProperties = useMemo(
    () => properties.filter(p => p.type === 'hotel'),
    [properties]
  );
  
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
  
  const activeTourProperty = hotelProperties.find((p) => p.id === activeTourId);
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
        <h1 className="text-3xl font-bold text-accent">
          {language === 'en' ? 'Hotel Resorts' : 'منتجعات الفنادق'}
        </h1>
      </div>

      {/* Firebase Properties (dynamic, added via Admin) */}
      {propertiesLoading ? (
        <div className="text-center text-gray-400 py-4">
          {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
        </div>
      ) : firebaseProperties.length > 0 ? (
        <div className="space-y-4 mb-6">
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
                    <p className="text-accent font-bold text-lg">{prop.price.toLocaleString()} π</p>
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

      <div className="space-y-4">
        {firebaseProperties.length === 0 && (
          <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-2">
            {language === 'en' ? 'Featured Listings' : 'قوائم مميزة'}
          </h2>
        )}
        {hotelProperties.map((property) => (
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
                <div className="flex flex-col items-end">
                  <PropertyQRCode propertyId={property.id} size={52} className="rounded" />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">#{property.id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <UnifiedPaymentButton
                  propertyId={property.id}
                  propertyTitle={language === 'en' ? property.titleEn : property.titleAr}
                  price={property.price}
                  transactionType="hotel"
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
                      category: 'hotel',
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

      {/* Firebase Property Detail Modal */}
      {selectedProp && (
        <FirebaseHotelModal
          prop={selectedProp}
          language={language}
          onClose={() => setSelectedProp(null)}
        />
      )}
    </main>
  );
}
