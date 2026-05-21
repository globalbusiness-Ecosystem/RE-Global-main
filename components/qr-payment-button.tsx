'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Loader2, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { PRODUCT_CONFIG } from '@/lib/product-config';
import type { Product } from '@/lib/sdklite-types';

interface QRPaymentButtonProps {
  propertyId: string;
  language: 'en' | 'ar';
  className?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

// Memoized error messages object to avoid recreating on each render
const ERROR_MESSAGES = {
  en: {
    notAvailable: 'Payment system not available',
    success: 'QR Code generated successfully!',
    productNotFound: 'Product not found',
    purchaseCancelled: 'Purchase cancelled',
    purchaseError: 'Purchase error',
    paymentFailed: 'Payment failed',
    retry: 'Retry',
    generateQR: 'Generate QR',
    qrGenerated: 'QR Generated',
  },
  ar: {
    notAvailable: 'نظام الدفع غير متاح',
    success: 'تم إنشاء رمز QR بنجاح!',
    productNotFound: 'المنتج غير موجود',
    purchaseCancelled: 'تم إلغاء الشراء',
    purchaseError: 'خطأ في الشراء',
    paymentFailed: 'فشل الدفع',
    retry: 'إعادة محاولة',
    generateQR: 'إنشاء QR',
    qrGenerated: 'تم إنشاء QR',
  },
};

function QRPaymentButtonComponent({
  propertyId,
  language,
  className = '',
  onSuccess,
  onError,
}: QRPaymentButtonProps) {
  const { sdk, products, restoredPurchases } = usePiAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0);

  // Memoize product lookup to avoid recalculating
  const productData = useMemo(() => {
    if (!products || products.length === 0) return null;
    return products.find(
      (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a04d26a6998bdd155eb3d53
    ) || null;
  }, [products]);

  // Memoize quantity calculation
  const purchaseQuantity = useMemo(() => {
    if (!productData || !restoredPurchases) return 0;
    return (
      restoredPurchases.find((p) => p.productId === productData.slug)?.quantity ?? 0
    );
  }, [productData, restoredPurchases]);

  // Update product and quantity when memoized values change
  useEffect(() => {
    if (productData !== product || purchaseQuantity !== quantity) {
      setProduct(productData);
      setQuantity(purchaseQuantity);
    }
  }, [productData, purchaseQuantity, product, quantity]);

  // Memoize message lookup
  const messages = useMemo(() => ERROR_MESSAGES[language], [language]);

  // Memoize purchase handler with useCallback
  const handlePurchase = useCallback(async () => {
    if (!sdk || !product) {
      setPaymentState({
        status: 'error',
        message: messages.notAvailable,
      });
      return;
    }

    setPaymentState({ status: 'processing' });

    try {
      const result = await sdk.makePurchase(product.slug);

      if (result.ok) {
        // If consumable, consume it
        if (product.is_consumable) {
          await sdk.state.consume(product.slug, 1);
        }

        setPaymentState({
          status: 'success',
          message: messages.success,
        });

        // Update quantity
        setQuantity((prev) => prev + 1);

        if (onSuccess) {
          onSuccess(result);
        }

        // Reset after 3 seconds
        const timeoutId = setTimeout(() => {
          setPaymentState({ status: 'idle' });
        }, 3000);

        return () => clearTimeout(timeoutId);
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error: any) {
      let errorMessage = messages.paymentFailed;

      if (error.code === 'product_not_found') {
        errorMessage = messages.productNotFound;
      } else if (error.code === 'purchase_cancelled') {
        errorMessage = messages.purchaseCancelled;
      } else if (error.code === 'purchase_error') {
        errorMessage = messages.purchaseError;
      }

      setPaymentState({
        status: 'error',
        message: errorMessage,
      });

      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [sdk, product, messages, onSuccess, onError]);

  // Memoize price label
  const priceLabel = useMemo(() => {
    if (!product) return '';
    return `π${product.price_in_pi.toFixed(2)}`;
  }, [product]);

  // Memoize button label
  const buttonLabel = useMemo(() => {
    if (!product) return messages.generateQR;
    return language === 'en'
      ? `Generate QR - ${priceLabel}`
      : `إنشاء QR - ${priceLabel}`;
  }, [product, priceLabel, language, messages]);

  // Memoize button title
  const buttonTitle = useMemo(
    () =>
      language === 'en'
        ? `Generate QR Code - ${priceLabel}`
        : `إنشاء رمز QR - ${priceLabel}`,
    [language, priceLabel]
  );

  if (!product) {
    return (
      <button
        disabled
        className={`w-full py-2 px-3 rounded-lg text-xs font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2 bg-accent/20 text-accent ${className}`}
      >
        <QrCode className="w-3 h-3" />
        {language === 'en' ? 'QR System' : 'نظام QR'}
      </button>
    );
  }

  // Show success state
  if (paymentState.status === 'success') {
    return (
      <button
        disabled
        className={`w-full py-2 px-3 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/50 flex items-center justify-center gap-2 ${className}`}
      >
        <CheckCircle className="w-3 h-3" />
        {messages.qrGenerated}
      </button>
    );
  }

  // Show error state
  if (paymentState.status === 'error') {
    return (
      <div className={`space-y-1 ${className}`}>
        <button
          onClick={handlePurchase}
          disabled={paymentState.status === 'processing'}
          className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/50 flex items-center justify-center gap-2 hover:bg-red-600/30 transition"
        >
          <AlertCircle className="w-3 h-3" />
          {messages.retry}
        </button>
        {paymentState.message && (
          <p className="text-xs text-red-400 text-center">
            {paymentState.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={paymentState.status === 'processing'}
      className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
        paymentState.status === 'processing'
          ? 'bg-accent/50 text-accent-foreground/50 cursor-not-allowed'
          : 'bg-accent/20 hover:bg-accent/40 text-accent border border-accent/30 hover:border-accent/60'
      } ${className}`}
      title={buttonTitle}
    >
      {paymentState.status === 'processing' && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {paymentState.status !== 'processing' && (
        <QrCode className="w-3 h-3" />
      )}
      <span className="truncate">{buttonLabel}</span>
    </button>
  );
}

// Export memoized component to prevent unnecessary re-renders from parent
export const QRPaymentButton = memo(QRPaymentButtonComponent);
