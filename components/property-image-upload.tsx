'use client';

import { useState, useRef } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { PropertyImage } from './property-images-carousel';
import { Button } from './ui/button';

interface PropertyImageUploadProps {
  onImagesChange: (images: PropertyImage[]) => void;
  language: 'en' | 'ar';
  maxImages?: number;
  maxFileSize?: number; // in MB
}

export default function PropertyImageUpload({
  onImagesChange,
  language,
  maxImages = 10,
  maxFileSize = 5
}: PropertyImageUploadProps) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError(null);
    setIsLoading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        if (images.length >= maxImages) {
          setError(
            language === 'en'
              ? `Maximum ${maxImages} images allowed`
              : `الحد الأقصى ${maxImages} صور مسموحة`
          );
          break;
        }

        const file = files[i];

        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(
            language === 'en'
              ? `File size must be less than ${maxFileSize}MB`
              : `حجم الملف يجب أن يكون أقل من ${maxFileSize}MB`
          );
          continue;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(
            language === 'en'
              ? 'Please upload only image files'
              : 'يرجى رفع ملفات صور فقط'
          );
          continue;
        }

        // Create image object
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newImage: PropertyImage = {
            id: `img-${Date.now()}-${i}`,
            url: imageUrl,
            alt: file.name,
            title: file.name.split('.')[0]
          };

          setImages((prev) => {
            const updated = [...prev, newImage];
            onImagesChange(updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(
        language === 'en'
          ? 'Error uploading images'
          : 'خطأ في رفع الصور'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (imageId: string) => {
    const updated = images.filter((img) => img.id !== imageId);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-accent/10');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent/10');
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isLoading}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {language === 'en'
                  ? 'Drag and drop or click to upload'
                  : 'اسحب وأفلت أو انقر للرفع'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en'
                  ? `PNG, JPG, GIF up to ${maxFileSize}MB`
                  : `PNG, JPG, GIF حتى ${maxFileSize}MB`}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Images Preview */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">
            {language === 'en'
              ? `Images (${images.length}/${maxImages})`
              : `الصور (${images.length}/${maxImages})`}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.title || image.alt}
                </p>
              </div>
            ))}

            {images.length < maxImages && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="col-span-1 border-2 border-dashed border-border/50 rounded-lg p-4 flex items-center justify-center hover:border-accent/50 transition-colors"
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          {language === 'en' ? 'Uploading images...' : 'جاري رفع الصور...'}
        </div>
      )}
    </div>
  );
}
