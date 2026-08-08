'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import InspectionsPage from '@/components/pages/inspections-page';

export default function InspectionsRoute() {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  return (
    <div className="relative">
      <button
        onClick={() => setLanguage((l) => (l === 'ar' ? 'en' : 'ar'))}
        className="fixed top-4 right-4 z-30 bg-card border border-border rounded-full p-2.5 shadow-lg"
        title="EN / AR"
      >
        <Languages className="w-4 h-4 text-accent" />
      </button>
      <InspectionsPage language={language} />
    </div>
  );
}
