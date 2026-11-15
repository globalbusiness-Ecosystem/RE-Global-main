import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { filterProjects } from '@/components/partners/project-showcase';
import type { PublicProject } from '@/components/partners/project-detail-modal';
import { PROJECT_TEXT } from '@/lib/partner-projects-i18n';

const src = (p: string) => readFileSync(p, 'utf8');
const mk = (o: Partial<PublicProject>): PublicProject => ({ id: 'a', company: 'Acme', role: 'developer', title: 'Nile Tower', description: '', kind: 'apartment', country: 'EG', city: 'Cairo', price: 1, currency: 'USD', images: [], lowestMonthly: null, hasInstallments: false, ...o });
const list = [mk({ id: '1' }), mk({ id: '2', title: 'Palm Villa', kind: 'villa', country: 'AE', city: 'Dubai', hasInstallments: true, company: 'Gulf Dev' })];

describe('filterProjects', () => {
  it('returns everything without filters', () => expect(filterProjects(list, { q: '', kind: '', country: '', installments: false })).toHaveLength(2));
  it('filters by type, country and instalments', () => {
    expect(filterProjects(list, { q: '', kind: 'villa', country: '', installments: false }).map((p) => p.id)).toEqual(['2']);
    expect(filterProjects(list, { q: '', kind: '', country: 'EG', installments: false }).map((p) => p.id)).toEqual(['1']);
    expect(filterProjects(list, { q: '', kind: '', country: '', installments: true }).map((p) => p.id)).toEqual(['2']);
  });
  it('searches title, city and partner name, ignoring case and spaces', () => {
    expect(filterProjects(list, { q: ' dubai ', kind: '', country: '', installments: false }).map((p) => p.id)).toEqual(['2']);
    expect(filterProjects(list, { q: 'ACME', kind: '', country: '', installments: false }).map((p) => p.id)).toEqual(['1']);
    expect(filterProjects(list, { q: 'zzz', kind: '', country: '', installments: false })).toHaveLength(0);
  });
});

describe('redesigned partners page', () => {
  it('has the three tabs and keeps the team logos', () => {
    const s = src('components/pages/partners-page.tsx');
    for (const t of ['tabProjects', 'tabPartners', 'tabJoin']) expect(s).toContain(t);
    expect(s).toContain('role="tablist"');
    expect(s).toContain('<ProjectShowcase');
    expect(s).toContain('<PartnerDirectory');
    expect(s).toContain('showDirectory={false}');
    expect(s).toContain("useSiteContent<any>('partners')");
  });
  it('the showcase and the detail window use the public API only', () => {
    expect(src('components/partners/project-showcase.tsx')).toContain("'/api/partners/showcase'");
    const m = src('components/partners/project-detail-modal.tsx');
    expect(m).toContain('/api/partners/showcase?id=');
    expect(m).toContain('aria-modal="true"');
    expect(m).toContain("'Escape'");
    expect(m).toContain('InstallmentTable');
  });
  it('the new texts exist in all seven languages', () => {
    for (const k of ['tabProjects', 'heroLine', 'searchPh', 'viewDetails', 'plansNote', 'fromMonthly']) for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect((PROJECT_TEXT as any)[k][l]).toBeTruthy();
    expect(PROJECT_TEXT.fromMonthly.en).toContain('{n}');
  });
  it('no hard-coded dark colours on the new screens', () => {
    for (const f of ['project-showcase', 'project-detail-modal', 'installment-table']) expect(src(`components/partners/${f}.tsx`), f).not.toMatch(/bg-(gray|slate)-[0-9]|text-gray-[0-9]/);
  });
});
