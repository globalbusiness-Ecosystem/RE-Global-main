'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, RefreshCw, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Wallet, Transaction } from '@/lib/transaction-manager';
import { useTransactionManager } from '@/lib/transaction-manager';

interface PaymentPageProps {
  language: 'en' | 'ar';
  userId?: string;
  onBack?: () => void;
}

export default function PaymentPage({ language = 'en', userId = 'user_123', onBack }: PaymentPageProps) {
  const transactionManager = useTransactionManager();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const isArabic = language === 'ar';

  useEffect(() => {
    loadWalletData();
    const interval = setInterval(loadWalletData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const walletData = await transactionManager.getWallet(userId);
      const transactionsData = await transactionManager.getTransactionHistory(userId, 20);
      
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('[v0] Error loading wallet:', error);
      toast.error(isArabic ? 'خطأ في تحميل المحفظة' : 'Error loading wallet');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = selectedType === 'all' 
    ? transactions 
    : transactions.filter(t => t.transactionType === selectedType);

  const stats = {
    totalSpent: wallet?.totalSpent || 0,
    totalEarned: wallet?.totalEarned || 0,
    balance: wallet?.balance || 0
  };

  const transactionTypes = [
    { id: 'all', label: isArabic ? 'الكل' : 'All' },
    { id: 'buy', label: isArabic ? 'الشراء' : 'Buy' },
    { id: 'rent', label: isArabic ? 'الإيجار' : 'Rent' },
    { id: 'invest', label: isArabic ? 'الاستثمار' : 'Invest' },
    { id: 'hotel', label: isArabic ? 'الفنادق' : 'Hotels' }
  ];

  return (
    <div className={`flex flex-col h-full bg-background pb-24 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition"
            >
              ←
            </button>
          )}
          <h1 className="text-xl font-bold text-foreground">
            {isArabic ? 'المحفظة والدفع' : 'Wallet & Payments'}
          </h1>
          <button
            onClick={loadWalletData}
            className="text-muted-foreground hover:text-foreground transition"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !wallet ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {isArabic ? 'الرصيد الحالي' : 'Current Balance'}
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {wallet?.balance.toFixed(2)} <span className="text-2xl">π</span>
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-accent opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'المصروف' : 'Spent'}
                </p>
                <p className="text-lg font-semibold text-red-500">
                  -{stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'المكسب' : 'Earned'}
                </p>
                <p className="text-lg font-semibold text-green-500">
                  +{stats.totalEarned.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-accent hover:bg-accent/90 text-background"
              onClick={() => toast.info(isArabic ? 'إضافة رصيد قريبًا' : 'Add funds coming soon')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isArabic ? 'إضافة رصيد' : 'Add Funds'}
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info(isArabic ? 'سحب الأموال قريبًا' : 'Withdraw coming soon')}
            >
              <Send className="w-4 h-4 mr-2" />
              {isArabic ? 'سحب' : 'Withdraw'}
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
            {transactionTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                  selectedType === type.id
                    ? 'bg-accent text-background'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground px-2">
              {isArabic ? 'سجل المعاملات' : 'Transaction History'}
            </h2>
            {filteredTransactions.length === 0 ? (
              <Card className="p-8 text-center">
                <TrendingDown className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد معاملات' : 'No transactions'}
                </p>
              </Card>
            ) : (
              filteredTransactions.map(transaction => (
                <Card
                  key={transaction.transactionId}
                  className="p-4 hover:bg-muted/50 transition border-l-4 border-l-accent"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">
                        {transaction.propertyTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transactionManager.getTransactionLabel(transaction.transactionType, language)}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(transaction.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        -{transaction.amount.toFixed(2)} {transaction.currency}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                        transactionManager.getStatusColor(transaction.status)
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Info Section */}
          <Card className="p-4 bg-muted/30 border-dashed">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic
                ? 'تُحفظ جميع معاملاتك بأمان. يمكنك عرض سجل المعاملات الكامل وإدارة محفظتك من هنا.'
                : 'All your transactions are securely saved. You can view your complete transaction history and manage your wallet from here.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
