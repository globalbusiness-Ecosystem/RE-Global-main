'use client';
import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { useProperties, pTitle, pLocation, type Property } from '@/lib/useProperties';
import { FirebasePropertyModal } from '@/components/pages/buy-page';

// Real listings added from the admin panel (Firestore), filtered by listing type.
export function FirestoreListings({ listingType, language }: { listingType: string; language: NavLanguage }) {
  const { properties, loading } = useProperties();
  const [selected, setSelected] = useState<Property | null>(null);
  const items = useMemo(() => properties.filter((p) => p.type === listingType), [properties, listingType]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-4">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-semibold text-accent border-b border-accent/30 pb-2">
        {language === 'en' ? '⭐ Available Properties' : '⭐ العقارات المتاحة'}
      </h2>
      {items.map((prop) => (
        <div
          key={prop.id}
          onClick={() => setSelected(prop)}
          className="rounded-lg border border-accent/40 overflow-hidden hover:border-accent transition cursor-pointer"
          style={{ backgroundColor: '#1a2332' }}
        >
          {prop.image && <img src={prop.image} alt={prop.title} className="w-full h-44 object-cover" />}
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-white font-semibold text-base">{pTitle(prop, language)}</h4>
              {prop.featured && (
                <span className="text-xs bg-accent text-black px-2 py-0.5 rounded font-bold">
                  {language === 'en' ? 'Featured' : 'مميز'}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">{pLocation(prop, language)}</p>
            <div className="flex justify-between items-center">
              <p className="text-accent font-bold text-lg">{prop.price} π</p>
              <span className="text-xs text-accent border border-accent/50 px-2 py-0.5 rounded flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {language === 'en' ? 'Details' : 'تفاصيل'}
              </span>
            </div>
          </div>
        </div>
      ))}
      {selected && <FirebasePropertyModal prop={selected} language={language} onClose={() => setSelected(null)} />}
    </div>
  );
}
