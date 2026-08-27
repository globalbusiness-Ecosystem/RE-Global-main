'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertTriangle, ImageUp } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  language: NavLanguage;
  onScan: (value: string) => void;
  onClose: () => void;
}

export function QRScannerModal({ language, onScan, onClose }: QRScannerModalProps) {
  const isArabic = language === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      URL.revokeObjectURL(url);
      if (code && code.data) {
        onScan(code.data);
      } else {
        setError(isArabic ? 'لم يتم العثور على QR في هذه الصورة' : 'No QR code found in this image');
      }
    };
    img.src = url;
  };

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        scanLoop();
      } catch (e) {
        console.error('[QRScanner] Camera error:', e);
        setError(
          isArabic
            ? 'تعذر الوصول للكاميرا. تأكد من إعطاء الإذن.'
            : 'Could not access the camera. Please grant permission.'
        );
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        onScan(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(scanLoop);
    };

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[110] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isArabic ? 'وجّه الكاميرا نحو الـ QR' : 'Point the camera at the QR code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10"
          >
            <ImageUp className="w-4 h-4" />
            {isArabic ? 'رفع صورة' : 'Upload image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
          />
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-6 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-yellow-400" />
            <p className="text-sm text-white/80">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-accent rounded-lg" />
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
