'use client';

export interface PaymentConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  timeout: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: 'π' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'purchase' | 'rental' | 'investment' | 'subscription';
  timestamp: number;
  description: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: 'π' | 'USD';
  transactions: Transaction[];
  createdAt: number;
}

export class PiPaymentManager {
  private config: PaymentConfig;
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Transaction[] = [];

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  createWallet(userId: string, initialBalance: number = 0): Wallet {
    const wallet: Wallet = {
      userId,
      balance: initialBalance,
      currency: 'π',
      transactions: [],
      createdAt: Date.now(),
    };
    this.wallets.set(userId, wallet);
    return wallet;
  }

  getWallet(userId: string): Wallet | null {
    return this.wallets.get(userId) || null;
  }

  processTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const wallet = this.wallets.get(transaction.userId);
    if (!wallet) throw new Error('محفظة غير موجودة');

    if (transaction.status === 'completed' && wallet.balance < transaction.amount) {
      throw new Error('رصيد غير كافي');
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).slice(7),
      timestamp: Date.now(),
    };

    if (transaction.status === 'completed') {
      wallet.balance -= transaction.amount;
      wallet.transactions.push(newTransaction);
    }

    this.transactions.push(newTransaction);
    return newTransaction;
  }

  getTransactionHistory(userId: string): Transaction[] {
    return this.transactions.filter(t => t.userId === userId);
  }

  refund(transactionId: string): boolean {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'completed') return false;

    const wallet = this.wallets.get(transaction.userId);
    if (!wallet) return false;

    wallet.balance += transaction.amount;
    transaction.status = 'cancelled';
    return true;
  }

  convertCurrency(amount: number, from: 'π' | 'USD', to: 'π' | 'USD', exchangeRate: number): number {
    if (from === to) return amount;
    if (to === 'USD') return amount * exchangeRate;
    return amount / exchangeRate;
  }
}

export function usePiPayment(apiKey: string) {
  const manager = new PiPaymentManager({
    apiKey,
    environment: 'sandbox',
    timeout: 30000,
  });

  const createWallet = (userId: string) => {
    return manager.createWallet(userId, 100);
  };

  const processPayment = async (
    userId: string,
    amount: number,
    description: string,
    type: 'purchase' | 'rental' | 'investment' = 'purchase'
  ) => {
    try {
      const transaction = manager.processTransaction({
        userId,
        amount,
        currency: 'π',
        status: 'completed',
        type,
        description,
      });
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const getBalance = (userId: string) => {
    const wallet = manager.getWallet(userId);
    return wallet?.balance || 0;
  };

  const getHistory = (userId: string) => {
    return manager.getTransactionHistory(userId);
  };

  return { createWallet, processPayment, getBalance, getHistory, manager };
}
