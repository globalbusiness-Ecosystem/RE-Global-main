'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { deviceMediaService, type CapturedMedia } from '@/lib/device-media-service';
import { Button } from '@/components/ui/button';

export type { CapturedMedia } from '@/lib/device-media-service';

interface MediaCaptureProps {
  onMediaCapture?: (media: CapturedMedia) => void;
  onMediaUpload?: (result: { url: string; id: string }) => void;
  language?: 'en' | 'ar';
  maxSize?: number;
}

export function MediaCapture({ 
  onMediaCapture, 
  onMediaUpload, 
  language = 'en',
  maxSize = 10 * 1024 * 1024 
}: MediaCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CapturedMedia | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isArabic = language === 'ar';

  const labels = {
    en: {
      takPhoto: 'Take Photo',
      selectGallery: 'Select from Gallery',
      capture: 'Capture',
      cancel: 'Cancel',
      upload: 'Upload to Aladdin',
      remove: 'Remove',
      uploading: 'Uploading...',
      analyzing: 'Analyzing property...',
      error: 'Error',
      permissionDenied: 'Camera permission denied',
      noCamera: 'No camera found',
    },
    ar: {
      takPhoto: 'التقط صورة',
      selectGallery: 'اختر من الصور',
      capture: 'التقط',
      cancel: 'إلغاء',
      upload: 'رفع إلى علاء الدين',
      remove: 'إزالة',
      uploading: 'جاري الرفع...',
      analyzing: 'جاري تحليل العقار...',
      error: 'خطأ',
      permissionDenied: 'تم رفض الوصول للكاميرا',
      noCamera: 'لا توجد كاميرا متاحة',
    },
  };

  const t = labels[isArabic ? 'ar' : 'en'];

  // Initialize camera
  const handleOpenCamera = async () => {
    try {
      setError(null);
      if (!videoRef.current) return;

      await deviceMediaService.requestCameraAccess(videoRef.current);
      setIsCameraOpen(true);
    } catch (err: any) {
      setError(err.message || t.permissionDenied);
    }
  };

  // Capture photo
  const handleCapture = async () => {
    try {
      setIsLoading(true);
      const media = await deviceMediaService.capturePhoto(0.9);
      setPreview(media);
      setIsCameraOpen(false);
      deviceMediaService.stopCamera();
      onMediaCapture?.(media);
    } catch (err: any) {
      setError(err.message || 'Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  };

  // Select from gallery
  const handleSelectGallery = async () => {
    try {
      setError(null);
      const media = await deviceMediaService.selectFromGallery();
      
      if (media.metadata && media.metadata.size && media.metadata.size > maxSize) {
        setError('Image size exceeds limit');
        return;
      }

      setPreview(media);
      onMediaCapture?.(media);
    } catch (err: any) {
      setError(err.message || 'Failed to select image');
    }
  };

  // Upload media
  const handleUpload = async () => {
    if (!preview) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await deviceMediaService.uploadMedia(preview);
      
      // Analyze the image for property insights
      try {
        const analysis = await deviceMediaService.analyzePropertyImage(result.url);
        onMediaUpload?.({ ...result, analysis });
      } catch {
        onMediaUpload?.(result);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Close camera
  const handleCloseCamera = () => {
    deviceMediaService.stopCamera();
    setIsCameraOpen(false);
  };

  // Remove preview
  const handleRemove = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
    setError(null);
  };

  return (
    <div className={`flex flex-col gap-4 p-4 rounded-lg border border-slate-700 bg-slate-950 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Camera View */}
      {isCameraOpen && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-gradient-to-t from-black to-transparent">
            <Button
              onClick={handleCapture}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {t.capture}
            </Button>
            <Button
              onClick={handleCloseCamera}
              variant="secondary"
              className="flex-1"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && !isCameraOpen && (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={preview.url}
            alt="Preview"
            className="w-full aspect-video object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-gradient-to-t from-black to-transparent">
            <Button
              onClick={handleUpload}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.uploading}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t.upload}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCameraOpen && !preview && (
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button
            onClick={handleOpenCamera}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Camera className="w-4 h-4" />
            {t.takPhoto}
          </Button>
          <Button
            onClick={handleSelectGallery}
            variant="secondary"
            className="flex-1 gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            {t.selectGallery}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded bg-red-950 border border-red-700 text-red-200 text-sm">
          <p className="font-semibold">{t.error}:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
