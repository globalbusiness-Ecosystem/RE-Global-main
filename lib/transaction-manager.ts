'use client';

export interface Transaction {
  transactionId: string;
  paymentId: string;
  userId: string;
  amount: number;
  currency: 'PI' | 'USD';
  transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized';
  propertyId: string;
  propertyTitle: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: string;
  metadata?: Record<string, any>;
  description: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: 'PI' | 'USD';
  totalSpent: number;
  totalEarned: number;
  createdAt: string;
  transactions: Transaction[];
}

export class TransactionManager {
  private apiUrl = '/api/payments';

  async processPayment(
    userId: string,
    amount: number,
    currency: 'PI' | 'USD',
    transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized',
    propertyId: string,
    propertyTitle: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          currency,
          transactionType,
          propertyId,
          propertyTitle,
          metadata
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Payment failed' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[v0] Payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const response = await fetch(`${this.apiUrl}?userId=${userId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.wallet;
    } catch (error) {
      console.error('[v0] Wallet fetch error:', error);
      return null;
    }
  }

  async getTransactions(userId: string, type?: string): Promise<Transaction[]> {
    try {
      let url = `${this.apiUrl}?userId=${userId}`;
      if (type) url += `&type=${type}`;
      
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('[v0] Transactions fetch error:', error);
      return [];
    }
  }

  async getTransactionHistory(userId: string, limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactions(userId);
    return transactions.slice(0, limit).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  formatCurrency(amount: number, currency: 'PI' | 'USD'): string {
    if (currency === 'PI') return `${amount.toFixed(2)} π`;
    return `$${amount.toFixed(2)}`;
  }

  getTransactionIcon(type: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized'): string {
    const icons = {
      buy: '🏠',
      rent: '🔑',
      hotel: '🏨',
      invest: '💰',
      tokenized: '📊'
    };
    return icons[type];
  }

  getTransactionLabel(type: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized', language: 'en' | 'ar'): string {
    const labels = {
      en: {
        buy: 'Property Purchase',
        rent: 'Property Rental',
        hotel: 'Hotel Booking',
        invest: 'Investment',
        tokenized: 'Tokenized Property'
      },
      ar: {
        buy: 'شراء عقار',
        rent: 'استئجار عقار',
        hotel: 'حجز فندق',
        invest: 'استثمار',
        tokenized: 'عقار معروق'
      }
    };
    return labels[language][type];
  }

  getStatusColor(status: 'pending' | 'completed' | 'failed' | 'refunded'): string {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      completed: 'bg-green-500/10 text-green-700 dark:text-green-400',
      failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
      refunded: 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    };
    return colors[status];
  }
}

export const transactionManager = new TransactionManager();

export function useTransactionManager() {
  return {
    processPayment: transactionManager.processPayment.bind(transactionManager),
    getWallet: transactionManager.getWallet.bind(transactionManager),
    getTransactions: transactionManager.getTransactions.bind(transactionManager),
    getTransactionHistory: transactionManager.getTransactionHistory.bind(transactionManager),
    formatCurrency: transactionManager.formatCurrency.bind(transactionManager),
    getTransactionIcon: transactionManager.getTransactionIcon.bind(transactionManager),
    getTransactionLabel: transactionManager.getTransactionLabel.bind(transactionManager),
    getStatusColor: transactionManager.getStatusColor.bind(transactionManager)
  };
}
