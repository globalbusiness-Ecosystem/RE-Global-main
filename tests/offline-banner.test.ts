import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { OFFLINE_I18N } from '@/lib/offline-i18n';
import { SEO_LANGS } from '@/lib/seo-i18n';

const h = vi.hoisted(() => ({ lang: 'en' }));
vi.mock('@/contexts/language-context', () => ({ useLanguage: () => ({ language: h.lang }) }));

import { OfflineBanner } from '@/components/offline-banner';

const render = (lang: string, visible = true) => {
  h.lang = lang;
  return renderToStaticMarkup(createElement(OfflineBanner, { isVisible: visible, onClose: () => undefined }));
};

describe('offline banner', () => {
  it('has text in every language', () => {
    for (const l of SEO_LANGS) {
      expect(OFFLINE_I18N[l].message.length, l).toBeGreaterThan(10);
      expect(OFFLINE_I18N[l].close.length, l).toBeGreaterThan(1);
    }
  });
  it('shows the message in the user\'s language, right-to-left for Arabic and Urdu', () => {
    expect(render('ar')).toContain(OFFLINE_I18N.ar.message);
    expect(render('ar')).toContain('dir="rtl"');
    expect(render('ur')).toContain('dir="rtl"');
    expect(render('fr')).toContain('dir="ltr"');
  });
  it('is announced to screen readers and its close button has a name', () => {
    const html = render('es');
    expect(html).toContain('role="status"');
    expect(html).toContain(`aria-label="${OFFLINE_I18N.es.close}"`);
  });
  it('renders nothing when hidden, and falls back to English for an unknown language', () => {
    expect(render('en', false)).toBe('');
    expect(render('xx')).toContain(OFFLINE_I18N.en.message);
  });
  it('does not promise cached data (the app only saves bookings)', () => {
    expect(OFFLINE_I18N.en.message.toLowerCase()).not.toContain('cached');
  });
});
