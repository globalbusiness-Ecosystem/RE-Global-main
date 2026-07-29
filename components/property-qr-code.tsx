'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface PropertyQRCodeProps {
  propertyId: string | number;
  size?: number;
  className?: string;
}

export function PropertyQRCode({ propertyId, size = 96, className = '' }: PropertyQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const value = `re-global://property/${propertyId}`;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).catch((e) => console.error('[PropertyQRCode] generation error:', e));
  }, [propertyId, size]);

  return <canvas ref={canvasRef} className={className} width={size} height={size} />;
}
