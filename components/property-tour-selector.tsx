'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

interface PropertyTourSelectorProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

// Sample properties with tour data
const tourProperties = [
  {
    id: 'tour-1',
    titleEn: 'Luxury Downtown Penthouse',
    titleAr: 'بنتهاوس فاخر وسط المدينة',
    price: 850000,
    city: 'Dubai',
    bedrooms: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  },
  {
    id: 'tour-2',
    titleEn: 'Modern Apartment Manhattan',
    titleAr: 'شقة حديثة في مانهاتن',
    price: 650000,
    city: 'New York',
    bedrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1613490493576-4d884d0b7f2e?w=400&h=300&fit=crop',
  },
  {
    id: 'tour-3',
    titleEn: 'Beachfront Villa Thailand',
    titleAr: 'فيلا على الشاطئ في تايلاند',
    price: 450000,
    city: 'Phuket',
    bedrooms: 4,
    area: 320,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
  },
  {
    id: 'tour-4',
    titleEn: 'Contemporary House London',
    titleAr: 'منزل معاصر في لندن',
    price: 750000,
    city: 'London',
    bedrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
  },
  {
    id: 'tour-5',
    titleEn: 'Urban Condo Tokyo',
    titleAr: 'شقة حضرية في طوكيو',
    price: 520000,
    city: 'Tokyo',
    bedrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b814?w=400&h=300&fit=crop',
  },
  {
    id: 'tour-6',
    titleEn: 'Hillside Estate Paris',
    titleAr: 'عقار على التل في باريس',
    price: 920000,
    city: 'Paris',
    bedrooms: 4,
    area: 350,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
];

export default function PropertyTourSelector({ language, onClose }: PropertyTourSelectorProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const selected = selectedProperty 
    ? tourProperties.find(p => p.id === selectedProperty)
    : null;

  // If a property is selected, show the VR tour viewer
  if (selected) {
    return (
      <VRPropertyTourViewer
        property={DEMO_PROPERTY}
        onClose={() => setSelectedProperty(null)}
        onBuyClick={() => {
          alert('Buy with Pi feature - Integrate with Pi payment SDK');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300">
      <div className="w-full bg-gradient-to-b from-[#1a1410] to-[#0f0b08] rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#2a1f15] border-b border-[#F59E0B]/20 px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {language === 'en' ? 'Select Property for AI Tour' : 'اختر عقار للجولة الذكية'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F59E0B]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#F59E0B]" />
          </button>
        </div>

        {/* Properties Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {tourProperties.map((property) => (
            <button
              key={property.id}
              onClick={() => setSelectedProperty(property.id)}
              className="group relative overflow-hidden rounded-lg border border-[#F59E0B]/30 hover:border-[#F59E0B] transition-all hover:shadow-lg hover:shadow-[#F59E0B]/20"
            >
              {/* Image */}
              <div className="relative w-full aspect-square overflow-hidden bg-[#0f0b08]">
                <img
                  src={property.image}
                  alt={language === 'en' ? property.titleEn : property.titleAr}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <h3 className="text-xs font-semibold text-white mb-1 line-clamp-2">
                  {language === 'en' ? property.titleEn : property.titleAr}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{property.city}</span>
                  <span className="text-[#F59E0B] font-bold">${(property.price / 1000).toFixed(0)}K</span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/0 to-[#F59E0B]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">🎥</div>
                  <span className="text-white text-xs font-semibold">
                    {language === 'en' ? 'Start Tour' : 'ابدأ الجولة'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}
