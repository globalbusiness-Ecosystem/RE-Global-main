'use client';

import { useState } from 'react';
import { MapPin, Bed, Maximize2, MapPin as MapIcon, Video, Heart, X } from 'lucide-react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface PropertiesPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const properties = [
  {
    id: '1',
    titleEn: 'Luxury Downtown Penthouse',
    titleAr: 'بنتهاوس فاخر وسط المدينة',
    price: 850000,
    city: 'Dubai',
    country: 'AE',
    countryFlag: '🇦🇪',
    bedrooms: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    category: 'buy',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Panoramique_360_Living_room.jpg/2560px-Panoramique_360_Living_room.jpg',
  },
  {
    id: '2',
    titleEn: 'Modern Apartment Manhattan',
    titleAr: 'شقة حديثة في مانهاتن',
    price: 650000,
    city: 'New York',
    country: 'US',
    countryFlag: '🇺🇸',
    bedrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a7bee777b?w=400&h=300&fit=crop',
    category: 'buy',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Equirectangular_projection.jpg',
  },
  {
    id: '3',
    titleEn: 'Beachfront Villa Thailand',
    titleAr: 'فيلا على الشاطئ في تايلاند',
    price: 450000,
    city: 'Phuket',
    country: 'TH',
    countryFlag: '🇹🇭',
    bedrooms: 4,
    area: 320,
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop',
    category: 'invest',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Panoramique_360_Living_room.jpg/2560px-Panoramique_360_Living_room.jpg',
  },
  {
    id: '4',
    titleEn: 'Historic London Townhouse',
    titleAr: 'منزل عتيق في لندن',
    price: 1200000,
    city: 'London',
    country: 'GB',
    countryFlag: '🇬🇧',
    bedrooms: 5,
    area: 420,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    category: 'buy',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Equirectangular_projection.jpg',
  },
  {
    id: '5',
    titleEn: 'Resort Property Bali',
    titleAr: 'منتجع في بالي',
    price: 380000,
    city: 'Seminyak',
    country: 'ID',
    countryFlag: '🇮🇩',
    bedrooms: 6,
    area: 500,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    category: 'hotel',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Panoramique_360_Living_room.jpg/2560px-Panoramique_360_Living_room.jpg',
  },
  {
    id: '6',
    titleEn: 'Tech Hub Office Tokyo',
    titleAr: 'مكتب في مركز التكنولوجيا بطوكيو',
    price: 2100000,
    city: 'Tokyo',
    country: 'JP',
    countryFlag: '🇯🇵',
    bedrooms: 0,
    area: 600,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    category: 'invest',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Equirectangular_projection.jpg',
  },
  {
    id: '7',
    titleEn: 'Garden Apartment Barcelona',
    titleAr: 'شقة مع حديقة في برشلونة',
    price: 520000,
    city: 'Barcelona',
    country: 'ES',
    countryFlag: '🇪🇸',
    bedrooms: 3,
    area: 210,
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    category: 'buy',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Panoramique_360_Living_room.jpg/2560px-Panoramique_360_Living_room.jpg',
  },
];

export default function PropertiesPage({
  language,
  currency,
  favorites,
  toggleFavorite,
}: PropertiesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  const activeTourProperty = properties.find((p) => p.id === activeTourId);

  const categories = [
    { id: 'all', label: language === 'en' ? 'All' : 'الكل' },
    { id: 'buy', label: language === 'en' ? 'Buy' : 'شراء' },
    { id: 'invest', label: language === 'en' ? 'Invest' : 'استثمر' },
    { id: 'hotel', label: language === 'en' ? 'Hotel' : 'فندق' },
  ];

  const filteredProperties =
    selectedCategory === 'all'
      ? properties
      : properties.filter((p) => p.category === selectedCategory);

  const formatPrice = (price: number) => {
    if (currency === 'PI') {
      return `Π ${(price * 0.00003).toFixed(2)}`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <main className="px-4 py-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-accent mb-6">
        {language === 'en' ? 'Properties' : 'العقارات'}
      </h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-card border border-border text-foreground hover:border-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProperties.map((prop) => (
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
                className={`absolute top-3 right-3 p-2 rounded-full transition ${
                  favorites.includes(prop.id)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-black/50 text-white hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Heart className="w-5 h-5" fill={favorites.includes(prop.id) ? 'currentColor' : 'none'} />
              </button>
              <button className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {language === 'en' ? 'Tour' : 'جولة'} 360°
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {language === 'en' ? prop.titleEn : prop.titleAr}
              </h3>

              <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                <MapIcon className="w-4 h-4" />
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
                  <MapPin className="w-4 h-4" /> Map
                </button>
                <button
                  onClick={() => setActiveTourId(prop.id)}
                  className="bg-card border border-border text-foreground py-2 rounded-lg font-medium text-sm hover:border-accent transition flex items-center justify-center gap-1"
                >
                  <Video className="w-4 h-4" /> Tour
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
