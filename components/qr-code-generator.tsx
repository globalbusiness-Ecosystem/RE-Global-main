'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { qrp } from '@/lib/qr-pay-labels';

interface QRCodeGeneratorProps {
  propertyId: string;
  propertyName: string;
  propertyUrl?: string;
  size?: number;
  language?: string;
}

export const QRCodeGenerator = ({
  propertyId,
  propertyName,
  propertyUrl,
  size = 256,
  language = 'en',
}: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR code using a simple algorithm
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Use a free QR code API for simplicity
        const baseUrl = window.location.origin;
        const propertyLink = propertyUrl || `${baseUrl}?property=${propertyId}`;
        const encodedUrl = encodeURIComponent(propertyLink);
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
        
        setQrDataUrl(qrCodeUrl);

        // Draw on canvas for download functionality
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, size, size);
              ctx.drawImage(img, 0, 0, size, size);
            }
          }
        };
        img.src = qrCodeUrl;
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();
  }, [propertyId, propertyUrl, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `QR-${propertyId}.png`;
      link.click();
    }
  };

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="bg-gray-50 p-2 rounded">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`${qrp('qrAlt', language)}: ${propertyName}`}
            width={size}
            height={size}
            className="border-2 border-gray-200"
          />
        ) : (
          <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
            <p className="text-gray-400">{qrp('generating', language)}</p>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2"
          title={qrp('downloadTitle', language)}
        >
          <Download className="w-4 h-4" />
          {qrp('download', language)}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-2"
          title={qrp('copyTitle', language)}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              {qrp('copied', language)}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {qrp('copy', language)}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        {propertyName}
      </p>
    </div>
  );
};
