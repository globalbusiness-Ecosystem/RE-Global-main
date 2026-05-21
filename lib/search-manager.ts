'use client';

export interface FilterCriteria {
  searchQuery?: string;
  priceRange?: { min: number; max: number };
  bedrooms?: number;
  city?: string;
  country?: string;
  propertyType?: string;
  sortBy?: 'price' | 'area' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  country: string;
  bedrooms: number;
  area: number;
  image?: string;
  rating?: number;
  reviews?: number;
}

export class SearchManager {
  private properties: Property[] = [];

  constructor(initialProperties: Property[] = []) {
    this.properties = initialProperties;
  }

  addProperty(property: Property): void {
    this.properties.push(property);
  }

  search(criteria: FilterCriteria): Property[] {
    let results = [...this.properties];

    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      results = results.filter(
        p => p.title.toLowerCase().includes(query) ||
             p.city.toLowerCase().includes(query) ||
             p.country.toLowerCase().includes(query)
      );
    }

    if (criteria.priceRange) {
      results = results.filter(
        p => p.price >= criteria.priceRange!.min && p.price <= criteria.priceRange!.max
      );
    }

    if (criteria.bedrooms) {
      results = results.filter(p => p.bedrooms === criteria.bedrooms);
    }

    if (criteria.city) {
      results = results.filter(p => p.city === criteria.city);
    }

    if (criteria.country) {
      results = results.filter(p => p.country === criteria.country);
    }

    if (criteria.propertyType) {
      results = results.filter(p => p.title.includes(criteria.propertyType!));
    }

    if (criteria.sortBy) {
      results.sort((a, b) => {
        let aValue: number, bValue: number;

        switch (criteria.sortBy) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'area':
            aValue = a.area;
            bValue = b.area;
            break;
          case 'popularity':
            aValue = a.reviews || 0;
            bValue = b.reviews || 0;
            break;
          case 'newest':
            aValue = parseInt(a.id);
            bValue = parseInt(b.id);
            break;
          default:
            return 0;
        }

        return criteria.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return results;
  }

  getUniqueCities(): string[] {
    return [...new Set(this.properties.map(p => p.city))];
  }

  getUniqueCountries(): string[] {
    return [...new Set(this.properties.map(p => p.country))];
  }

  getPriceRange(): { min: number; max: number } {
    if (this.properties.length === 0) return { min: 0, max: 0 };
    const prices = this.properties.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}

export function useAdvancedSearch(initialProperties: Property[]) {
  const manager = new SearchManager(initialProperties);

  const search = (criteria: FilterCriteria) => {
    return manager.search(criteria);
  };

  const getFilters = () => ({
    cities: manager.getUniqueCities(),
    countries: manager.getUniqueCountries(),
    priceRange: manager.getPriceRange(),
  });

  return { search, getFilters, manager };
}
