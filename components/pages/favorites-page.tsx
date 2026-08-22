'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Heart } from 'lucide-react';
import { MapPin, Bed, Maximize2, Video } from 'lucide-react';
import { useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';
import { useProperties } from '@/lib/useProperties';

interface FavoritesPageProps {
  language: NavLanguage;
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export default function FavoritesPage({
  language,
  currency,
  favorites,
  toggleFavorite,
}: FavoritesPageProps) {
  const { properties, loading } = useProperties();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  const formatPrice = (price: number) => {
    if (currency === 'PI') {
      return `π ${price.toLocaleString()}`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const activeTourProperty = properties.find((p) => p.id === activeTourId);

  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto pb-24">
      <h2 className="text-2xl font-bold text-accent mb-6">
        {language === 'en' ? 'Favorites' : 'المفضلات'}
      </h2>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">
          {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
        </p>
      ) : favoriteProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-center">
            {language === 'en'
              ? 'No favorite properties yet. Start adding them!'
              : 'لا توجد عقارات مفضلة حتى الآن. ابدأ بإضافتها!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {prop.image ? (
                  <img
                    src={prop.image}
                    alt={language === 'en' ? prop.title : prop.titleAr || prop.title}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    {language === 'en' ? 'No image' : 'لا توجد صورة'}
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(prop.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {language === 'en' ? prop.title : prop.titleAr || prop.title}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{language === 'en' ? prop.location : prop.locationAr || prop.location}</span>
                  </div>
                  <PropertyQRCode propertyId={prop.id} size={44} className="rounded" />
                </div>

                <p className="text-2xl font-bold text-accent mb-4">{formatPrice(prop.price)}</p>

                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                  {!!prop.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{prop.bedrooms}</span>
                    </div>
                  )}
                  {!!prop.area && (
                    <div className="flex items-center gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>{prop.area} m²</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <UnifiedPaymentButton
                    propertyId={prop.id}
                    propertyTitle={language === 'ar' ? prop.titleAr || prop.title : prop.title}
                    price={prop.price}
                    transactionType="buy"
                    language={language}
                    currency="PI"
                    className="bg-accent text-accent-foreground py-2 rounded-lg font-medium text-sm hover:opacity-90 transition"
                  />
                  <button
                    className="bg-card border border-border text-foreground py-2 rounded-lg font-medium text-sm hover:border-accent transition flex items-center justify-center gap-1"
                    onClick={() => setActiveTourId(prop.id)}
                    title={language === 'en' ? 'Virtual Tour' : 'جولة افتراضية'}
                  >
                    <Video className="w-4 h-4" />
                    {language === 'en' ? 'Tour' : 'جولة'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTourProperty && (
        <VRPropertyTourViewer
          property={DEMO_PROPERTY}
          onClose={() => setActiveTourId(null)}
          onBuyClick={() => {
            setActiveTourId(null);
          }}
        />
      )}
    </main>
  );
}
