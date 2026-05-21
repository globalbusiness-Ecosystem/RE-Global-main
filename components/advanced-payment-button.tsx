'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTransactionManager } from '@/lib/transaction-manager';

interface AdvancedPaymentButtonProps {
  propertyId: string;
  propertyTitle: string;
  price: number;
  currency: 'PI' | 'USD';
  transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized';
  language: 'en' | 'ar';
  userId?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showModal?: boolean;
}

interface PaymentModalState {
  isOpen: boolean;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  transactionId?: string;
}

export function AdvancedPaymentButton({
  propertyId,
  propertyTitle,
  price,
  currency,
  transactionType,
  language,
  userId = 'user_123',
  onSuccess,
  onError,
  className = '',
  showModal = true
}: AdvancedPaymentButtonProps) {
  const transactionManager = useTransactionManager();
  const [modalState, setModalState] = useState<PaymentModalState>({ isOpen: false, status: 'idle' });
  const isArabic = language === 'ar';

  const getButtonText = () => {
    const texts = {
      en: {
        buy: 'Buy Now',
        rent: 'Rent Now',
        hotel: 'Book Now',
        invest: 'Invest Now',
        tokenized: 'Tokenize'
      },
      ar: {
        buy: 'اشتر الآن',
        rent: 'استأجر الآن',
        hotel: 'احجز الآن',
        invest: 'استثمر الآن',
        tokenized: 'رمز'
      }
    };
    return texts[language][transactionType];
  };

  const handlePayment = async () => {
    try {
      if (showModal) {
        setModalState({ isOpen: true, status: 'processing' });
      }

      toast.loading(isArabic ? 'جاري معالجة الدفع...' : 'Processing payment...', { id: 'payment' });

      const result = await transactionManager.processPayment(
        userId,
        price,
        currency,
        transactionType,
        propertyId,
        propertyTitle,
        { propertyType: transactionType }
      );

      if (result.success) {
        toast.success(
          isArabic 
            ? `تم دفع ${price} ${currency} بنجاح!`
            : `Payment of ${price} ${currency} processed successfully!`,
          { id: 'payment' }
        );

        if (showModal) {
          setModalState({
            isOpen: true,
            status: 'success',
            message: isArabic 
              ? `تم الدفع بنجاح لـ ${propertyTitle}`
              : `Successfully paid for ${propertyTitle}`,
            transactionId: result.data?.transactionId
          });
        }

        onSuccess?.(result.data);
      } else {
        const errorMessage = result.error || (isArabic ? 'فشل الدفع' : 'Payment failed');
        toast.error(errorMessage, { id: 'payment' });

        if (showModal) {
          setModalState({
            isOpen: true,
            status: 'error',
            message: errorMessage
          });
        }

        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (isArabic ? 'حدث خطأ' : 'An error occurred');
      toast.error(errorMessage, { id: 'payment' });

      if (showModal) {
        setModalState({
          isOpen: true,
          status: 'error',
          message: errorMessage
        });
      }

      onError?.(errorMessage);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, status: 'idle' });
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={modalState.status === 'processing'}
        className={`bg-accent hover:bg-accent/90 text-background w-full ${className}`}
      >
        {modalState.status === 'processing' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isArabic ? 'جاري المعالجة...' : 'Processing...'}
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {getButtonText()} - {transactionManager.formatCurrency(price, currency)}
          </>
        )}
      </Button>

      {/* Payment Modal */}
      {showModal && modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            {/* Status Icon */}
            <div className="flex justify-center">
              {modalState.status === 'processing' && (
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                </div>
              )}
              {modalState.status === 'success' && (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              )}
              {modalState.status === 'error' && (
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                {modalState.status === 'processing' && (isArabic ? 'جاري معالجة الدفع' : 'Processing Payment')}
                {modalState.status === 'success' && (isArabic ? 'نجح الدفع' : 'Payment Successful')}
                {modalState.status === 'error' && (isArabic ? 'فشل الدفع' : 'Payment Failed')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {modalState.message}
              </p>
            </div>

            {/* Details */}
            {(modalState.status === 'success' || modalState.status === 'error') && (
              <Card className="p-4 bg-muted/30 border-0 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'العقار' : 'Property'}:</span>
                  <span className="font-semibold">{propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}:</span>
                  <span className="font-semibold">{transactionManager.formatCurrency(price, currency)}</span>
                </div>
                {modalState.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}:</span>
                    <span className="font-mono text-xs">{modalState.transactionId.slice(0, 12)}...</span>
                  </div>
                )}
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {modalState.status === 'processing' && (
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                  disabled
                >
                  {isArabic ? 'الرجاء الانتظار' : 'Please wait'}
                </Button>
              )}
              {(modalState.status === 'success' || modalState.status === 'error') && (
                <>
                  {modalState.status === 'error' && (
                    <Button
                      variant="outline"
                      onClick={handlePayment}
                      className="flex-1"
                    >
                      {isArabic ? 'إعادة محاولة' : 'Retry'}
                    </Button>
                  )}
                  <Button
                    onClick={closeModal}
                    className={`flex-1 ${modalState.status === 'success' ? 'bg-accent' : ''}`}
                  >
                    {isArabic ? 'إغلاق' : 'Close'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
