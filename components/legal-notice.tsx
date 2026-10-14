'use client';

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';

// Buyer-facing notice about title transfer for the property's country.
export function LegalNotice({ country, language }: { country?: string; language: string }) {
  const [n, setN] = useState<{ noticeEn: string; noticeAr: string } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/legal?country=${encodeURIComponent(country || '')}`)
      .then((r) => r.json())
      .then((d) => { if (alive && d?.noticeEn) setN(d); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [country]);
  if (!n) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300 flex gap-2">
      <Scale className="w-4 h-4 shrink-0 text-accent mt-0.5" />
      <p dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? n.noticeAr : n.noticeEn}</p>
    </div>
  );
}
