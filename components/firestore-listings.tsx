'use client';
import { useMemo, useState } from 'react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { useProperties, type Property } from '@/lib/useProperties';
import { FirebasePropertyModal } from '@/components/pages/buy-page';
import { ListingCard } from '@/components/listing-card';

// Real listings added from the admin panel (Firestore), filtered by listing type.
export function FirestoreListings({ listingType, featuredOnly, language, favorites, toggleFavorite }: {
  listingType?: string; featuredOnly?: boolean; language: NavLanguage; favorites?: string[]; toggleFavorite?: (id: string) => void;
}) {
  const { properties, loading } = useProperties();
  const [selected, setSelected] = useState<Property | null>(null);
  const items = useMemo(() => {
    const list = properties.filter((p) => (!listingType || p.type === listingType) && (!featuredOnly || (p.featured && p.status !== 'sold')));
    return featuredOnly ? list.slice(0, 6) : list;
  }, [properties, listingType, featuredOnly]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-4">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-semibold text-accent border-b border-accent/30 pb-2">
        {featuredOnly
          ? (language === 'en' ? '⭐ Featured Properties' : '⭐ عقارات مميزة')
          : (language === 'en' ? '⭐ Available Properties' : '⭐ العقارات المتاحة')}
      </h2>
      {items.map((prop) => (
        <ListingCard
          key={prop.id}
          prop={prop}
          language={language}
          isFavorite={favorites?.includes(prop.id)}
          onToggleFavorite={toggleFavorite ? () => toggleFavorite(prop.id) : undefined}
          onOpenDetails={() => setSelected(prop)}
        />
      ))}
      {selected && <FirebasePropertyModal prop={selected} language={language} onClose={() => setSelected(null)} />}
    </div>
  );
}
