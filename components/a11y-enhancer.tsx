'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { A11Y_I18N } from '@/lib/a11y-i18n';
import { needsCloseLabel } from '@/lib/a11y';

// Gives every icon-only "close" button a spoken name (in the visitor's language), including ones added later.
export function A11yEnhancer() {
  const { language } = useLanguage();
  useEffect(() => {
    const label = (A11Y_I18N[language] ?? A11Y_I18N.en).close;
    const fix = (root: ParentNode) => {
      root.querySelectorAll('button').forEach((b) => {
        const has = b.hasAttribute('aria-label') || b.hasAttribute('aria-labelledby') || b.hasAttribute('title');
        const hadAuto = b.dataset.a11yAuto === '1';
        if (has && !hadAuto) return;
        const hasCloseIcon = !!b.querySelector('svg.lucide-x');
        if (hadAuto || needsCloseLabel({ text: b.textContent ?? '', hasName: false, hasCloseIcon })) {
          b.setAttribute('aria-label', label);
          b.dataset.a11yAuto = '1';
        }
      });
    };
    fix(document);
    const mo = new MutationObserver((list) => {
      for (const m of list) m.addedNodes.forEach((n) => { if (n instanceof HTMLElement) fix(n); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [language]);
  return null;
}
