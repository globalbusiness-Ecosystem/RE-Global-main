/** @jsxRuntime automatic */
'use client';

import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { OFFLINE_I18N } from '@/lib/offline-i18n';
import { isRtl } from '@/lib/seo-i18n';

interface OfflineBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function OfflineBanner({ isVisible, onClose }: OfflineBannerProps) {
  const { language } = useLanguage();
  if (!isVisible) return null;
  const t = OFFLINE_I18N[language] ?? OFFLINE_I18N.en;

  return (
    <div role="status" dir={isRtl(language) ? 'rtl' : 'ltr'} className="fixed top-0 left-0 right-0 z-50 bg-accent text-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div aria-hidden="true" className="w-2 h-2 bg-background rounded-full animate-pulse" />
        <span className="text-sm font-medium">{t.message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-background/20 rounded transition-colors"
        aria-label={t.close}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
