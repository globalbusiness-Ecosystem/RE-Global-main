'use client';

import { MapPin, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useState, useMemo, memo } from 'react';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface HotelPageProps {
  language: 'en' | 'ar';
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

export default function HotelPage({ language, currency, favorites, toggleFavorite, onBack, showBackButton }: HotelPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  
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
          {language === 'en' ? 'Hotel Resorts' : 'منتجعات الفنادق'}
        </h1>
      </div>

      <div className="space-y-4">
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
    </main>
  );
}
