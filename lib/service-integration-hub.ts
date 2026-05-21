// Central integration hub for all RE Platform services with caching and optimization
import { networkIntegration as NetworkIntegration } from './network-integration';
import { useOTPAuthentication as OTPAuthentication } from './otp-authentication';
import { useFirebaseDatabase as FirebaseDatabase } from './firebase-database';
import { whatsappManager as WhatsAppManager } from './whatsapp-manager';
import { TransactionManager } from './transaction-manager';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ServiceIntegrationHub {
  private static instance: ServiceIntegrationHub;
  private network: NetworkIntegration;
  private auth: OTPAuthentication;
  private database: FirebaseDatabase;
  private whatsapp: WhatsAppManager;
  private transactions: TransactionManager;
  private initialized: boolean = false;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cacheDefaults = {
    properties: 5 * 60 * 1000,
    wallet: 2 * 60 * 1000,
    property: 10 * 60 * 1000,
  };

  private constructor() {
    this.network = new NetworkIntegration();
    this.auth = new OTPAuthentication();
    this.database = new FirebaseDatabase();
    this.whatsapp = new WhatsAppManager();
    this.transactions = new TransactionManager();
  }

  static getInstance(): ServiceIntegrationHub {
    if (!ServiceIntegrationHub.instance) {
      ServiceIntegrationHub.instance = new ServiceIntegrationHub();
    }
    return ServiceIntegrationHub.instance;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await Promise.all([
        this.database.initialize(),
        this.network.initialize(),
      ]);
      this.initialized = true;
      console.log('[RE Platform] All services initialized successfully');
    } catch (error) {
      console.error('[RE Platform] Initialization failed:', error);
      throw error;
    }
  }

  async processPayment(userId: string, propertyId: string, amount: number, type: string) {
    const transaction = await this.network.processTransaction(propertyId, amount, type);
    await this.database.addTransaction(userId, transaction);
    this.cache.delete(`wallet_${userId}`);
    return transaction;
  }

  async getWalletStatus(userId: string) {
    const cacheKey = `wallet_${userId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;
    const wallet = await this.network.getWallet(userId);
    this.setCache(cacheKey, wallet, this.cacheDefaults.wallet);
    return wallet;
  }

  async sendOTP(phone: string): Promise<string> {
    return await this.auth.sendOTP(phone);
  }

  async verifyOTP(phone: string, code: string) {
    const session = await this.auth.verifyOTP(phone, code);
    await this.database.createSession(phone, session);
    return session;
  }

  async getProperties(filters?: any) {
    const cacheKey = `properties_${JSON.stringify(filters || {})}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;
    const properties = await this.database.getProperties(filters);
    this.setCache(cacheKey, properties, this.cacheDefaults.properties);
    return properties;
  }

  async getProperty(id: string) {
    const cacheKey = `property_${id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;
    const property = await this.database.getProperty(id);
    this.setCache(cacheKey, property, this.cacheDefaults.property);
    return property;
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidatePropertyCache(): void {
    Array.from(this.cache.keys())
      .filter(key => key.startsWith('properties_') || key.startsWith('property_'))
      .forEach(key => this.cache.delete(key));
  }

  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
    };
  }

  async getUserProfile(userId: string) {
    return await this.database.getUser(userId);
  }

  async updateUserProfile(userId: string, data: any) {
    return await this.database.updateUser(userId, data);
  }

  async getTransactionHistory(userId: string) {
    return await this.database.getTransactions(userId);
  }

  async sendPropertyInquiry(phone: string, propertyId: string, name: string) {
    return await this.whatsapp.sendInquiry(phone, propertyId, name);
  }

  async sendBookingRequest(phone: string, propertyId: string, dates: any) {
    return await this.whatsapp.sendBookingRequest(phone, propertyId, dates);
  }

  async getServiceStatus() {
    return {
      network: this.network.isInitialized(),
      auth: this.auth.isInitialized(),
      database: this.database.isInitialized(),
      whatsapp: this.whatsapp.isInitialized(),
      initialized: this.initialized,
    };
  }

  async recoverSession(sessionToken: string) {
    try {
      return await this.database.validateSession(sessionToken);
    } catch (error) {
      console.error('[RE Platform] Session recovery failed:', error);
      return null;
    }
  }

  async performHealthCheck() {
    const checks = {
      database: await this.database.healthCheck(),
      network: await this.network.healthCheck(),
      auth: await this.auth.healthCheck(),
      timestamp: new Date().toISOString(),
    };
    return checks;
  }
}

export const serviceHub = ServiceIntegrationHub.getInstance();
