'use client';

import { X } from 'lucide-react';

interface OfflineBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function OfflineBanner({ isVisible, onClose }: OfflineBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-background rounded-full animate-pulse" />
        <span className="text-sm font-medium">Offline mode - Using cached data</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-background/20 rounded transition-colors"
        aria-label="Close offline banner"
      >
        <X size={18} />
      </button>
    </div>
  );
}
