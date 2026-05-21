'use client';

import { Heart } from 'lucide-react';
import { MapPin, Bed, Maximize2, Video } from 'lucide-react';
import { useState, useMemo } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface FavoritesPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const allProperties = [
  {
    id: '1',
    titleEn: 'Luxury Downtown Penthouse',
    titleAr: 'بنتهاوس فاخر وسط المدينة',
    price: 850000,
    city: 'Dubai',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: '2',
    titleEn: 'Modern Apartment Manhattan',
    titleAr: 'شقة حديثة في مانهاتن',
    price: 650000,
    city: 'New York',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a7bee777b?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: '3',
    titleEn: 'Beachfront Villa Thailand',
    titleAr: 'فيلا على الشاطئ في تايلاند',
    price: 450000,
    city: 'Phuket',
    countryFlag: '🇹🇭',
    bedrooms: 4,
    area: 320,
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: '4',
    titleEn: 'Historic London Townhouse',
    titleAr: 'منزل عتيق في لندن',
    price: 1200000,
    city: 'London',
    countryFlag: '🇬🇧',
    bedrooms: 5,
    area: 420,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: '5',
    titleEn: 'Resort Property Bali',
    titleAr: 'منتجع في بالي',
    price: 380000,
    city: 'Seminyak',
    countryFlag: '🇮🇩',
    bedrooms: 6,
    area: 500,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
  {
    id: '6',
    titleEn: 'Tech Hub Office Tokyo',
    titleAr: 'مكتب في مركز التكنولوجيا بطوكيو',
    price: 2100000,
    city: 'Tokyo',
    countryFlag: '🇯🇵',
    bedrooms: 0,
    area: 600,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  },
];

export default function FavoritesPage({
  language,
  currency,
  favorites,
  toggleFavorite,
}: FavoritesPageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const favoriteProperties = allProperties.filter((p) => favorites.includes(p.id));

  const formatPrice = (price: number) => {
    if (currency === 'PI') {
      return `Π ${(price * 0.00003).toFixed(2)}`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const activeTourProperty = allProperties.find((p) => p.id === activeTourId);

  return (
    <main className="px-4 py-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-accent mb-6">
        {language === 'en' ? 'Favorites' : 'المفضلات'}
      </h2>

      {favoriteProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-center">
            {language === 'en'
              ? 'No favorite properties yet. Start adding them!'
              : 'لا توجد عقارات مفضلة حتى الآن. ابدأ بإضافتها!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favoriteProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={prop.image}
                  alt={language === 'en' ? prop.titleEn : prop.titleAr}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
                <button
                  onClick={() => toggleFavorite(prop.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {language === 'en' ? prop.titleEn : prop.titleAr}
                </h3>

                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {prop.city}, {prop.countryFlag}
                  </span>
                </div>

                <p className="text-2xl font-bold text-accent mb-4">{formatPrice(prop.price)}</p>

                {/* Details */}
                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                  {prop.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{prop.bedrooms}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-4 h-4" />
                    <span>{prop.area} m²</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-accent text-accent-foreground py-2 rounded-lg font-medium text-sm hover:opacity-90 transition">
                    Buy π
                  </button>
                  <button className="bg-card border border-border text-foreground py-2 rounded-lg font-medium text-sm hover:border-accent transition flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4" />
                  </button>
                  <button className="bg-card border border-border text-foreground py-2 rounded-lg font-medium text-sm hover:border-accent transition flex items-center justify-center gap-1"
                    onClick={() => setActiveTourId(prop.id)}
                    title={language === 'en' ? 'Virtual Tour' : 'جولة افتراضية'}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
