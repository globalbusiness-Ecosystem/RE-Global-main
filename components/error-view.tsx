'use client';

import { useEffect, useState } from 'react';
import { ERROR_PAGE_I18N } from '@/lib/error-page-i18n';
import { pickLanguage } from '@/lib/detect-language';
import type { NavLanguage } from '@/lib/nav-i18n';

// Friendly page for a crash or a missing page, in the visitor's language. Inline styles on purpose:
// it must look right even when the app's own styles or providers are what failed.
export function ErrorView({ kind, reset }: { kind: 'error' | 'notfound'; reset?: () => void }) {
  const [lang, setLang] = useState<NavLanguage>('en');
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem('re_nav_language'); } catch { /* private mode */ }
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    setLang(pickLanguage(stored, langs.filter(Boolean)));
  }, []);
  const t = ERROR_PAGE_I18N[lang];
  const rtl = lang === 'ar' || lang === 'ur';
  const btn = { padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' } as const;
  return (
    <div role="alert" dir={rtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 40, color: '#d4af37' }}>{kind === 'error' ? '!' : '404'}</div>
      <h1 style={{ fontSize: 22, margin: 0 }}>{kind === 'error' ? t.errorTitle : t.notFoundTitle}</h1>
      <p style={{ maxWidth: 380, margin: 0, color: '#9ca3af', fontSize: 14, lineHeight: 1.6 }}>{kind === 'error' ? t.errorBody : t.notFoundBody}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {kind === 'error' && reset && <button onClick={reset} style={{ ...btn, background: '#d4af37', color: '#000', border: 'none' }}>{t.retry}</button>}
        <a href="/" style={{ ...btn, border: '1px solid #444', color: '#fff' }}>{t.home}</a>
      </div>
    </div>
  );
}
