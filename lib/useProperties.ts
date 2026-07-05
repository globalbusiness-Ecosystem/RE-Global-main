import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  currency?: string;
  location: string;
  locationAr?: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  image?: string;
  images?: string[];
  description?: string;
  descriptionAr?: string;
  featured?: boolean;
  lat?: number;
  lng?: number;
  vrUrl?: string;
  createdAt?: any;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const q = query(
          collection(db, 'properties'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const raw = doc.data();
          return {
            id: doc.id,
            ...raw,
            price: Number(raw.price) || 0,
            bedrooms: raw.bedrooms !== undefined ? Number(raw.bedrooms) || 0 : undefined,
            bathrooms: raw.bathrooms !== undefined ? Number(raw.bathrooms) || 0 : undefined,
            area: raw.area !== undefined ? Number(raw.area) || 0 : undefined,
            lat: raw.lat !== undefined ? Number(raw.lat) : undefined,
            lng: raw.lng !== undefined ? Number(raw.lng) : undefined,
          };
        }) as Property[];
        setProperties(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  return { properties, loading, error };
}