// Firebase Database Layer for RE Platform
// Real-time data persistence and management

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'sonner';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  type: 'buy' | 'rent' | 'invest' | 'hotel' | 'tokenized';
  description: string;
  images: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  name: string;
  walletAddress?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  currency: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  username: string;
  propertyId: string;
  createdAt: Date;
}

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  companyName: string;
  websiteUrl: string;
  updatedAt: Date;
}

export interface SmartContract {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerUsername: string;
  sellerUsername: string;
  type: 'buy' | 'rent' | 'invest' | 'tokenized';
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  contractIdOnChain?: string;
  paymentId?: string;
  txid?: string;
  createdAt: Date;
  updatedAt: Date;
}

class FirebaseDatabase {
  private collectionsCache: Map<string, any[]> = new Map();

  // Properties Operations
  async addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property | null> {
    try {
      console.log('[DB] Adding property:', property.title);

      const docRef = await addDoc(collection(db, 'properties'), {
        ...property,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const newProperty: Property = {
        id: docRef.id,
        ...property,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.invalidateCache('properties');
      toast.success('Property added successfully');
      return newProperty;
    } catch (error) {
      console.error('[DB] Add property error:', error);
      toast.error('Failed to add property');
      return null;
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Property;
    } catch (error) {
      console.error('[DB] Get property error:', error);
      return null;
    }
  }

  async getProperties(filters?: { type?: string; userId?: string }): Promise<Property[]> {
    try {
      console.log('[DB] Fetching properties with filters:', filters);

      const cacheKey = `properties_${JSON.stringify(filters || {})}`;
      if (this.collectionsCache.has(cacheKey)) {
        return this.collectionsCache.get(cacheKey);
      }

      let q = query(collection(db, 'properties'));

      if (filters?.type) {
        q = query(collection(db, 'properties'), where('type', '==', filters.type));
      }
      if (filters?.userId) {
        q = query(collection(db, 'properties'), where('userId', '==', filters.userId));
      }

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Property);
      });

      this.collectionsCache.set(cacheKey, properties);
      return properties;
    } catch (error) {
      console.error('[DB] Get properties error:', error);
      toast.error('Failed to fetch properties');
      return [];
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
    try {
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      this.invalidateCache('properties');
      toast.success('Property updated');
      return true;
    } catch (error) {
      console.error('[DB] Update property error:', error);
      toast.error('Failed to update property');
      return false;
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'properties', id));
      this.invalidateCache('properties');
      toast.success('Property deleted');
      return true;
    } catch (error) {
      console.error('[DB] Delete property error:', error);
      toast.error('Failed to delete property');
      return false;
    }
  }

  // User Operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('[DB] Create user error:', error);
      return null;
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as User;
    } catch (error) {
      console.error('[DB] Get user error:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      this.invalidateCache('users');
      return true;
    } catch (error) {
      console.error('[DB] Update user error:', error);
      return false;
    }
  }

  // Transaction Operations
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        ...transaction,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('[DB] Add transaction error:', error);
      return null;
    }
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Transaction);
      });

      return transactions;
    } catch (error) {
      console.error('[DB] Get transactions error:', error);
      return [];
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    try {
      const docRef = doc(db, 'transactions', id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('[DB] Update transaction error:', error);
      return false;
    }
  }

  // Smart Contract Operations
  async addContract(contract: Omit<SmartContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartContract | null> {
    try {
      const docRef = await addDoc(collection(db, 'contracts'), {
        ...contract,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...contract, createdAt: new Date(), updatedAt: new Date() };
    } catch (error) {
      console.error('[DB] Add contract error:', error);
      return null;
    }
  }

  async getContractsForUser(username: string): Promise<SmartContract[]> {
    try {
      const buyerQuery = query(collection(db, 'contracts'), where('buyerUsername', '==', username));
      const sellerQuery = query(collection(db, 'contracts'), where('sellerUsername', '==', username));
      const [buyerSnap, sellerSnap] = await Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)]);
      const contracts: Map<string, SmartContract> = new Map();
      [buyerSnap, sellerSnap].forEach((snap) => {
        snap.forEach((docSnap) => {
          contracts.set(docSnap.id, {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
            updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          } as SmartContract);
        });
      });
      return Array.from(contracts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('[DB] Get contracts for user error:', error);
      return [];
    }
  }

  async getAllContracts(): Promise<SmartContract[]> {
    try {
      const q = query(collection(db, 'contracts'));
      const querySnapshot = await getDocs(q);
      const contracts: SmartContract[] = [];
      querySnapshot.forEach((docSnap) => {
        contracts.push({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as SmartContract);
      });
      return contracts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('[DB] Get all contracts error:', error);
      return [];
    }
  }

  async updateContract(id: string, updates: Partial<SmartContract>): Promise<boolean> {
    try {
      const docRef = doc(db, 'contracts', id);
      await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
      return true;
    } catch (error) {
      console.error('[DB] Update contract error:', error);
      return false;
    }
  }

  // User Profile
  async getProfile(username: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'profiles', username);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        ...docSnap.data(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as UserProfile;
    } catch (error) {
      console.error('[DB] Get profile error:', error);
      return null;
    }
  }

  async saveProfile(username: string, profile: Omit<UserProfile, 'username' | 'updatedAt'>): Promise<boolean> {
    try {
      const docRef = doc(db, 'profiles', username);
      await setDoc(docRef, {
        ...profile,
        username,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('[DB] Save profile error:', error);
      return false;
    }
  }

  // Favorites
  async getFavoritesForUser(username: string): Promise<Favorite[]> {
    try {
      const q = query(collection(db, 'favorites'), where('username', '==', username));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as Favorite[];
    } catch (error) {
      console.error('[DB] Get favorites error:', error);
      return [];
    }
  }

  async addFavorite(username: string, propertyId: string): Promise<boolean> {
    try {
      await addDoc(collection(db, 'favorites'), {
        username,
        propertyId,
        createdAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('[DB] Add favorite error:', error);
      return false;
    }
  }

  async removeFavorite(username: string, propertyId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('username', '==', username),
        where('propertyId', '==', propertyId)
      );
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'favorites', d.id))));
      return true;
    } catch (error) {
      console.error('[DB] Remove favorite error:', error);
      return false;
    }
  }

  // Cache management
  private invalidateCache(collection: string): void {
    for (const key of this.collectionsCache.keys()) {
      if (key.startsWith(collection)) {
        this.collectionsCache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.collectionsCache.clear();
    console.log('[DB] Cache cleared');
  }
}

export const firebaseDB = new FirebaseDatabase();

// Hook for React
export function useFirebaseDatabase() {
  return {
    // Properties
    addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) =>
      firebaseDB.addProperty(property),
    getProperty: (id: string) => firebaseDB.getProperty(id),
    getProperties: (filters?: { type?: string; userId?: string }) =>
      firebaseDB.getProperties(filters),
    updateProperty: (id: string, updates: Partial<Property>) =>
      firebaseDB.updateProperty(id, updates),
    deleteProperty: (id: string) => firebaseDB.deleteProperty(id),

    // Users
    createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
      firebaseDB.createUser(user),
    getUser: (id: string) => firebaseDB.getUser(id),
    updateUser: (id: string, updates: Partial<User>) =>
      firebaseDB.updateUser(id, updates),

    // Transactions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) =>
      firebaseDB.addTransaction(transaction),
    getTransactions: (userId: string) =>
      firebaseDB.getTransactions(userId),
    updateTransaction: (id: string, updates: Partial<Transaction>) =>
      firebaseDB.updateTransaction(id, updates),

    // Smart Contracts
    addContract: (contract: Omit<SmartContract, 'id' | 'createdAt' | 'updatedAt'>) =>
      firebaseDB.addContract(contract),
    getContractsForUser: (username: string) =>
      firebaseDB.getContractsForUser(username),
    getAllContracts: () =>
      firebaseDB.getAllContracts(),
    updateContract: (id: string, updates: Partial<SmartContract>) =>
      firebaseDB.updateContract(id, updates),

    // Favorites
    getFavoritesForUser: (username: string) => firebaseDB.getFavoritesForUser(username),
    addFavorite: (username: string, propertyId: string) => firebaseDB.addFavorite(username, propertyId),
    removeFavorite: (username: string, propertyId: string) => firebaseDB.removeFavorite(username, propertyId),

    // User Profile
    getProfile: (username: string) => firebaseDB.getProfile(username),
    saveProfile: (username: string, profile: Omit<UserProfile, 'username' | 'updatedAt'>) =>
      firebaseDB.saveProfile(username, profile),

    // Cache
    clearCache: () => firebaseDB.clearCache(),
  };
}
