'use client';

export const PropertyCardSkeleton = () => {
  return (
    <div className="group relative bg-gradient-to-br from-background/50 to-background/20 rounded-2xl overflow-hidden border border-accent/10">
      <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
        
        <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />

        <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />

        <div className="flex gap-3 pt-2 border-t border-border/30">
          <div className="h-3 bg-gray-700 rounded animate-pulse w-8" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-12" />
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = ({ count = 7 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};
