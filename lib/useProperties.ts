import { useState, useEffect } from 'react';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sample data - استبدلها بـ Firebase لاحقاً
    const sampleProperties: Property[] = [
      {
        id: '1',
        title: 'Luxury Villa — Palm Jumeirah',
        titleAr: 'فيلا فاخرة — نخلة جميرا',
        price: 28500,
        currency: 'Pi',
        location: 'Dubai, UAE',
        locationAr: 'دبي، الإمارات',
        type: 'sale',
        bedrooms: 5,
        bathrooms: 4,
        area: 620,
        featured: true,
        lat: 25.1124,
        lng: 55.1390,
      },
      {
        id: '2',
        title: 'Nile Tower — Luxury Apartment',
        titleAr: 'برج النيل — شقة فاخرة',
        price: 85000,
        currency: 'Pi',
        location: 'Cairo, Egypt',
        locationAr: 'القاهرة، مصر',
        type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        featured: true,
        lat: 30.0444,
        lng: 31.2357,
      },
    ];

    setProperties(sampleProperties);
    setLoading(false);
  }, []);

  return { properties, loading, error };
}