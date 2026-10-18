'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { panoramaSrc } from '@/lib/panorama';
import { CARD_I18N } from '@/lib/card-i18n';

// Full-screen 360 view of a property, from the panorama link the admin saved.
export function PanoramaModal({ url, title, language, onClose }: { url: string; title: string; language: NavLanguage; onClose: () => void }) {
  const t = CARD_I18N[language] ?? CARD_I18N.en;
  const src = panoramaSrc(url);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={t.tourTitle}>
      <div className="flex items-center justify-between gap-3 border-b border-accent/30 p-3">
        <h2 className="truncate text-sm font-semibold text-white">🎥 {title}</h2>
        <button type="button" onClick={onClose} aria-label={t.close} className="rounded-lg p-2 hover:bg-white/10"><X className="h-5 w-5 text-white" /></button>
      </div>
      {src ? (
        <iframe src={src} title={t.tourTitle} className="w-full flex-1" style={{ border: 0 }} allowFullScreen />
      ) : (
        <p className="flex-1 p-6 text-center text-sm text-gray-400">{t.noTour}</p>
      )}
    </div>
  );
}
