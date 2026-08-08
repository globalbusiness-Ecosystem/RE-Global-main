'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Favorite {
  id: string;
  propertyId: string;
  userId: string;
  createdAt: number;
  notes?: string;
  priceAlert?: number;
}

/**
 * Real-time favorites backed by Firestore (collection: "favorites").
 * Replaces the old in-memory Map implementation, which lost all data
 * on every page refresh.
 */
export function useFavorites(userId: string | null | undefined) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Favorite[];
        setFavorites(data.sort((a, b) => b.createdAt - a.createdAt));
        setLoading(false);
      },
      (err) => {
        console.error('[useFavorites] Firestore listener failed:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addFavorite = async (propertyId: string, notes?: string, priceAlert?: number) => {
    if (!userId) throw new Error('Cannot add favorite: user not authenticated');
    if (favorites.some((f) => f.propertyId === propertyId)) return; // already favorited
    await addDoc(collection(db, 'favorites'), {
      propertyId,
      userId,
      notes: notes ?? null,
      priceAlert: priceAlert ?? null,
      createdAt: Date.now(),
    });
  };

  const removeFavorite = async (favoriteId: string) => {
    await deleteDoc(doc(db, 'favorites', favoriteId));
  };

  const removeFavoriteByPropertyId = async (propertyId: string) => {
    const existing = favorites.find((f) => f.propertyId === propertyId);
    if (existing) await removeFavorite(existing.id);
  };

  const toggleFavorite = async (propertyId: string) => {
    const existing = favorites.find((f) => f.propertyId === propertyId);
    if (existing) {
      await removeFavorite(existing.id);
    } else {
      await addFavorite(propertyId);
    }
  };

  const isFavorited = (propertyId: string) =>
    favorites.some((f) => f.propertyId === propertyId);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    removeFavoriteByPropertyId,
    toggleFavorite,
    isFavorited,
  };
}
