'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Printer, QrCode, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeGenerator } from './qr-code-generator';
import { downloadQRCode, copyQRCodeToClipboard } from '@/lib/qr-code-utils';

interface PropertyQRData {
  id: string;
  name: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
}

interface QRCodesManagerProps {
  properties: PropertyQRData[];
  language: 'en' | 'ar';
}

export const QRCodesManager = ({ properties, language }: QRCodesManagerProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = async (propertyId: string) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
        `${typeof window !== 'undefined' ? window.location.origin : 'https://re.pi'}?property=${propertyId}`
      )}`;
      await downloadQRCode(qrUrl, propertyId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopy = async (propertyId: string) => {
    const success = await copyQRCodeToClipboard(propertyId);
    if (success) {
      setCopied(propertyId);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handlePrint = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `${typeof window !== 'undefined' ? window.location.origin : 'https://re.pi'}?property=${propertyId}`
    )}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${property.name}</title>
        <style>
          body { font-family: Arial; margin: 20px; background: white; }
          .container { max-width: 600px; margin: 0 auto; text-align: center; }
          .qr-code { margin: 20px 0; }
          .qr-code img { width: 300px; height: 300px; border: 2px solid #f59e0b; padding: 10px; }
          h2 { color: #030712; }
          .info { margin-top: 20px; border-top: 2px solid #f59e0b; padding-top: 20px; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .price { font-size: 18px; font-weight: bold; color: #f59e0b; margin: 10px 0; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${property.name}</h2>
          <div class="qr-code">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
          <div class="info">
            <div class="price">π${property.price.toLocaleString()}</div>
            <div class="row">
              <span>${language === 'en' ? 'Location' : 'الموقع'}:</span>
              <strong>${property.city}</strong>
            </div>
            <div class="row">
              <span>${language === 'en' ? 'Bedrooms' : 'الغرف'}:</span>
              <strong>${property.bedrooms}</strong>
            </div>
            <div class="row">
              <span>${language === 'en' ? 'Area' : 'المساحة'}:</span>
              <strong>${property.area} m²</strong>
            </div>
            <div class="row">
              <span>${language === 'en' ? 'ID' : 'المعرف'}:</span>
              <strong>${propertyId}</strong>
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">
          {language === 'en' ? 'No properties to generate QR codes' : 'لا توجد عقارات لإنشاء رموز QR'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex gap-2 justify-end">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
          title="Grid view"
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          title="List view"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <QRCodeGenerator
                  propertyId={property.id}
                  propertyName={property.name}
                  size={256}
                />
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-sm truncate">{property.name}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{property.city}</p>
                  <p className="text-primary font-semibold">π{property.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(property.id)}
                  className="flex-1"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(property.id)}
                  className="flex-1"
                  title="Copy link"
                >
                  {copied === property.id ? (
                    <span className="text-green-600 text-xs">Copied</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrint(property.id)}
                  className="flex-1"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{property.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {property.city} • π{property.price.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(property.id)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(property.id)}
                  title="Copy link"
                >
                  {copied === property.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePrint(property.id)}
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
