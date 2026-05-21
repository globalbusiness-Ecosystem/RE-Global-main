'use client';

import { memo, useCallback, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface SearchFilterProps {
  language: 'en' | 'ar';
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  cities?: string[];
}

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  cities?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}

export const SearchFilter = memo(
  ({ language, onSearch, onFilterChange, cities = [] }: SearchFilterProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch(value);
      },
      [onSearch]
    );

    const handleFilterUpdate = useCallback(
      (newFilters: FilterOptions) => {
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
      },
      [onFilterChange]
    );

    const clearFilters = useCallback(() => {
      setSearchQuery('');
      setActiveFilters({});
      onSearch('');
      onFilterChange({});
    }, [onSearch, onFilterChange]);

    const isFiltered = Object.keys(activeFilters).length > 0 || searchQuery.length > 0;

    return (
      <div className="p-4 bg-background border-b border-border space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={language === 'en' ? 'Search properties...' : 'ابحث عن عقارات...'}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-2 bg-secondary/20 hover:bg-secondary/40 border border-secondary/30 rounded-lg transition-colors text-secondary-foreground font-medium text-sm"
        >
          <span>{language === 'en' ? 'Filters' : 'التصفية'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-card border border-border rounded-lg">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Price Range' : 'نطاق السعر'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  onChange={(e) =>
                    handleFilterUpdate({
                      ...activeFilters,
                      minPrice: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  onChange={(e) =>
                    handleFilterUpdate({
                      ...activeFilters,
                      maxPrice: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Bedrooms' : 'غرف النوم'}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      handleFilterUpdate({
                        ...activeFilters,
                        bedrooms: activeFilters.bedrooms === num ? undefined : num,
                      })
                    }
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeFilters.bedrooms === num
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-background border border-border text-foreground hover:border-accent'
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>

            {/* Cities */}
            {cities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'City' : 'المدينة'}
                </label>
                <select
                  onChange={(e) =>
                    handleFilterUpdate({
                      ...activeFilters,
                      cities: e.target.value ? [e.target.value] : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">{language === 'en' ? 'All Cities' : 'جميع المدن'}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Sort By' : 'ترتيب حسب'}
              </label>
              <select
                onChange={(e) =>
                  handleFilterUpdate({
                    ...activeFilters,
                    sortBy: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:border-accent"
              >
                <option value="">{language === 'en' ? 'None' : 'لا شيء'}</option>
                <option value="price-asc">{language === 'en' ? 'Price: Low to High' : 'السعر: من الأقل للأعلى'}</option>
                <option value="price-desc">{language === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى للأقل'}</option>
                <option value="newest">{language === 'en' ? 'Newest' : 'الأحدث'}</option>
              </select>
            </div>

            {/* Clear Filters */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-destructive/20 hover:bg-destructive/40 text-destructive border border-destructive/30 rounded-lg font-medium text-sm transition-colors"
              >
                {language === 'en' ? 'Clear Filters' : 'مسح التصفية'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

SearchFilter.displayName = 'SearchFilter';
