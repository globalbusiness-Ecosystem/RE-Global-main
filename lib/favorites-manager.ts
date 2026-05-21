'use client';

export interface Favorite {
  id: string;
  propertyId: string;
  userId: string;
  createdAt: number;
  notes?: string;
  priceAlert?: number;
}

export interface WatchList {
  id: string;
  userId: string;
  name: string;
  propertyIds: string[];
  createdAt: number;
  isPublic: boolean;
}

export class FavoritesManager {
  private favorites: Map<string, Favorite> = new Map();
  private watchLists: Map<string, WatchList> = new Map();
  private priceAlerts: Map<string, number[]> = new Map();

  addFavorite(propertyId: string, userId: string, notes?: string): Favorite {
    const favorite: Favorite = {
      id: Math.random().toString(36).slice(7),
      propertyId,
      userId,
      createdAt: Date.now(),
      notes,
    };
    this.favorites.set(favorite.id, favorite);
    return favorite;
  }

  removeFavorite(favoriteId: string): boolean {
    return this.favorites.delete(favoriteId);
  }

  getFavorites(userId: string): Favorite[] {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  isFavorited(propertyId: string, userId: string): boolean {
    return Array.from(this.favorites.values()).some(
      f => f.propertyId === propertyId && f.userId === userId
    );
  }

  createWatchList(userId: string, name: string, isPublic: boolean = false): WatchList {
    const watchList: WatchList = {
      id: Math.random().toString(36).slice(7),
      userId,
      name,
      propertyIds: [],
      createdAt: Date.now(),
      isPublic,
    };
    this.watchLists.set(watchList.id, watchList);
    return watchList;
  }

  addToWatchList(watchListId: string, propertyId: string): boolean {
    const watchList = this.watchLists.get(watchListId);
    if (!watchList) return false;
    if (!watchList.propertyIds.includes(propertyId)) {
      watchList.propertyIds.push(propertyId);
    }
    return true;
  }

  removeFromWatchList(watchListId: string, propertyId: string): boolean {
    const watchList = this.watchLists.get(watchListId);
    if (!watchList) return false;
    watchList.propertyIds = watchList.propertyIds.filter(id => id !== propertyId);
    return true;
  }

  getWatchLists(userId: string): WatchList[] {
    return Array.from(this.watchLists.values()).filter(w => w.userId === userId);
  }

  setPriceAlert(userId: string, propertyId: string, maxPrice: number): void {
    if (!this.priceAlerts.has(userId)) {
      this.priceAlerts.set(userId, []);
    }
    const alerts = this.priceAlerts.get(userId)!;
    alerts.push(maxPrice);
  }

  checkPriceAlert(propertyId: string, currentPrice: number): boolean {
    for (const [userId, prices] of this.priceAlerts) {
      const favorites = this.getFavorites(userId);
      if (favorites.some(f => f.propertyId === propertyId)) {
        const favorites_with_alerts = favorites.filter(f => f.priceAlert !== undefined);
        if (favorites_with_alerts.some(f => currentPrice <= f.priceAlert!)) {
          return true;
        }
      }
    }
    return false;
  }

  shareWatchList(watchListId: string): string {
    const watchList = this.watchLists.get(watchListId);
    if (!watchList) throw new Error('قائمة المراقبة غير موجودة');
    watchList.isPublic = true;
    return watchListId;
  }
}

export function useFavorites(userId: string) {
  const manager = new FavoritesManager();

  const addFavorite = (propertyId: string, notes?: string) => {
    return manager.addFavorite(propertyId, userId, notes);
  };

  const removeFavorite = (favoriteId: string) => {
    return manager.removeFavorite(favoriteId);
  };

  const getFavorites = () => {
    return manager.getFavorites(userId);
  };

  const isFavorited = (propertyId: string) => {
    return manager.isFavorited(propertyId, userId);
  };

  const createWatchList = (name: string) => {
    return manager.createWatchList(userId, name);
  };

  const getWatchLists = () => {
    return manager.getWatchLists(userId);
  };

  return {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorited,
    createWatchList,
    getWatchLists,
    manager,
  };
}
