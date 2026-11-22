import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseToursEnabled, tourItems, showToursEntry } from '@/lib/tours';
import { TOUR_PICKER_I18N } from '@/lib/tour-picker-i18n';
import { HOME_CATEGORIES } from '@/lib/home-i18n';
import { groupOf, can } from '@/lib/admin-roles';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const src = (p: string) => readFileSync(p, 'utf8');

describe('which listings are tours', () => {
  const doc = (id: string, data: Record<string, unknown>) => ({ id, data });
  it('only visible listings with an https 360 link', () => {
    const items = tourItems([
      doc('a', { title: 'A', vrUrl: 'https://x.test/p.jpg', image: 'https://x.test/i.jpg' }),
      doc('b', { title: 'B', vrUrl: '' }),
      doc('c', { title: 'C', vrUrl: 'http://x.test/p.jpg' }),
      doc('d', { title: 'D', vrUrl: 'javascript:alert(1)' }),
      doc('e', { title: 'E', vrUrl: 'https://x.test/e.jpg', hidden: true }),
      doc('f', { title: 'F', vrUrl: 'https://x.test/f.jpg', images: ['https://x.test/f1.jpg'] }),
    ]);
    expect(items.map((i) => i.id)).toEqual(['a', 'f']);
    expect(items[1].image).toBe('https://x.test/f1.jpg');
  });
  it('the list is capped', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}`, data: { title: 't', vrUrl: 'https://x.test/p.jpg' } }));
    expect(tourItems(many, 60)).toHaveLength(60);
  });
});

describe('the switch and the entry', () => {
  it('only an explicit false turns tours off', () => {
    expect(parseToursEnabled(false)).toBe(false);
    for (const v of [true, undefined, null, 0, '', 'false']) expect(parseToursEnabled(v)).toBe(true);
  });
  it('the entry shows when it is on and there is something to open', () => {
    expect(showToursEntry(null)).toBe(false);
    expect(showToursEntry({ enabled: false, demo: true, count: 5 })).toBe(false);
    expect(showToursEntry({ enabled: true, demo: false, count: 0 })).toBe(false);
    expect(showToursEntry({ enabled: true, demo: false, count: 1 })).toBe(true);
    expect(showToursEntry({ enabled: true, demo: true, count: 0 })).toBe(true);
  });
});

describe('wiring', () => {
  it('one tile replaces the two: no AI or augmented-reality tile is left', () => {
    const h = src('components/pages/home-page.tsx');
    expect(h).toContain("id: 'virtual-tour'");
    expect(h).not.toContain("'ai-tour'");
    expect(h).not.toContain("'vr-tour'");
    expect(h).toContain('<TourPicker');
    expect(h).not.toContain('VRPropertyTourViewer');
    expect(Object.keys(HOME_CATEGORIES)).toContain('virtual-tour');
    expect(Object.keys(HOME_CATEGORIES)).not.toContain('ai-tour');
    expect(Object.keys(HOME_CATEGORIES)).not.toContain('vr-tour');
  });
  it('the picker has all 7 languages', () => {
    for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) for (const v of Object.values(TOUR_PICKER_I18N[l])) expect(v.length).toBeGreaterThan(0);
  });
  it('the sample tour is only offered while sample content is on', () => {
    expect(src('components/tour-picker.tsx')).toContain('tours.demo ?');
    expect(src('lib/tours-server.ts')).toContain('getShowDemo()');
  });
  it('the admin route is content-area, logged, and the public route is rate-limited', () => {
    expect(groupOf('/api/admin/tours')).toBe('content');
    expect(can('content', 'content', 'PUT')).toBe(true);
    expect(can('finance', 'content', 'PUT')).toBe(false);
    expect(src('app/api/admin/tours/route.ts')).toContain("logAdmin('display.tours'");
    expect(src('app/api/tours/route.ts')).toContain('ipLimited(');
    expect(auditLabel('display.tours')).toContain('الجولات');
    expect(auditSummary('display.tours', { to: false })).toBe('إخفاء');
  });
  it('the admin screen sits next to the display settings', () => {
    expect(src('components/admin/properties-tab.tsx')).toContain('ToursSettings');
  });
});
