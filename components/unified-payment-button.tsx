'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface UnifiedPaymentButtonProps {
  propertyId: string;
  propertyTitle: string;
  price: number;
  transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized';
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  className?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export function UnifiedPaymentButton({
  propertyId,
  propertyTitle,
  price,
  transactionType,
  language,
  currency,
  className = '',
  onSuccess,
  onError,
}: UnifiedPaymentButtonProps) {
  const { sdk, isAuthenticated } = usePiAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isPiAvailable = typeof window !== 'undefined' && window.Pi && typeof window.Pi.createPayment === 'function';

  const getTransactionLabel = () => {
    const labels = {
      buy: language === 'en' ? 'Buy' : 'شراء',
      rent: language === 'en' ? 'Rent' : 'استئجر',
      hotel: language === 'en' ? 'Book' : 'احجز',
      invest: language === 'en' ? 'Invest' : 'استثمر',
      tokenized: language === 'en' ? 'Tokenize' : 'رمز',
    };
    return labels[transactionType];
  };

  const handlePayment = async () => {
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      setPaymentState({
        status: 'error',
        message: language === 'en' ? 'Pi Network not available' : 'شبكة Pi غير متاحة',
      });
      return;
    }

    setPaymentState({ status: 'processing' });

    try {
      // Determine payment amount and memo based on transaction type
      let paymentAmount = 50;
      let paymentMemo = 'Property Payment';

      if (transactionType === 'buy') {
        paymentAmount = 1;
        paymentMemo = 'Property Purchase';
      }

      console.log('[v0] Initiating Pi payment:', { amount: paymentAmount, memo: paymentMemo, type: transactionType });
      
      // Create payment with Pi.createPayment()
      const paymentResult = await new Promise<{ paymentId: string; txid?: string; status: string }>((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: paymentAmount,
            memo: paymentMemo,
            metadata: {
              propertyId,
              transactionType,
              currency,
            },
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('[v0] Payment ready for approval:', paymentId);
              resolve({ paymentId, status: 'ready' });
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('[v0] Payment ready for completion:', paymentId, txid);
              resolve({ paymentId, txid, status: 'completed' });
            },
            onCancel: () => {
              console.log('[v0] Payment cancelled by user');
              reject(new Error('Payment cancelled by user'));
            },
            onError: (error: any) => {
              console.log('[v0] Payment error:', error);
              reject(error);
            },
          }
        );
      });

      console.log('[v0] Payment result:', paymentResult);

      // Format success message based on transaction type
      let successMessage = language === 'en' 
        ? `Payment of ${paymentAmount} Pi processed successfully!`
        : `تم معالجة دفع ${paymentAmount} Pi بنجاح!`;

      if (transactionType === 'buy') {
        successMessage = language === 'en'
          ? 'Property purchase payment completed successfully!'
          : 'تم إتمام دفع شراء العقار بنجاح!';
      }

      setPaymentState({
        status: 'success',
        message: successMessage,
      });

      if (onSuccess) {
        onSuccess(paymentResult);
      }

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentState({ status: 'idle' });
      }, 3000);
    } catch (error) {
      console.log('[v0] Payment exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentState({
        status: 'error',
        message: language === 'en' ? errorMessage : `خطأ: ${errorMessage}`,
      });

      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const getButtonText = () => {
    if (paymentState.status === 'processing') {
      return language === 'en' ? 'Processing...' : 'جاري المعالجة...';
    }
    if (paymentState.status === 'success') {
      return language === 'en' ? 'Success!' : 'نجح!';
    }
    return `${getTransactionLabel()} π${price}`;
  };

  const getButtonColor = () => {
    if (paymentState.status === 'success') return 'bg-green-600 hover:bg-green-700';
    if (paymentState.status === 'error') return 'bg-red-600 hover:bg-red-700';
    return 'bg-accent hover:bg-accent/90';
  };

  return (
    <>
      <button
        onClick={() => setShowPaymentModal(true)}
        disabled={paymentState.status === 'processing' || !isPiAvailable}
        className={`${getButtonColor()} text-accent-foreground py-2 px-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm w-full ${className}`}
      >
        {paymentState.status === 'processing' && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {paymentState.status === 'success' && (
          <CheckCircle className="w-4 h-4" />
        )}
        {paymentState.status !== 'processing' && paymentState.status !== 'success' && (
          <ShoppingCart className="w-4 h-4" />
        )}
        <span>{getButtonText()}</span>
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4 animate-in fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-accent">
                {language === 'en' ? 'Confirm Transaction' : 'تأكيد العملية'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {language === 'en' ? 'Review and confirm your purchase' : 'راجع وأكد عملية الشراء'}
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-4 space-y-3 border border-border">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground text-sm">
                  {language === 'en' ? 'Property' : 'العقار'}
                </span>
                <span className="font-semibold text-right line-clamp-2 ml-2">
                  {propertyTitle}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-muted-foreground text-sm">
                  {language === 'en' ? 'Transaction Type' : 'نوع العملية'}
                </span>
                <span className="font-semibold text-accent capitalize">
                  {transactionType}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-muted-foreground text-sm">
                  {language === 'en' ? 'Amount' : 'المبلغ'}
                </span>
                <span className="font-bold text-xl text-accent">
                  {price.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {paymentState.status === 'error' && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{paymentState.message}</p>
              </div>
            )}

            {paymentState.status === 'success' && (
              <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">{paymentState.message}</p>
              </div>
            )}

            {paymentState.status === 'processing' && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex gap-2 items-center justify-center">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <p className="text-sm text-accent">
                  {language === 'en' ? 'Processing payment...' : 'جاري معالجة الدفع...'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentState.status === 'processing'}
                className="border border-border text-foreground py-2 rounded-lg font-semibold hover:bg-background/50 transition disabled:opacity-50"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentState.status === 'processing' || paymentState.status === 'success'}
                className={`${getButtonColor()} text-accent-foreground py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {paymentState.status === 'processing' && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {paymentState.status === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'en' ? 'Done' : 'تم'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{getTransactionLabel()} {language === 'en' ? 'Now' : 'الآن'}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {language === 'en' 
                ? 'Your transaction is secured by Pi Network'
                : 'تم تأمين المعاملة بواسطة شبكة Pi'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
