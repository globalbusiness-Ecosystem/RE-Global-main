'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { MapPin, Bed, Maximize2, Video, Heart, Eye } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { useProperties, Property } from '@/lib/useProperties';

interface InvestPageProps {
  language: NavLanguage;
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

// ─── Firebase Property Detail Modal ───────────────────────────────────────────
function FirebaseInvestModal({
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
                  <span>{prop.bedrooms} {language === 'en' ? 'Units' : 'وحدة'}</span>
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
            transactionType="invest"
            language={language}
            currency="PI"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function InvestPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: InvestPageProps) {
  const { properties, loading: propertiesLoading } = useProperties();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const firebaseProperties = useMemo(
    () => properties.filter(p => p.type === 'invest'),
    [properties]
  );
  
  const activeTourProperty = investProperties.find((p) => p.id === activeTourId);
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
          {language === 'en' ? 'Investment Properties' : 'العقارات الاستثمارية'}
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

      {/* Firebase Property Detail Modal */}
      {selectedProp && (
        <FirebaseInvestModal
          prop={selectedProp}
          language={language}
          onClose={() => setSelectedProp(null)}
        />
      )}
    </main>
  );
}
