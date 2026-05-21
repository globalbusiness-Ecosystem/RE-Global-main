'use client';

type PropertyCategory = 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized' | 'abroad' | 'offplan' | 'map' | 'partners';

const categoryGradients: Record<PropertyCategory, { from: string; to: string }> = {
  buy: { from: 'from-blue-600', to: 'to-blue-900' },
  rent: { from: 'from-purple-600', to: 'to-purple-900' },
  hotel: { from: 'from-amber-600', to: 'to-amber-900' },
  invest: { from: 'from-emerald-600', to: 'to-emerald-900' },
  tokenized: { from: 'from-pink-600', to: 'to-pink-900' },
  abroad: { from: 'from-cyan-600', to: 'to-cyan-900' },
  offplan: { from: 'from-indigo-600', to: 'to-indigo-900' },
  map: { from: 'from-green-600', to: 'to-green-900' },
  partners: { from: 'from-orange-600', to: 'to-orange-900' },
};

interface CategoryGradientProps {
  category: PropertyCategory;
  className?: string;
}

export function CategoryGradient({ category, className = '' }: CategoryGradientProps) {
  const gradient = categoryGradients[category] || categoryGradients.buy;
  
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient.from} ${gradient.to} ${className}`}
      role="img"
      aria-label={`${category} property image placeholder`}
    />
  );
}

export function PropertyImagePlaceholder({
  category,
  title,
  className = '',
}: {
  category: PropertyCategory;
  title: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gray-900 ${className}`}>
      <CategoryGradient category={category} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg font-bold truncate px-4">{title}</div>
        </div>
      </div>
    </div>
  );
}
