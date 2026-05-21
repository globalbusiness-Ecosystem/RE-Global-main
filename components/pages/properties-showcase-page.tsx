'use client';

import { useState } from 'react';
import { PropertiesGrid } from '@/components/properties-grid';
import { SAMPLE_PROPERTIES } from '@/lib/sample-properties';
import { Search, MapPin, Home } from 'lucide-react';

interface PropertiesPageProps {
  language: 'en' | 'ar';
}

export default function PropertiesPage({ language }: PropertiesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const cities = [...new Set(SAMPLE_PROPERTIES.map(p => p.city))];

  const filteredProperties = SAMPLE_PROPERTIES.filter(property => {
    const matchesSearch =
      property.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.titleAr.includes(searchQuery) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = !selectedCity || property.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/20 to-background/0 p-4 sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {language === 'en' ? 'Properties' : 'العقارات'}
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search properties...' : 'ابحث عن العقارات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/20 border border-border/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>

        {/* City Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCity('')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
              !selectedCity
                ? 'bg-accent text-black'
                : 'bg-secondary/20 text-foreground hover:bg-secondary/40'
            }`}
          >
            {language === 'en' ? 'All Cities' : 'جميع المدن'}
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm flex items-center gap-2 ${
                selectedCity === city
                  ? 'bg-accent text-black'
                  : 'bg-secondary/20 text-foreground hover:bg-secondary/40'
              }`}
            >
              <MapPin className="w-3 h-3" />
              {city}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-xs text-muted-foreground mt-3">
          {language === 'en' 
            ? `${filteredProperties.length} properties found`
            : `تم العثور على ${filteredProperties.length} عقار`}
        </p>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <PropertiesGrid
          language={language}
          properties={filteredProperties}
          onBuyClick={(propertyId) => {
            console.log('Buy property:', propertyId);
            // Integrate with Pi payment here
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Home className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-center">
            {language === 'en'
              ? 'No properties found'
              : 'لم يتم العثور على عقارات'}
          </p>
          <p className="text-xs text-muted-foreground/50 text-center mt-2">
            {language === 'en'
              ? 'Try adjusting your search filters'
              : 'حاول تعديل معايير البحث'}
          </p>
        </div>
      )}
    </main>
  );
}
