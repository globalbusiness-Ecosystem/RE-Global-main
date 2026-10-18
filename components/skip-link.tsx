'use client';

import { useLanguage } from '@/contexts/language-context';
import { A11Y_I18N } from '@/lib/a11y-i18n';

// First thing a keyboard or screen-reader user reaches: jumps past the header straight to the page content.
export function SkipLink() {
  const { language } = useLanguage();
  const t = A11Y_I18N[language] ?? A11Y_I18N.en;
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        const el = document.getElementById('main-content');
        if (el) { e.preventDefault(); el.focus(); el.scrollIntoView(); }
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-foreground"
    >
      {t.skip}
    </a>
  );
}
