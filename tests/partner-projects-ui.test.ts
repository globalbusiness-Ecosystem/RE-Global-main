import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PROJECT_TEXT, pp, projectErrorKey } from '@/lib/partner-projects-i18n';
import { PROJECT_KINDS, PROJECT_STATUSES } from '@/lib/partner-projects';

const src = (p: string) => readFileSync(p, 'utf8');
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('partner projects i18n', () => {
  it('has every text in all 7 languages', () => {
    for (const [k, row] of Object.entries(PROJECT_TEXT)) for (const l of LANGS) expect(row[l]?.trim(), `${k}.${l}`).toBeTruthy();
  });
  it('covers every project kind and status', () => {
    for (const k of PROJECT_KINDS) expect(PROJECT_TEXT).toHaveProperty(`k_${k}`);
    for (const s of PROJECT_STATUSES) expect(PROJECT_TEXT).toHaveProperty(`st_${s}`);
  });
  it('maps API errors to messages and falls back to English', () => {
    for (const f of ['title', 'description', 'kind', 'country', 'city', 'price', 'currency', 'images', 'contact', 'plan']) expect(projectErrorKey('invalid', f)).toBe(`e_${f}`);
    expect(projectErrorKey('limit')).toBe('e_limit');
    expect(projectErrorKey('too_large')).toBe('e_too_large');
    expect(projectErrorKey('whatever')).toBe('e_generic');
    expect(pp('addProject', 'xx')).toBe('Add a project');
  });
});

describe('partner workspace wiring', () => {
  it('shows the projects workspace inside the approved dashboard', () => {
    expect(src('components/partners/partner-dashboard.tsx')).toContain('<PartnerProjects language={language} />');
  });
  it('uploads photos to the partner upload route and saves through the projects route', () => {
    const form = src('components/partners/partner-project-form.tsx');
    expect(form).toContain("'/api/partners/upload'");
    expect(form).toContain("'/api/partners/projects'");
    expect(form).toContain('submit');
    expect(form).toContain('InstallmentTable');
  });
  it('lets the admin review projects from the partners tab', () => {
    expect(src('components/admin/payments-tab.tsx')).toContain('<PartnerProjectsPanel');
    const panel = src('components/admin/partner-projects-panel.tsx');
    expect(panel).toContain('/api/admin/partner-projects');
    for (const a of ['approve', 'reject', 'hide', 'restore']) expect(panel).toContain(`'${a}'`);
  });
});
