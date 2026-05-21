// Pi Network Integration for RE Platform
// Complete system for wallet, transactions, and network connectivity

import { toast } from 'sonner';

export interface NetworkConfig {
  networkId: string;
  apiEndpoint: string;
  wsEndpoint: string;
  contractAddress: string;
  timeout: number;
}

export interface WalletStatus {
  isConnected: boolean;
  address: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
}

export interface NetworkTransaction {
  id: string;
  type: 'buy' | 'rent' | 'invest' | 'tokenized' | 'hotel';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
  propertyId?: string;
}

class NetworkIntegration {
  private config: NetworkConfig;
  private walletStatus: WalletStatus | null = null;
  private transactionHistory: NetworkTransaction[] = [];

  constructor(config: NetworkConfig) {
    this.config = config;
  }

  // Initialize network connection
  async initialize(): Promise<boolean> {
    try {
      console.log('[Network] Initializing Pi Network connection...');
      
      // Check network connectivity
      const isOnline = navigator.onLine;
      if (!isOnline) {
        console.error('[Network] No internet connection');
        toast.error('No internet connection. Please check your network.');
        return false;
      }

      // Initialize wallet
      const walletInitialized = await this.initializeWallet();
      if (!walletInitialized) {
        console.error('[Network] Wallet initialization failed');
        return false;
      }

      console.log('[Network] Pi Network initialized successfully');
      toast.success('Connected to Pi Network');
      return true;
    } catch (error) {
      console.error('[Network] Initialization error:', error);
      toast.error('Failed to connect to Pi Network');
      return false;
    }
  }

  // Initialize wallet
  private async initializeWallet(): Promise<boolean> {
    try {
      // Check if Pi SDK is available
      if (typeof window !== 'undefined' && window.Pi) {
        const user = await window.Pi.authenticate();
        
        this.walletStatus = {
          isConnected: true,
          address: user?.username || 'unknown',
          balance: user?.balance?.pi || 0,
          currency: 'PI',
          lastUpdated: new Date(),
        };
        
        console.log('[Network] Wallet initialized:', this.walletStatus);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Network] Wallet initialization error:', error);
      return false;
    }
  }

  // Get wallet status
  getWalletStatus(): WalletStatus | null {
    return this.walletStatus;
  }

  // Get transaction history
  getTransactionHistory(): NetworkTransaction[] {
    return this.transactionHistory;
  }

  // Process transaction
  async processTransaction(
    propertyId: string,
    amount: number,
    type: NetworkTransaction['type']
  ): Promise<NetworkTransaction | null> {
    try {
      if (!this.walletStatus?.isConnected) {
        throw new Error('Wallet not connected');
      }

      if (this.walletStatus.balance < amount) {
        throw new Error('Insufficient balance');
      }

      console.log(`[Network] Processing ${type} transaction for property ${propertyId}`);

      const transaction: NetworkTransaction = {
        id: `tx_${Date.now()}`,
        type,
        amount,
        status: 'pending',
        timestamp: new Date(),
        propertyId,
      };

      this.transactionHistory.push(transaction);

      // Simulate network processing
      const success = await this.submitToNetwork(transaction);
      
      if (success) {
        transaction.status = 'confirmed';
        this.walletStatus.balance -= amount;
        console.log('[Network] Transaction confirmed:', transaction);
        toast.success(`Transaction confirmed: ${amount} π`);
      } else {
        transaction.status = 'failed';
        console.error('[Network] Transaction failed');
        toast.error('Transaction failed. Please try again.');
      }

      return transaction;
    } catch (error) {
      console.error('[Network] Transaction error:', error);
      toast.error(error instanceof Error ? error.message : 'Transaction error');
      return null;
    }
  }

  // Submit transaction to network
  private async submitToNetwork(transaction: NetworkTransaction): Promise<boolean> {
    try {
      // Simulate network API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, 95% success rate
      return Math.random() > 0.05;
    } catch (error) {
      console.error('[Network] Submission error:', error);
      return false;
    }
  }

  // Update wallet balance
  async updateBalance(): Promise<number> {
    try {
      if (!this.walletStatus) return 0;

      if (typeof window !== 'undefined' && window.Pi) {
        const user = await window.Pi.authenticate();
        const newBalance = user?.balance?.pi || 0;
        this.walletStatus.balance = newBalance;
        this.walletStatus.lastUpdated = new Date();
        return newBalance;
      }

      return this.walletStatus.balance;
    } catch (error) {
      console.error('[Network] Balance update error:', error);
      return this.walletStatus?.balance || 0;
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    this.walletStatus = null;
    this.transactionHistory = [];
    console.log('[Network] Wallet disconnected');
    toast.success('Disconnected from Pi Network');
  }

  // Check connection status
  isConnected(): boolean {
    return this.walletStatus?.isConnected ?? false;
  }

  // Get network configuration
  getConfig(): NetworkConfig {
    return this.config;
  }
}

// Export singleton instance
const defaultConfig: NetworkConfig = {
  networkId: 'pi-testnet',
  apiEndpoint: 'https://api.testnet.pi.network',
  wsEndpoint: 'wss://ws.testnet.pi.network',
  contractAddress: process.env.NEXT_PUBLIC_PI_CONTRACT_ADDRESS || '',
  timeout: 30000,
};

export const networkIntegration = new NetworkIntegration(defaultConfig);

// Hook for React components
export function useNetworkIntegration() {
  return {
    initialize: () => networkIntegration.initialize(),
    getStatus: () => networkIntegration.getWalletStatus(),
    processTransaction: (propertyId: string, amount: number, type: NetworkTransaction['type']) =>
      networkIntegration.processTransaction(propertyId, amount, type),
    updateBalance: () => networkIntegration.updateBalance(),
    getTransactionHistory: () => networkIntegration.getTransactionHistory(),
    disconnect: () => networkIntegration.disconnect(),
    isConnected: () => networkIntegration.isConnected(),
  };
}
