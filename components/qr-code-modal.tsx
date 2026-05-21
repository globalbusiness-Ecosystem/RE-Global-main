'use client';

import { useState } from 'react';
import { X, Download, Copy, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeGenerator } from './qr-code-generator';
import { printQRCode } from '@/lib/qr-code-utils';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
  language: 'en' | 'ar';
}

export const QRCodeModal = ({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  price,
  city,
  bedrooms,
  area,
  language,
}: QRCodeModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const propertyShareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://re.pi'}?property=${propertyId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(propertyShareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    printQRCode(qrImageUrl, {
      propertyId,
      propertyName,
      price,
      city,
      bedrooms,
      area,
      currency: 'π',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {language === 'en' ? 'Property QR Code' : 'رمز الملكية'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* QR Code Generator */}
        <div className="flex justify-center">
          <QRCodeGenerator
            propertyId={propertyId}
            propertyName={propertyName}
            propertyUrl={propertyShareUrl}
            size={300}
          />
        </div>

        {/* Property Info */}
        <div className="bg-secondary/10 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold text-foreground">{propertyName}</p>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div>
              <span className="text-xs">{language === 'en' ? 'Location' : 'الموقع'}:</span>
              <p className="font-medium text-foreground">{city}</p>
            </div>
            <div>
              <span className="text-xs">{language === 'en' ? 'Price' : 'السعر'}:</span>
              <p className="font-medium text-foreground">{price.toLocaleString()}π</p>
            </div>
            <div>
              <span className="text-xs">{language === 'en' ? 'Bedrooms' : 'الغرف'}:</span>
              <p className="font-medium text-foreground">{bedrooms}</p>
            </div>
            <div>
              <span className="text-xs">{language === 'en' ? 'Area' : 'المساحة'}:</span>
              <p className="font-medium text-foreground">{area}m²</p>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-secondary/10 rounded-lg p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Share Link' : 'رابط المشاركة'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={propertyShareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-background border border-border rounded text-xs text-foreground truncate"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  {language === 'en' ? 'Copied' : 'تم'}
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  {language === 'en' ? 'Copy' : 'نسخ'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={handlePrint}
            title={language === 'en' ? 'Print QR Code' : 'طباعة رمز QR'}
          >
            <Printer className="w-4 h-4" />
            {language === 'en' ? 'Print' : 'طباعة'}
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={onClose}
          >
            {language === 'en' ? 'Close' : 'إغلاق'}
          </Button>
        </div>
      </div>
    </div>
  );
};
