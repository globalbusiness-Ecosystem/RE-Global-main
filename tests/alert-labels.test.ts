import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ALERT_LABELS, alertLabel, alertText, type AlertLabelKey } from '@/lib/alert-labels';
import { generateSmartAlerts } from '@/lib/smart-alerts';
import { stayAlerts } from '@/lib/stay-alerts';
import { payoutAlerts } from '@/lib/payout-alerts';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const holes = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(',');

describe('alert labels', () => {
  it('every text exists in all 7 languages with the same placeholders', () => {
    for (const [key, row] of Object.entries(ALERT_LABELS)) {
      for (const l of LANGS) {
        expect((row as Record<string, string>)[l]?.trim().length, `${key}.${l}`).toBeGreaterThan(1);
        expect(holes((row as Record<string, string>)[l]), `${key}.${l}`).toBe(holes(row.en));
      }
    }
  });
  it('falls back to English for an unknown language and fills placeholders', () => {
    expect(alertLabel('checkinDays', 'xx', { n: 2 })).toBe('Check-in in 2 days');
    expect(alertLabel('checkinDays', 'fr', { n: 2 })).toBe('Arrivée dans 2 jours');
  });
  it('uses the Arabic property name in Arabic and the original elsewhere', () => {
    const vars = { title: 'Villa', titleAr: 'فيلا', from: '1', to: '2', pct: '+100' };
    expect(alertLabel('priceChangeD', 'ar', vars)).toContain('فيلا');
    expect(alertLabel('priceChangeD', 'zh', vars)).toContain('Villa');
  });
  it('alerts from all three sources carry texts in every language, no placeholder left open', () => {
    const today = '2026-10-30';
    const stay = stayAlerts([
      { id: 'a', propertyTitle: 'Hotel', start: '2026-10-31', end: '2026-11-02', status: 'confirmed' },
      { id: 'b', propertyTitle: 'Hotel', start: '2026-10-01', end: '2026-10-28', status: 'confirmed', reviewed: true, hostReply: 'thanks' },
      { id: 'c', propertyTitle: 'Hotel', start: '2026-10-01', end: '2026-10-28', status: 'confirmed' },
      { id: 'd', propertyTitle: 'Hotel', start: '2026-12-01', end: '2026-12-03', status: 'review' },
    ], today);
    const pay = payoutAlerts([
      { id: 'p1', kind: 'refund', amount: 5, status: 'paid', createdAt: '2026-10-29T00:00:00Z' },
      { id: 'p2', kind: 'resale', amount: 7, status: 'pending', createdAt: '2026-10-29T00:00:00Z' },
    ], Date.parse('2026-10-30T00:00:00Z'));
    const props = [{ id: 'x', title: 'Villa', titleAr: 'فيلا', price: 120, currency: 'π', type: 'villa', location: 'Cairo' }] as never[];
    const smart = generateSmartAlerts(
      [{ id: 'f1', propertyId: 'x', priceAtFavorite: 100 }, { id: 'f2', propertyId: 'y' }] as never[],
      [...props, { id: 'z', title: 'Flat', price: 50, type: 'villa', location: 'Giza' }] as never[],
      [{ id: 'c1', status: 'active', propertyId: 'x', propertyTitle: 'Villa', amount: 10, currency: 'π', updatedAt: new Date() }] as never[],
    );
    const all = [...stay, ...pay, ...smart];
    expect(all.length).toBeGreaterThanOrEqual(9);
    for (const a of all) {
      expect(a.i18n, a.id).toBeTruthy();
      for (const l of LANGS) {
        const t = alertText(a, l);
        expect(t.title.length, `${a.id}.${l}`).toBeGreaterThan(2);
        expect(t.description, `${a.id}.${l}`).not.toMatch(/\{[a-zA-Z]+\}/);
      }
      // The new Arabic and English texts are exactly what the old pair said.
      expect(alertText(a, 'ar').title).toBe(a.titleAr);
      expect(alertText(a, 'en').title).toBe(a.titleEn);
      expect(alertText(a, 'ar').description).toBe(a.descriptionAr);
      expect(alertText(a, 'en').description).toBe(a.descriptionEn);
    }
  });
  it('alerts without i18n still show the old Arabic or English pair', () => {
    const a = { titleEn: 'T', titleAr: 'ت', descriptionEn: 'D', descriptionAr: 'و' };
    expect(alertText(a, 'ar')).toEqual({ title: 'ت', description: 'و' });
    expect(alertText(a, 'ur')).toEqual({ title: 'T', description: 'D' });
  });
  it('the alerts page uses the accessor and no longer decides by language === ar', () => {
    const page = readFileSync('components/pages/alerts-page.tsx', 'utf8');
    expect(page).toContain('alertText(alert, language)');
    expect(page).not.toMatch(/isArabic|language === 'ar'/);
  });
  it('every key is used somewhere', () => {
    const src = ['lib/smart-alerts.ts', 'lib/stay-alerts.ts', 'lib/payout-alerts.ts', 'components/pages/alerts-page.tsx'].map((f) => readFileSync(f, 'utf8')).join('\n');
    for (const k of Object.keys(ALERT_LABELS) as AlertLabelKey[]) expect(src, k).toContain(`'${k}'`);
  });
});
