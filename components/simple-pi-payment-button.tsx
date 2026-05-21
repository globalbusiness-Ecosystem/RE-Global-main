'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface SimplePiPaymentButtonProps {
  propertyId?: string;
  language?: 'en' | 'ar';
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function SimplePiPaymentButton({
  propertyId = 'default-property',
  language = 'en',
  onSuccess,
  onError,
  className = '',
}: SimplePiPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      setErrorMessage(language === 'en' ? 'Pi Network not available' : 'شبكة Pi غير متاحة');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      console.log('[v0] Initiating Pi payment: amount=1, memo=Property Purchase');

      const paymentResult = await new Promise<{ paymentId: string; txid?: string; status: string }>(
        (resolve, reject) => {
          window.Pi.createPayment(
            {
              amount: 1,
              memo: 'Property Purchase',
              metadata: {
                propertyId,
              },
            },
            {
              onReadyForServerApproval: async (paymentId: string) => {
                console.log('[v0] Payment ready for approval:', paymentId);
                resolve({ paymentId, status: 'ready' });
              },
              onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                console.log('[v0] Payment completed:', paymentId, txid);
                resolve({ paymentId, txid, status: 'completed' });
              },
              onCancel: () => {
                console.log('[v0] Payment cancelled');
                reject(new Error('Payment cancelled by user'));
              },
              onError: (error: any) => {
                console.log('[v0] Payment error:', error);
                reject(error);
              },
            }
          );
        }
      );

      console.log('[v0] Payment successful:', paymentResult);

      setShowSuccess(true);
      if (onSuccess) {
        onSuccess(paymentResult);
      }

      setTimeout(() => {
        setShowSuccess(false);
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      console.log('[v0] Payment error caught:', errorMsg);
      setErrorMessage(language === 'en' ? errorMsg : `خطأ: ${errorMsg}`);
      setIsProcessing(false);

      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  if (showSuccess) {
    return (
      <button
        disabled
        className={`w-full py-3 px-4 rounded-lg font-semibold bg-green-500/20 text-green-400 border border-green-500/50 ${className}`}
      >
        {language === 'en' ? '✓ Payment Successful' : '✓ تمت العملية بنجاح'}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
          isProcessing
            ? 'bg-accent/50 text-accent-foreground/50 cursor-not-allowed'
            : 'bg-accent hover:bg-accent/90 text-accent-foreground'
        } ${className}`}
      >
        <ShoppingCart className="w-4 h-4" />
        {isProcessing ? (
          <span>{language === 'en' ? 'Processing...' : 'جاري المعالجة...'}</span>
        ) : (
          <span>{language === 'en' ? 'Pay 1 Pi' : 'ادفع 1 Pi'}</span>
        )}
      </button>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
    </div>
  );
}
